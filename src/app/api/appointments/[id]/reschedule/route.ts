import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const appointmentId = params.id;
    const body = await req.json();
    const { newSlotId } = body;

    if (!newSlotId) {
      return NextResponse.json({ error: "Missing newSlotId" }, { status: 400 });
    }

    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: { include: { user: true } } },
    });

    if (!appt || appt.patientId !== userId) {
      return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    }

    // Atomic Reschedule Transaction
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Verify new slot
      const newSlot = await tx.slot.findUnique({
        where: { id: newSlotId },
      });

      if (!newSlot || newSlot.isBooked || newSlot.isEmergencyBlocked) {
        throw new Error("New slot is no longer available. Please select another slot.");
      }

      // 2. Release old slot
      await tx.slot.update({
        where: { id: appt.slotId },
        data: { isBooked: false, isLocked: false, lockedByUserId: null, lockedUntil: null },
      });

      // 3. Book new slot
      await tx.slot.update({
        where: { id: newSlotId },
        data: { isBooked: true, isLocked: false },
      });

      // 4. Update appointment
      const updatedAppt = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          slotId: newSlot.id,
          appointmentDate: newSlot.startTime,
          status: "CONFIRMED",
          reminder24hSent: false,
          reminder2hSent: false,
          reminder15mSent: false,
        },
        include: { slot: true },
      });

      // 5. Patient notification
      const formattedDate = new Date(newSlot.startTime).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const formattedTime = new Date(newSlot.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      await tx.notification.create({
        data: {
          userId,
          title: "Appointment Rescheduled",
          message: `Your appointment with ${appt.doctor.user.name} has been moved to ${formattedDate} at ${formattedTime}.`,
          type: "APPOINTMENT_RESCHEDULED",
        },
      });

      // 6. Audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: "RESCHEDULE",
          detailsJson: JSON.stringify({
            appointmentId,
            oldSlotId: appt.slotId,
            newSlotId,
            newStartTime: newSlot.startTime.toISOString(),
          }),
        },
      });

      return updatedAppt;
    });

    return NextResponse.json({
      success: true,
      message: "Appointment rescheduled successfully",
      appointment: updated,
    });
  } catch (error: any) {
    console.error("Reschedule error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reschedule appointment" },
      { status: 400 }
    );
  }
}
