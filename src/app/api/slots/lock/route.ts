import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { acquireLock, releaseLock, getLockStatus } from "@/lib/lock-manager";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { slotId, action } = body;

    if (!slotId) {
      return NextResponse.json({ error: "Missing slotId" }, { status: 400 });
    }

    // Identify user or generate anonymous session token if booking before login
    const userId = (session?.user as any)?.id || body.tempSessionId || "guest_session";

    if (action === "release") {
      await releaseLock(slotId, userId);
      return NextResponse.json({ success: true, message: "Lock released" });
    }

    // Check if slot exists and is not already booked in DB
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { doctor: { include: { user: true } } },
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    if (slot.isBooked) {
      return NextResponse.json(
        { error: "This slot is already booked" },
        { status: 409 }
      );
    }

    if (slot.isEmergencyBlocked) {
      return NextResponse.json(
        { error: "This slot is reserved for emergency medical cases" },
        { status: 403 }
      );
    }

    // Acquire 180-second mutex lock
    const lockResult = await acquireLock(slotId, userId, 180);

    if (!lockResult.success) {
      return NextResponse.json(
        {
          error: "This slot is currently held by another patient. Please choose another slot or try again shortly.",
          remainingSeconds: lockResult.remainingSeconds,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Slot locked for 180 seconds",
      slotId,
      remainingSeconds: lockResult.remainingSeconds || 180,
      slot: {
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        doctor: {
          id: slot.doctor.id,
          name: slot.doctor.user.name,
          fee: slot.doctor.consultationFee,
        },
      },
    });
  } catch (error: any) {
    console.error("Lock slot error:", error);
    return NextResponse.json({ error: "Failed to lock slot" }, { status: 500 });
  }
}
