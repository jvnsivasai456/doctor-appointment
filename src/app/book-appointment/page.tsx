import React from "react";
import { prisma } from "@/lib/prisma";
import { QuickBookingSection } from "@/components/quick-booking-section";
import Link from "next/link";
import { ArrowLeft, Stethoscope, ShieldCheck, Calendar, Lock, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookAppointmentPage() {
  const allDoctors = await prisma.doctorProfile.findMany({
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
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    take: 200,
  });

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <QuickBookingSection doctors={allDoctors} />
    </div>
  );
}
