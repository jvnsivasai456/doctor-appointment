"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers";
import {
  ShieldCheck,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Stethoscope,
  Activity,
  Layers,
} from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lang, t } = useApp();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      if ((session.user as any).role !== "ADMIN") {
        router.push("/");
        return;
      }

      fetch("/api/admin/stats")
        .then((res) => res.json())
        .then((d) => setData(d))
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    } else if (status !== "loading") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  if (loading || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading clinic operational analytics...</p>
      </div>
    );
  }

  const { metrics, specialties, recentAppointments } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          <span>Clinic Operations & Executive Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor no-show rates, clinical capacity, specialty demand, and DPDP audit events.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Bookings</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.totalAppointments}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 block mb-1">Completed</span>
          <span className="text-2xl font-black text-emerald-600">
            {metrics.completedCount}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-rose-500 block mb-1">Cancelled</span>
          <span className="text-2xl font-black text-rose-500">
            {metrics.cancelledCount}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-amber-500 block mb-1">No-Show Rate</span>
          <span className="text-2xl font-black text-amber-600">
            {metrics.noShowRate}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-brand-600 block mb-1">Active Doctors</span>
          <span className="text-2xl font-black text-brand-600">
            {metrics.totalDoctors}
          </span>
        </div>
      </div>

      {/* Specialties Breakdown & Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Specialty Capacity */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600" />
            <span>Specialty Distribution</span>
          </h2>

          <div className="space-y-3">
            {specialties.map((s: any) => (
              <div key={s.id} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">
                    {s.name} ({s.nameTa})
                  </span>
                  <span className="text-slate-400">{s._count.doctors} Doctors</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${(s._count.doctors / metrics.totalDoctors) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Reliability & Zero Double Booking */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Concurrency & System Health</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Locking Engine:</span>
                <span className="font-semibold text-emerald-600">Redis Mutex + In-Memory Atomic Fallback</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Database Constraint:</span>
                <span className="font-semibold text-emerald-600">UNIQUE(doctorId, startTime) Enforced</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Triage Escalation Guard:</span>
                <span className="font-semibold text-rose-600">RED Urgency Auto-Blocks Online Booking</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">DPDP Act 2023 Compliance:</span>
                <span className="font-semibold text-emerald-600">AES-256 Encrypted at Rest</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-600" />
          <span>Recent Appointments Log</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Patient</th>
                <th className="pb-3 font-semibold">Doctor</th>
                <th className="pb-3 font-semibold">Specialty</th>
                <th className="pb-3 font-semibold">Date & Time</th>
                <th className="pb-3 font-semibold">Urgency</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentAppointments.map((appt: any) => (
                <tr key={appt.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">
                    {appt.patient.name}
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">
                    {appt.doctor.user.name}
                  </td>
                  <td className="py-3 text-brand-600 font-medium">
                    {appt.doctor.specialty.name}
                  </td>
                  <td className="py-3 text-slate-500">
                    {new Date(appt.appointmentDate).toLocaleDateString()} at{" "}
                    {new Date(appt.slot.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        appt.urgency === "AMBER"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950"
                          : appt.urgency === "RED"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950"
                      }`}
                    >
                      {appt.urgency}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        appt.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950"
                          : appt.status === "CANCELLED"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950"
                          : "bg-teal-100 text-teal-800 dark:bg-teal-950"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
