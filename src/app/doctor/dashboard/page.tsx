"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ShieldAlert,
  Calendar,
  FileText,
  Activity,
  Check,
  Stethoscope,
  Phone,
} from "lucide-react";

interface QueueItem {
  id: string;
  appointmentDate: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  urgency: "GREEN" | "AMBER" | "RED";
  symptoms: string | null;
  triageSpecialty: string | null;
  triageReason: string | null;
  patientPhone: string | null;
  patient: {
    id: string;
    name: string;
    email: string;
  };
  slot: {
    id: string;
    startTime: string;
    endTime: string;
  };
}

export default function DoctorDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lang, t } = useApp();

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);
  const [blockMessage, setBlockMessage] = useState("");

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/doctor/queue");
      if (res.ok) {
        const data = await res.json();
        setDoctorInfo(data.doctor);
        setQueue(data.queue);
      }
    } catch (err) {
      console.error("Failed to load queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchQueue();
    } else if (status !== "loading") {
      router.push("/auth/login");
    }
  }, [session, status]);

  const handleUpdateStatus = async (
    appointmentId: string,
    newStatus: "COMPLETED" | "NO_SHOW"
  ) => {
    try {
      const res = await fetch("/api/doctor/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, status: newStatus }),
      });

      if (res.ok) {
        setQueue((prev) =>
          prev.map((item) =>
            item.id === appointmentId ? { ...item, status: newStatus } : item
          )
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleBlockEmergencySlot = async () => {
    setBlocking(true);
    setBlockMessage("");
    try {
      const res = await fetch("/api/doctor/emergency-block", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setBlockMessage(data.message || t("blockSuccess"));
      } else {
        setBlockMessage(data.error || "Failed to block slot");
      }
    } catch (err) {
      setBlockMessage("Network error reserving emergency slot");
    } finally {
      setBlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading today&apos;s patient queue...</p>
      </div>
    );
  }

  const activePatients = queue.filter((q) => q.status === "CONFIRMED");
  const processedPatients = queue.filter((q) => q.status !== "CONFIRMED");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200">
              Doctor Clinical Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("doctorDashboardTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            • {activePatients.length} patients waiting
          </p>
        </div>

        {/* 1-Click "Block Emergency Slot" */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBlockEmergencySlot}
            disabled={blocking}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-500/20 disabled:opacity-50 transition flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{blocking ? t("loading") : t("blockEmergencySlot")}</span>
          </button>
        </div>
      </div>

      {blockMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
          <span>{blockMessage}</span>
          <button onClick={() => setBlockMessage("")} className="text-rose-500 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Patient Queue List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-600" />
            <span>Active Consultation Queue ({activePatients.length})</span>
          </h2>
        </div>

        {activePatients.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Queue Clear</h3>
            <p className="text-xs text-slate-500 mt-1">
              No patients currently waiting in today&apos;s queue.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activePatients.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {item.patient.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {item.patient.email}{" "}
                        {item.patientPhone && `• ${item.patientPhone}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Urgency Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.urgency === "AMBER"
                          ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300"
                          : item.urgency === "RED"
                          ? "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-300"
                          : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200"
                      }`}
                    >
                      {item.urgency} Urgency
                    </span>

                    {/* Time Slot Badge */}
                    <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      {new Date(item.slot.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* AI-generated symptom brief & clinical note */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <Stethoscope className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        AI Clinical Triage Summary:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {item.triageReason || "Self-described appointment symptoms."}
                      </p>
                    </div>
                  </div>

                  {item.symptoms && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Encrypted Patient Description:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 italic mt-0.5">
                        &quot;{item.symptoms}&quot;
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions: Mark Completed / No-Show */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleUpdateStatus(item.id, "NO_SHOW")}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{t("markNoShow")}</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(item.id, "COMPLETED")}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t("markCompleted")}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed / Handled Section */}
        {processedPatients.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              Processed Today ({processedPatients.length})
            </h3>
            <div className="space-y-2">
              {processedPatients.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs opacity-75"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.patient.name}
                    </span>
                    <span className="text-slate-400">
                      {new Date(item.slot.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      item.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
