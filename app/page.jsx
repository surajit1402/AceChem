"use client";
import React, { useState, useCallback, useEffect } from "react";

const COURSES = {
  Chem1: [
    { id: "atomic", symbol: "At", num: 1, title: "Atomic Structure & Periodic Trends", desc: "Electron configs, periodic trends, quantum numbers.", skills: ["e⁻ configs", "trends", "quantum #s"] },
    { id: "bonding", symbol: "Bd", num: 2, title: "Chemical Bonding", desc: "Lewis structures, VSEPR, polarity, hybridization.", skills: ["Lewis", "VSEPR", "polarity"] },
    { id: "nomenclature", symbol: "Nm", num: 3, title: "Nomenclature", desc: "Naming ionic, covalent, and acid compounds.", skills: ["ionic", "covalent", "acids"] },
    { id: "reactions", symbol: "Rx", num: 4, title: "Reactions & Equations", desc: "Balancing, reaction types, predicting products.", skills: ["balancing", "types", "products"] },
    { id: "stoich", symbol: "St", num: 5, title: "Stoichiometry", desc: "Mole ratios, limiting reagent, percent yield.", skills: ["moles", "limiting", "% yield"] },
    { id: "gases", symbol: "Gs", num: 6, title: "Gases", desc: "Ideal gas law, partial pressure, kinetic theory.", skills: ["PV=nRT", "Dalton", "KMT"] },
    { id: "thermochem", symbol: "Tc", num: 7, title: "Thermochemistry", desc: "Enthalpy, calorimetry, Hess's law.", skills: ["ΔH", "q=mcΔT", "Hess"] },
    { id: "solutions", symbol: "Sl", num: 8, title: "Solutions & Concentration", desc: "Molarity, dilution, colligative properties.", skills: ["molarity", "dilution", "colligative"] },
  ],
  Chem2: [
    { id: "kinetics", symbol: "Kn", num: 9, title: "Kinetics", desc: "Rate laws, integrated rate laws, activation energy.", skills: ["rate laws", "half-life", "Eₐ"] },
    { id: "equilibrium", symbol: "Eq", num: 10, title: "Equilibrium", desc: "Kc, Kp, ICE tables, Le Chatelier's principle.", skills: ["Kc / Kp", "ICE", "Le Chatelier"] },
    { id: "acidsbases", symbol: "Ab", num: 11, title: "Acids & Bases", desc: "pH, pKa, buffers, titration curves.", skills: ["pH", "buffers", "titration"] },
    { id: "thermo", symbol: "Td", num: 12, title: "Thermodynamics", desc: "Entropy, Gibbs free energy, spontaneity.", skills: ["ΔS", "ΔG", "spontaneity"] },
    { id: "electrochem", symbol: "Ec", num: 13, title: "Electrochemistry", desc: "Redox, galvanic cells, the Nernst equation.", skills: ["redox", "E°cell", "Nernst"] },
  ],
};

const TAB_COLOR = { Chem1: "#2A7F7E", Chem2: "#E0527A" };
const DIFFICULTIES = [
  { key: "Intro", desc: "single-step" },
  { key: "Intermediate", desc: "multi-step" },
  { key: "Advanced", desc: "exam-style" },
];

/* ---------- Logo ---------- */
function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <polygon points="20,3 35,11.5 35,28.5 20,37 5,28.5 5,11.5" fill="#1B2A3D" />
      <polygon points="20,8 30.5,14 30.5,26 20,32 9.5,26 9.5,14" fill="none" stroke="#2A7F7E" strokeWidth="1.6" />
      <circle cx="20" cy="20" r="4.5" fill="#E0527A" />
      <circle cx="20" cy="10.5" r="2" fill="#D9A441" />
    </svg>
  );
}

/* ---------- Background ---------- */
function HexBackground() {
  return (
    <svg
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, opacity: 0.05, pointerEvents: "none" }}
    >
      <defs>
        <pattern id="hex" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(1.4)">
          <polygon points="28,2 52,16 52,44 28,58 4,44 4,16" fill="none" stroke="#1B2A3D" strokeWidth="1.5" />
          <polygon points="28,50.5 52,64.5 52,92.5 28,106.5 4,92.5 4,64.5" fill="none" stroke="#1B2A3D" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex)" />
    </svg>
  );
}

