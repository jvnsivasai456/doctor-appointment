"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/providers";
import { DoctorAvatar } from "@/components/doctor-avatar";
import {
  Search,
  Filter,
  Star,
  Clock,
  Calendar,
  Languages,
  ArrowUpDown,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  MapPin,
  Building2,
} from "lucide-react";

interface Doctor {
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
    id: string;
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
    startTime: string;
  }>;
}

const specialtiesList = [
  "all",
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "Pediatrics",
  "Neurology",
  "Gynecology",
];

const chennaiLocalities = [
  "all",
  "Sholinganallur",
  "OMR",
  "Perumbakkam",
  "Kottivakkam",
  "Alwarpet",
  "Vadapalani",
  "Greams Road",
  "Adyar",
  "Anna Nagar",
];

function DoctorsDirectoryContent() {
  const searchParams = useSearchParams();
  const initialSpecialty = searchParams.get("specialty") || "all";
  const initialQuery = searchParams.get("query") || "";
  const initialLocation = searchParams.get("location") || "all";

  const { lang, t } = useApp();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialQuery);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [maxFee, setMaxFee] = useState(1500);
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, selectedLocation, selectedLanguage, maxFee, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSpecialty !== "all") params.set("specialty", selectedSpecialty);
      if (selectedLocation !== "all") params.set("location", selectedLocation);
      if (search.trim()) params.set("query", search.trim());
      if (selectedLanguage !== "all") params.set("language", selectedLanguage);
      if (maxFee < 1500) params.set("maxFee", maxFee.toString());
      params.set("sort", sortBy);

      const res = await fetch(`/api/doctors?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (err) {
      console.error("Failed to load doctors", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedSpecialty("all");
    setSelectedLocation("all");
    setSelectedLanguage("all");
    setMaxFee(1500);
    setSortBy("rating");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-3">
          <MapPin className="w-3.5 h-3.5 text-brand-600" />
          <span>Chennai Metro Area Doctors & Hospitals</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {lang === "en" ? "Find Verified Doctors in Chennai" : "சென்னையின் முன்னணி சிறப்பு மருத்துவர்கள்"}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1.5">
          {lang === "en"
            ? "Connect with top specialists across Apollo Greams Road, Kauvery Alwarpet, SIMS Vadapalani, MIOT, and Fortis Malar with zero double-booking."
            : "அப்போலோ, காவேரி, சிம்ஸ், மியாட் போன்ற முன்னணி மருத்துவமனைகளின் மருத்துவர்களுடன் இரட்டை முன்பதிவு இன்றி ஆலோசியுங்கள்."}
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              lang === "en"
                ? "Search doctor, specialty, or Chennai hospital (Apollo, Kauvery, SIMS, Vadapalani, Adyar)..."
                : "மருத்துவர் பெயர், துறை அல்லது மருத்துவமனை (அப்போலோ, சிம்ஸ், ஆழ்வார்பேட்டை) மூலம் தேடுங்கள்..."
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:bg-white dark:focus:bg-slate-900 outline-none transition"
          />
        </div>

        {/* Specialty Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {specialtiesList.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedSpecialty === spec
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {spec === "all" ? (lang === "en" ? "All Specialties" : "அனைத்து துறைகள்") : spec}
            </button>
          ))}
        </div>

        {/* Secondary Filter Controls: Locality, Language, Max Fee, Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Chennai Locality Filter */}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-medium outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
                title="Filter by Chennai Locality"
              >
                <option value="all">📍 All Chennai Localities</option>
                {chennaiLocalities
                  .filter((loc) => loc !== "all")
                  .map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
              </select>
            </div>

            {/* Language */}
            <div className="flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-medium outline-none text-slate-700 dark:text-slate-300"
              >
                <option value="all">{lang === "en" ? "All Languages" : lang === "ta" ? "அனைத்து மொழிகள்" : "అన్ని భాషలు"}</option>
                <option value="English">English</option>
                <option value="தமிழ்">தமிழ் (Tamil)</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>

            {/* Max Fee */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Max Fee: ₹{maxFee}</span>
              <input
                type="range"
                min={400}
                max={1500}
                step={50}
                value={maxFee}
                onChange={(e) => setMaxFee(Number(e.target.value))}
                className="w-24 accent-brand-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 font-medium outline-none text-slate-700 dark:text-slate-300"
              >
                <option value="rating">Top Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="fee_asc">Fee: Low to High</option>
                <option value="fee_desc">Fee: High to Low</option>
              </select>
            </div>

            {/* Reset */}
            <button
              onClick={handleResetFilters}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6 text-xs text-slate-500">
        <span>Showing {doctors.length} verified doctors</span>
        <span className="flex items-center gap-1 text-emerald-600 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" /> Zero Double-Booking Lock Enabled
        </span>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4 border border-brand-200 dark:border-brand-800">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {lang === "en" ? "No Doctors Found" : "மருத்துவர்கள் காணப்படவில்லை"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            {lang === "en"
              ? "We couldn't find any doctors matching your selected filters. Try broadening your criteria."
              : "நீங்கள் தேர்ந்தெடுத்த வடிப்பான்களுக்கு ஏற்ப மருத்துவர்கள் கிடைக்கவில்லை. பிற வடிப்பான்களை முயற்சிக்கவும்."}
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        /* Doctors Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => {
            const nextSlot = doc.slots[0];
            const slotFormatted = nextSlot
              ? new Date(nextSlot.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;
            const slotDate = nextSlot
              ? new Date(nextSlot.startTime).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              : null;

            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-brand-500/40 transition duration-200 group"
              >
                <div className="p-6">
                  {/* Top Doctor Row */}
                  <div className="flex items-start gap-4 mb-4">
                    <DoctorAvatar
                      src={doc.avatarUrl}
                      name={doc.user.name}
                      specialtyName={doc.specialty.name}
                      size="md"
                    />
                    <div className="overflow-hidden flex-1">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                        {doc.user.name}
                      </h3>
                      <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                        {lang === "ta" ? doc.specialty.nameTa : doc.specialty.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {doc.qualification}
                      </p>
                    </div>
                  </div>

                  {/* Chennai Hospital & Locality Badges */}
                  <div className="mb-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      {doc.hospital && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 min-w-0">
                          <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          <span className="truncate">{doc.hospital}</span>
                        </div>
                      )}
                      {doc.doctorIdCode && (
                        <span className="px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-mono text-[10px] font-bold shrink-0 border border-brand-200/60">
                          {doc.doctorIdCode}
                        </span>
                      )}
                    </div>
                    {doc.cityLocation && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{doc.cityLocation}</span>
                      </div>
                    )}
                    {doc.landmark && (
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 pl-5 truncate">
                        📍 {doc.landmark}
                      </div>
                    )}
                    {doc.fullAddress && (
                      <div className="pt-1 mt-1 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 truncate max-w-[200px]" title={doc.fullAddress}>
                          {doc.fullAddress}
                        </span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doc.fullAddress || `${doc.hospital}, Chennai`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 dark:text-brand-400 hover:underline font-semibold shrink-0 ml-2"
                        >
                          Directions ↗
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {lang === "ta" ? doc.bioTa : doc.bio}
                  </p>

                  {/* Key Stats Row */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800 text-center my-3 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl">
                    <div>
                      <div className="flex items-center justify-center gap-1 font-bold text-xs text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{doc.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">({doc.reviewCount} reviews)</span>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {doc.experienceYears} yrs
                      </span>
                      <span className="text-[10px] text-slate-400 block">Experience</span>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-brand-600 dark:text-brand-400">
                        ₹{doc.consultationFee}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Per Visit</span>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2">
                    <Languages className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Speaks: {doc.languages}</span>
                  </div>

                  {/* Next Available Slot Badge */}
                  {slotFormatted && (
                    <div className="mt-4 p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 flex items-center justify-between text-xs">
                      <span className="text-teal-700 dark:text-teal-300 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>Next Slot:</span>
                      </span>
                      <span className="font-bold text-teal-800 dark:text-teal-200">
                        {slotDate}, {slotFormatted}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="p-6 pt-0">
                  <Link
                    href={`/booking/${doc.id}`}
                    className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-brand-500/20 group-hover:shadow-brand-500/30"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t("bookAppointment")}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading verified doctors...</p>
        </div>
      }
    >
      <DoctorsDirectoryContent />
    </Suspense>
  );
}
