import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Fetch user appointments to release their slots
    const userAppointments = await prisma.appointment.findMany({
      where: { patientId: userId },
    });

    const slotIdsToFree = userAppointments.map((a) => a.slotId);

    // Atomic right-to-erasure sequence
    await prisma.$transaction(async (tx) => {
      // 1. Free booked slots back to clinic availability
      if (slotIdsToFree.length > 0) {
        await tx.slot.updateMany({
          where: { id: { in: slotIdsToFree } },
          data: {
            isBooked: false,
            isLocked: false,
            lockedByUserId: null,
            lockedUntil: null,
          },
        });
      }

      // 2. Delete patient appointments
      await tx.appointment.deleteMany({
        where: { patientId: userId },
      });

      // 3. Delete notifications
      await tx.notification.deleteMany({
        where: { userId },
      });

      // 4. Log compliance erasure record (retaining zero PII)
      await tx.auditLog.create({
        data: {
          action: "RIGHT_TO_ERASURE_DATA_DELETED",
          detailsJson: JSON.stringify({
            compliance: "DPDP_ACT_2023_SECTION_12",
            timestamp: new Date().toISOString(),
            status: "ALL_PATIENT_RECORDS_PURGED",
          }),
        },
      });

      // 5. Delete user account
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({
      success: true,
      message: "All personal data, medical notes, and appointments permanently purged under DPDP Act 2023.",
    });
  } catch (error: any) {
    console.error("Right to erasure error:", error);
    return NextResponse.json(
      { error: "Failed to erase personal data" },
      { status: 500 }
    );
  }
}
