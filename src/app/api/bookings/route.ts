import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptText } from "@/lib/crypto";
import { releaseLock } from "@/lib/lock-manager";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required to confirm appointment" },
        { status: 401 }
      );
    }

    const patientId = (session.user as any).id;
    const body = await req.json();
    const {
      slotId,
      symptoms,
      patientPhone,
      urgency = "GREEN",
      triageSpecialty,
      triageReason,
    } = body;

    if (!slotId) {
      return NextResponse.json({ error: "Missing slotId" }, { status: 400 });
    }

    // Encrypt sensitive patient notes at rest (DPDP Act 2023)
    const encryptedNotes = symptoms ? encryptText(symptoms) : null;

    // Atomic transaction ensures zero double-booking
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch slot with strict verification
      const slot = await tx.slot.findUnique({
        where: { id: slotId },
        include: { doctor: { include: { user: true, specialty: true } } },
      });

      if (!slot) {
        throw new Error("Slot not found");
      }

      if (slot.isBooked) {
        throw new Error("Slot is already booked by another patient");
      }

      if (slot.isEmergencyBlocked) {
        throw new Error("This slot has been reserved for emergency cases");
      }

      // 2. Mark slot booked
      await tx.slot.update({
        where: { id: slotId },
        data: {
          isBooked: true,
          isLocked: false,
          lockedByUserId: null,
          lockedUntil: null,
        },
      });

      // 3. Create appointment
      const appointment = await tx.appointment.create({
        data: {
          patientId,
          doctorId: slot.doctorId,
          slotId: slot.id,
          appointmentDate: slot.startTime,
          status: "CONFIRMED",
          urgency,
          encryptedSymptomNotes: encryptedNotes,
          triageSpecialty: triageSpecialty || slot.doctor.specialty.name,
          triageReason: triageReason || "Self-selected consultation",
          patientPhone: patientPhone || null,
        },
        include: {
          doctor: {
            include: {
              user: { select: { name: true, email: true } },
              specialty: true,
            },
          },
          slot: true,
        },
      });

      // 4. Create confirmation notification for patient
      const formattedDate = new Date(slot.startTime).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const formattedTime = new Date(slot.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      await tx.notification.create({
        data: {
          userId: patientId,
          title: "Appointment Confirmed",
          message: `Your appointment with ${slot.doctor.user.name} is confirmed for ${formattedDate} at ${formattedTime}.`,
          type: "APPOINTMENT_CONFIRMED",
        },
      });

      // 5. Create notification for doctor
      await tx.notification.create({
        data: {
          userId: slot.doctor.userId,
          title: "New Patient Scheduled",
          message: `New appointment scheduled for ${formattedDate} at ${formattedTime} (Urgency: ${urgency}).`,
          type: "NEW_APPOINTMENT",
        },
      });

      // 6. DPDP Audit Log
      await tx.auditLog.create({
        data: {
          userId: patientId,
          action: "BOOK",
          detailsJson: JSON.stringify({
            appointmentId: appointment.id,
            doctorId: slot.doctorId,
            slotId: slot.id,
            startTime: slot.startTime.toISOString(),
            urgency,
          }),
        },
      });

      return appointment;
    });

    // Release the mutex lock since the slot is now permanently booked
    await releaseLock(slotId, patientId);

    return NextResponse.json({
      success: true,
      message: "Appointment confirmed successfully",
      appointment: result,
    });
  } catch (error: any) {
    console.error("Booking error:", error);
    const isConflict = error.message?.includes("already booked");
    return NextResponse.json(
      { error: error.message || "Failed to confirm appointment" },
      { status: isConflict ? 409 : 500 }
    );
  }
}
