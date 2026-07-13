import { NextResponse } from "next/server";

// This runs on the SERVER, so your ANTHROPIC_API_KEY is never exposed to the browser.
export async function POST(req) {
  try {
    const { topic, difficulty } = await req.json();

    const system = `You are a general chemistry (college gen chem) problem generator. Respond with ONLY valid JSON, no markdown fences, no commentary. Schema:
{"question": string, "options": string[] (exactly 4 plausible answer choices, only one correct), "correctAnswer": string (must exactly match one of the 4 options), "explanation": string}
Always produce a multiple-choice question — never a free-response or numeric-entry question. If the problem involves a calculation, do the calculation yourself and present the numeric result as one of the 4 options (with the other 3 as plausible wrong answers, e.g. common calculation errors). Use plain text with unicode subscripts/superscripts for formulas (e.g. H₂O, Ca²⁺, 10⁻³). Explanation should be a concise step-by-step solution, 2-4 sentences. Vary problem phrasing and numbers every time; never repeat a previous problem verbatim.`;

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
