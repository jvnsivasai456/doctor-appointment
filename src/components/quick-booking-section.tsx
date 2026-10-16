"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useApp } from "./providers";
import { DoctorAvatar } from "./doctor-avatar";
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
  Stethoscope,
  Phone,
  FileText,
  Building2,
  MapPin,
  Star,
  Lock,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface SlotItem {
  id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  isLocked: boolean;
  lockRemainingSeconds: number;
}

interface DoctorItem {
  id: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  bio: string;
  bioTa: string;
  languages: string;
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
    id?: string;
    name: string;
    email: string;
  };
  specialty: {
    id: string;
    name: string;
    nameTa: string;
  };
  slots: Array<{
    id: string;
    startTime: string | Date;
  }>;
}

interface QuickBookingSectionProps {
  doctors: DoctorItem[];
}

export function QuickBookingSection({ doctors }: QuickBookingSectionProps) {
  const { data: session } = useSession();
  const { lang, t } = useApp();

  // Wizard Steps: 1 = Doctor & Hospital, 2 = Date & Slot, 3 = Patient Details, 4 = Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Filters for Step 1
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [doctorSearch, setDoctorSearch] = useState<string>("");

  // Selections
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorItem | null>(null);
  const [doctorSlots, setDoctorSlots] = useState<SlotItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);

  // Patient Info (Step 3)
  const [patientName, setPatientName] = useState<string>(
    session?.user?.name || ""
  );
  const [patientPhone, setPatientPhone] = useState<string>("+91 98765 43210");
  const [patientSymptoms, setPatientSymptoms] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Lock countdown timer
  const [lockCountdown, setLockCountdown] = useState<number>(180);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Auto-fill patient name if session changes
  useEffect(() => {
    if (session?.user?.name && !patientName) {
      setPatientName(session.user.name);
    }
  }, [session]);

  // Dynamically extract unique localities present in doctors list (no empty areas)
  const availableLocations = React.useMemo(() => {
    const locSet = new Set<string>();
    doctors.forEach((d) => {
      const raw = d.cityLocation || "";
      const cleaned = raw.replace(/,?\s*Chennai/gi, "").trim();
      if (cleaned) locSet.add(cleaned);
    });
    return Array.from(locSet).sort();
  }, [doctors]);

  // Dynamically extract unique specialties present in doctors list
  const availableSpecialties = React.useMemo(() => {
    const specSet = new Set<string>();
    doctors.forEach((d) => {
      if (d.specialty?.name) specSet.add(d.specialty.name);
    });
    return Array.from(specSet).sort();
  }, [doctors]);

  // Filter available doctors
  const filteredDoctors = doctors.filter((doc) => {
    if (
      selectedSpecialty !== "all" &&
      doc.specialty.name.toLowerCase() !== selectedSpecialty.toLowerCase()
    ) {
      return false;
    }
    if (selectedLocation !== "all") {
      const loc = (doc.cityLocation || "").toLowerCase();
      const hosp = (doc.hospital || "").toLowerCase();
      const query = selectedLocation.toLowerCase();
      if (!loc.includes(query) && !hosp.includes(query)) return false;
    }
    if (doctorSearch.trim()) {
      const q = doctorSearch.toLowerCase();
      const name = doc.user.name.toLowerCase();
      const hosp = (doc.hospital || "").toLowerCase();
      const spec = doc.specialty.name.toLowerCase();
      if (!name.includes(q) && !hosp.includes(q) && !spec.includes(q))
        return false;
    }
    return true;
  });

  // When a doctor is selected, fetch their available slots
  const handleSelectDoctor = async (doc: DoctorItem) => {
    setSelectedDoctor(doc);
    setSelectedSlot(null);
    setSelectedDate("");
    setLoadingSlots(true);
    setCurrentStep(2);

    try {
      const res = await fetch(`/api/doctors/${doc.id}/slots`);
      if (res.ok) {
        const slotsData: SlotItem[] = await res.json();
        setDoctorSlots(slotsData);

        // Auto-select earliest date
        if (slotsData.length > 0) {
          const earliestDate = new Date(slotsData[0].startTime).toDateString();
          setSelectedDate(earliestDate);
        }
      }
    } catch (err) {
      console.error("Failed to fetch slots for doctor:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Group slots by date
  const slotsByDate: Record<string, SlotItem[]> = {};
  doctorSlots.forEach((slot) => {
    const dateStr = new Date(slot.startTime).toDateString();
    if (!slotsByDate[dateStr]) slotsByDate[dateStr] = [];
    slotsByDate[dateStr].push(slot);
  });

  const availableDates = Object.keys(slotsByDate);
  const slotsForSelectedDate = selectedDate ? slotsByDate[selectedDate] || [] : [];

  // Group slots for selected date into Morning, Afternoon, Evening
  const morningSlots = slotsForSelectedDate.filter((s) => {
    const hour = new Date(s.startTime).getHours();
    return hour >= 8 && hour < 12;
  });
  const afternoonSlots = slotsForSelectedDate.filter((s) => {
    const hour = new Date(s.startTime).getHours();
    return hour >= 12 && hour < 17;
  });
  const eveningSlots = slotsForSelectedDate.filter((s) => {
    const hour = new Date(s.startTime).getHours();
    return hour >= 17;
  });

  // Handle slot selection & acquire mutex lock
  const handleSlotSelect = async (slot: SlotItem) => {
    setSelectedSlot(slot);
    setErrorMessage("");

    try {
      const res = await fetch("/api/slots/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: slot.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMessage(
          err.error ||
            "Slot is temporarily locked by another patient. Please choose another."
        );
        return;
      }

      setLockCountdown(180);
      setCurrentStep(3);
    } catch (err) {
      console.error("Lock error:", err);
      setCurrentStep(3);
    }
  };

  // Mutex lock countdown timer
  useEffect(() => {
    if (currentStep === 3 && lockCountdown > 0) {
      const timer = setInterval(() => {
        setLockCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setErrorMessage("Slot hold expired. Please re-select your slot.");
            setCurrentStep(2);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, lockCountdown]);

  // Submit appointment booking
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedDoctor) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          symptoms: patientSymptoms || "General specialist medical consultation",
          patientPhone: patientPhone.trim(),
          patientName: patientName.trim() || "Patient",
          urgency: "GREEN",
          triageSpecialty: selectedDoctor.specialty.name,
          triageReason: "Home page direct appointment booking",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to confirm appointment");
      }

      const confirmedData = await res.json();
      setConfirmedBooking(confirmedData);
      setCurrentStep(4);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0284c7", "#0d9488", "#10b981", "#6366f1"],
      });
    } catch (err: any) {
      setErrorMessage(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Reset booking wizard
  const handleReset = () => {
    setCurrentStep(1);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setSelectedDate("");
    setConfirmedBooking(null);
    setErrorMessage("");
  };

  // Download Calendar (.ics)
  const handleDownloadCalendar = () => {
    if (!confirmedBooking || !selectedDoctor || !selectedSlot) return;

    const start = new Date(
      confirmedBooking.appointment?.slot?.startTime ||
      confirmedBooking.appointment?.appointmentDate ||
      confirmedBooking.slot?.startTime ||
      selectedSlot.startTime
    );
    const end = new Date(
      confirmedBooking.appointment?.slot?.endTime ||
      confirmedBooking.slot?.endTime ||
      selectedSlot.endTime
    );

    const ics = generateICSContent({
      title: `Doctor Appointment: ${selectedDoctor.user.name} (${selectedDoctor.specialty.name})`,
      description: `Confirmed MediBook Appointment\\nDoctor: ${selectedDoctor.user.name}\\nSpecialty: ${selectedDoctor.specialty.name}\\nHospital: ${selectedDoctor.hospital}\\nAddress: ${selectedDoctor.fullAddress || selectedDoctor.cityLocation}\\nSymptoms: ${patientSymptoms || "General Checkup"}\\nPatient: ${patientName}`,
      location: selectedDoctor.fullAddress || selectedDoctor.hospital || "Chennai, India",
      startTime: start,
      endTime: end,
    });

    downloadICSFile(`appointment-${selectedDoctor.user.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`, ics);
  };

  return (
    <section
      id="book-appointment"
      className="py-16 md:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-100/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-xs font-bold text-brand-700 dark:text-brand-300 mb-3.5 shadow-2xs">
            <CalendarIcon className="w-4 h-4 text-brand-600 animate-pulse" />
            <span>Instant Online Doctor Appointment Booking</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Book Doctor Appointment in 60 Seconds
          </h2>

          <p className="mt-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Directly select from <span className="font-bold text-brand-600 dark:text-brand-400">135+ verified specialists</span> across <span className="font-bold text-slate-800 dark:text-slate-200">34 premier Chennai hospitals</span>. Zero waiting queue, 180s guaranteed mutex lock, and immediate token receipt.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
            <div
              className={`p-3 rounded-2xl border transition flex items-center justify-center gap-2 ${
                currentStep === 1
                  ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20"
                  : currentStep > 1
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                  : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">
                {currentStep > 1 ? "✓" : "1"}
              </span>
              <span>1. Choose Specialist</span>
            </div>

            <div
              className={`p-3 rounded-2xl border transition flex items-center justify-center gap-2 ${
                currentStep === 2
                  ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20"
                  : currentStep > 2
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                  : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">
                {currentStep > 2 ? "✓" : "2"}
              </span>
              <span>2. Pick Slot & Time</span>
            </div>

            <div
              className={`p-3 rounded-2xl border transition flex items-center justify-center gap-2 ${
                currentStep >= 3
                  ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">
                {currentStep === 4 ? "✓" : "3"}
              </span>
              <span>3. Confirm Booking</span>
            </div>
          </div>
        </div>

        {/* Main Appointment Booking Console Container */}
        <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* ======================================================= */}
          {/* STEP 1: CHOOSE DOCTOR & HOSPITAL */}
          {/* ======================================================= */}
          {currentStep === 1 && (
            <div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-brand-600" />
                    <span>Select Doctor & Department</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Showing {filteredDoctors.length} accredited doctors with instant bookable slots.
                  </p>
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {/* Specialty dropdown */}
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="all">🩺 All Specialties ({availableSpecialties.length})</option>
                    {availableSpecialties.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>

                  {/* Location dropdown */}
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="all">📍 All Localities ({availableLocations.length})</option>
                    {availableLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>

                  {/* Search doctor input */}
                  <input
                    type="text"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    placeholder="Search doctor or hospital..."
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 flex-1 md:w-44"
                  />
                </div>
              </div>

              {/* Doctors Grid (Scrollable) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[520px] overflow-y-auto pr-1">
                {filteredDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoctor(doc)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <DoctorAvatar
                          avatarUrl={doc.avatarUrl}
                          name={doc.user.name}
                          specialty={doc.specialty.name}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition truncate">
                            {doc.user.name}
                          </h4>
                          <span className="inline-block text-[11px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80 px-2 py-0.5 rounded-md mt-0.5">
                            {doc.specialty.name}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                            {doc.qualification}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px] text-[11px]" title={doc.hospital}>
                            {doc.hospital?.split(",")[0]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{doc.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                          Consult Fee
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          ₹{doc.consultationFee}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1 group-hover:scale-105 transition"
                      >
                        <span>Select</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* STEP 2: PICK DATE & AVAILABLE TIME SLOT */}
          {/* ======================================================= */}
          {currentStep === 2 && selectedDoctor && (
            <div>
              {/* Doctor Header Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3.5">
                  <DoctorAvatar
                    avatarUrl={selectedDoctor.avatarUrl}
                    name={selectedDoctor.user.name}
                    specialty={selectedDoctor.specialty.name}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {selectedDoctor.user.name}
                      </h4>
                      <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-md">
                        {selectedDoctor.specialty.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedDoctor.hospital}</span>
                      <span>•</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{selectedDoctor.consultationFee}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Change Doctor</span>
                </button>
              </div>

              {loadingSlots ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs font-medium text-slate-500">Checking live appointment schedule...</p>
                </div>
              ) : (
                <div>
                  {/* Select Date Tabs */}
                  <div className="mb-6">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2.5">
                      <CalendarIcon className="w-4 h-4 text-brand-600" />
                      <span>1. Choose Appointment Date (Next 14 Days):</span>
                    </label>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {availableDates.map((dateStr) => {
                        const d = new Date(dateStr);
                        const isSelected = selectedDate === dateStr;
                        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
                        const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => setSelectedDate(dateStr)}
                            className={`px-3.5 py-2.5 rounded-xl text-center shrink-0 border transition ${
                              isSelected
                                ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20 font-bold"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-500 font-medium"
                            }`}
                          >
                            <span className="block text-[10px] uppercase tracking-wider">{dayName}</span>
                            <span className="block text-xs font-extrabold mt-0.5">{monthDay}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Select Time Slot */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-3">
                      <Clock className="w-4 h-4 text-brand-600" />
                      <span>2. Select Available Consultation Time:</span>
                    </label>

                    {slotsForSelectedDate.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">
                        No open slots on this date. Please pick another date.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {/* Morning */}
                        {morningSlots.length > 0 && (
                          <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                              🌅 Morning Slots (09:00 AM – 11:30 AM)
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {morningSlots.map((slot) => {
                                const timeFormatted = new Date(slot.startTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                                return (
                                  <button
                                    key={slot.id}
                                    type="button"
                                    onClick={() => handleSlotSelect(slot)}
                                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-800 dark:text-slate-200 transition shadow-2xs"
                                  >
                                    {timeFormatted}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Afternoon */}
                        {afternoonSlots.length > 0 && (
                          <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                              ☀️ Afternoon Slots (02:00 PM – 03:30 PM)
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {afternoonSlots.map((slot) => {
                                const timeFormatted = new Date(slot.startTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                                return (
                                  <button
                                    key={slot.id}
                                    type="button"
                                    onClick={() => handleSlotSelect(slot)}
                                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-800 dark:text-slate-200 transition shadow-2xs"
                                  >
                                    {timeFormatted}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Evening */}
                        {eveningSlots.length > 0 && (
                          <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                              🌙 Evening Slots (05:00 PM – 06:30 PM)
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {eveningSlots.map((slot) => {
                                const timeFormatted = new Date(slot.startTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                                return (
                                  <button
                                    key={slot.id}
                                    type="button"
                                    onClick={() => handleSlotSelect(slot)}
                                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-800 dark:text-slate-200 transition shadow-2xs"
                                  >
                                    {timeFormatted}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* STEP 3: PATIENT DETAILS & CONFIRMATION */}
          {/* ======================================================= */}
          {currentStep === 3 && selectedDoctor && selectedSlot && (
            <div>
              {/* Mutex Lock Active Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200">
                  <Lock className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>
                    Slot Locked for You:{" "}
                    {new Date(selectedSlot.startTime).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(selectedSlot.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-amber-200">
                  ⏱️ {Math.floor(lockCountdown / 60)}:
                  {(lockCountdown % 60).toString().padStart(2, "0")}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-xs font-semibold text-rose-700 dark:text-rose-300 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. S. Ramanathan"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-brand-500 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Mobile Number (For SMS & WhatsApp Token) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-brand-500 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Symptoms / Reason for Visit (AES-256 Encrypted)
                  </label>
                  <textarea
                    rows={2}
                    value={patientSymptoms}
                    onChange={(e) => setPatientSymptoms(e.target.value)}
                    placeholder="Describe any symptoms, fevers, aches, or previous medical records..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-brand-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                {/* Summary Card */}
                <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Consultation with {selectedDoctor.user.name}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 block mt-0.5">
                      {selectedDoctor.hospital}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Pay at Hospital Counter
                    </span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      ₹{selectedDoctor.consultationFee}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Slot Selection</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Securing Slot...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Lock Appointment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================= */}
          {/* STEP 4: INSTANT BOOKING RECEIPT */}
          {/* ======================================================= */}
          {currentStep === 4 && confirmedBooking && selectedDoctor && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50 dark:ring-emerald-950/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 inline-block mb-2">
                Appointment Successfully Confirmed
              </span>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Booking Token: #{confirmedBooking.appointment?.id?.slice(-6)?.toUpperCase() || "MB-7842"}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                A confirmation has been scheduled. Your consultation is reserved with zero waiting queue.
              </p>

              {/* Receipt Details Box */}
              <div className="mt-6 max-w-lg mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-700">
                  <span className="text-xs text-slate-500">Doctor</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedDoctor.user.name} ({selectedDoctor.specialty.name})
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-700">
                  <span className="text-xs text-slate-500">Hospital</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white text-right max-w-[240px]">
                    {selectedDoctor.hospital}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-700">
                  <span className="text-xs text-slate-500">Date & Time</span>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                    {new Date(
                      confirmedBooking.appointment?.appointmentDate || selectedSlot?.startTime || ""
                    ).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Patient</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {patientName} ({patientPhone})
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadCalendar}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Add to Calendar (.ics)</span>
                </button>

                {selectedDoctor.fullAddress && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${selectedDoctor.hospital} ${selectedDoctor.fullAddress}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>Get Driving Directions</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Book Another Appointment</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
