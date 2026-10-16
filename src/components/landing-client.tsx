"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "./providers";
import { DoctorAvatar } from "./doctor-avatar";
import {
  Stethoscope,
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Star,
  Activity,
  AlertCircle,
  ChevronDown,
  Lock,
  Zap,
  CheckCircle2,
  Users,
  Award,
  PhoneCall,
  Flame,
  MapPin,
  Building2,
  Search,
  Quote,
} from "lucide-react";

interface SpecialtyItem {
  id: string;
  name: string;
  nameTa: string;
  description: string;
  descriptionTa: string;
  iconName: string;
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
    startTime: Date | string;
  }>;
}

const iconMap: Record<string, React.ElementType> = {
  Stethoscope,
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Sparkles,
};

const specialtyTeMap: Record<string, { name: string; desc: string }> = {
  "General Medicine": {
    name: "జనరల్ మెడిసిన్ (సాధారణ వైద్యం)",
    desc: "జ్వరం, ఇన్ఫెక్షన్లు మరియు సాధారణ అనారోగ్యాలకు ప్రాథమిక వైద్య సంరక్షణ.",
  },
  "Cardiology": {
    name: "కార్డియాలజీ (గుండె సంరక్షణ)",
    desc: "గుండె జబ్బులు, రక్తపోటు, దడ మరియు ఛాతీ సమస్యల నిపుణులు.",
  },
  "Dermatology": {
    name: "డెర్మటాలజీ (చర్మ వ్యాధులు)",
    desc: "చర్మ వ్యాధులు, దద్దుర్లు, అలర్జీలు మరియు జుట్టు సమస్యల సంరక్షణ.",
  },
  "Orthopedics": {
    name: "ఆర్థోపెడిక్స్ (ఎముకలు & కీళ్ళు)",
    desc: "కీళ్ల నొప్పులు, ఎముకల పగుళ్లు, వెన్నునొప్పి మరియు కండరాల గాయాలు.",
  },
  "Pediatrics": {
    name: "పీడియాట్రిక్స్ (పిల్లల వైద్యం)",
    desc: "శిశువులు మరియు పిల్లల సమగ్ర ఆరోగ్య సంరక్షణ నిపుణులు.",
  },
  "Neurology": {
    name: "న్యూరాలజీ (మెదడు & నరాలు)",
    desc: "మైగ్రేన్, తీవ్ర తలనొప్పి, నరాల సమస్యలు మరియు మెదడు ఆరోగ్యం.",
  },
  "Gynecology": {
    name: "గైనకాలజీ (స్త్రీ జననేంద్రియ శాస్త్రం)",
    desc: "మహిళల ఆరోగ్యం, గర్భధారణ సంరక్షణ మరియు హార్మోన్ల సమస్యల నిపుణులు.",
  },
};

