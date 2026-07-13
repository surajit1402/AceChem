import { NextResponse } from "next/server";

// This runs on the SERVER, so your ANTHROPIC_API_KEY is never exposed to the browser.
export async function POST(req) {
  try {
    const { topic, difficulty } = await req.json();

    const system = `You are a general chemistry (college gen chem) problem generator. Respond with ONLY valid JSON, no markdown fences, no commentary. Schema:
{"question": string, "type": "multiple_choice" | "numeric" | "short_answer", "options": string[] (exactly 4 if multiple_choice, else []), "correctAnswer": string, "explanation": string, "unit": string (empty if none)}
Use plain text with unicode subscripts/superscripts for formulas (e.g. H₂O, Ca²⁺, 10⁻³). Explanation should be a concise step-by-step solution. Vary problem phrasing and numbers every time; never repeat a previous problem verbatim.`;

    const user = `Generate one ${difficulty}-level gen chem practice problem on: ${topic}. Return JSON only.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    const data = await response.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const cleaned = text.replace(/```json|```/g, "").trim();
    const question = JSON.parse(cleaned);

    return NextResponse.json({ question });
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate question" }, { status: 500 });
  }
}
