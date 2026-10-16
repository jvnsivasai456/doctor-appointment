"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useApp } from "@/components/providers";
import { DoctorAvatar } from "@/components/doctor-avatar";
import { generateICSContent, downloadICSFile } from "@/lib/calendar";
import confetti from "canvas-confetti";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  AlertTriangle,
  Stethoscope,
  Phone,
  FileText,
  Building2,
  MapPin,
} from "lucide-react";

interface SlotItem {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  isLocked: boolean;
  lockRemainingSeconds: number;
}

interface DoctorDetail {
  id: string;
  qualification: string;
  consultationFee: number;
  rating: number;
  bio: string;
  bioTa: string;
  avatarUrl?: string | null;
  hospital?: string;
  cityLocation?: string;
  doctorIdCode?: string | null;
  fullAddress?: string | null;
  landmark?: string | null;
  pincode?: string | null;
  lat?: number | null;
  lng?: number | null;
  user: {
    name: string;
    email: string;
  };
  specialty: {
    id: string;
    name: string;
    nameTa: string;
  };
}

function BookingWizardContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { lang, t } = useApp();

  const doctorId = params.doctorId as string;
  const initialUrgency = searchParams.get("urgency") || "GREEN";
  const initialSymptom = searchParams.get("symptom") || "";

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);

  // Form details for Step 2
  const [symptoms, setSymptoms] = useState(initialSymptom);
  const [phone, setPhone] = useState("+91 98765 43210");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Mutex Lock Countdown Timer (180 seconds)
  const [countdown, setCountdown] = useState<number>(180);
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);

  // Load doctor profile and open slots
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [docRes, slotsRes] = await Promise.all([
          fetch(`/api/doctors`),
          fetch(`/api/doctors/${doctorId}/slots`),
        ]);

        if (docRes.ok && slotsRes.ok) {
          const docs = await docRes.json();
          const currentDoc = docs.find((d: any) => d.id === doctorId);
          setDoctor(currentDoc || null);

          const slotsData: SlotItem[] = await slotsRes.json();
          setSlots(slotsData);

          if (slotsData.length > 0) {
            const firstDate = new Date(slotsData[0].startTime).toISOString().split("T")[0];
            setSelectedDate(firstDate);
          }
        }
      } catch (err) {
        console.error("Error loading doctor data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [doctorId]);

  // Handle countdown timer on Step 2
  useEffect(() => {
    if (step !== 2) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMessage("Reservation expired. Please select a slot again.");
          setStep(1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    const dateKey = new Date(slot.startTime).toISOString().split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, SlotItem[]>);

  const availableDates = Object.keys(slotsByDate);
  const currentSlots = selectedDate ? slotsByDate[selectedDate] || [] : [];

  // Proceed to Step 2 (Acquire 180s Mutex Lock)
  const handleProceedToStep2 = async () => {
    if (!selectedSlot) return;
    setErrorMessage("");

    try {
      const res = await fetch("/api/slots/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlot.id, action: "lock" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Slot is held by another user. Please choose another.");
        return;
      }

      setCountdown(data.remainingSeconds || 180);
      setStep(2);
    } catch (err: any) {
      setErrorMessage("Network error locking slot. Please try again.");
    }
  };

  // Back to Step 1 (Release Lock)
  const handleBackToStep1 = async () => {
    if (selectedSlot) {
      fetch("/api/slots/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlot.id, action: "release" }),
      }).catch(() => {});
    }
    setStep(1);
  };

  // Final Step 3 (Confirm Booking)
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    if (!session?.user) {
      // Store redirect target
      router.push(`/auth/login?callbackUrl=/booking/${doctorId}`);
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          symptoms,
          patientPhone: phone,
          urgency: initialUrgency,
          triageSpecialty: doctor?.specialty.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to confirm booking.");
        setSubmitting(false);
        return;
      }

      setConfirmedAppointment(data.appointment);
      setStep(3);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } catch (err: any) {
      setErrorMessage("Unexpected error booking appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Download .ics file
  const handleDownloadICS = () => {
    if (!confirmedAppointment || !doctor) return;

    const eventLocation = doctor.hospital
      ? `${doctor.hospital}, ${doctor.cityLocation || "Chennai, Tamil Nadu"}`
      : "Apollo Hospitals, Greams Road, Chennai";

    const eventContent = generateICSContent({
      title: `Doctor Appointment with ${doctor.user.name} (${doctor.specialty.name})`,
      description: `Appointment confirmed via MediBook AI.\nHospital: ${doctor.hospital || "Chennai Specialty Clinic"}\nReason: ${symptoms || "General Consultation"}\nFee: ₹${doctor.consultationFee}`,
      location: eventLocation,
      startTime: confirmedAppointment.slot.startTime,
      endTime: confirmedAppointment.slot.endTime,
    });

    downloadICSFile(`medibook-appointment-${confirmedAppointment.id}.ics`, eventContent);
  };

  if (loading || !doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading booking calendar...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Breadcrumb & Progress Tracker */}
      <div className="mb-8">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-4 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{lang === "en" ? "Back to Doctors" : "மருத்துவர்கள் பட்டியல்"}</span>
        </Link>

        {/* 3 Steps Indicator */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div
            className={`p-3 rounded-xl border text-center transition ${
              step >= 1
                ? "bg-brand-50 dark:bg-brand-950/60 border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-semibold"
                : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
            }`}
          >
            <span className="text-xs uppercase tracking-wider block">Step 1</span>
            <span className="text-xs sm:text-sm">{t("stepDateSlot")}</span>
          </div>

          <div
            className={`p-3 rounded-xl border text-center transition ${
              step >= 2
                ? "bg-brand-50 dark:bg-brand-950/60 border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-semibold"
                : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
            }`}
          >
            <span className="text-xs uppercase tracking-wider block">Step 2</span>
            <span className="text-xs sm:text-sm">{t("stepConfirm")}</span>
          </div>

          <div
            className={`p-3 rounded-xl border text-center transition ${
              step === 3
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold"
                : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
            }`}
          >
            <span className="text-xs uppercase tracking-wider block">Step 3</span>
            <span className="text-xs sm:text-sm">{t("stepSuccess")}</span>
          </div>
        </div>
      </div>

      {/* Doctor Summary Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <DoctorAvatar
            src={doctor.avatarUrl}
            name={doctor.user.name}
            specialtyName={doctor.specialty.name}
            size="md"
          />
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              {doctor.user.name}
            </h2>
            <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
              {lang === "ta" ? doctor.specialty.nameTa : doctor.specialty.name} • {doctor.qualification}
            </p>
            {doctor.hospital && (
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-1">
                <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>{doctor.hospital}</span>
                {doctor.doctorIdCode && (
                  <span className="ml-1 px-1.5 py-0.2 rounded bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-mono text-[9px] font-bold border border-brand-200/60">
                    {doctor.doctorIdCode}
                  </span>
                )}
              </p>
            )}
            {doctor.cityLocation && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span>{doctor.cityLocation}</span>
              </p>
            )}
            {doctor.landmark && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 pl-4 mt-0.5">
                📍 Landmark: {doctor.landmark}
              </p>
            )}
            {doctor.fullAddress && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 pl-4 mt-0.5 flex items-center gap-2">
                <span className="truncate max-w-[280px]">{doctor.fullAddress}</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doctor.fullAddress || doctor.hospital || "Chennai")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                >
                  Map ↗
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold sm:border-l sm:border-slate-100 sm:dark:border-slate-800 sm:pl-6">
          <div>
            <span className="text-slate-400 block text-[10px]">Consultation Fee</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">₹{doctor.consultationFee}</span>
          </div>
          {initialUrgency && initialUrgency !== "GREEN" && (
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                initialUrgency === "AMBER"
                  ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300"
                  : "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300"
              }`}
            >
              Priority: {initialUrgency}
            </span>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Select Date and Slot */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-brand-600" />
              <span>Select Date & Time Slot</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Choose your preferred consultation timing. Real-time availability refreshed live.
            </p>
          </div>

          {/* Date Picker Horizontal Carousel */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Available Dates (Next 2 Weeks)
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {availableDates.map((dateStr) => {
                const d = new Date(dateStr + "T00:00:00");
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setSelectedSlot(null);
                    }}
                    className={`p-3 rounded-2xl border text-center shrink-0 w-24 transition ${
                      isSelected
                        ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className="text-[11px] uppercase font-bold block opacity-80">
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span className="text-lg font-extrabold block my-0.5">
                      {d.getDate()}
                    </span>
                    <span className="text-[10px] block opacity-80">
                      {d.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Available Slots for{" "}
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </label>

            {currentSlots.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No slots available on this date. Please pick another date.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {currentSlots.map((slot) => {
                  const timeFormatted = new Date(slot.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const isSelected = selectedSlot?.id === slot.id;
                  const isLockedByOther = slot.isLocked;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isLockedByOther}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                          : isLockedByOther
                          ? "bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed line-through"
                          : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-brand-500"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{timeFormatted}</span>
                      {isLockedByOther && (
                        <span className="text-[9px] font-normal text-amber-500">Held</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {selectedSlot ? (
                <span className="text-brand-600 font-semibold">
                  Selected: {new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              ) : (
                "Please choose a time slot to proceed"
              )}
            </span>

            <button
              type="button"
              disabled={!selectedSlot}
              onClick={handleProceedToStep2}
              className="py-3 px-6 rounded-xl font-semibold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-40 transition flex items-center gap-2"
            >
              <span>{t("proceed")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Review, 180s Countdown Hold & Confirm */}
      {step === 2 && selectedSlot && (
        <form onSubmit={handleConfirmBooking} className="space-y-6">
          {/* Active 180-second Lock Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 animate-pulse">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                  {t("slotHeldNotice")}
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  Zero double-booking lock active. Slot released if timer runs out.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
              </span>
              <span className="block text-[10px] text-amber-600 font-semibold uppercase tracking-wider">
                Seconds Left
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Patient Information & Reason for Visit
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("reasonForVisit")} (Encrypted at rest with AES-256)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  rows={3}
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe key symptoms, concerns, or previous reports to share with the doctor..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:bg-white dark:focus:bg-slate-900 transition outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("patientPhone")} (For WhatsApp/SMS reminders)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:bg-white dark:focus:bg-slate-900 transition outline-none"
                />
              </div>
            </div>

            {/* Booking Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(selectedSlot.startTime).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                  {new Date(selectedSlot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 font-bold text-sm">
                <span>Total Consultation Fee:</span>
                <span className="text-brand-600 dark:text-brand-400">₹{doctor.consultationFee}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBackToStep1}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t("back")}
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="py-3 px-6 rounded-xl font-semibold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 transition flex items-center gap-2"
              >
                {submitting ? t("loading") : t("confirmBookingBtn")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* STEP 3: Booking Success Screen */}
      {step === 3 && confirmedAppointment && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-200 dark:border-emerald-800 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t("bookingSuccessTitle")}
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t("bookingSuccessSubtitle")} An automated reminder will notify you before the appointment.
          </p>

          <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Appointment ID:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {confirmedAppointment.id.slice(0, 10).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Doctor:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {doctor.user.name}
              </span>
            </div>
            {doctor.hospital && (
              <div className="flex justify-between">
                <span className="text-slate-400">Hospital Venue:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  {doctor.hospital}
                </span>
              </div>
            )}
            {doctor.cityLocation && (
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-medium text-slate-600 dark:text-slate-400 text-right">
                  {doctor.cityLocation}
                </span>
              </div>
            )}
            {doctor.landmark && (
              <div className="flex justify-between">
                <span className="text-slate-400">Landmark:</span>
                <span className="font-medium text-slate-600 dark:text-slate-400 text-right">
                  {doctor.landmark}
                </span>
              </div>
            )}
            {doctor.fullAddress && (
              <div className="flex justify-between items-start gap-4">
                <span className="text-slate-400 shrink-0">Address:</span>
                <div className="text-right">
                  <span className="font-medium text-slate-600 dark:text-slate-400 block text-[11px]">
                    {doctor.fullAddress}
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doctor.fullAddress || doctor.hospital || "Chennai")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 dark:text-brand-400 hover:underline font-semibold inline-block mt-0.5"
                  >
                    Open in Google Maps ↗
                  </a>
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Date & Time:</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">
                {new Date(confirmedAppointment.slot.startTime).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                at{" "}
                {new Date(confirmedAppointment.slot.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Action CTAs: Add to Calendar & My Appointments */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={handleDownloadICS}
              className="w-full sm:w-auto py-3 px-5 rounded-xl font-semibold text-xs bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-700 text-white shadow-sm transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{t("addToCalendar")}</span>
            </button>

            <Link
              href="/appointments"
              className="w-full sm:w-auto py-3 px-5 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>{t("viewMyAppointments")}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading booking calendar...</p>
        </div>
      }
    >
      <BookingWizardContent />
    </Suspense>
  );
}