/* ---------- Hero ---------- */
function TitrationHero() {
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, marginBottom: 28, background: "linear-gradient(135deg, #1B2A3D 0%, #24384f 60%, #1B2A3D 100%)" }}>
      <svg aria-hidden="true" style={{ position: "absolute", right: -30, top: -30, opacity: 0.08 }} width="280" height="280" viewBox="0 0 100 100">
        <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="none" stroke="#F6F8F6" strokeWidth="2" />
        <circle cx="50" cy="50" r="14" fill="none" stroke="#F6F8F6" strokeWidth="2" />
      </svg>
      <div style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24, padding: "44px 34px" }}>
        <div style={{ flex: 1, minWidth: 250 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, padding: "5px 14px", borderRadius: 999, display: "inline-block", marginBottom: 18, background: "#F6F8F612", color: "#D9A441", letterSpacing: "0.06em" }}>
            ⚗ GUIDED CHEMISTRY PRACTICE
          </span>
          <h1 className="hero-title" style={{ fontFamily: "var(--display)", fontSize: "clamp(30px, 6vw, 46px)", marginBottom: 14, color: "#F6F8F6", letterSpacing: "-0.015em", lineHeight: 1.05 }}>
            Master gen chem,<br />one reaction at a time.
          </h1>
          <p style={{ fontSize: 15, maxWidth: 440, color: "#9FB2BE", lineHeight: 1.6 }}>
            Unlimited AI-generated practice problems across 13 topics — pick a difficulty, answer, and get an instant step-by-step explanation. Free, no sign-up.
          </p>
        </div>
        <svg width="120" height="150" viewBox="0 0 120 150" aria-hidden="true" style={{ flexShrink: 0 }}>
          <rect x="54" y="0" width="12" height="30" fill="#F6F8F633" />
          <circle className="drop" cx="60" cy="34" r="4" fill="#D9A441" />
          <path d="M40 60 L48 100 L38 140 L82 140 L72 100 L80 60 Z" fill="none" stroke="#F6F8F655" strokeWidth="2" />
          <path className="flask-liquid" d="M43 100 L38 140 L82 140 L77 100 Z" />
          <circle className="bubble b1" cx="52" cy="128" r="2.5" fill="#F6F8F644" />
          <circle className="bubble b2" cx="64" cy="132" r="2" fill="#F6F8F644" />
          <circle className="bubble b3" cx="58" cy="124" r="1.6" fill="#F6F8F644" />
        </svg>
      </div>
    </div>
  );
}

