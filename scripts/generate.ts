/**
 * Offline batch question generator.
 *
 * Runs LOCALLY only — never on Vercel, never at request time.
 *
 *   npm run generate -- --course chem1 --topic stoich --difficulty Intermediate --count 10
 *
 * Writes drafts to content/<course>/<topic>/drafts/, validation failures to
 * content/<course>/<topic>/rejected/. Resumable: --count means "ensure N total
 * (drafts + approved) exist for this course/topic/difficulty"; existing files
 * are never overwritten.
 */
import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  COURSE_TOPICS,
  COURSE_IDS,
  DIFFICULTY_LEVELS,
  parseChoiceNumber,
  validateQuestion,
  type CourseId,
  type Difficulty,
  type Question,
} from "../lib/schema";

const PROMPT_VERSION = "v1";
const DEFAULT_MODEL = "claude-sonnet-4-6";

/* $ per million tokens, for the running cost estimate */
const PRICES: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-sonnet-5": { input: 3, output: 15 },
  "claude-opus-4-8": { input: 5, output: 25 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

const DIFFICULTY_DEFS: Record<Difficulty, string> = {
  Intro: "one-step recall or a single plug-in calculation. No unit conversions beyond the trivial.",
  Intermediate: "multi-step, requiring at least one unit conversion or intermediate quantity.",
  Advanced:
    "multi-step with a conceptual trap or twist (limiting reagent, competing equilibrium, sign convention, common misconception) — exam-style.",
};

/* ---------------- CLI ---------------- */
function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      args[argv[i].slice(2)] = argv[i + 1] ?? "";
      i++;
    }
  }
  return args;
}

function usage(msg?: string): never {
  if (msg) console.error(`\nError: ${msg}`);
  console.error(`
Usage: npm run generate -- --course <course> --topic <topic> --difficulty <level> --count <n> [options]

  --course      ${COURSE_IDS.join(" | ")}
  --topic       topic id (e.g. stoich, gases, equilibrium)
  --difficulty  ${DIFFICULTY_LEVELS.join(" | ")}
  --count       ensure this many total questions (drafts + approved) exist
  --out         output root directory (default: content/)
  --model       Anthropic model id (default: ${DEFAULT_MODEL})

Topics per course:`);
  for (const [course, topics] of Object.entries(COURSE_TOPICS)) {
    console.error(`  ${course}: ${topics.map((t) => t.id).join(", ")}`);
  }
  process.exit(1);
}

/* ---------------- env ---------------- */
function loadApiKey(): string {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^\s*ANTHROPIC_API_KEY\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, "");
    }
  }
  console.error("ANTHROPIC_API_KEY not found (checked environment and .env.local)");
  process.exit(1);
}

/* ---------------- prompting ---------------- */
function systemPrompt(): string {
  return `You are an expert general chemistry (college gen chem) question writer creating original multiple-choice practice questions.

ORIGINALITY — NON-NEGOTIABLE: Generate every question from the course syllabus and the underlying chemistry only. Never reproduce, paraphrase, or adapt questions from textbooks, publisher test banks, AAMC/NBME/commercial prep materials, or any other existing source. Every question must be an original composition.

OUTPUT: Respond with ONLY a single valid JSON object — no markdown fences, no commentary. Schema:
{
  "stem": string,                    // the question text
  "choices": string[4],              // exactly 4 answer choices, only one correct
  "correctIndex": number,            // 0-3, index of the correct choice
  "solution": string,                // COMPLETE worked solution — every step
  "distractorRationales": string[3]  // one per WRONG choice, in choice order (skip the correct one)
}

RULES:
1. DISTRACTORS: each wrong choice must be the result of a specific, common student error — forgot to balance the equation, used the wrong mole ratio, dropped a unit conversion, inverted a ratio, wrong sign on ΔH, used molarity where molality was needed, ignored the limiting reagent, etc. Each distractorRationale must NAME the exact mistake that produces that choice. Never use random wrong numbers.
2. UNITS & SIG FIGS: numeric answers carry correct units and sensible significant figures. The solution must show units cancelling step by step.
3. SOLUTION: the worked solution is the product, not a footnote. Show every step: the relevant equation(s), substitution with units, the arithmetic, and the final answer with units and sig figs.
4. NOTATION: plain text with unicode subscripts/superscripts (H₂O, Ca²⁺, 10⁻³, ΔH°, →, ⇌). No LaTeX, no markdown.
5. VERIFY: before finalizing, re-solve the problem from scratch and confirm correctIndex is right and no distractor accidentally equals the correct answer. If the arithmetic does not hold, fix it before answering.
6. VARIETY: vary phrasing, numbers, and scenario every time; never repeat a previous problem.`;
}

