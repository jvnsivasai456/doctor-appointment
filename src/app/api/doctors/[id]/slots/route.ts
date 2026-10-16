import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLockStatus } from "@/lib/lock-manager";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = params.id;
    const now = new Date();

    const slots = await prisma.slot.findMany({
      where: {
        doctorId,
        isBooked: false,
        isEmergencyBlocked: false,
        startTime: { gt: now },
      },
      orderBy: { startTime: "asc" },
      take: 60, // next ~2 weeks
    });

    // Check mutex lock status for each slot
    const slotsWithLockStatus = await Promise.all(
      slots.map(async (s) => {
        const lock = await getLockStatus(s.id);
        return {
          id: s.id,
          doctorId: s.doctorId,
          startTime: s.startTime,
          endTime: s.endTime,
          isLocked: lock.isLocked,
          lockRemainingSeconds: lock.remainingSeconds,
        };
      })
    );

    return NextResponse.json(slotsWithLockStatus);
  } catch (error) {
    console.error("Slots API error:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}
