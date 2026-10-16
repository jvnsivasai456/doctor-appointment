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
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctorProfile) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    // Find the next available unbooked slot today or tomorrow
    const nextSlot = await prisma.slot.findFirst({
      where: {
        doctorId: doctorProfile.id,
        isBooked: false,
        isLocked: false,
        isEmergencyBlocked: false,
        startTime: { gt: new Date() },
      },
      orderBy: { startTime: "asc" },
    });

    if (!nextSlot) {
      return NextResponse.json(
        { error: "No unbooked upcoming slots found to reserve as emergency buffer." },
        { status: 400 }
      );
    }

    // Mark slot as emergency blocked
    const updated = await prisma.slot.update({
      where: { id: nextSlot.id },
      data: { isEmergencyBlocked: true },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: "BLOCK_EMERGENCY",
        detailsJson: JSON.stringify({
          slotId: nextSlot.id,
          doctorId: doctorProfile.id,
          startTime: nextSlot.startTime.toISOString(),
        }),
      },
    });

    const timeFormatted = new Date(nextSlot.startTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return NextResponse.json({
      success: true,
      message: `Slot at ${timeFormatted} successfully blocked for emergency hospital triage.`,
      slot: updated,
    });
  } catch (error) {
    console.error("Emergency block error:", error);
    return NextResponse.json({ error: "Failed to block emergency slot" }, { status: 500 });
  }
}
