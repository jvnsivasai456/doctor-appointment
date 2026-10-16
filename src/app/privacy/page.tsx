"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/components/providers";
import { ShieldCheck, Lock, FileText, Database, Trash2, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  const { lang, t } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t("back")}</span>
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>India DPDP Act 2023 Compliant</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t("privacyTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Your personal medical data is strictly protected, encrypted, and owned entirely by you.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-600" />
            <span>1. AES-256 Encryption at Rest</span>
          </h2>
          <p>
            All symptoms, medical history notes, and triage reasons entered into MediBook AI are encrypted using industry-standard AES-256 cipher before being written to persistent storage. Only authorized healthcare professionals attending your consultation can view these decrypted notes.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-600" />
            <span>2. Zero PII Transmitted to AI Models</span>
          </h2>
          <p>
            When utilizing our clinical symptom triage chat, your personal identifiable information (PII) including legal name, phone number, email address, and IP address are stripped. The AI engine processes solely anonymized symptom text. Your conversations are never used to train machine learning models.
          </p>
        </section>

        <section className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>3. Right to Erasure (DPDP Act 2023 Section 12)</span>
          </h2>
          <p>
            Under the Digital Personal Data Protection Act, 2023, you hold the absolute right to have your personal data permanently deleted. Executing this will instantly delete your account profile, symptom history, and appointment logs from our servers.
          </p>
          <div className="pt-2">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition"
            >
              <span>Go to Profile to Delete My Data</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