function userPrompt(course: CourseId, topicId: string, difficulty: Difficulty, seq: number): string {
  const topic = COURSE_TOPICS[course].find((t) => t.id === topicId)!;
  return `Write one original ${difficulty}-level question (question #${seq} in a varied set — make it distinct from typical examples).

Course: ${course}
Topic: ${topic.title} — ${topic.desc}
Skills to draw from: ${topic.skills.join(", ")}
Difficulty definition (${difficulty}): ${DIFFICULTY_DEFS[difficulty]}

Return JSON only.`;
}

/* ---------------- helpers ---------------- */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function fileStamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function countExisting(dirs: string[], difficulty: Difficulty): number {
  let n = 0;
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      try {
        const item = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
        if (item.difficulty === difficulty) n++;
      } catch {
        /* unreadable file — ignore for counting */
      }
    }
  }
  return n;
}

function writeJson(dir: string, name: string, data: unknown) {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, name);
  if (fs.existsSync(file)) throw new Error(`refusing to overwrite ${file}`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  return file;
}

/* ---------------- main ---------------- */
async function main() {
  const args = parseArgs(process.argv.slice(2));

  const course = args.course as CourseId;
  if (!COURSE_IDS.includes(course)) usage(`--course must be one of: ${COURSE_IDS.join(", ")}`);
  const topicId = args.topic;
  if (!COURSE_TOPICS[course].some((t) => t.id === topicId))
    usage(`--topic "${topicId}" not found in course "${course}"`);
  const difficulty = args.difficulty as Difficulty;
  if (!DIFFICULTY_LEVELS.includes(difficulty))
    usage(`--difficulty must be one of: ${DIFFICULTY_LEVELS.join(", ")}`);
  const count = parseInt(args.count, 10);
  if (!Number.isFinite(count) || count < 1) usage("--count must be a positive integer");
  const outRoot = args.out || "content";
  const model = args.model || DEFAULT_MODEL;

  const topicDir = path.join(outRoot, course, topicId);
  const draftsDir = path.join(topicDir, "drafts");
  const approvedDir = path.join(topicDir, "approved");
  const rejectedDir = path.join(topicDir, "rejected");

  const existing = countExisting([draftsDir, approvedDir], difficulty);
  const needed = count - existing;
  console.log(
    `${course}/${topicId} @ ${difficulty}: ${existing} existing (drafts + approved), target ${count} → generating ${Math.max(needed, 0)}`,
  );
  if (needed <= 0) {
    console.log("Nothing to do — target already met.");
    return;
  }

  const client = new Anthropic({ apiKey: loadApiKey() });
  const price = PRICES[model] ?? { input: 5, output: 25 };
  let totalCost = 0;
  let written = 0;
  let rejected = 0;
  const batch: Question[] = [];

  for (let i = 0; i < needed; i++) {
    let text = "";
    let usageIn = 0;
    let usageOut = 0;

    /* sequential with backoff on rate limits / overload (on top of SDK auto-retries) */
    for (let attempt = 0; ; attempt++) {
      try {
        const response = await client.messages.create({
          model,
          max_tokens: 8000, // adaptive thinking spends from this budget too

          thinking: { type: "adaptive" },
          system: systemPrompt(),
          messages: [{ role: "user", content: userPrompt(course, topicId, difficulty, existing + i + 1) }],
        });
        text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n");
        usageIn = response.usage.input_tokens;
        usageOut = response.usage.output_tokens;
        break;
      } catch (err) {
        const retryable =
          err instanceof Anthropic.RateLimitError ||
          err instanceof Anthropic.InternalServerError ||
          err instanceof Anthropic.APIConnectionError;
        if (!retryable || attempt >= 5) throw err;
        const wait = Math.min(2 ** attempt * 2000, 60000);
        console.log(`  rate-limited/overloaded — backing off ${wait / 1000}s (attempt ${attempt + 1}/5)`);
        await sleep(wait);
      }
    }

    totalCost += (usageIn * price.input + usageOut * price.output) / 1_000_000;

    const stamp = fileStamp();
    const shortId = crypto.randomUUID().slice(0, 8);
    const fileName = `${stamp}-${shortId}.json`;

    let parsed: unknown;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (e) {
      const file = writeJson(rejectedDir, fileName, {
        status: "rejected",
        rejectionReason: `model output was not valid JSON: ${(e as Error).message}`,
        raw: text,
        provenance: { model, promptVersion: PROMPT_VERSION, generatedAt: new Date().toISOString() },
      });
      rejected++;
      console.log(`  ✗ [${i + 1}/${needed}] JSON parse failure → ${file}`);
      continue;
    }

    const item = {
      id: crypto.randomUUID(),
      course,
      topic: topicId,
      difficulty,
      status: "draft" as const,
      ...(parsed as object),
      provenance: {
        model,
        promptVersion: PROMPT_VERSION,
        generatedAt: new Date().toISOString(),
        reviewedBy: null,
        reviewedAt: null,
        editedFromOriginal: false,
      },
    };

    const result = validateQuestion(item);
    if (!result.success) {
      const file = writeJson(rejectedDir, fileName, {
        ...item,
        status: "rejected",
        rejectionReason: `schema validation failed: ${result.error}`,
      });
      rejected++;
      console.log(`  ✗ [${i + 1}/${needed}] invalid → ${file}\n      ${result.error}`);
      continue;
    }

    const file = writeJson(draftsDir, fileName, result.data);
    batch.push(result.data);
    written++;
    console.log(
      `  ✓ [${i + 1}/${needed}] ${file}  (${usageIn} in / ${usageOut} out · running cost ~$${totalCost.toFixed(3)})`,
    );
  }

  /* ---- numeric sanity check across the batch ----
     If the correct choice is too often the largest or smallest value, the model
     is being lazy with distractors. Chance rate is ~50% (25% max + 25% min). */
  const numeric = batch.filter((q) => q.choices.every((c) => parseChoiceNumber(c) !== null));
  if (numeric.length >= 10) {
    let extremes = 0;
    for (const q of numeric) {
      const values = q.choices.map((c) => parseChoiceNumber(c)!.value);
      const v = values[q.correctIndex];
      if (v === Math.max(...values) || v === Math.min(...values)) extremes++;
    }
    const rate = extremes / numeric.length;
    const report = {
      generatedAt: new Date().toISOString(),
      difficulty,
      numericQuestions: numeric.length,
      correctIsExtremeRate: Number(rate.toFixed(3)),
      expectedByChance: 0.5,
      flagged: rate > 0.65,
    };
    fs.mkdirSync(topicDir, { recursive: true });
    fs.writeFileSync(path.join(topicDir, "batch-report.json"), JSON.stringify(report, null, 2) + "\n");
    if (report.flagged) {
      console.warn(
        `\n⚠ SANITY FLAG: correct answer was the max/min choice in ${(rate * 100).toFixed(0)}% of ${numeric.length} numeric questions (chance ≈ 50%). Distractors may be lazy — review carefully.`,
      );
    }
  } else if (numeric.length > 0) {
    console.log(`(numeric sanity check skipped — needs ≥10 numeric questions in one batch, had ${numeric.length})`);
  }

  console.log(
    `\nDone: ${written} draft(s) written, ${rejected} rejected. Estimated API cost: $${totalCost.toFixed(3)}.` +
      `\nReview at http://localhost:3000/admin/review (dev server only).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
