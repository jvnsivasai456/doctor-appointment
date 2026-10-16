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
    const userRole = (session.user as any).role;
    const appointmentId = params.id;
    const body = await req.json().catch(() => ({}));
    const action = body.action || "cancel"; // cancel or undo

    const appt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        slot: true,
        doctor: { include: { user: true } },
      },
    });

    if (!appt) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Role check: Only the booked patient, the doctor, or an admin can cancel
    if (appt.patientId !== userId && userRole !== "ADMIN" && appt.doctor.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "undo") {
      // Check if slot was booked by someone else in the meantime
      const slot = await prisma.slot.findUnique({ where: { id: appt.slotId } });
      if (slot?.isBooked) {
        return NextResponse.json(
          { error: "Slot was booked by another patient while cancelled. Please reschedule to another slot." },
          { status: 409 }
        );
      }

      await prisma.$transaction([
        prisma.appointment.update({
          where: { id: appointmentId },
          data: { status: "CONFIRMED" },
        }),
        prisma.slot.update({
          where: { id: appt.slotId },
          data: { isBooked: true },
        }),
        prisma.auditLog.create({
          data: {
            userId,
            action: "UNDO_CANCEL",
            detailsJson: JSON.stringify({ appointmentId }),
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: "Appointment restored to confirmed" });
    }

    // Cancel appointment and re-open slot
    await prisma.$transaction([
      prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "CANCELLED" },
      }),
      prisma.slot.update({
        where: { id: appt.slotId },
        data: {
          isBooked: false,
          isLocked: false,
          lockedByUserId: null,
          lockedUntil: null,
        },
      }),
      prisma.notification.create({
        data: {
          userId: appt.patientId,
          title: "Appointment Cancelled",
          message: `Your appointment with ${appt.doctor.user.name} on ${new Date(appt.appointmentDate).toLocaleDateString()} has been cancelled.`,
          type: "APPOINTMENT_CANCELLED",
        },
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: "CANCEL",
          detailsJson: JSON.stringify({
            appointmentId,
            reason: body.reason || "Patient requested cancellation",
          }),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Appointment successfully cancelled. Slot has been returned to the schedule.",
    });
  } catch (error: any) {
    console.error("Cancellation error:", error);
    return NextResponse.json(
      { error: "Failed to cancel appointment" },
      { status: 500 }
    );
  }
}
