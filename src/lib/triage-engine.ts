export interface TriageResult {
  specialty: string;
  urgency: "GREEN" | "AMBER" | "RED";
  reason: string;
  clarifying_question: string | null;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const CLINICAL_SYSTEM_PROMPT = `You are MediBook AI, an expert clinical triage assistant.
Your sole mission is to assess clinical urgency and recommend the appropriate medical specialty (General Medicine, Cardiology, Dermatology, Orthopedics, Pediatrics, Neurology).

CRITICAL SAFETY RULES:
1. NEVER diagnose a disease, condition, or illness.
2. NEVER prescribe medications or suggest dosages.
3. NEVER tell the patient they are completely safe if dangerous signs are present.
4. IMMEDIATELY escalate to RED tier if any of the following are mentioned:
   - Severe chest pain or crushing chest pressure radiating to arm, jaw, or back
   - Sudden severe shortness of breath or inability to breathe
   - Signs of stroke: sudden facial drooping, arm weakness, slurred speech (FAST criteria)
   - Heavy uncontrolled bleeding
   - Loss of consciousness, sudden collapse, or seizures
   - Severe anaphylaxis (swelling of throat, lips, tongue)
   - Suicidal ideation or self-harm intentions
5. If symptoms overlap multiple specialties, ask EXACTLY ONE clarifying question to differentiate.
6. Urgency tiers:
   - RED: Emergency life-threat. Stop booking immediately.
   - AMBER: High clinical priority. Requires same-day evaluation.
   - GREEN: Routine consultation, follow-up, or non-acute issue.

You MUST respond strictly in valid JSON matching this schema:
{
  "specialty": "Cardiology" | "General Medicine" | "Dermatology" | "Orthopedics" | "Pediatrics" | "Neurology",
  "urgency": "GREEN" | "AMBER" | "RED",
  "reason": "Brief clinical rationale for routing (in plain, non-jargon language)",
  "clarifying_question": null or "One clear clarifying question if needed"
}`;

/**
 * Deterministic Clinical NLP Router (High-Fidelity Mock & Offline Fallback)
 * Works flawlessly offline and supports both English and Tamil
 */
export function deterministicTriage(symptomsText: string, chatHistory: ChatMessage[] = []): TriageResult {
  const text = symptomsText.toLowerCase();

  // 1. EMERGENCY RED TIER CHECK
  const redFlags = [
    "chest pain",
    "crushing chest",
    "heart attack",
    "நெஞ்சு வலி",
    "மார்பு வலி",
    "ఛాతీ నొప్పి",
    "గుండెపోటు",
    "can't breathe",
    "cannot breathe",
    "gasping",
    "shortness of breath",
    "மூச்சுத்திணறல்",
    "శ్వాస ఆడకపోవడం",
    "stroke",
    "slurred speech",
    "facial drooping",
    "பக்கவாதம்",
    "పక్షవాతం",
    "severe bleeding",
    "తీవ్రమైన రక్తస్రావం",
    "vomiting blood",
    "unconscious",
    "collapsed",
    "fainted suddenly",
    "suicidal",
    "kill myself",
    "self harm",
  ];

  for (const flag of redFlags) {
    if (text.includes(flag)) {
      return {
        specialty: "Cardiology",
        urgency: "RED",
        reason:
          "High-risk emergency indicators detected (e.g. acute chest discomfort, respiratory distress, or neurological deficit). Immediate emergency department evaluation required.",
        clarifying_question: null,
      };
    }
  }

  // 2. CHECK FOR OVERLAPPING SYMPTOMS (Ask 1 clarifying question)
  const hasHeadIssue = text.includes("headache") || text.includes("தலைவலி") || text.includes("తలనొప్పి") || text.includes("migraine");
  const hasEyeIssue = text.includes("eye") || text.includes("vision") || text.includes("பார்வை") || text.includes("కంటి");
  const hasNeckStiffness = text.includes("stiff neck") || text.includes("கழுத்து வலி") || text.includes("మెడ నొప్పి");
  const hasFever = text.includes("fever") || text.includes("காய்ச்சல்") || text.includes("జ్వరం") || text.includes("temp");

  // If already answered clarifying question in history, proceed without re-asking
  const hasPriorClarification = chatHistory.length > 2;

  if (!hasPriorClarification && hasHeadIssue && (hasEyeIssue || hasNeckStiffness || hasFever)) {
    return {
      specialty: "Neurology",
      urgency: "AMBER",
      reason: "Symptoms involve neurological and systemic complaints.",
      clarifying_question:
        "Is your headache accompanied by sudden intense throbbing and sensitivity to light (migraine), or is it paired with a stiff neck and high fever?",
    };
  }

  // 3. PEDIATRICS
  if (
    text.includes("baby") ||
    text.includes("child") ||
    text.includes("kid") ||
    text.includes("infant") ||
    text.includes("toddler") ||
    text.includes("குழந்தை") ||
    text.includes("பாப்பா") ||
    text.includes("పిల్లల") ||
    text.includes("శిశువు") ||
    text.includes("చిన్నారి")
  ) {
    const isUrgentChild = text.includes("high fever") || text.includes("not eating") || text.includes("vomiting");
    return {
      specialty: "Pediatrics",
      urgency: isUrgentChild ? "AMBER" : "GREEN",
      reason: "Symptom description pertains to pediatric health and wellness.",
      clarifying_question: null,
    };
  }

  // 4. DERMATOLOGY
  if (
    text.includes("skin") ||
    text.includes("rash") ||
    text.includes("itch") ||
    text.includes("acne") ||
    text.includes("pimple") ||
    text.includes("eczema") ||
    text.includes("psoriasis") ||
    text.includes("scalp") ||
    text.includes("தோல்") ||
    text.includes("அரிப்பு") ||
    text.includes("தடிப்பு") ||
    text.includes("முகப்பரு") ||
    text.includes("చర్మం") ||
    text.includes("దురద") ||
    text.includes("దద్దుర్లు") ||
    text.includes("మొటిమలు")
  ) {
    return {
      specialty: "Dermatology",
      urgency: "GREEN",
      reason: "Cutaneous and dermatological symptoms identified for specialist examination.",
      clarifying_question: null,
    };
  }

  // 5. ORTHOPEDICS
  if (
    text.includes("knee") ||
    text.includes("joint") ||
    text.includes("bone") ||
    text.includes("fracture") ||
    text.includes("sprain") ||
    text.includes("twist") ||
    text.includes("back pain") ||
    text.includes("shoulder") ||
    text.includes("மூட்டு") ||
    text.includes("எலும்பு") ||
    text.includes("முதுகு வலி") ||
    text.includes("சுளுக்கு") ||
    text.includes("కీళ్ల") ||
    text.includes("నొప్పులు") ||
    text.includes("వెన్నునొప్పి") ||
    text.includes("మోకాలి") ||
    text.includes("ఎముక") ||
    text.includes("బెణుకు")
  ) {
    const isAcuteOrtho = text.includes("cannot walk") || text.includes("swelling") || text.includes("fall");
    return {
      specialty: "Orthopedics",
      urgency: isAcuteOrtho ? "AMBER" : "GREEN",
      reason: "Musculoskeletal or joint-related discomfort flagged for orthopedic assessment.",
      clarifying_question: null,
    };
  }

  // 6. NEUROLOGY
  if (
    text.includes("migraine") ||
    text.includes("dizzy") ||
    text.includes("dizziness") ||
    text.includes("vertigo") ||
    text.includes("numbness") ||
    text.includes("tingling") ||
    text.includes("tremor") ||
    text.includes("ஒற்றைத் தலைவலி") ||
    text.includes("தலைச்சுற்றல்") ||
    text.includes("மின்னல்") ||
    text.includes("நடுக்கம்") ||
    text.includes("మైగ్రేన్") ||
    text.includes("తలతిరగడం") ||
    text.includes("తిమ్మిరి")
  ) {
    return {
      specialty: "Neurology",
      urgency: "AMBER",
      reason: "Neurological complaints involving cranial discomfort, balance, or sensory nerve signals.",
      clarifying_question: null,
    };
  }

  // 7. CARDIOLOGY (Sub-acute)
  if (
    text.includes("palpitation") ||
    text.includes("racing heart") ||
    text.includes("high bp") ||
    text.includes("hypertension") ||
    text.includes("படபடப்பு") ||
    text.includes("ரத்த அழுத்தம்") ||
    text.includes("గుండె దడ") ||
    text.includes("రక్తపోటు")
  ) {
    return {
      specialty: "Cardiology",
      urgency: "AMBER",
      reason: "Cardiovascular indicators (heart rate variations / blood pressure concerns).",
      clarifying_question: null,
    };
  }

  // 8. GENERAL MEDICINE (Default / Primary Care)
  const isHighFever = text.includes("high fever") || text.includes("chills") || text.includes("acute");
  return {
    specialty: "General Medicine",
    urgency: isHighFever ? "AMBER" : "GREEN",
    reason: "Primary healthcare evaluation recommended for acute systemic symptoms, infections, or general checkups.",
    clarifying_question: null,
  };
}

/**
 * Main Triage Function:
 * Uses Anthropic API if key is present and MOCK_AI_MODE is not true, otherwise falls back gracefully.
 */
export async function triageSymptoms(
  messages: ChatMessage[]
): Promise<TriageResult> {
  const latestUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";

  // Check if Anthropic API should be called
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const mockMode = process.env.MOCK_AI_MODE === "true" || !apiKey;

  if (mockMode || !apiKey) {
    return deterministicTriage(latestUserMsg, messages);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4 second max timeout

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 350,
        system: CLINICAL_SYSTEM_PROMPT,
        messages: messages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      }),
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn("[Triage] Anthropic API returned non-OK status, falling back to deterministic router");
      return deterministicTriage(latestUserMsg, messages);
    }

    const data = await res.json();
    const responseText = data.content?.[0]?.text;

    // Parse JSON
    const parsed = JSON.parse(responseText);
    if (parsed.specialty && parsed.urgency) {
      return {
        specialty: parsed.specialty,
        urgency: parsed.urgency,
        reason: parsed.reason || "Clinical evaluation recommendation.",
        clarifying_question: parsed.clarifying_question || null,
      };
    }

    return deterministicTriage(latestUserMsg, messages);
  } catch (err) {
    console.warn("[Triage] Anthropic call failed or timed out, using deterministic triage fallback:", err);
    return deterministicTriage(latestUserMsg, messages);
  }
}
