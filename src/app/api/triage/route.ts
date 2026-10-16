import { NextResponse } from "next/server";
import { triageSymptoms, ChatMessage } from "@/lib/triage-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing messages" }, { status: 400 });
    }

    // Strip out potential PII (phone numbers, email addresses) from symptom messages
    const sanitizedMessages: ChatMessage[] = messages.map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content)
        .replace(/[\w.-]+@[\w.-]+\.\w+/g, "[email removed]")
        .replace(/\b(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b/g, "[phone removed]"),
    }));

    const result = await triageSymptoms(sanitizedMessages);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Triage API error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate clinical symptoms" },
      { status: 500 }
    );
  }
}