/* ---------- How it works ---------- */
function HowItWorks() {
  const steps = [
    ["01", "Pick a difficulty", "Intro, Intermediate, or Advanced — switch anytime."],
    ["02", "Choose a topic", "13 topics spanning both semesters of gen chem."],
    ["03", "Answer & learn", "Instant feedback with a step-by-step explanation."],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
      {steps.map(([n, t, d]) => (
        <div key={n} style={{ borderRadius: 12, background: "#ffffffd9", backdropFilter: "blur(4px)", padding: "16px 18px", border: "1px solid #1B2A3D14", display: "flex", gap: 14 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "#D9A441", fontWeight: 600 }}>{n}</span>
          <div>
            <div style={{ fontFamily: "var(--display)", fontSize: 15, marginBottom: 2 }}>{t}</div>
            <div style={{ fontSize: 13, color: "#4B5F6F", lineHeight: 1.5 }}>{d}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Session tracker ---------- */
function SessionBar({ score, answered, streak }) {
  const pct = answered ? Math.round((score / answered) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, borderRadius: 12, background: "#1B2A3D", color: "#F6F8F6", padding: "14px 20px", marginBottom: 28, flexWrap: "wrap" }}>
      <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#9FB2BE", letterSpacing: "0.06em" }}>THIS SESSION</span>
      <span style={{ fontFamily: "var(--display)", fontSize: 15 }}>{score}<span style={{ color: "#9FB2BE" }}>/{answered} correct</span></span>
      <div style={{ flex: 1, minWidth: 120, height: 6, borderRadius: 999, background: "#F6F8F622", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: pct >= 70 ? "#2A7F7E" : "#D9A441", transition: "width 0.4s" }} />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: streak >= 3 ? "#E0527A" : "#9FB2BE" }}>
        {streak >= 3 ? "🔥 " : ""}streak {streak}
      </span>
    </div>
  );
}

/* ---------- Topic card ---------- */
function ElementTile({ topic, accent, stats, onStart }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onStart(topic)}
      style={{
        borderRadius: 14,
        padding: 20,
        background: "#ffffffe6",
        backdropFilter: "blur(4px)",
        cursor: "pointer",
        transition: "all 0.2s",
        border: `1px solid ${hover ? accent : "#1B2A3D14"}`,
        boxShadow: hover ? `0 10px 24px -10px ${accent}66` : "0 1px 3px #1B2A3D0a",
        transform: hover ? "translateY(-3px)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", background: `${accent}12`, color: accent, border: `1px solid ${accent}33` }}>
          <span style={{ fontSize: 9, lineHeight: 1 }}>{topic.num}</span>
          <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1, marginTop: 2 }}>{topic.symbol}</span>
        </div>
        {stats && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: stats.correct === stats.answered && stats.answered > 0 ? "#2A7F7E" : "#4B5F6F" }}>
            ✓ {stats.correct}/{stats.answered}
          </span>
        )}
      </div>
      <h3 style={{ fontFamily: "var(--display)", fontSize: 16, marginBottom: 5, color: "#1B2A3D" }}>{topic.title}</h3>
      <p style={{ fontSize: 13.5, marginBottom: 12, color: "#4B5F6F", lineHeight: 1.5 }}>{topic.desc}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {topic.skills.map((s) => (
          <span key={s} style={{ fontFamily: "var(--mono)", fontSize: 10.5, padding: "3px 8px", borderRadius: 999, background: "#1B2A3D0a", color: "#4B5F6F" }}>{s}</span>
        ))}
      </div>
      <span style={{ marginTop: "auto", fontFamily: "var(--mono)", fontSize: 12, padding: "7px 14px", borderRadius: 8, display: "inline-block", alignSelf: "flex-start", background: hover ? accent : `${accent}12`, color: hover ? "#fff" : accent, transition: "all 0.2s" }}>
        Start practice →
      </span>
    </div>
  );
}

