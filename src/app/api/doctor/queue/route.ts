import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptText } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
      include: { specialty: true },
    });

    if (!doctorProfile) {
      return NextResponse.json(
        { error: "Doctor profile not found for current user" },
        { status: 404 }
      );
    }

    // Fetch today's appointments (start of day to end of day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorProfile.id,
        appointmentDate: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        slot: true,
      },
      orderBy: { appointmentDate: "asc" },
    });

    const decryptedAppointments = appointments.map((appt) => ({
      ...appt,
      symptoms: appt.encryptedSymptomNotes
        ? decryptText(appt.encryptedSymptomNotes)
        : null,
    }));

    return NextResponse.json({
      doctor: doctorProfile,
      queue: decryptedAppointments,
    });
  } catch (error) {
    console.error("Doctor queue GET error:", error);
    return NextResponse.json({ error: "Failed to fetch doctor queue" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { appointmentId, status } = body; // COMPLETED or NO_SHOW

    if (!appointmentId || !["COMPLETED", "NO_SHOW"].includes(status)) {
      return NextResponse.json({ error: "Invalid status or missing appointmentId" }, { status: 400 });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: { patient: true },
    });

    // Notify patient
    await prisma.notification.create({
      data: {
        userId: updated.patientId,
        title: status === "COMPLETED" ? "Consultation Completed" : "Appointment Marked No-Show",
        message:
          status === "COMPLETED"
            ? "Your consultation has been marked completed. Thank you for choosing MediBook AI."
            : "Your appointment was marked as a no-show. If this was a mistake, please reach out to clinic support.",
        type: `STATUS_${status}`,
      },
    });

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    console.error("Doctor queue POST error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
