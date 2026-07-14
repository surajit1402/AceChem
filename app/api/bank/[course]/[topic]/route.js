import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { COURSE_TOPICS } from "../../../../../lib/schema";

/* Serves the APPROVED question bank. Rendered statically at build time —
   `next build` runs this once per course/topic pair and ships the JSON as
   static output, so student requests cost zero fs reads and zero API calls.
   Drafts and rejected content are never read here. */
export const dynamic = "force-static";

export function generateStaticParams() {
  return Object.entries(COURSE_TOPICS).flatMap(([course, topics]) =>
    topics.map((t) => ({ course, topic: t.id })),
  );
}

export async function GET(_req, { params }) {
  const { course, topic } = params;
  const topics = COURSE_TOPICS[course];
  if (!topics || !topics.some((t) => t.id === topic)) {
    return NextResponse.json({ questions: [] });
  }

  const approvedDir = path.join(process.cwd(), "content", course, topic, "approved");
  const questions = [];
  if (fs.existsSync(approvedDir)) {
    for (const f of fs.readdirSync(approvedDir).sort()) {
      if (!f.endsWith(".json")) continue;
      try {
        const q = JSON.parse(fs.readFileSync(path.join(approvedDir, f), "utf8"));
        if (q.status !== "approved") continue;
        // student payload only — provenance and rationales stay out of the client
        questions.push({
          id: q.id,
          difficulty: q.difficulty,
          stem: q.stem,
          choices: q.choices,
          correctIndex: q.correctIndex,
          solution: q.solution,
        });
      } catch {
        /* malformed file — excluded from the bank */
      }
    }
  }

  return NextResponse.json({ questions });
}
