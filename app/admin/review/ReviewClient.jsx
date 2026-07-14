"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

/* Styling mirrors the student-facing app (see app/page.jsx). */
const NAVY = "#1B2A3D";
const TEAL = "#2A7F7E";
const GOLD = "#D9A441";
const PINK = "#E0527A";
const GREY = "#4B5F6F";

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const display = { fontFamily: "'Space Grotesk', sans-serif" };

const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8,
  border: `1.5px solid ${NAVY}22`, fontSize: 14, fontFamily: "inherit", lineHeight: 1.5,
};

function letter(i) {
  return String.fromCharCode(65 + i);
}

export default function ReviewClient() {
  const [drafts, setDrafts] = useState(null);
  const [counts, setCounts] = useState({ drafts: 0, approved: 0, rejected: 0 });
  const [sessionStats, setSessionStats] = useState({ approved: 0, rejected: 0 });
  const [index, setIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const reasonRef = useRef(null);

  useEffect(() => {
    setReviewer(localStorage.getItem("acechem-reviewer") || "");
    load();
  }, []);

  const load = async () => {
    const res = await fetch("/api/admin/review");
    const data = await res.json();
    setDrafts(data.drafts);
    setCounts(data.counts);
    setIndex((i) => Math.min(i, Math.max(0, data.drafts.length - 1)));
  };

  const current = drafts && drafts[index];

  const act = useCallback(
    async (payload) => {
      if (!current || busy) return;
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: current._file, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "request failed");
        return data;
      } catch (e) {
        setError(e.message);
        return null;
      } finally {
        setBusy(false);
      }
    },
    [current, busy],
  );

  const removeCurrent = (kind) => {
    setDrafts((d) => d.filter((_, i) => i !== index));
    setCounts((c) => ({ ...c, drafts: c.drafts - 1, [kind]: c[kind] + 1 }));
    setSessionStats((s) => ({ ...s, [kind]: s[kind] + 1 }));
    setIndex((i) => Math.max(0, Math.min(i, drafts.length - 2)));
    setRejecting(false);
    setReason("");
  };

  const approve = useCallback(async () => {
    if (!reviewer.trim()) {
      setError("Enter your reviewer name first (top right).");
      return;
    }
    const ok = await act({ action: "approve", reviewedBy: reviewer.trim() });
    if (ok) removeCurrent("approved");
  }, [act, reviewer, index, drafts]);

  const reject = useCallback(async () => {
    if (!reason.trim()) {
      setRejecting(true);
      setTimeout(() => reasonRef.current?.focus(), 0);
      return;
    }
    const ok = await act({ action: "reject", reason: reason.trim(), reviewedBy: reviewer.trim() });
    if (ok) removeCurrent("rejected");
  }, [act, reason, reviewer, index, drafts]);

  const saveEdit = async () => {
    const q = {
      ...editDraft,
      correctIndex: Number(editDraft.correctIndex),
      choices: editDraft.choices.map((c) => c.trim()),
      distractorRationales: editDraft.distractorRationales.map((r) => r.trim()),
    };
    const data = await act({ action: "save", question: q });
    if (data) {
      setDrafts((d) => d.map((item, i) => (i === index ? { ...data.question, _file: item._file } : item)));
      setEditing(false);
    }
  };

  /* keyboard: ← → navigate, a approve, r reject, e edit */
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || editing) return;
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, (drafts?.length || 1) - 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
      else if (e.key === "a") approve();
      else if (e.key === "r") reject();
      else if (e.key === "e" && current) {
        setEditDraft(JSON.parse(JSON.stringify(current)));
        setEditing(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drafts, editing, approve, reject, current]);

  const reviewedTotal = counts.approved + counts.rejected;
  const rejectionRate = reviewedTotal ? Math.round((counts.rejected / reviewedTotal) * 100) : 0;

  if (drafts === null)
    return <p style={{ ...mono, padding: 40, color: GREY }}>loading drafts…</p>;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px 80px", color: NAVY }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap'); body { font-family: 'Inter', system-ui, sans-serif; background: #F6F8F6; }`}</style>

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
        <h1 style={{ ...display, fontSize: 22, margin: 0 }}>Content review</h1>
        <label style={{ ...mono, fontSize: 12, color: GREY, display: "flex", alignItems: "center", gap: 8 }}>
          reviewer
          <input
            value={reviewer}
            onChange={(e) => {
              setReviewer(e.target.value);
              localStorage.setItem("acechem-reviewer", e.target.value);
            }}
            placeholder="your name"
            style={{ ...inputStyle, width: 160, padding: "6px 10px", fontSize: 13 }}
          />
        </label>
      </div>

      {/* progress */}
      <div style={{ ...mono, fontSize: 12.5, color: GREY, marginBottom: 20, display: "flex", gap: 18, flexWrap: "wrap" }}>
        <span>drafts remaining: <b style={{ color: NAVY }}>{counts.drafts}</b></span>
        <span>approved: <b style={{ color: TEAL }}>{counts.approved}</b></span>
        <span>rejected: <b style={{ color: PINK }}>{counts.rejected}</b></span>
        <span>rejection rate: <b style={{ color: NAVY }}>{rejectionRate}%</b></span>
        <span style={{ opacity: 0.7 }}>this session: +{sessionStats.approved} / −{sessionStats.rejected}</span>
      </div>

      {error && (
        <p style={{ background: `${PINK}18`, border: `1px solid ${PINK}`, color: NAVY, padding: "10px 14px", borderRadius: 8, fontSize: 13.5 }}>
          {error}
        </p>
      )}

      {!current ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: GREY }}>
          <p style={{ ...display, fontSize: 20, color: NAVY }}>No drafts to review 🎉</p>
          <p style={{ fontSize: 14 }}>Generate more with <code style={mono}>npm run generate</code>.</p>
        </div>
      ) : editing ? (
        /* ---------- EDIT MODE ---------- */
        <div style={{ background: "white", borderRadius: 14, padding: 24, border: `1px solid ${NAVY}14`, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ ...mono, fontSize: 12, color: GOLD }}>EDITING — saving marks editedFromOriginal</div>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Stem
            <textarea rows={3} value={editDraft.stem} onChange={(e) => setEditDraft({ ...editDraft, stem: e.target.value })} style={{ ...inputStyle, marginTop: 4 }} />
          </label>
          {editDraft.choices.map((c, i) => (
            <label key={i} style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="radio"
                name="correct"
                checked={editDraft.correctIndex === i}
                onChange={() => setEditDraft({ ...editDraft, correctIndex: i })}
                title="mark as correct answer"
              />
              <span style={{ ...mono, width: 16 }}>{letter(i)}.</span>
              <input
                value={c}
                onChange={(e) => setEditDraft({ ...editDraft, choices: editDraft.choices.map((x, j) => (j === i ? e.target.value : x)) })}
                style={{ ...inputStyle, flex: 1 }}
              />
            </label>
          ))}
          <label style={{ fontSize: 13, fontWeight: 600 }}>Worked solution
            <textarea rows={7} value={editDraft.solution} onChange={(e) => setEditDraft({ ...editDraft, solution: e.target.value })} style={{ ...inputStyle, marginTop: 4 }} />
          </label>
          {editDraft.distractorRationales.map((r, i) => (
            <label key={i} style={{ fontSize: 13, fontWeight: 600 }}>Distractor rationale {i + 1}
              <textarea
                rows={2}
                value={r}
                onChange={(e) =>
                  setEditDraft({ ...editDraft, distractorRationales: editDraft.distractorRationales.map((x, j) => (j === i ? e.target.value : x)) })
                }
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </label>
          ))}
          <label style={{ fontSize: 13, fontWeight: 600 }}>Difficulty
            <select value={editDraft.difficulty} onChange={(e) => setEditDraft({ ...editDraft, difficulty: e.target.value })} style={{ ...inputStyle, marginTop: 4, width: 220 }}>
              {["Intro", "Intermediate", "Advanced"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={saveEdit} disabled={busy} style={{ ...display, padding: "10px 22px", borderRadius: 8, border: "none", background: TEAL, color: "white", fontSize: 14, cursor: "pointer" }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ ...display, padding: "10px 22px", borderRadius: 8, border: `1px solid ${NAVY}33`, background: "white", fontSize: 14, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      ) : (
        /* ---------- REVIEW MODE ---------- */
        <div>
          <div style={{ ...mono, fontSize: 12, color: GREY, marginBottom: 10, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
            <span>
              {index + 1} / {drafts.length} · {current.course}/{current.topic} · <span style={{ color: GOLD }}>{current.difficulty}</span>
              {current.provenance?.editedFromOriginal && <span style={{ color: TEAL }}> · edited</span>}
            </span>
            <span>{current.provenance?.model} · {current.provenance?.promptVersion}</span>
          </div>

          {/* student view */}
          <div style={{ background: "white", borderRadius: 14, padding: 24, border: `1px solid ${NAVY}14`, marginBottom: 16 }}>
            <p style={{ fontSize: 15, lineHeight: 1.6, marginTop: 0 }}>{current.stem}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {current.choices.map((opt, i) => {
                const isRight = i === current.correctIndex;
                return (
                  <div key={i} style={{ ...mono, padding: "12px 16px", borderRadius: 8, fontSize: 14, border: `1.5px solid ${isRight ? TEAL : `${NAVY}1c`}`, background: isRight ? `${TEAL}12` : "white" }}>
                    <span style={{ color: GREY, marginRight: 10 }}>{letter(i)}.</span>
                    {opt}
                    {isRight && <span style={{ float: "right", color: TEAL }}>✓ correct</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* solution + rationales */}
          <div style={{ background: "white", borderRadius: 14, padding: 24, border: `1px solid ${NAVY}14`, marginBottom: 16 }}>
            <p style={{ ...mono, fontSize: 11.5, color: TEAL, letterSpacing: "0.06em", margin: "0 0 8px" }}>WORKED SOLUTION</p>
            <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0, color: NAVY }}>{current.solution}</p>
            <p style={{ ...mono, fontSize: 11.5, color: PINK, letterSpacing: "0.06em", margin: "18px 0 8px" }}>DISTRACTOR RATIONALES</p>
            {current.choices.map((_, i) => {
              if (i === current.correctIndex) return null;
              const wrongBefore = current.choices.slice(0, i).filter((_, j) => j !== current.correctIndex).length;
              return (
                <p key={i} style={{ fontSize: 13.5, lineHeight: 1.6, margin: "0 0 8px", color: GREY }}>
                  <b style={{ ...mono, color: NAVY }}>{letter(i)}:</b> {current.distractorRationales[wrongBefore]}
                </p>
              );
            })}
          </div>

          {/* actions */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={approve} disabled={busy} style={{ ...display, padding: "11px 24px", borderRadius: 8, border: "none", background: TEAL, color: "white", fontSize: 14, cursor: "pointer" }}>
              Approve <span style={{ ...mono, fontSize: 11, opacity: 0.8 }}>(a)</span>
            </button>
            <button
              onClick={() => { setEditDraft(JSON.parse(JSON.stringify(current))); setEditing(true); }}
              style={{ ...display, padding: "11px 24px", borderRadius: 8, border: `1px solid ${NAVY}33`, background: "white", fontSize: 14, cursor: "pointer" }}
            >
              Edit <span style={{ ...mono, fontSize: 11, color: GREY }}>(e)</span>
            </button>
            <button onClick={reject} disabled={busy} style={{ ...display, padding: "11px 24px", borderRadius: 8, border: "none", background: PINK, color: "white", fontSize: 14, cursor: "pointer" }}>
              Reject <span style={{ ...mono, fontSize: 11, opacity: 0.8 }}>(r)</span>
            </button>
            {rejecting && (
              <input
                ref={reasonRef}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") reject(); if (e.key === "Escape") { setRejecting(false); setReason(""); } }}
                placeholder="rejection reason (Enter to confirm)"
                style={{ ...inputStyle, flex: 1, minWidth: 240 }}
              />
            )}
            <span style={{ ...mono, fontSize: 11.5, color: GREY, marginLeft: "auto" }}>← → navigate</span>
          </div>
        </div>
      )}
    </div>
  );
}
