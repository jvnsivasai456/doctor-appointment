import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LandingClient } from "@/components/landing-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const specialties = await prisma.specialty.findMany({
    include: {
      _count: { select: { doctors: true } },
    },
    take: 8,
  });

  const featuredDoctors = await prisma.doctorProfile.findMany({
    where: { isAvailable: true },
    include: {
      user: { select: { name: true, email: true } },
      specialty: true,
      slots: {
        where: {
          isBooked: false,
          isLocked: false,
          startTime: { gt: new Date() },
        },
        orderBy: { startTime: "asc" },
        take: 1,
      },
    },
    orderBy: { rating: "desc" },
    take: 8,
  });

  return (
    <LandingClient
      initialSpecialties={specialties}
      initialDoctors={featuredDoctors}
    />
  );
}
