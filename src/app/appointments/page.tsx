"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useApp } from "@/components/providers";
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Undo2,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

interface Appointment {
  id: string;
  appointmentDate: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  urgency: "GREEN" | "AMBER" | "RED";
  symptoms: string | null;
  triageSpecialty: string | null;
  doctor: {
    id: string;
    qualification: string;
    consultationFee: number;
    user: { name: string; email: string };
    specialty: { name: string; nameTa: string };
  };
  slot: {
    id: string;
    startTime: string;
    endTime: string;
  };
}

interface OpenSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export default function MyAppointmentsPage() {
  const { data: session, status } = useSession();
  const { lang, t } = useApp();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Undo Toast state
  const [undoToast, setUndoToast] = useState<{
    visible: boolean;
    appointmentId: string;
    countdown: number;
  }>({ visible: false, appointmentId: "", countdown: 5 });

  // Cancel Dialog state
  const [cancelModal, setCancelModal] = useState<{
    open: boolean;
    appointment: Appointment | null;
  }>({ open: false, appointment: null });

  // Reschedule Modal state
  const [rescheduleModal, setRescheduleModal] = useState<{
    open: boolean;
    appointment: Appointment | null;
    openSlots: OpenSlot[];
    selectedSlotId: string | null;
    submitting: boolean;
  }>({ open: false, appointment: null, openSlots: [], selectedSlotId: null, submitting: false });

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchAppointments();
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [session, status]);

  // Undo timer countdown
  useEffect(() => {
    if (!undoToast.visible) return;
    const timer = setInterval(() => {
      setUndoToast((prev) => {
        if (prev.countdown <= 1) {
          clearInterval(timer);
          return { ...prev, visible: false };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [undoToast.visible]);

  // Execute cancellation
  const handleConfirmCancel = async () => {
    if (!cancelModal.appointment) return;
    const apptId = cancelModal.appointment.id;

    try {
      const res = await fetch(`/api/appointments/${apptId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      if (res.ok) {
        // Optimistic update
        setAppointments((prev) =>
          prev.map((a) => (a.id === apptId ? { ...a, status: "CANCELLED" } : a))
        );
        setCancelModal({ open: false, appointment: null });
        // Show 5-second Undo Toast
        setUndoToast({ visible: true, appointmentId: apptId, countdown: 5 });
      }
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  // Undo cancellation
  const handleUndoCancel = async () => {
    const apptId = undoToast.appointmentId;
    try {
      const res = await fetch(`/api/appointments/${apptId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "undo" }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === apptId ? { ...a, status: "CONFIRMED" } : a))
        );
        setUndoToast({ visible: false, appointmentId: "", countdown: 5 });
      }
    } catch (err) {
      console.error("Undo failed:", err);
    }
  };

  // Open reschedule modal
  const handleOpenReschedule = async (appt: Appointment) => {
    setRescheduleModal({
      open: true,
      appointment: appt,
      openSlots: [],
      selectedSlotId: null,
      submitting: false,
    });

    try {
      const res = await fetch(`/api/doctors/${appt.doctor.id}/slots`);
      if (res.ok) {
        const slots: OpenSlot[] = await res.json();
        setRescheduleModal((prev) => ({
          ...prev,
          openSlots: slots.slice(0, 12), // show next 12 open slots
        }));
      }
    } catch (err) {
      console.error("Failed to load slots for reschedule:", err);
    }
  };

  // Confirm reschedule
  const handleConfirmReschedule = async () => {
    if (!rescheduleModal.appointment || !rescheduleModal.selectedSlotId) return;

    setRescheduleModal((prev) => ({ ...prev, submitting: true }));

    try {
      const res = await fetch(
        `/api/appointments/${rescheduleModal.appointment.id}/reschedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newSlotId: rescheduleModal.selectedSlotId }),
        }
      );

      if (res.ok) {
        await fetchAppointments();
        setRescheduleModal({
          open: false,
          appointment: null,
          openSlots: [],
          selectedSlotId: null,
          submitting: false,
        });
      }
    } catch (err) {
      console.error("Reschedule failed:", err);
    } finally {
      setRescheduleModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  if (!session?.user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 border border-brand-200">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Sign In to View Appointments
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Access your confirmed appointments, medical briefs, and reschedule anytime.
        </p>
        <Link
          href="/auth/login"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition inline-flex items-center gap-2"
        >
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const now = new Date();
  const upcoming = appointments.filter(
    (a) => new Date(a.appointmentDate) >= now && a.status === "CONFIRMED"
  );
  const pastOrCancelled = appointments.filter(
    (a) => new Date(a.appointmentDate) < now || a.status !== "CONFIRMED"
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("navAppointments")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your consultations with 1-click reschedule, cancel, and automated reminders.
          </p>
        </div>

        <Link
          href="/doctors"
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book New Appointment</span>
        </Link>
      </div>

      {/* Undo Toast Notification */}
      {undoToast.visible && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 animate-in slide-in-from-bottom duration-200">
          <div>
            <p className="text-xs font-bold">Appointment Cancelled</p>
            <p className="text-[11px] text-slate-300">
              Undo available for {undoToast.countdown}s
            </p>
          </div>
          <button
            onClick={handleUndoCancel}
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse h-32"
            />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4 border border-brand-200 dark:border-brand-800">
            <CalendarDays className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Appointments Scheduled
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            You don&apos;t have any consultations scheduled. Describe your symptoms on our AI triage or browse doctors.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/triage"
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition"
            >
              Start AI Triage
            </Link>
            <Link
              href="/doctors"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
            >
              Browse Doctors
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Section */}
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Upcoming Consultations ({upcoming.length})</span>
            </h2>

            {upcoming.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 italic">No upcoming appointments.</p>
            ) : (
              <div className="space-y-4">
                {upcoming.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-brand-500/40 transition"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-base text-slate-900 dark:text-white">
                          {appt.doctor.user.name}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {appt.doctor.specialty.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            appt.urgency === "AMBER"
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-700"
                              : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700"
                          }`}
                        >
                          {appt.urgency}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-brand-600" />
                          <span>
                            {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                          <Clock className="w-3.5 h-3.5 text-brand-600" />
                          <span>
                            {new Date(appt.slot.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div>Fee: ₹{appt.doctor.consultationFee}</div>
                      </div>

                      {appt.symptoms && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                          <strong className="text-slate-800 dark:text-slate-200">Clinical Note:</strong>{" "}
                          {appt.symptoms}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleOpenReschedule(appt)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        onClick={() => setCancelModal({ open: true, appointment: appt })}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past & Cancelled Section */}
          {pastOrCancelled.length > 0 && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Past & Cancelled ({pastOrCancelled.length})
              </h2>

              <div className="space-y-3 opacity-80">
                {pastOrCancelled.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {appt.doctor.user.name} ({appt.doctor.specialty.name})
                      </span>
                      <span className="text-slate-400 block mt-0.5">
                        {new Date(appt.appointmentDate).toLocaleDateString()} at{" "}
                        {new Date(appt.slot.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          appt.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : appt.status === "CANCELLED"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation Dialog Modal */}
      {cancelModal.open && cancelModal.appointment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Cancel Appointment?
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to cancel your consultation with{" "}
              <strong>{cancelModal.appointment.doctor.user.name}</strong> on{" "}
              {new Date(cancelModal.appointment.appointmentDate).toLocaleDateString()}?
              The slot will immediately be returned to the clinic&apos;s available schedule.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModal({ open: false, appointment: null })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Yes, Cancel Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal.open && rescheduleModal.appointment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-brand-600" />
              <span>Reschedule Consultation</span>
            </h3>

            <p className="text-xs text-slate-500">
              Select a new time slot with {rescheduleModal.appointment.doctor.user.name}. Your existing slot will be atomically swapped.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2">
              {rescheduleModal.openSlots.map((slot) => {
                const d = new Date(slot.startTime);
                const isSelected = rescheduleModal.selectedSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() =>
                      setRescheduleModal((prev) => ({
                        ...prev,
                        selectedSlotId: slot.id,
                      }))
                    }
                    className={`p-2.5 rounded-xl border text-xs text-left transition ${
                      isSelected
                        ? "bg-brand-600 text-white border-brand-600 font-bold"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-brand-500"
                    }`}
                  >
                    <span className="block opacity-80 text-[10px]">
                      {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <span className="block font-bold">
                      {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() =>
                  setRescheduleModal({
                    open: false,
                    appointment: null,
                    openSlots: [],
                    selectedSlotId: null,
                    submitting: false,
                  })
                }
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={!rescheduleModal.selectedSlotId || rescheduleModal.submitting}
                onClick={handleConfirmReschedule}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm disabled:opacity-40"
              >
                {rescheduleModal.submitting ? "Updating..." : "Confirm New Slot"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
