import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const [
      totalAppointments,
      completedCount,
      cancelledCount,
      noShowCount,
      totalDoctors,
      specialties,
      recentAppointments,
    ] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: "COMPLETED" } }),
      prisma.appointment.count({ where: { status: "CANCELLED" } }),
      prisma.appointment.count({ where: { status: "NO_SHOW" } }),
      prisma.doctorProfile.count(),
      prisma.specialty.findMany({
        include: {
          _count: { select: { doctors: true } },
        },
      }),
      prisma.appointment.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          patient: { select: { name: true, email: true } },
          doctor: { include: { user: true, specialty: true } },
          slot: true,
        },
      }),
    ]);

    const activeOrPastTotal = completedCount + noShowCount;
    const noShowRate =
      activeOrPastTotal > 0
        ? ((noShowCount / activeOrPastTotal) * 100).toFixed(1)
        : "0.0";

    return NextResponse.json({
      metrics: {
        totalAppointments,
        completedCount,
        cancelledCount,
        noShowCount,
        noShowRate: `${noShowRate}%`,
        totalDoctors,
      },
      specialties,
      recentAppointments,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to load admin stats" }, { status: 500 });
  }
}
