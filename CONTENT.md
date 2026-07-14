# Content pipeline: generate → review → approve → ship

AceChem serves practice questions from a **pre-generated, human-reviewed bank**
committed to this repo under `content/`. Students cost ~zero API calls; live AI
generation exists only as a capped, clearly-labeled "extra practice" fallback.

## Directory layout

```
content/
  <course>/            intro | chem1 | chem2
    <topic>/           topic id from lib/schema.ts (e.g. stoich, gases)
      drafts/          generated, awaiting review — never served
      approved/        reviewed & approved — the ONLY content served to students
      rejected/        failed validation or rejected in review — never served
      batch-report.json  numeric-distractor sanity stats for the last batch
```

One pretty-printed JSON file per question, so diffs stay readable. Every file
carries permanent `provenance` metadata (model, prompt version, generation
time, reviewer, review time, whether it was edited) — the audit trail for how
each question was made.

## 1. Generate drafts (local only)

Needs `ANTHROPIC_API_KEY` in `.env.local`. Never runs on Vercel.

```sh
npm run generate -- --course chem1 --topic stoich --difficulty Intermediate --count 10
```

- `--count` is a **target total** (drafts + approved) for that course/topic/difficulty,
  so re-running is resumable and never overwrites existing files.
- Options: `--out <dir>` (default `content/`), `--model <id>` (default `claude-sonnet-4-6`).
- Every item is validated against the shared Zod schema (`lib/schema.ts`) before
  writing. Failures land in `rejected/` with the validation error attached —
  never silently dropped.
- Prints a running API cost estimate, and a warning if the correct answer is
  suspiciously often the largest/smallest numeric choice (lazy distractors).

**No derivative content**: the generation prompt builds questions from the
syllabus and the underlying chemistry only. It must never be fed, and must
never reproduce, questions from textbooks, publisher test banks, or any prep
source — and no feature that ingests external question banks may be added.

## 2. Review (local dev server only)

```sh
npm run dev   # then open http://localhost:3000/admin/review
```

The review UI is hard-gated to development — it 404s on production builds and
is not reachable on the deployed site.

- Set your reviewer name (top right, persisted locally).
- Each draft shows the question exactly as a student sees it, plus the marked
  answer, the full worked solution, and every distractor rationale.
- **Approve** (`a`) → moves to `approved/`, stamps `reviewedBy`/`reviewedAt`.
- **Edit** (`e`) → inline-edit everything; saving sets `editedFromOriginal: true`.
- **Reject** (`r`) → type a reason, moves to `rejected/`.
- Navigate with `←` / `→`. Header shows drafts remaining / approved / rejected /
  rejection rate.

## 3. Ship

```sh
git add content/ && git commit -m "Add reviewed stoichiometry questions" && git push
```

Vercel rebuilds on push. `next build` renders `/api/bank/<course>/<topic>` as
**static JSON from `approved/` only** — drafts and rejects are never served, and
student practice sessions read the static bank at zero API cost.

## How students get questions

- The quiz modal fetches the topic's approved bank once, filters by difficulty,
  and samples **without repeats** within a session until the pool is exhausted.
- When the pool is empty or exhausted, students can re-practice the pool or use
  **⚡ Generate extra practice** — labeled "AI-generated · not expert-reviewed",
  capped per session client-side and per browser/day server-side (httpOnly
  cookie, HTTP 429 past the limit). Live questions are never written to the bank.

## Adding a new topic (or course)

1. Add the topic to `COURSES` in `app/page.jsx` (student UI) **and** to
   `COURSE_TOPICS` in `lib/schema.ts` (pipeline) — keep the two in sync.
2. `npm run generate -- --course <course> --topic <new-id> ...`
3. Review at `/admin/review`, commit `content/`, push.

## Schema

`lib/schema.ts` is the single source of truth, shared by the generator, the
review API, and the bank endpoint. Validation enforces: exactly 4 choices,
`correctIndex` in range, one distractor rationale per wrong choice, a real
worked solution (min length), no duplicate or numerically-identical choices,
and a known course/topic pair. Difficulty levels are the app's existing three:
`Intro` (one-step), `Intermediate` (multi-step + conversion), `Advanced`
(multi-step with a conceptual trap).
