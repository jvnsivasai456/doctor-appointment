"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/components/providers";
import {
  Stethoscope,
  Send,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Layers,
} from "lucide-react";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  triageData?: {
    specialty: string;
    urgency: "GREEN" | "AMBER" | "RED";
    reason: string;
    clarifying_question: string | null;
  };
}

function TriageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const { lang, t } = useApp();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      content:
        lang === "te"
          ? "నమస్కారం! నేను మెడిబుక్ AI క్లినికల్ అసిస్టెంట్‌ని. మీరు ఎదుర్కొంటున్న ఆరోగ్య సమస్యలు లేదా రోగ లక్షణాలను సరళమైన తెలుగు లేదా ఇంగ్లీషులో వివరించండి."
          : lang === "ta"
          ? "வணக்கம்! நான் மெடிபுக் AI மருத்துவ உதவியாளர். உங்கள் உடல்நலக் கோளாறுகள் அல்லது அறிகுறிகளை எளிய தமிழில் அல்லது ஆங்கிலத்தில் விவரியுங்கள்."
          : "Hello. I'm MediBook AI, your clinical triage assistant. Please describe the symptoms or health concerns you are experiencing in plain language (English, தமிழ், or తెలుగు).",
    },
  ]);

  const [input, setInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [activeTriage, setActiveTriage] = useState<any>(null);
  const [showManualPicker, setShowManualPicker] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // If initialQuery came from homepage search, submit immediately
  useEffect(() => {
    if (initialQuery.trim()) {
      handleSendMessage(initialQuery.trim());
    }
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Triage failed");

      const data = await res.json();
      const triage = data.result;

      setActiveTriage(triage);

      let replyContent = "";
      if (triage.clarifying_question) {
        replyContent = triage.clarifying_question;
      } else if (triage.urgency === "RED") {
        replyContent =
          "CRITICAL EMERGENCY ALERT: Based on your symptoms, online booking is suspended for your safety. Seek immediate emergency care.";
      } else {
        replyContent = `Recommended Specialty: ${triage.specialty} (${triage.urgency} Urgency).\n${triage.reason}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: replyContent,
          triageData: triage,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I could not complete the automated triage. You can select your specialty manually below or try again.",
        },
      ]);
      setShowManualPicker(true);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    {
      label: "Chest Pain & Pressure (Red Alert)",
      text: "Severe crushing chest pain radiating to left arm and neck with cold sweat",
    },
    {
      label: "Skin Itching & Rash (Green)",
      text: "Dry itchy red rash across both arms for the past 4 days",
    },
    {
      label: "Severe Migraine & Dizziness (Amber)",
      text: "Intense throbbing headache on right side with nausea and sensitivity to light",
    },
    {
      label: "Knee Pain After Running (Green)",
      text: "Sharp joint stiffness and pain in right knee after running yesterday",
    },
    {
      label: "கடுமையான நெஞ்சு வலி (Tamil Red)",
      text: "கடுமையான நெஞ்சு வலி மற்றும் மூச்சுத்திணறல் ஏற்படுகிறது",
    },
    {
      label: "తీవ్రమైన ఛాతీ నొప్పి (Telugu Red)",
      text: "తీవ్రమైన ఛాతీ నొప్పి మరియు శ్వాస ఆడకపోవడం ఉంది",
    },
    {
      label: "చర్మం దురద (Telugu Green)",
      text: "రెండు చేతులపై ఎర్రటి దద్దుర్లు మరియు దురద ఉంది",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10 flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            <strong>Disclaimer:</strong> {t("heroDisclaimer")}
          </span>
        </div>
        <button
          onClick={() => setShowManualPicker(!showManualPicker)}
          className="text-brand-600 dark:text-brand-400 font-bold hover:underline shrink-0 text-[11px]"
        >
          {showManualPicker ? "Close Specialty Picker" : "Manual Specialty Picker"}
        </button>
      </div>

      {/* Manual Specialty Picker Fallback */}
      {showManualPicker && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 animate-in fade-in">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
            Choose Specialty Directly
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              "General Medicine",
              "Cardiology",
              "Dermatology",
              "Orthopedics",
              "Pediatrics",
              "Neurology",
            ].map((spec) => (
              <Link
                key={spec}
                href={`/doctors?specialty=${encodeURIComponent(spec)}`}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-brand-500 hover:text-brand-600 transition text-center"
              >
                {spec}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Box */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white flex items-center justify-center shadow-sm">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>AI Clinical Triage Assistant</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <p className="text-[11px] text-slate-400">English & தமிழ் Language Supported</p>
            </div>
          </div>

          <button
            onClick={() => {
              setMessages([
                {
                  id: Date.now().toString(),
                  role: "assistant",
                  content:
                    lang === "en"
                      ? "Conversation reset. What symptoms can I assist you with today?"
                      : "உரையாடல் மீண்டும் தொடங்கப்பட்டது. உங்கள் அறிகுறிகளை விவரியுங்கள்.",
                },
              ]);
              setActiveTriage(null);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.role === "user";
            const triage = m.triageData;

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-brand-600 text-white rounded-br-none shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700/60"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>

                {/* If Assistant returned a triage decision */}
                {triage && !triage.clarifying_question && (
                  <div className="w-full max-w-[90%] sm:max-w-[80%] mt-3">
                    {/* RED EMERGENCY TIER */}
                    {triage.urgency === "RED" ? (
                      <div className="p-5 rounded-2xl bg-rose-600 text-white shadow-xl animate-in fade-in space-y-4 border-2 border-rose-300">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white text-rose-600 flex items-center justify-center font-extrabold shrink-0">
                            <AlertTriangle className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base tracking-tight">
                              {t("emergencyWarningTitle")}
                            </h3>
                            <p className="text-xs text-rose-100">
                              {t("emergencyWarningText")}
                            </p>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-rose-700/60 text-xs text-rose-100 border border-rose-500 space-y-1">
                          <p className="font-bold">Immediate Medical Protocol:</p>
                          <p>
                            • Do not drive yourself. Have someone drive or call emergency services immediately.
                          </p>
                          <p>
                            • If experiencing chest pain, remain calm, sit upright, and loosen tight clothing.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                          <a
                            href="tel:112"
                            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-white text-rose-700 font-extrabold text-xs shadow-md hover:bg-rose-50 transition flex items-center justify-center gap-2"
                          >
                            <PhoneCall className="w-4 h-4" />
                            <span>{t("callEmergency")}</span>
                          </a>
                          <span className="text-[11px] text-rose-200 text-center sm:text-left">
                            National Emergency Helpline 112 (Police, Fire, Ambulance)
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* AMBER / GREEN TIERS */
                      <div className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-brand-600" />
                            <span className="font-bold text-xs text-teal-900 dark:text-teal-200">
                              Recommended: {triage.specialty}
                            </span>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              triage.urgency === "AMBER"
                                ? "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-300"
                                : "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                            }`}
                          >
                            {triage.urgency} TIER (
                            {triage.urgency === "AMBER" ? "Same-Day Priority" : "Routine"})
                          </span>
                        </div>

                        <p className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
                          {triage.reason}
                        </p>

                        <div className="pt-2 border-t border-teal-200/60 dark:border-teal-800/60 flex items-center justify-between">
                          <span className="text-[11px] text-teal-700 dark:text-teal-400">
                            {triage.urgency === "AMBER"
                              ? "Displaying earliest available slots first"
                              : "Choose from verified clinic specialists"}
                          </span>

                          <Link
                            href={`/doctors?specialty=${encodeURIComponent(
                              triage.specialty
                            )}&urgency=${triage.urgency}&symptom=${encodeURIComponent(
                              messages.find((m) => m.role === "user")?.content || ""
                            )}`}
                            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
                          >
                            <span>Book {triage.specialty} Doctor</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 w-24">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Sample Queries */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-none flex gap-2">
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.text)}
              className="px-3 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-brand-500 whitespace-nowrap transition"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              lang === "en"
                ? "Type your symptoms in English or தமிழ்..."
                : "உங்கள் அறிகுறிகளை தமிழ் அல்லது ஆங்கிலத்தில் தட்டச்சு செய்யவும்..."
            }
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm focus:bg-white dark:focus:bg-slate-900 outline-none transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/20 disabled:opacity-40 transition flex items-center justify-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TriagePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading AI Clinical Triage...</p>
        </div>
      }
    >
      <TriageContent />
    </Suspense>
  );
}