/* ---------- Quiz modal ---------- */
function QuizModal({ topic, difficulty, accent, onClose, onAnswered }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSubmitted(false);
    setSelectedOption("");
    try {
      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.title, difficulty }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuestion(data.question);
    } catch (e) {
      setError("Couldn't generate a question. Try again.");
    } finally {
      setLoading(false);
    }
  }, [topic, difficulty]);

  useEffect(() => { load(); }, [load]);

  const submit = () => {
    if (!question) return;
    const correct = selectedOption.trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswered(topic.id, correct);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#1B2A3Dd9", backdropFilter: "blur(3px)" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 540, borderRadius: 16, background: "white", padding: 26, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 60px -12px #00000066" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, padding: "3px 10px", borderRadius: 6, background: `${accent}12`, color: accent }}>{topic.title}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#D9A441" }}>{difficulty}</span>
          </div>
          <button onClick={onClose} style={{ fontFamily: "var(--mono)", fontSize: 14, color: "#4B5F6F", background: "none", border: "none", cursor: "pointer" }}>✕</button>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <svg width="42" height="52" viewBox="0 0 120 150" style={{ marginBottom: 10 }}>
              <circle className="drop" cx="60" cy="34" r="5" fill="#D9A441" />
              <path d="M40 60 L48 100 L38 140 L82 140 L72 100 L80 60 Z" fill="none" stroke="#1B2A3D44" strokeWidth="3" />
            </svg>
            <p style={{ fontFamily: "var(--mono)", fontSize: 13, color: accent }}>generating problem…</p>
          </div>
        )}
        {error && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 14, color: "#E0527A", marginBottom: 12 }}>{error}</p>
            <button onClick={load} style={{ fontFamily: "var(--mono)", fontSize: 13, color: "#2A7F7E", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>retry</button>
          </div>
        )}

        {question && !loading && !error && (
          <div>
            <p style={{ marginBottom: 20, lineHeight: 1.6, fontSize: 15 }}>{question.question}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {question.options.map((opt, i) => {
                const isRight = submitted && opt.trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
                const isWrong = submitted && selectedOption === opt && !isRight;
                return (
                  <button
                    key={i}
                    disabled={submitted}
                    onClick={() => setSelectedOption(opt)}
                    style={{
                      textAlign: "left", padding: "12px 16px", borderRadius: 8, fontFamily: "var(--mono)", fontSize: 14, cursor: submitted ? "default" : "pointer", transition: "all 0.15s",
                      border: `1.5px solid ${isRight ? "#2A7F7E" : isWrong ? "#E0527A" : selectedOption === opt ? accent : "#1B2A3D1c"}`,
                      background: isRight ? "#2A7F7E12" : isWrong ? "#E0527A12" : selectedOption === opt ? `${accent}0d` : "white",
                    }}
                  >
                    <span style={{ color: "#4B5F6F", marginRight: 10 }}>{String.fromCharCode(65 + i)}.</span>{opt}
                    {isRight && <span style={{ float: "right", color: "#2A7F7E" }}>✓</span>}
                    {isWrong && <span style={{ float: "right", color: "#E0527A" }}>✕</span>}
                  </button>
                );
              })}
            </div>

            {!submitted ? (
              <button
                onClick={submit}
                disabled={!selectedOption}
                style={{ marginTop: 22, padding: "12px 26px", borderRadius: 8, fontSize: 14, fontFamily: "var(--display)", color: "white", border: "none", cursor: "pointer", background: accent, opacity: !selectedOption ? 0.4 : 1, transition: "opacity 0.15s" }}
              >
                Submit answer
              </button>
            ) : (
              <div style={{ marginTop: 22, borderTop: "1px solid #1B2A3D14", paddingTop: 16 }}>
                <p style={{ fontSize: 15, marginBottom: 8, fontWeight: 600, fontFamily: "var(--display)", color: isCorrect ? "#2A7F7E" : "#E0527A" }}>
                  {isCorrect ? "✓ Correct" : "✕ Not quite"}
                </p>
                {!isCorrect && (
                  <p style={{ fontSize: 14, marginBottom: 8 }}>
                    Correct answer: <span style={{ fontFamily: "var(--mono)", color: "#2A7F7E" }}>{question.correctAnswer}</span>
                  </p>
                )}
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#4B5F6F" }}>{question.explanation}</p>
                <button onClick={load} style={{ marginTop: 18, padding: "12px 26px", borderRadius: 8, fontSize: 14, fontFamily: "var(--display)", color: "#F6F8F6", background: "#1B2A3D", border: "none", cursor: "pointer" }}>
                  Next question →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function Home() {
  const [activeCourse, setActiveCourse] = useState("Chem1");
  const [difficulty, setDifficulty] = useState("Intro");
  const [openTopic, setOpenTopic] = useState(null);
  const [topicStats, setTopicStats] = useState({});
  const [session, setSession] = useState({ score: 0, answered: 0, streak: 0 });

  const handleAnswered = (topicId, correct) => {
    setTopicStats((prev) => {
      const cur = prev[topicId] || { answered: 0, correct: 0 };
      return { ...prev, [topicId]: { answered: cur.answered + 1, correct: cur.correct + (correct ? 1 : 0) } };
    });
    setSession((s) => ({
      score: s.score + (correct ? 1 : 0),
      answered: s.answered + 1,
      streak: correct ? s.streak + 1 : 0,
    }));
  };

  const totalTopics = COURSES.Chem1.length + COURSES.Chem2.length;
  const accent = TAB_COLOR[activeCourse];

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        :root { --display: 'Space Grotesk', sans-serif; --body: 'Inter', system-ui, sans-serif; --mono: 'JetBrains Mono', monospace; }
        body { font-family: var(--body); }
        @keyframes drip { 0% { transform: translateY(0); opacity: 1; } 70% { opacity: 1; } 100% { transform: translateY(70px); opacity: 0; } }
        @keyframes colorShift { 0%, 45% { fill: #2A7F7E; } 55%, 100% { fill: #E0527A; } }
        @keyframes rise { 0% { transform: translateY(0); opacity: 0.7; } 100% { transform: translateY(-22px); opacity: 0; } }
        .drop { animation: drip 1.8s ease-in infinite; }
        .flask-liquid { animation: colorShift 3.6s ease-in-out infinite; }
        .bubble { animation: rise 2.4s ease-out infinite; }
        .b2 { animation-delay: 0.8s; } .b3 { animation-delay: 1.5s; }
        @media (prefers-reduced-motion: reduce) { .drop, .flask-liquid, .bubble { animation: none; } }
      `}</style>

      <HexBackground />

      <header style={{ position: "relative", zIndex: 1, borderBottom: "1px solid #1B2A3D12", background: "#F6F8F6e6", backdropFilter: "blur(8px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <Logo />
          <div>
            <div style={{ fontFamily: "var(--display)", fontSize: 18, letterSpacing: "-0.01em", color: "#1B2A3D" }}>AceChem</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "#4B5F6F", letterSpacing: "0.05em" }}>GENERAL CHEMISTRY PRACTICE</div>
          </div>
          <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, padding: "4px 12px", borderRadius: 999, background: "#2A7F7E14", color: "#2A7F7E" }}>
            {totalTopics} topics · free
          </span>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "28px 20px 60px", color: "#1B2A3D" }}>
        <TitrationHero />
        <HowItWorks />
        <SessionBar score={session.score} answered={session.answered} streak={session.streak} />

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#4B5F6F", letterSpacing: "0.06em" }}>DIFFICULTY</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d.key}
                onClick={() => setDifficulty(d.key)}
                style={{
                  padding: "7px 16px", borderRadius: 999, fontSize: 13, cursor: "pointer", fontFamily: "var(--body)", transition: "all 0.15s",
                  background: difficulty === d.key ? "#1B2A3D" : "#ffffffb3",
                  color: difficulty === d.key ? "white" : "#4B5F6F",
                  border: `1px solid ${difficulty === d.key ? "#1B2A3D" : "#1B2A3D22"}`,
                }}
              >
                {d.key} <span style={{ opacity: 0.6, fontSize: 11 }}>· {d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: 12, marginBottom: 4, color: "#4B5F6F", letterSpacing: "0.06em" }}>BROWSE TOPICS</p>
            <h2 style={{ fontFamily: "var(--display)", fontSize: 26, letterSpacing: "-0.01em" }}>
              {activeCourse === "Chem1" ? "Chem 1 · First Semester" : "Chem 2 · Second Semester"}
            </h2>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {Object.keys(COURSES).map((c) => (
              <button
                key={c}
                onClick={() => setActiveCourse(c)}
                style={{
                  padding: "7px 18px", borderRadius: 999, fontSize: 14, cursor: "pointer", fontFamily: "var(--display)", transition: "all 0.15s",
                  background: activeCourse === c ? TAB_COLOR[c] : "#ffffffb3",
                  color: activeCourse === c ? "white" : "#4B5F6F",
                  border: `1px solid ${activeCourse === c ? TAB_COLOR[c] : "#1B2A3D22"}`,
                }}
              >
                {c} <span style={{ opacity: 0.7, fontSize: 12 }}>({COURSES[c].length})</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 16 }}>
          {COURSES[activeCourse].map((t) => (
            <ElementTile key={t.id} topic={t} accent={accent} stats={topicStats[t.id]} onStart={setOpenTopic} />
          ))}
        </div>

        <footer style={{ marginTop: 56, paddingTop: 20, borderTop: "1px solid #1B2A3D12", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Logo size={22} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#4B5F6F" }}>
            AceChem · unlimited AI-generated gen chem practice · questions are generated fresh — double-check anything that looks off
          </span>
        </footer>
      </main>

      {openTopic && (
        <QuizModal topic={openTopic} difficulty={difficulty} accent={accent} onClose={() => setOpenTopic(null)} onAnswered={handleAnswered} />
      )}
    </div>
  );
}
