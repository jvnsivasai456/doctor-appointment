"use client";

import React, { useState } from "react";

interface DoctorAvatarProps {
  src?: string | null;
  name: string;
  specialtyName?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const femaleNameKeywords = [
  "divya",
  "kavitha",
  "pavithra",
  "pushkala",
  "niraaimathi",
  "madhumitha",
  "shalini",
  "gayathri",
  "meenakshi",
  "ananya",
  "lakshmi",
  "priya",
  "dr. kavitha",
  "dr. divya",
  "dr. pushkala",
  "dr. a. s. niraaimathi",
];

export function DoctorAvatar({
  src,
  name,
  specialtyName,
  className = "",
  size = "md",
}: DoctorAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const isFemale = femaleNameKeywords.some((k) =>
    name.toLowerCase().includes(k)
  );

  const animatedFallback = isFemale
    ? "/doctors/animated-female-doctor.svg"
    : "/doctors/animated-male-doctor.svg";

  const effectiveSrc = !src || hasError ? animatedFallback : src;
  const isAnimation =
    effectiveSrc.includes("animated-") || effectiveSrc.endsWith(".svg") || hasError;

  const sizeClasses =
    size === "sm"
      ? "w-10 h-10 rounded-xl"
      : size === "lg"
      ? "w-20 h-20 rounded-2xl"
      : "w-14 h-14 rounded-2xl";

  return (
    <div className={`relative shrink-0 ${sizeClasses} ${className}`}>
      {/* Animated Ping Aura for Doctors without original photo or animated avatar */}
      {isAnimation && (
        <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-brand-500 via-teal-400 to-sky-400 opacity-60 blur-[3px] animate-pulse pointer-events-none" />
      )}

      <img
        src={effectiveSrc}
        alt={name}
        onError={() => setHasError(true)}
        className={`relative z-10 w-full h-full object-cover border-2 shadow-sm transition-transform duration-300 hover:scale-105 ${
          isAnimation
            ? "border-teal-300/80 dark:border-teal-500/80 rounded-2xl"
            : "border-slate-100 dark:border-slate-800 rounded-2xl"
        }`}
      />

      {/* Verified / Animation Indicator Badge */}
      <span
        className={`absolute -bottom-1 -right-1 z-20 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-[9px] font-bold shadow-sm ${
          isAnimation ? "bg-teal-500 animate-pulse" : "bg-emerald-500"
        }`}
        title={isAnimation ? "Verified Clinical Profile (Animated Avatar)" : "Verified Specialist"}
      >
        {isAnimation ? "✨" : "✓"}
      </span>
    </div>
  );
}
