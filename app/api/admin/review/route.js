import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { validateQuestion } from "../../../../lib/schema";

/* Local-development-only review API. Operates on the content/ tree with fs.
   Hard-gated: unreachable in production builds (returns 404). */
export const dynamic = "force-dynamic";

const CONTENT_ROOT = path.join(process.cwd(), "content");

const inProduction = () => process.env.NODE_ENV === "production";

/* Resolve a repo-relative draft path safely inside content/, e.g.
   "chem1/stoich/drafts/2026-...-ab12cd34.json". */
function resolveDraft(relFile) {
  const abs = path.resolve(CONTENT_ROOT, relFile);
  if (!abs.startsWith(CONTENT_ROOT + path.sep)) throw new Error("path escapes content/");
  const parts = path.relative(CONTENT_ROOT, abs).split(path.sep);
  if (parts.length !== 4 || parts[2] !== "drafts" || !parts[3].endsWith(".json"))
    throw new Error("not a draft file path");
  if (!fs.existsSync(abs)) throw new Error("draft not found (already reviewed?)");
  return abs;
}

function countDir(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((f) => f.endsWith(".json")).length;
}

export async function GET() {
  if (inProduction()) return new NextResponse(null, { status: 404 });

  const drafts = [];
  let approved = 0;
  let rejected = 0;

  if (fs.existsSync(CONTENT_ROOT)) {
    for (const course of fs.readdirSync(CONTENT_ROOT)) {
      const courseDir = path.join(CONTENT_ROOT, course);
      if (!fs.statSync(courseDir).isDirectory()) continue;
      for (const topic of fs.readdirSync(courseDir)) {
        const topicDir = path.join(courseDir, topic);
        if (!fs.statSync(topicDir).isDirectory()) continue;
        approved += countDir(path.join(topicDir, "approved"));
        rejected += countDir(path.join(topicDir, "rejected"));
        const draftsDir = path.join(topicDir, "drafts");
        if (!fs.existsSync(draftsDir)) continue;
        for (const f of fs.readdirSync(draftsDir).sort()) {
          if (!f.endsWith(".json")) continue;
          try {
            const q = JSON.parse(fs.readFileSync(path.join(draftsDir, f), "utf8"));
            drafts.push({ ...q, _file: [course, topic, "drafts", f].join("/") });
          } catch {
            /* unreadable draft — skip; generator never writes invalid JSON here */
          }
        }
      }
    }
  }

  return NextResponse.json({ drafts, counts: { drafts: drafts.length, approved, rejected } });
}

export async function POST(req) {
  if (inProduction()) return new NextResponse(null, { status: 404 });

  try {
    const body = await req.json();
    const { action, file } = body;
    const abs = resolveDraft(file);
    const question = JSON.parse(fs.readFileSync(abs, "utf8"));

    if (action === "save") {
      const updated = {
        ...question,
        ...body.question,
        id: question.id, // identity and provenance are not editable
        course: question.course,
        topic: question.topic,
        status: "draft",
        provenance: { ...question.provenance, editedFromOriginal: true },
      };
      const result = validateQuestion(updated);
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
      fs.writeFileSync(abs, JSON.stringify(result.data, null, 2) + "\n");
      return NextResponse.json({ ok: true, question: result.data });
    }

    if (action === "approve") {
      const reviewedBy = (body.reviewedBy || "").trim();
      if (!reviewedBy) return NextResponse.json({ error: "reviewedBy is required" }, { status: 400 });
      const updated = {
        ...question,
        status: "approved",
        provenance: { ...question.provenance, reviewedBy, reviewedAt: new Date().toISOString() },
      };
      const result = validateQuestion(updated);
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
      const dest = path.join(path.dirname(path.dirname(abs)), "approved");
      fs.mkdirSync(dest, { recursive: true });
      fs.writeFileSync(path.join(dest, path.basename(abs)), JSON.stringify(result.data, null, 2) + "\n");
      fs.unlinkSync(abs);
      return NextResponse.json({ ok: true });
    }

    if (action === "reject") {
      const reason = (body.reason || "").trim();
      if (!reason) return NextResponse.json({ error: "a rejection reason is required" }, { status: 400 });
      const reviewedBy = (body.reviewedBy || "").trim() || null;
      const updated = {
        ...question,
        status: "rejected",
        rejectionReason: reason,
        provenance: { ...question.provenance, reviewedBy, reviewedAt: new Date().toISOString() },
      };
      const dest = path.join(path.dirname(path.dirname(abs)), "rejected");
      fs.mkdirSync(dest, { recursive: true });
      fs.writeFileSync(path.join(dest, path.basename(abs)), JSON.stringify(updated, null, 2) + "\n");
      fs.unlinkSync(abs);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: `unknown action "${action}"` }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