export function LandingClient({
  initialSpecialties,
  initialDoctors,
}: {
  initialSpecialties: SpecialtyItem[];
  initialDoctors: DoctorItem[];
}) {
  const router = useRouter();
  const { lang, t } = useApp();
  const [symptomInput, setSymptomInput] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeDoctorTab, setActiveDoctorTab] = useState<
    "all" | "omr" | "vadapalani" | "alwarpet" | "miot" | "rela" | "greams" | "adyar" | "annanagar" | "billroth" | "mehta"
  >("all");
  const [heroSpecialty, setHeroSpecialty] = useState("all");
  const [heroLocation, setHeroLocation] = useState("all");

  const omrKeywords = [
    "omr",
    "sholinganallur",
    "perungudi",
    "karapakkam",
    "kelambakkam",
    "kottivakkam",
    "navalur",
    "padur",
    "pallikaranai",
    "gleneagles",
    "chettinad",
    "valarcare",
    "iswarya",
    "gem hospital",
    "apollo cradle",
    "kandanchavadi",
  ];

  const omrCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return omrKeywords.some((k) => loc.includes(k) || hosp.includes(k));
  }).length;

  const alwarpetCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("alwarpet") || hosp.includes("alwarpet");
  }).length;

  const vadapalaniCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("vadapalani") || hosp.includes("vadapalani") || hosp.includes("sims") || hosp.includes("vijaya");
  }).length;

  const greamsCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("greams") || hosp.includes("greams");
  }).length;

  const adyarCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("adyar") || hosp.includes("malar");
  }).length;

  const annaNagarCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("anna nagar") || hosp.includes("anna nagar") || hosp.includes("mgm") || hosp.includes("smf");
  }).length;

  const miotCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("manapakkam") || hosp.includes("miot");
  }).length;

  const relaCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("chromepet") || hosp.includes("rela");
  }).length;

  const billrothCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("shenoy") || hosp.includes("billroth");
  }).length;

  const mehtaCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("chetpet") || hosp.includes("mehta");
  }).length;

  const porurCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("porur") || hosp.includes("srmc") || hosp.includes("ramachandra");
  }).length;

  const mogappairCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("mogappair") || hosp.includes("mmm") || hosp.includes("mission");
  }).length;

  const velacheryCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("velachery") || hosp.includes("prashanth") || hosp.includes("astra");
  }).length;

  const kilpaukCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("kilpauk") || hosp.includes("kilpauk") || hosp.includes("first med") || hosp.includes("kumaran") || hosp.includes("lifeline");
  }).length;

  const mylaporeCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("mylapore") || hosp.includes("kalyani") || hosp.includes("isabel") || hosp.includes("csi");
  }).length;

  const tambaramCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("tambaram") || hosp.includes("hindu mission");
  }).length;

  const tnagarCount = initialDoctors.filter((doc) => {
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    return loc.includes("t. nagar") || loc.includes("t nagar") || hosp.includes("be well");
  }).length;

  const displayedDoctors = initialDoctors.filter((doc) => {
    if (activeDoctorTab === "all") return true;
    const loc = (doc.cityLocation || "").toLowerCase();
    const hosp = (doc.hospital || "").toLowerCase();
    if (activeDoctorTab === "omr") {
      return omrKeywords.some((k) => loc.includes(k) || hosp.includes(k));
    }
    if (activeDoctorTab === "vadapalani") {
      return loc.includes("vadapalani") || hosp.includes("vadapalani") || hosp.includes("sims") || hosp.includes("vijaya") || hosp.includes("sooriya");
    }
    if (activeDoctorTab === "alwarpet") {
      return loc.includes("alwarpet") || hosp.includes("alwarpet") || hosp.includes("motherhood");
    }
    if (activeDoctorTab === "porur") {
      return loc.includes("porur") || hosp.includes("srmc") || hosp.includes("ramachandra");
    }
    if (activeDoctorTab === "kilpauk") {
      return loc.includes("kilpauk") || hosp.includes("kilpauk") || hosp.includes("first med") || hosp.includes("kumaran") || hosp.includes("lifeline");
    }
    if (activeDoctorTab === "mylapore") {
      return loc.includes("mylapore") || hosp.includes("kalyani") || hosp.includes("isabel") || hosp.includes("csi");
    }
    if (activeDoctorTab === "mogappair") {
      return loc.includes("mogappair") || hosp.includes("mmm") || hosp.includes("mission");
    }
    if (activeDoctorTab === "velachery") {
      return loc.includes("velachery") || hosp.includes("prashanth") || hosp.includes("astra");
    }
    if (activeDoctorTab === "tambaram") {
      return loc.includes("tambaram") || hosp.includes("hindu mission");
    }
    if (activeDoctorTab === "tnagar") {
      return loc.includes("t. nagar") || loc.includes("t nagar") || hosp.includes("be well");
    }
    if (activeDoctorTab === "miot") {
      return loc.includes("manapakkam") || hosp.includes("miot");
    }
    if (activeDoctorTab === "rela") {
      return loc.includes("chromepet") || hosp.includes("rela");
    }
    if (activeDoctorTab === "greams") {
      return loc.includes("greams") || hosp.includes("greams");
    }
    if (activeDoctorTab === "adyar") {
      return loc.includes("adyar") || hosp.includes("malar");
    }
    if (activeDoctorTab === "annanagar") {
      return loc.includes("anna nagar") || hosp.includes("anna nagar") || hosp.includes("mgm") || hosp.includes("smf") || hosp.includes("bloom");
    }
    if (activeDoctorTab === "billroth") {
      return loc.includes("shenoy") || hosp.includes("billroth");
    }
    if (activeDoctorTab === "mehta") {
      return loc.includes("chetpet") || hosp.includes("mehta") || hosp.includes("vs hospital");
    }
    return true;
  });

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroSpecialty !== "all") params.set("specialty", heroSpecialty);
    if (heroLocation !== "all") params.set("location", heroLocation);
    if (symptomInput.trim()) params.set("query", symptomInput.trim());
    router.push(`/doctors?${params.toString()}`);
  };

  const handleSymptomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;
    router.push(`/triage?q=${encodeURIComponent(symptomInput.trim())}`);
  };

  const getSymptomChips = () => {
    if (lang === "te") {
      return [
        { label: "ఛాతీలో నొప్పి & బిగుతు", query: "తీవ్రమైన ఛాతీ నొప్పి మరియు గుండె దడగా ఉంది" },
        { label: "చర్మంపై ఎర్రటి దద్దుర్లు", query: "చేతులపై ఎర్రటి దద్దుర్లు మరియు దురద ఉంది" },
        { label: "తీవ్రమైన మైగ్రేన్ తలనొప్పి", query: "ఎడమ వైపు తీవ్రమైన తలనొప్పి మరియు వాంతి భావన" },
        { label: "మోకాలి కీళ్ల నొప్పులు", query: "కుడి మోకాలిలో తీవ్రమైన కీళ్ల నొప్పి ఉంది" },
        { label: "పిల్లల అధిక జ్వరం", query: "చిన్నారికి విపరీతమైన జ్వరం మరియు వణుకు ఉంది" },
      ];
    }
    if (lang === "ta") {
      return [
        { label: "நெஞ்சு இறுக்கம் & படபடப்பு", query: "கடுமையான நெஞ்சு இறுக்கம் மற்றும் படபடப்பு" },
        { label: "தோல் அரிப்பு & தடிப்பு", query: "இரு கைகளிலும் சிவப்பு தடிப்பு மற்றும் அரிப்பு" },
        { label: "ஒற்றைத் தலைவலி & வாந்தி", query: "இடது பக்க தலைவலி மற்றும் குமட்டல் உணர்வு" },
        { label: "முழங்கால் மூட்டு வலி", query: "வலது முழங்காலில் கடுமையான மூட்டு வலி" },
        { label: "குழந்தைக்கு கடுமையான காய்ச்சல்", query: "குழந்தைக்கு அதிக காய்ச்சல் மற்றும் நடுக்கம்" },
      ];
    }
    return [
      { label: "Chest Tightness & Palpitations", query: "Severe chest tightness radiating to arm with palpitations" },
      { label: "Skin Itching & Rash", query: "Red itchy rash on forearms for past 3 days" },
      { label: "Pounding Left-side Migraine", query: "Severe throbbing headache on left side with nausea" },
      { label: "Knee Joint Pain", query: "Sharp right knee pain and swelling after workout" },
      { label: "Child High Fever", query: "Toddler high fever with shivering and crying" },
    ];
  };

  const faqs = [
    {
      q:
        lang === "te"
          ? "AI రోగ లక్షణాల విశ్లేషణ ఎలా పనిచేస్తుంది?"
          : lang === "ta"
          ? "AI அறிகுறி மதிப்பீடு எவ்வாறு செயல்படுகிறது?"
          : "How does the AI triage work?",
      a:
        lang === "te"
          ? "మీరు ఎదుర్కొంటున్న ఆరోగ్య సమస్యను సరళమైన తెలుగు, తమిళం లేదా ఇంగ్లీషులో వివరించవచ్చు. మా క్లినికల్ ఇంజిన్ మీ అత్యవసరతను (గ్రీన్, అంబర్, లేదా రెడ్) అంచనా వేసి సరైన వైద్య విభాగానికి మార్గనిర్దేశం చేస్తుంది."
          : lang === "ta"
          ? "உங்கள் அறிகுறிகளை எளிய தமிழ் அல்லது ஆங்கிலத்தில் கூறலாம். எங்களின் AI உங்கள் அவசர நிலையை (பச்சை, மஞ்சள், சிவப்பு) கணித்து பொருத்தமான மருத்துவரிடம் வழிகாட்டுகிறது."
          : "You describe what you're feeling in plain English, Tamil, or Telugu. Our clinical engine analyzes your urgency (Green, Amber, or Red) and directs you to the exact medical specialty you need without medical jargon.",
    },
    {
      q:
        lang === "te"
          ? "మెడిబుక్ AI వ్యాధి నిర్ధారణ లేదా మందులను సిఫారసు చేస్తుందా?"
          : lang === "ta"
          ? "மெடிபுக் AI நோயறிதல் அல்லது மருந்து பரிந்துரை செய்யுமா?"
          : "Does MediBook AI give a diagnosis or prescription?",
      a:
        lang === "te"
          ? "లేదు. మెడిబుక్ AI రోగ లక్షణాలను మాత్రమే విశ్లేషించి ధృవీకరించబడిన నిపుణులతో కలుపుతుంది. ఇది ఎప్పుడూ వ్యాధి నిర్ధారణ చేయదు లేదా మందులను సిఫారసు చేయదు."
          : lang === "ta"
          ? "இல்லை. மெடிபுக் AI அறிகுறிகளை மதிப்பீடு செய்து சரியான மருத்துவரிடம் மட்டுமே இணைக்கிறது. மருந்து பரிந்துரைப்பதோ நோயறிதல் செய்வதோ இல்லை."
          : "No. MediBook AI strictly triages and routes patients to licensed specialists. It never diagnoses conditions or prescribes medications.",
    },
    {
      q:
        lang === "te"
          ? "నా లక్షణాలు అత్యవసర పరిస్థితిగా ఉంటే ఏమి జరుగుతుంది?"
          : lang === "ta"
          ? "எனது அறிகுறிகள் அவசர நிலையாக இருந்தால் என்ன நடக்கும்?"
          : "What happens if my symptoms are an emergency?",
      a:
        lang === "te"
          ? "తీవ్రమైన ఛాతీ నొప్పి, పక్షవాతం లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది వంటి అధిక-ప్రమాదకర లక్షణాలు కనిపిస్తే, ఆన్‌లైన్ బుకింగ్ వెంటనే నిలిపివేయబడి 112 అత్యవసర డయల్ సహాయం ప్రదర్శించబడుతుంది."
          : lang === "ta"
          ? "மாரடைப்பு அல்லது மூச்சுத்திணறல் போன்ற தீவிர அறிகுறிகள் இருப்பின் முன்பதிவு உடனே நிறுத்தப்பட்டு 112 அவசர உதவி எண் காண்பிக்கப்படும்."
          : "If high-risk symptoms like severe chest pain, stroke warning signs, or breathlessness are detected, booking is suspended immediately and an emergency alert with quick-dial 112 is displayed.",
    },
    {
      q:
        lang === "te"
          ? "డబుల్ బుకింగ్ లేకుండా ఎలా చూసుకుంటారు?"
          : lang === "ta"
          ? "இரட்டை முன்பதிவு இல்லாமை எவ்வாறு உறுதி செய்யப்படுகிறது?"
          : "How does zero double-booking work?",
      a:
        lang === "te"
          ? "మీరు ఒక సమయ స్లాట్‌ను ఎంచుకున్నప్పుడు, 180 సెకన్ల మ్యూటెక్స్ లాక్ ఆ స్లాట్‌ను మీ కోసం మాత్రమే రిజర్వ్ చేస్తుంది. అదనంగా, మా డేటాబేస్ ఖచ్చితమైన ప్రత్యేక నియమాన్ని (doctorId, startTime) అమలు చేస్తుంది."
          : lang === "ta"
          ? "நீங்கள் நேரத்தை தேர்ந்தெடுத்ததும் 180 வினாடிகளுக்கு அது உங்களுக்காக மட்டுமே முடக்கப்படும். தரவுத்தள கட்டுப்பாட்டால் இருவர் ஒரே நேரத்தில் பதிவு செய்ய இயலாது."
          : "When you select a slot, a 180-second mutex lock reserves it exclusively for you while you confirm. Plus, our database enforces a strict unique constraint on (doctorId, startTime).",
    },
    {
      q:
        lang === "te"
          ? "DPDP చట్టం 2023 ప్రకారం నా ఆరోగ్య సమాచారం భద్రంగా ఉంటుందా?"
          : lang === "ta"
          ? "எனது உடல்நலத் தகவல்கள் DPDP சட்டம் 2023 படி பாதுகாக்கப்படுகிறதா?"
          : "Is my health data private and secure under DPDP Act 2023?",
      a:
        lang === "te"
          ? "అవును. మీ ఆరోగ్య సమాచారం మొత్తం AES-256 ఎన్‌క్రిప్షన్‌తో సురక్షితంగా ఉంటుంది. మీ ప్రొఫైల్ నుండి ఎప్పుడైనా మీ డేటాను పూర్తిగా తొలగించే హక్కు (Right to Erasure) మీకు ఉంది."
          : lang === "ta"
          ? "ஆம். உங்கள் தகவல்கள் AES-256 மூலம் குறியாக்கம் செய்யப்பட்டுள்ளன. நீங்கள் விரும்பும் போது சுயவிவரத்தில் இருந்து உங்கள் தரவை முழுமையாக நீக்கலாம்."
          : "Yes. All symptom notes are encrypted with AES-256 at rest, patient identifiers are never sent to AI models, and you have full Right to Erasure ('Delete My Data') anytime from your profile.",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Top Clinical Announcement Ribbon */}
      <div className="bg-gradient-to-r from-teal-800 via-brand-700 to-sky-800 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>
          <strong>Emergency Protocol:</strong> Call <strong className="underline font-bold">112</strong> for immediate medical dispatch. MediBook AI guarantees 180s mutex slot hold with zero double-booking.
        </span>
      </div>

      {/* Hero Section with Medical Background Imagery */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-slate-200/80 dark:border-slate-800/80">
        {/* Modern Medical Consultation Clinic Backdrop */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2000"
            alt="Medical Clinic Consultation Room"
            className="w-full h-full object-cover object-center opacity-10 dark:opacity-10 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-slate-50/95 to-slate-50 dark:from-slate-950/80 dark:via-slate-950/95 dark:to-slate-950" />
        </div>

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] ambient-glow-teal rounded-full blur-3xl pointer-events-none -z-10 opacity-70 dark:opacity-40" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust Floating Pills */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50/90 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-xs font-semibold text-teal-800 dark:text-teal-200 backdrop-blur-md shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Chennai Doctors • Apollo, Kauvery, SIMS, MIOT</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50/90 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-xs font-semibold text-brand-700 dark:text-brand-300 backdrop-blur-md shadow-sm">
              <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>DPDP Act 2023 Compliant</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50/90 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-xs font-semibold text-sky-700 dark:text-sky-300 backdrop-blur-md shadow-sm">
              <Lock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>180s Mutex Slot Reservation</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/90 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 backdrop-blur-md shadow-sm">
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Under 45s Booking</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            {t("heroTitle")}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t("heroSubtitle")}
          </p>

          {/* Multi-Filter Clinical Quick Finder Bar */}
          <div className="mt-8 sm:mt-10 max-w-4xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl sm:rounded-3xl shadow-xl shadow-teal-900/5 dark:shadow-none border border-slate-200 dark:border-slate-800 transition">
            <form onSubmit={handleHeroSearch} className="flex flex-col md:flex-row items-center gap-2">
              {/* Location Selector */}
              <div className="w-full md:w-52 flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mr-2" />
                <select
                  value={heroLocation}
                  onChange={(e) => setHeroLocation(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="all">📍 All Chennai (135 Doctors - 34 Hospitals)</option>
                  <option value="OMR">OMR Corridor (21 Doctors - Gleneagles, Chettinad, GEM)</option>
                  <option value="Vadapalani">Vadapalani (15 Doctors - SIMS, Kauvery, Vijaya, Sooriya)</option>
                  <option value="Alwarpet">Alwarpet (12 Doctors - Kauvery, Motherhood)</option>
                  <option value="Anna Nagar">Anna Nagar (10 Doctors - MGM, SMF, Bloom)</option>
                  <option value="Velachery">Velachery (9 Doctors - Prashanth, Astra)</option>
                  <option value="Chromepet">Chromepet (7 Doctors - Rela)</option>
                  <option value="Manapakkam">Manapakkam (7 Doctors - MIOT)</option>
                  <option value="Kilpauk">Kilpauk (6 Doctors - Apollo First Med, Kumaran, Lifeline)</option>
                  <option value="Mylapore">Mylapore (6 Doctors - Kalyani, St. Isabel&apos;s, CSI)</option>
                  <option value="Greams Road">Greams Road (5 Doctors - Apollo Main)</option>
                  <option value="Porur">Porur (5 Doctors - SRMC)</option>
                  <option value="Chetpet">Chetpet (5 Doctors - Dr. Mehta&apos;s, VS Hospitals)</option>
                  <option value="Mogappair">Mogappair (4 Doctors - MMM)</option>
                  <option value="Taramani">Taramani (4 Doctors - VHS)</option>
                  <option value="Pallikaranai">Pallikaranai (3 Doctors - KMH)</option>
                  <option value="Shenoy Nagar">Shenoy Nagar (3 Doctors - Billroth)</option>
                  <option value="Tambaram">Tambaram (2 Doctors - Hindu Mission)</option>
                  <option value="T. Nagar">T. Nagar (2 Doctors - Be Well)</option>
                  <option value="Nungambakkam">Nungambakkam (2 Doctors - Sankara Nethralaya)</option>
                  <option value="Saligramam">Saligramam (2 Doctors - Sooriya)</option>
                  <option value="Vanagaram">Vanagaram (2 Doctors - Apollo Vanagaram)</option>
                  <option value="Purasawalkam">Purasawalkam (2 Doctors - Noble)</option>
                  <option value="Thiruvottiyur">Thiruvottiyur (2 Doctors - Aakash)</option>
                  <option value="Adyar">Adyar (2 Doctors - Fortis Malar)</option>
                </select>
              </div>

              {/* Specialty Selector */}
              <div className="w-full md:w-56 flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <Stethoscope className="w-4 h-4 text-brand-600 shrink-0 mr-2" />
                <select
                  value={heroSpecialty}
                  onChange={(e) => setHeroSpecialty(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="all">🩺 All Specialties</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology (Heart)</option>
                  <option value="Neurology">Neurology (Brain/Spine)</option>
                  <option value="Orthopedics">Orthopedics (Joints)</option>
                  <option value="Pediatrics">Pediatrics (Child Care)</option>
                  <option value="Dermatology">Dermatology (Skin/Hair)</option>
                  <option value="Gynecology">Gynecology (Women/PCOS)</option>
                </select>
              </div>

              {/* Symptom / Doctor search input */}
              <div className="w-full flex-1 flex items-center px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  placeholder={
                    lang === "te"
                      ? "లక్షణాలు, డాక్టర్ పేరు లేదా ఆసుపత్రి..."
                      : lang === "ta"
                      ? "அறிகுறிகள், மருத்துவர் பெயர் அல்லது மருத்துவமனை..."
                      : "Search symptoms, doctor, hospital..."
                  }
                  className="w-full bg-transparent text-xs sm:text-sm outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-normal"
                />
              </div>

              {/* Search button */}
              <button
                type="submit"
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>{lang === "te" ? "వెతకండి" : lang === "ta" ? "தேடுங்கள்" : "Search"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Quick Symptom Suggestion Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-600 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-brand-500" />
              {lang === "te" ? "ప్రముఖ లక్షణాలు:" : lang === "ta" ? "பிரபலமான அறிகுறிகள்:" : "Popular Symptoms:"}
            </span>
            {getSymptomChips().map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setSymptomInput(chip.query);
                  router.push(`/triage?q=${encodeURIComponent(chip.query)}`);
                }}
                className="px-3 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950 dark:hover:text-brand-300 border border-slate-200 dark:border-slate-700 shadow-sm transition font-medium text-[11px]"
              >
                + {chip.label}
              </button>
            ))}
          </div>

          {/* Safety Disclaimer */}
          <p className="mt-5 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{t("heroDisclaimer")}</span>
          </p>

          {/* Real Clinical Capacity Trust Cards */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:border-brand-500/40 transition">
              <span className="text-2xl sm:text-3xl font-black text-brand-600 block">135+</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Verified Doctors</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">34 Partner Hospitals in Chennai</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:border-sky-500/40 transition">
              <span className="text-2xl sm:text-3xl font-black text-sky-600 block">34</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Premier Hospitals</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Apollo, Kauvery, MIOT, SIMS, SRMC</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:border-teal-500/40 transition">
              <span className="text-2xl sm:text-3xl font-black text-teal-600 block">21</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">OMR Highway Doctors</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Taramani to Kelambakkam</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:border-emerald-500/40 transition">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 block">20,700+</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Open Slots / 14 Days</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">180s Mutex Lock Guaranteed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Accredited Healthcare Standards Trust Bar */}
      <section className="py-6 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>India DPDP Act 2023 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-600" />
              <span>AES-256 Encrypted Health Notes</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>Direct 112 Emergency Dispatch Link</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>NABH & IMA Accredited Doctors</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step "How it works" */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-3">
            <span>Fast & Transparent Healthcare</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("howItWorksTitle")}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
            No medical jargon, no double bookings, no unmonitored queues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/50 hover:-translate-y-1 transition duration-200">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg mb-5 border border-teal-200 dark:border-teal-800 shadow-sm">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t("step1Title")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("step1Desc")}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-500/50 hover:-translate-y-1 transition duration-200">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg mb-5 border border-sky-200 dark:border-sky-800 shadow-sm">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t("step2Title")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("step2Desc")}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 hover:-translate-y-1 transition duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-5 border border-emerald-200 dark:border-emerald-800 shadow-sm">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {t("step3Title")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("step3Desc")}
            </p>
          </div>
        </div>
      </section>

      {/* Specialties Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t("specialtiesTitle")}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
              {t("specialtiesSubtitle")}
            </p>
          </div>
          <Link
            href="/doctors"
            className="mt-4 sm:mt-0 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>{lang === "en" ? "View all doctors" : lang === "ta" ? "அனைத்து மருத்துவர்கள்" : "అన్ని వైద్యులు"}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialSpecialties.map((s) => {
            const IconComponent = iconMap[s.iconName] || Stethoscope;
            const teItem = specialtyTeMap[s.name];
            const displayName = lang === "te" ? teItem?.name || s.name : lang === "ta" ? s.nameTa : s.name;
            const displayDesc = lang === "te" ? teItem?.desc || s.description : lang === "ta" ? s.descriptionTa : s.description;

            return (
              <Link
                key={s.id}
                href={`/doctors?specialty=${encodeURIComponent(s.name)}`}
                className="group p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5 transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-brand-200 dark:border-brand-800">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {displayName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {displayDesc}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                  <span>{lang === "en" ? "Browse Specialists" : lang === "ta" ? "மருத்துவர்களை காண்க" : "నిపుణులను చూడండి"}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Premier Chennai Hospital Networks Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Accredited Clinical Networks</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {lang === "ta"
                ? "சென்னையின் முன்னணி மருத்துவமனை கூட்டமைப்பு"
                : lang === "te"
                ? "చెన్నైలోని అగ్రగామి ఆసుపత్రి నెట్‌వర్క్‌లు"
                : "Premier Hospital Networks in Chennai"}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
              NABH & JCI accredited multi-speciality medical centres with dedicated OPD chambers & emergency protocols.
            </p>
          </div>
          <Link
            href="/doctors"
            className="mt-4 sm:mt-0 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>Browse All Network Doctors</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Hospital 1: Gleneagles Health City */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/60">
                  JCI & NABH Accredited
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 2 Specialists Open
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                Gleneagles Health City
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Cheran Nagar, Sholinganallur, OMR
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                45-acre multi-organ transplant & neuro-cardiac hospital. Featuring Dr. Dinesh Nayak (Neurology) and Dr. Arvind Menon (General Medicine).
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Neurology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">General Medicine</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">24x7 Stroke Unit</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/doctors?location=Sholinganallur"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View Gleneagles Doctors</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Gleneagles+Health+City+Sholinganallur+Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Directions ↗
              </a>
            </div>
          </div>

          {/* Hospital 2: Apollo Cradle & Children's Hospital */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/60">
                  Apollo Network
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 2 Specialists Open
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                Apollo Cradle & Children&apos;s
              </h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Rajiv Gandhi Salai, Karapakkam, OMR
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                Dedicated women and child super-speciality centre. Featuring Dr. Shruti K. (Pediatrics) and Dr. Dhivyambigai Rajendran (Obstetrics & Gynaecology).
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Pediatrics</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Gynecology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Level-III NICU</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/doctors?location=Karapakkam"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View Apollo OMR Doctors</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Apollo+Cradle+Karapakkam+OMR+Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Directions ↗
              </a>
            </div>
          </div>

          {/* Hospital 3: Kauvery Hospital Alwarpet */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/60">
                  Centre of Excellence
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 6 Specialists Open
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                Kauvery Hospital (Alwarpet)
              </h3>
              <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> No. 199, Luz Church Road, Alwarpet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                Flagship tertiary hospital with advanced Heart & Brain Institute. Senior consultants including Dr. Suresh Rao, Dr. Ananya Swaminathan, and Dr. Vikram Raghavan.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Cardiology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Neurology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Orthopedics</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/doctors?location=Alwarpet"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View Alwarpet Specialists</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Kauvery+Hospital+Alwarpet+Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Directions ↗
              </a>
            </div>
          </div>

          {/* Hospital 4: Kauvery Hospital Vadapalani */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/60">
                  Metro Adjacent Hub
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 6 Specialists Open
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                Kauvery Hospital (Vadapalani)
              </h3>
              <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Jawaharlal Nehru Road, Vadapalani
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                250-bed multi-speciality hospital adjacent to Vadapalani Metro station. Senior faculty including Dr. Rajesh Kumar, Dr. Anand Srinivasan, and Dr. Pavithra Sundar.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Cardiology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Orthopedics</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Pediatrics</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/doctors?location=Vadapalani"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View Vadapalani Specialists</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Kauvery+Hospital+Vadapalani+Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Directions ↗
              </a>
            </div>
          </div>

          {/* Hospital 5: GEM Hospital Perungudi */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/60">
                  Gastro Centre of Excellence
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 1 Specialist Open
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                GEM Hospital & Research Centre
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> MGR Main Road, Perungudi, OMR
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                Asia&apos;s premier gastroenterology, liver, and advanced laparoscopic surgery facility. Featuring Dr. R. Vinoth Kumar (Gastroenterologist & Hepatologist).
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Gastroenterology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Endoscopy Suite</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Liver ICU</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/doctors?location=Perungudi"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View GEM Perungudi Doctors</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=GEM+Hospital+Perungudi+OMR+Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Directions ↗
              </a>
            </div>
          </div>

          {/* Hospital 6: Chettinad Super Speciality Hospital */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60">
                  Multi-Speciality Campus
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 1 Specialist Open
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                Chettinad Super Speciality Hospital
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Chettinad Health City, Kelambakkam, OMR
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                Expansive tertiary healthcare centre serving South OMR. Featuring Dr. G. Ashok (Cardiologist) and complete 24/7 cardiac catheterization laboratory.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Cardiology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Interventional ICU</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Emergency Cath Lab</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/doctors?location=Kelambakkam"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View Chettinad Doctors</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Chettinad+Health+City+Kelambakkam+OMR+Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Directions ↗
              </a>
            </div>
          </div>

          {/* Hospital 7: MIOT International */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/60">
                  Global Ortho & Cardio Hub
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 3 Specialists Open
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                MIOT International
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Mount Poonamallee Road, Manapakkam
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                1000-bed quaternary care centre with world-class Institute of Orthopaedics, Cardiac Care, and Neurosciences. Featuring Dr. Prithvi Mohandas and Dr. V. V. Bashi.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Orthopedics</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Cardiology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Neurology</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/doctors?location=Manapakkam"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View MIOT Doctors</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=MIOT+International+Manapakkam+Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Directions ↗
              </a>
            </div>
          </div>

          {/* Hospital 8: SIMS Hospital Vadapalani */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/60">
                  Metro Super Speciality
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 3 Specialists Open
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                SIMS Hospital (Vadapalani)
              </h3>
              <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Jawaharlal Nehru Salai, Vadapalani Metro
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                Directly connected to Vadapalani Metro. Renowned for Advanced Neurosciences, TAVR Valve Cardiac Programme, and Orthopedics. Featuring Dr. U. Meenakshisundaram and Dr. Gopalamurugan.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Neurology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Cardiology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Orthopedics</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/doctors?location=Vadapalani"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View SIMS Specialists</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=SIMS+Hospital+Vadapalani+Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Directions ↗
              </a>
            </div>
          </div>

          {/* Hospital 9: Rela Hospital Chromepet */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/60">
                  Quaternary Institute
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 3 Specialists Open
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                Rela Hospital (Chromepet)
              </h3>
              <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> CLC Works Road, Chromepet, South Chennai
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                Founded by Prof. Mohamed Rela. 450-bed quaternary care hub for hepatobiliary wellness, complex internal medicine, neurology, and critical care.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">General Medicine</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Neurology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Critical Care</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/doctors?location=Chromepet"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View Rela Doctors</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Rela+Hospital+Chromepet+Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Directions ↗
              </a>
            </div>
          </div>

          {/* Hospital 10: Apollo Speciality Hospitals OMR */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/60">
                  Apollo Network
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 3 Specialists Open
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                Apollo Speciality Hospitals (OMR)
              </h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Rajiv Gandhi Salai, Kandanchavadi / Perungudi
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                Comprehensive multi-speciality tertiary facility catering to OMR IT professionals. Featuring Dr. Bellarmine Lawrence, Dr. Preetha Anand, and Dr. Anand Murugesan.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">General Medicine</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Dermatology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Orthopedics</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/doctors?location=Perungudi"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View Apollo OMR Doctors</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Apollo+Speciality+Hospitals+OMR+Kandanchavadi+Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Directions ↗
              </a>
            </div>
          </div>

          {/* Hospital 11: Billroth Hospitals */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/60">
                  Heritage Medical Group
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 3 Specialists Open
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                Billroth Hospitals (Shenoy Nagar)
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Lakshmi Talkies Road, Shenoy Nagar
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                Trusted for over 3 decades in central Chennai. Expert clinical care across General Medicine, Cardiology, and Gynecology. Featuring Dr. Rajesh B. and Dr. Kalpana S.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">General Medicine</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Gynecology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Cardiology</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/doctors?location=Shenoy%20Nagar"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View Billroth Doctors</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Billroth+Hospitals+Shenoy+Nagar+Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Directions ↗
              </a>
            </div>
          </div>

          {/* Hospital 12: Dr. Mehta's Hospitals */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60">
                  85+ Years Excellence
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 3 Specialists Open
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                Dr. Mehta&apos;s Hospitals (Chetpet)
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> McNichols Road, Chetpet, Central Chennai
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                Pioneers of pediatric and maternal healthcare in India. Over 85 years of clinical trust. Featuring Dr. Thangavelu, Dr. Sudha Madhavan, and Dr. M. G. Kannan.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Pediatrics</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Gynecology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">General Medicine</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/doctors?location=Chetpet"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View Mehta&apos;s Doctors</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Dr+Mehta+Hospitals+Chetpet+Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Directions ↗
              </a>
            </div>
          </div>

          {/* Hospital 13: Sri Ramachandra Medical Centre (SRMC) */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/60">
                  Deemed Medical University
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 5 Specialists Open
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                Sri Ramachandra Medical Centre (SRMC)
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> No. 1, Ramachandra Nagar, Porur
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                South India&apos;s flagship 2,000-bed university healthcare destination. Leading specialists: Dr. T. R. Muralidharan (Cardio), Dr. P. V. Vijayaraghavan (Ortho), and Dr. Usha Vishwanath (Gynae).
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Cardiology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Orthopedics</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">General Medicine</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/doctors?location=Porur"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View SRMC Specialists</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Sri+Ramachandra+Medical+Centre+Porur+Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Directions ↗
              </a>
            </div>
          </div>

          {/* Hospital 14: Madras Medical Mission (MMM) */}
          <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/60">
                  Cardiac & Neuro Pioneer
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 4 Specialists Open
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                Madras Medical Mission (MMM)
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> 4-A, Dr. J. Jayalalitha Nagar, Mogappair East
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                Internationally renowned for pioneering cardiovascular surgeries and advanced neurology. Featuring Dr. Mullasari Ajit Sankardas, Dr. Benjamin Cherian, and Dr. Jacob George.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Cardiology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Neurology</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Pediatrics</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/doctors?location=Mogappair"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View MMM Specialists</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Madras+Medical+Mission+Mogappair+Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Directions ↗
              </a>
            </div>
          </div>
        </div>

        {/* Chennai Locality Quick Pills */}
        <div className="mt-10 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Direct Browse by Chennai Hub:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { name: "OMR IT Corridor (21)", query: "OMR" },
              { name: "Vadapalani (15)", query: "Vadapalani" },
              { name: "Alwarpet (12)", query: "Alwarpet" },
              { name: "Anna Nagar (10)", query: "Anna Nagar" },
              { name: "Velachery (9)", query: "Velachery" },
              { name: "Chromepet (7)", query: "Chromepet" },
              { name: "Manapakkam - MIOT (7)", query: "Manapakkam" },
              { name: "Kilpauk (6)", query: "Kilpauk" },
              { name: "Mylapore (6)", query: "Mylapore" },
              { name: "Greams Road - Apollo (5)", query: "Greams Road" },
              { name: "Porur - SRMC (5)", query: "Porur" },
              { name: "Chetpet (5)", query: "Chetpet" },
              { name: "Mogappair - MMM (4)", query: "Mogappair" },
              { name: "Taramani - VHS (4)", query: "Taramani" },
              { name: "Pallikaranai - KMH (3)", query: "Pallikaranai" },
              { name: "Shenoy Nagar - Billroth (3)", query: "Shenoy Nagar" },
              { name: "Tambaram - Hindu Mission (2)", query: "Tambaram" },
              { name: "T. Nagar - Be Well (2)", query: "T. Nagar" },
              { name: "Nungambakkam - SN (2)", query: "Nungambakkam" },
              { name: "Adyar - Fortis Malar (2)", query: "Adyar" },
              { name: "Saligramam - Sooriya (2)", query: "Saligramam" },
              { name: "Vanagaram - Apollo (2)", query: "Vanagaram" },
              { name: "Purasawalkam - Noble (2)", query: "Purasawalkam" },
              { name: "Thiruvottiyur - Aakash (2)", query: "Thiruvottiyur" },
            ].map((hub) => (
              <Link
                key={hub.name}
                href={`/doctors?location=${encodeURIComponent(hub.query)}`}
                className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 transition shadow-2xs text-[11px]"
              >
                📍 {hub.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Chennai Doctors Section */}
      <section className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-3">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>Chennai Medical Specialists</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {lang === "ta" ? "சென்னையின் முன்னணி சிறப்பு மருத்துவர்கள்" : lang === "te" ? "చెన్నైలోని ప్రముఖ వైద్య నిపుణులు" : "Top Verified Specialists in Chennai"}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 max-w-2xl mx-auto">
              {lang === "ta"
                ? "OMR, வடபழனி, ஆழ்வார்பேட்டை, மணப்பாக்கம் (மியாட்), குரோம்பேட்டை (ரேலா), கிரீம்ஸ் ரோடு உள்ளிட்ட முன்னணி மருத்துவமனைகளின் மருத்துவர்கள்"
                : "Consult accredited doctors across OMR Corridor, Vadapalani, Alwarpet, MIOT Manapakkam, Rela Chromepet, Apollo Greams Road, Fortis Malar, and MGM Anna Nagar."}
            </p>
          </div>

          {/* Interactive Locality Hub Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              type="button"
              onClick={() => setActiveDoctorTab("all")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "all"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>📍 All Chennai Specialists</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "all" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}>
                {initialDoctors.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("omr")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "omr"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>OMR Corridor Hubs</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "omr" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
              }`}>
                {omrCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("vadapalani")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "vadapalani"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>Vadapalani Hub (SIMS & Kauvery)</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "vadapalani" ? "bg-white/20 text-white" : "bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300"
              }`}>
                {vadapalaniCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("alwarpet")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "alwarpet"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>Kauvery Alwarpet</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "alwarpet" ? "bg-white/20 text-white" : "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300"
              }`}>
                {alwarpetCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("miot")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "miot"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>MIOT Manapakkam</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "miot" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
              }`}>
                {miotCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("rela")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "rela"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>Rela Chromepet</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "rela" ? "bg-white/20 text-white" : "bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300"
              }`}>
                {relaCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("billroth")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "billroth"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>Billroth Shenoy Nagar</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "billroth" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
              }`}>
                {billrothCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("mehta")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "mehta"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>Dr. Mehta&apos;s Chetpet</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "mehta" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
              }`}>
                {mehtaCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("greams")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "greams"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>Apollo Greams Road</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "greams" ? "bg-white/20 text-white" : "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300"
              }`}>
                {greamsCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("adyar")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "adyar"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>Fortis Malar Adyar</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "adyar" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
              }`}>
                {adyarCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("annanagar")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "annanagar"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>MGM & SMF Anna Nagar</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "annanagar" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
              }`}>
                {annaNagarCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("porur")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "porur"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>SRMC Porur</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "porur" ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300"
              }`}>
                {porurCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("mogappair")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "mogappair"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>MMM Mogappair</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "mogappair" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
              }`}>
                {mogappairCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("velachery")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "velachery"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>Velachery (Prashanth & Astra)</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "velachery" ? "bg-white/20 text-white" : "bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300"
              }`}>
                {velacheryCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("kilpauk")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "kilpauk"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>Kilpauk Hub</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "kilpauk" ? "bg-white/20 text-white" : "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300"
              }`}>
                {kilpaukCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("mylapore")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "mylapore"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>Mylapore Hub</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "mylapore" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
              }`}>
                {mylaporeCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("tambaram")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "tambaram"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>Tambaram (Hindu Mission)</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "tambaram" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
              }`}>
                {tambaramCount} Doctors
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDoctorTab("tnagar")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                activeDoctorTab === "tnagar"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>T. Nagar (Be Well)</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeDoctorTab === "tnagar" ? "bg-white/20 text-white" : "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300"
              }`}>
                {tnagarCount} Doctors
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedDoctors.map((doc) => {
              const nextSlot = doc.slots[0];
              const slotFormatted = nextSlot
                ? new Date(nextSlot.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null;

              const teItem = specialtyTeMap[doc.specialty.name];
              const specialtyDisplay = lang === "te" ? teItem?.name || doc.specialty.name : lang === "ta" ? doc.specialty.nameTa : doc.specialty.name;

              return (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-brand-500/40 transition duration-200"
                >
                  <div className="p-5">
                    {/* Doctor Avatar with Verified Badge / Animated Aura */}
                    <div className="flex items-center gap-3.5 mb-4">
                      <DoctorAvatar
                        src={doc.avatarUrl}
                        name={doc.user.name}
                        specialtyName={doc.specialty.name}
                        size="md"
                      />
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {doc.user.name}
                        </h3>
                        <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold truncate">
                          {specialtyDisplay}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {doc.languages}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                      {doc.qualification}
                    </p>

                    {/* Chennai Hospital & Locality */}
                    {(doc.hospital || doc.cityLocation) && (
                      <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          {doc.hospital && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 min-w-0">
                              <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                              <span className="truncate">{doc.hospital}</span>
                            </div>
                          )}
                          {doc.doctorIdCode && (
                            <span className="px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-mono text-[9px] font-bold shrink-0 border border-brand-200/60">
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
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 pl-5 truncate">
                            📍 {doc.landmark}
                          </div>
                        )}
                        {doc.fullAddress && (
                          <div className="pt-1 mt-1 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px]">
                            <span className="text-slate-400 truncate max-w-[170px]" title={doc.fullAddress}>
                              {doc.fullAddress}
                            </span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doc.fullAddress || `${doc.hospital}, Chennai`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-600 dark:text-brand-400 hover:underline font-semibold shrink-0 ml-1"
                            >
                              Maps ↗
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 py-2.5 border-y border-slate-100 dark:border-slate-800 my-3">
                      <div className="flex items-center gap-1 font-semibold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{doc.rating.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">({doc.reviewCount})</span>
                      </div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {doc.experienceYears} {t("experienceYears")}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className="text-slate-500">{t("fee")}</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">₹{doc.consultationFee}</span>
                    </div>

                    {slotFormatted && (
                      <div className="mt-3.5 p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 flex items-center justify-between text-xs">
                        <span className="text-teal-700 dark:text-teal-300 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-teal-600" />
                          {t("nextAvailable")}
                        </span>
                        <span className="font-bold text-teal-800 dark:text-teal-200">{slotFormatted}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 pt-0">
                    <Link
                      href={`/booking/${doc.id}`}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-sm active:scale-[0.98]"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{t("bookAppointment")}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison: Why MediBook AI vs Traditional Portals */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-3">
            <span>Next-Gen Healthcare Guarantee</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Why MediBook AI vs Traditional Booking Apps
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Engineered from scratch to eliminate double bookings and unmonitored emergencies.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="grid grid-cols-3 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
            <div>Feature</div>
            <div className="text-slate-400">Traditional Portals</div>
            <div className="text-brand-600 dark:text-brand-400">MediBook AI</div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
            <div className="grid grid-cols-3 p-4 sm:p-5 items-center">
              <div className="font-semibold text-slate-900 dark:text-white">Double-Booking Risk</div>
              <div className="text-rose-500 font-medium">~14% slot collision</div>
              <div className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>0% (180s Mutex Lock)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 p-4 sm:p-5 items-center">
              <div className="font-semibold text-slate-900 dark:text-white">Emergency Detection</div>
              <div className="text-slate-500">None (book anyone)</div>
              <div className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Instant Red-Tier 112 Dispatch</span>
              </div>
            </div>

            <div className="grid grid-cols-3 p-4 sm:p-5 items-center">
              <div className="font-semibold text-slate-900 dark:text-white">Average Booking Time</div>
              <div className="text-slate-500">6 - 10 minutes</div>
              <div className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Under 45 Seconds</span>
              </div>
            </div>

            <div className="grid grid-cols-3 p-4 sm:p-5 items-center">
              <div className="font-semibold text-slate-900 dark:text-white">Data Privacy & Rights</div>
              <div className="text-slate-500">PII shared with ad networks</div>
              <div className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>DPDP 2023 + AES-256 Erasure</span>
              </div>
            </div>

            <div className="grid grid-cols-3 p-4 sm:p-5 items-center">
              <div className="font-semibold text-slate-900 dark:text-white">Regional Languages</div>
              <div className="text-slate-500">English only</div>
              <div className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>English, தமிழ், & తెలుగు</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Patient Reviews & Clinical Experiences */}
      <section className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {lang === "ta" ? "சென்னையின் நோயாளிகள் பகிர்ந்த உண்மை அனுபவங்கள்" : lang === "te" ? "చెన్నై రోగుల నిజమైన అనుభవాలు" : "Patient Stories & Verified Chennai Experiences"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real patients treated by verified specialists across OMR, Alwarpet, and Vadapalani
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;I needed an urgent neurology opinion for severe migraine and numbness while working in ELCOT SEZ Sholinganallur. Booked Dr. Dinesh Nayak at Gleneagles in 40 seconds. The 180s mutex hold ensured no one took my 6:30 PM slot!&rdquo;
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                  RS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ramesh Sundar</h4>
                  <p className="text-[11px] text-slate-400">Neurology Patient • Sholinganallur, OMR</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;காரப்பாக்கம் அப்போலோ கிரேடில் மருத்துவமனையில் டாக்டர் ஸ்ருதியிடம் என் மகளுக்கு முன்பதிவு செய்தேன். தமிழ் மொழியில் அறிகுறிகளை கூறியதும் தகுந்த பிரிவை உடனே காட்டியது. மிகவும் பயனுள்ள இணையதளம்!&rdquo;
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs">
                  MN
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Meena Natarajan</h4>
                  <p className="text-[11px] text-slate-400">Pediatrics Patient • Karapakkam, OMR</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;మా నాన్నగారి గుండె పరీక్ష కోసం కావేరి ఆసుపత్రి ఆళ్వార్‌పేటలో డాక్టర్ సురేష్ రావు గారిని సంప్రదించాము. డబుల్ బుకింగ్ లేకపోవడం మరియు డిజిటల్ రిసెప్షన్ అనుభవం అద్భుతం.&rdquo;
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                  KV
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Kalyan Varma</h4>
                  <p className="text-[11px] text-slate-400">Cardiology Patient • Alwarpet Hub</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {lang === "te" ? "తరచుగా అడిగే ప్రశ్నలు (FAQ)" : lang === "ta" ? "அடிக்கடி கேட்கப்படும் கேள்விகள்" : "Frequently Asked Questions"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === "te"
              ? "మా క్లినికల్ ట్రియాజ్ మరియు జీరో డబుల్ బుకింగ్ సిస్టమ్ గురించి పూర్తి సమాచారం"
              : lang === "ta"
              ? "எங்கள் AI அறிகுறி மதிப்பீடு மற்றும் முன்பதிவு பற்றிய விரிவான விளக்கங்கள்"
              : "Everything you need to know about our clinical triage and zero double-booking system"}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left font-semibold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform ${openFaq === idx ? "rotate-180 text-brand-600" : ""}`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Comprehensive Professional Healthcare Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-100 dark:border-slate-800 text-xs">
            {/* Brand Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <span className="font-bold text-base text-slate-900 dark:text-white">MediBook AI</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                India&apos;s fastest AI clinical triage and doctor appointment platform. Routing patients to accredited specialists with zero double-booking.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>DPDP Act 2023 Compliant</span>
              </div>
            </div>

            {/* Specialties */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Clinical Departments
              </h4>
              <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                <li><Link href="/doctors?specialty=General%20Medicine" className="hover:text-brand-600 transition">General Medicine</Link></li>
                <li><Link href="/doctors?specialty=Cardiology" className="hover:text-brand-600 transition">Cardiology & Heart Care</Link></li>
                <li><Link href="/doctors?specialty=Dermatology" className="hover:text-brand-600 transition">Dermatology & Skin</Link></li>
                <li><Link href="/doctors?specialty=Orthopedics" className="hover:text-brand-600 transition">Orthopedics & Spine</Link></li>
                <li><Link href="/doctors?specialty=Pediatrics" className="hover:text-brand-600 transition">Pediatrics & Child Care</Link></li>
                <li><Link href="/doctors?specialty=Neurology" className="hover:text-brand-600 transition">Neurology & Brain Health</Link></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Patient Services
              </h4>
              <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                <li><Link href="/triage" className="hover:text-brand-600 transition">AI Symptom Triage</Link></li>
                <li><Link href="/doctors" className="hover:text-brand-600 transition">Find Verified Doctors</Link></li>
                <li><Link href="/appointments" className="hover:text-brand-600 transition">My Appointments</Link></li>
                <li><Link href="/privacy" className="hover:text-brand-600 transition">DPDP Privacy & Erasure</Link></li>
                <li><Link href="/doctor/dashboard" className="hover:text-brand-600 transition">Doctor Queue Portal</Link></li>
                <li><Link href="/admin" className="hover:text-brand-600 transition">Clinic Administration</Link></li>
              </ul>
            </div>

            {/* National Emergency Contacts */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Emergency Helplines (24x7)
              </h4>
              <div className="space-y-2">
                <a href="tel:112" className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between hover:bg-rose-100 transition">
                  <span className="font-semibold text-rose-800 dark:text-rose-200">National Emergency</span>
                  <span className="font-bold text-rose-600">Dial 112</span>
                </a>
                <a href="tel:108" className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between hover:bg-amber-100 transition">
                  <span className="font-semibold text-amber-800 dark:text-amber-200">Ambulance Service</span>
                  <span className="font-bold text-amber-600">Dial 108</span>
                </a>
                <a href="tel:104" className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 flex items-center justify-between hover:bg-sky-100 transition">
                  <span className="font-semibold text-sky-800 dark:text-sky-200">Health Advice Helpline</span>
                  <span className="font-bold text-sky-600">Dial 104</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© {new Date().getFullYear()} MediBook AI Technologies. All rights reserved. Complies with DPDP Act 2023.</p>
            <p className="text-center sm:text-right">
              Medical Disclaimer: MediBook AI does not provide medical diagnoses or prescriptions. Always seek the advice of a qualified physician.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
