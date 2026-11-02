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
    const userRole = (session.user as any).role;

    let realUserId = userId;
    let appointments;
    if (userRole === "DOCTOR") {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId },
      });

      if (!doctorProfile) {
        return NextResponse.json([]);
      }

      appointments = await prisma.appointment.findMany({
        where: { doctorId: doctorProfile.id },
        include: {
          patient: { select: { id: true, name: true, email: true } },
          slot: true,
          doctor: { include: { user: true, specialty: true } },
        },
        orderBy: { appointmentDate: "asc" },
      });
    } else {
      // Resolve patient by email if ID is stale from earlier session
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists && session.user?.email) {
        const userByEmail = await prisma.user.findUnique({
          where: { email: session.user.email.toLowerCase().trim() },
        });
        if (userByEmail) {
          realUserId = userByEmail.id;
        }
      }

      appointments = await prisma.appointment.findMany({
        where: { patientId: realUserId },
        include: {
          doctor: { include: { user: true, specialty: true } },
          slot: true,
        },
        orderBy: { appointmentDate: "desc" },
      });
    }

    // Decrypt confidential symptom notes for presentation
    const formatted = appointments.map((appt) => ({
      ...appt,
      symptoms: appt.encryptedSymptomNotes
        ? decryptText(appt.encryptedSymptomNotes)
        : null,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Appointments GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
