"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers";
import {
  User,
  Mail,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Calendar,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { lang, t } = useApp();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!session?.user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-sm text-slate-500 mb-4">Please sign in to view account settings.</p>
        <button
          onClick={() => router.push("/auth/login")}
          className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleDeleteMyData = async () => {
    setDeleting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/user/delete-data", {
        method: "POST",
      });

      if (res.ok) {
        // Sign out and redirect to home
        await signOut({ callbackUrl: "/" });
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to erase data.");
        setDeleting(false);
      }
    } catch (err) {
      setErrorMessage("Network error during data deletion.");
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Account & Privacy Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal credentials, DPDP Act 2023 consent, and right to data erasure.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 mb-8">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-brand-500/20">
            {session.user.name?.slice(0, 2).toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {session.user.name}
            </h2>
            <p className="text-xs text-slate-500">{session.user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Role: {(session.user as any).role}
            </span>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">DPDP Act 2023 Statutory Consent:</span>
            </div>
            <span className="text-emerald-600 font-bold">ACTIVE & LOGGED</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4 text-brand-600" />
              <span className="font-semibold">Session Status:</span>
            </div>
            <span className="text-slate-500">Authenticated (JWT)</span>
          </div>
        </div>
      </div>

      {/* Danger Zone: Delete My Data (Right to Erasure) */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl border border-rose-200 dark:border-rose-900/50 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2 mb-2">
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>{t("deleteMyData")}</span>
        </h3>
        <p className="text-xs text-rose-700 dark:text-rose-400 mb-6 leading-relaxed">
          {t("deleteDataNotice")} This action is irreversible under India DPDP Act 2023. Any upcoming appointments will be cancelled and returned to the clinic schedule.
        </p>

        <button
          onClick={() => setDeleteModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Permanently Delete My Data</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Confirm Right to Erasure
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to permanently erase all your data from MediBook AI?
              This includes your account, appointment history, encrypted medical symptom notes, and notifications.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                disabled={deleting}
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDeleteMyData}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:opacity-50"
              >
                {deleting ? "Purging Data..." : "Yes, Permanently Erase Everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
