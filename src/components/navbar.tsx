"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useApp } from "./providers";
import {
  Stethoscope,
  Globe,
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  Calendar,
  MessageSquare,
  Users,
  Shield,
  Activity,
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const { lang, setLang, fontSize, setFontSize, t } = useApp();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch notifications if logged in
  useEffect(() => {
    if (session?.user) {
      fetch("/api/notifications")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setNotifications(data))
        .catch(() => {});
    }
  }, [session]);

  const userRole = (session?.user as any)?.role;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              MediBook <span className="text-brand-600 dark:text-brand-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800">AI</span>
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            href="/"
            className="px-3 py-2 rounded-lg hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {t("navHome")}
          </Link>
          <Link
            href="/triage"
            className="px-3 py-2 rounded-lg text-brand-600 dark:text-brand-400 font-semibold bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4 text-brand-600" />
            {t("navTriage")}
          </Link>
          <Link
            href="/doctors"
            className="px-3 py-2 rounded-lg hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            {t("navDoctors")}
          </Link>
          <a
            href="/#book-appointment"
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 shadow-sm transition flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </a>

          {session?.user && (
            <Link
              href="/appointments"
              className="px-3 py-2 rounded-lg hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              {t("navAppointments")}
            </Link>
          )}

          {userRole === "DOCTOR" && (
            <Link
              href="/doctor/dashboard"
              className="px-3 py-2 rounded-lg text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 transition"
            >
              {t("navDoctorQueue")}
            </Link>
          )}

          {userRole === "ADMIN" && (
            <Link
              href="/admin"
              className="px-3 py-2 rounded-lg text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 transition flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              {t("navAdmin")}
            </Link>
          )}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile Quick Book Button */}
          <a
            href="/#book-appointment"
            className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 shadow-sm transition"
            title="Book Doctor Appointment"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book</span>
          </a>
          {/* Font Size Modifier */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFontSize("small")}
              aria-label="Decrease text size"
              title="A- Small"
              className={`px-2 py-1 text-xs font-bold rounded ${fontSize === "small" ? "bg-white dark:bg-slate-900 shadow-sm text-brand-600" : "text-slate-600 dark:text-slate-400"}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize("normal")}
              aria-label="Normal text size"
              title="A Normal"
              className={`px-2 py-1 text-xs font-bold rounded ${fontSize === "normal" ? "bg-white dark:bg-slate-900 shadow-sm text-brand-600" : "text-slate-600 dark:text-slate-400"}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize("large")}
              aria-label="Increase text size"
              title="A+ Large"
              className={`px-2 py-1 text-xs font-bold rounded ${fontSize === "large" ? "bg-white dark:bg-slate-900 shadow-sm text-brand-600" : "text-slate-600 dark:text-slate-400"}`}
            >
              A+
            </button>
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition outline-none cursor-pointer"
              title="Switch Language"
            >
              <option value="en">English (EN)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          )}

          {/* Notifications Bell (for logged in users) */}
          {session?.user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Notifications</span>
                    <span className="text-[11px] text-slate-400">{notifications.length} total</span>
                  </div>
                  <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-100 dark:border-slate-800"
                        >
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                          <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth Button */}
          {session?.user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                <User className="w-3.5 h-3.5 text-brand-600" />
                <span className="max-w-[100px] truncate">{session.user.name || session.user.email}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 font-mono">
                  {(session.user as any).role}
                </span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title={t("navLogout")}
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t("navLogin")}
              </Link>
              <Link
                href="/auth/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 transition"
              >
                {t("navRegister")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
