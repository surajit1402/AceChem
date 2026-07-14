import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { LiveQuestionSchema } from "../../../lib/schema";

/* Live "extra practice" generation — SECONDARY to the reviewed bank.
   Runs on the server so ANTHROPIC_API_KEY is never exposed to the browser.
   Rate-capped per browser per day via an httpOnly cookie so it cannot run
   up the API bill. Output is never mixed into the reviewed content bank. */

const DAILY_LIMIT = 20;
const COOKIE = "ac_gen";

function readCounter(req) {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = req.cookies.get(COOKIE)?.value;
    const parsed = JSON.parse(raw);
    if (parsed.d === today && Number.isInteger(parsed.n)) return { d: today, n: parsed.n };
  } catch {
    /* missing or malformed cookie — start fresh */
  }
  return { d: today, n: 0 };
}

export async function POST(req) {
  const counter = readCounter(req);
  if (counter.n >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: "Daily extra-practice limit reached. Reviewed questions are still unlimited — try again tomorrow." },
      { status: 429 },
    );
  }

  try {
    const { topic, difficulty } = await req.json();

    const system = `You are a general chemistry (college gen chem) problem generator. Respond with ONLY valid JSON, no markdown fences, no commentary. Schema:
{"stem": string, "choices": string[] (exactly 4 plausible answer choices, only one correct), "correctIndex": number (0-3, index of the correct choice), "solution": string (concise step-by-step worked solution, 2-5 sentences, units carried through)}
Always produce a multiple-choice question — never free-response or numeric-entry. If the problem involves a calculation, do the calculation yourself and present the numeric result as one of the 4 choices, with the other 3 as results of common student errors. Use plain text with unicode subscripts/superscripts for formulas (e.g. H₂O, Ca²⁺, 10⁻³). Generate from the underlying chemistry only — never reproduce questions from textbooks or test banks. Before finalizing, re-solve the problem and confirm correctIndex is right. Vary problem phrasing and numbers every time.`;

    const user = `Generate one ${difficulty}-level gen chem practice problem on: ${topic}. Return JSON only.`;

    const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system,
      messages: [{ role: "user", content: user }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = LiveQuestionSchema.safeParse(JSON.parse(cleaned));
    if (!parsed.success) throw new Error("generated question failed validation");

    const res = NextResponse.json({
      question: parsed.data,
      remaining: DAILY_LIMIT - counter.n - 1,
    });
    res.cookies.set(COOKIE, JSON.stringify({ d: counter.d, n: counter.n + 1 }), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/api/generate-question",
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate question" }, { status: 500 });
  }
}
