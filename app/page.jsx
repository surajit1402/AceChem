"use client";
import React, { useState, useCallback, useEffect } from "react";

const COURSES = {
  Chem1: [
    { id: "atomic", symbol: "At", num: 1, title: "Atomic Structure & Periodic Trends", desc: "Electron configs, periodic trends, quantum numbers." },
    { id: "bonding", symbol: "Bd", num: 2, title: "Chemical Bonding", desc: "Lewis structures, VSEPR, polarity, hybridization." },
    { id: "nomenclature", symbol: "Nm", num: 3, title: "Nomenclature", desc: "Naming ionic, covalent, and acid compounds." },
    { id: "reactions", symbol: "Rx", num: 4, title: "Reactions & Equations", desc: "Balancing, reaction types, predicting products." },
    { id: "stoich", symbol: "St", num: 5, title: "Stoichiometry", desc: "Mole ratios, limiting reagent, percent yield." },
    { id: "gases", symbol: "Gs", num: 6, title: "Gases", desc: "Ideal gas law, partial pressure, kinetic theory." },
    { id: "thermochem", symbol: "Tc", num: 7, title: "Thermochemistry", desc: "Enthalpy, calorimetry, Hess's law." },
    { id: "solutions", symbol: "Sl", num: 8, title: "Solutions & Concentration", desc: "Molarity, dilution, colligative properties." },
  ],
  Chem2: [
    { id: "kinetics", symbol: "Kn", num: 9, title: "Kinetics", desc: "Rate laws, integrated rate laws, activation energy." },
    { id: "equilibrium", symbol: "Eq", num: 10, title: "Equilibrium", desc: "Kc, Kp, ICE tables, Le Chatelier's principle." },
    { id: "acidsbases", symbol: "Ab", num: 11, title: "Acids & Bases", desc: "pH, pKa, buffers, titration curves." },
    { id: "thermo", symbol: "Td", num: 12, title: "Thermodynamics", desc: "Entropy, Gibbs free energy, spontaneity." },
    { id: "electrochem", symbol: "Ec", num: 13, title: "Electrochemistry", desc: "Redox, galvanic cells, the Nernst equation." },
  ],
};

const TAB_COLOR = { Chem1: "#2A7F7E", Chem2: "#E0527A" };
const DIFFICULTIES = ["Intro", "Intermediate", "Advanced"];

function TitrationHero() {
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, marginBottom: 32, background: "#1B2A3D" }}>
      <style>{`
        @keyframes drip { 0% { transform: translateY(0); opacity: 1; } 70% { opacity: 1; } 100% { transform: translateY(70px); opacity: 0; } }
        @keyframes colorShift { 0%, 45% { fill: #2A7F7E; } 55%, 100% { fill: #E0527A; } }
        .drop { animation: drip 1.8s ease-in infinite; }
        .flask-liquid { animation: colorShift 3.6s ease-in-out infinite; }
      `}</style>
      <div style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24, padding: "40px 32px" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <span style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 12px", borderRadius: 999, display: "inline-block", marginBottom: 16, background: "#F6F8F614", color: "#D9A441" }}>
            ⚗ Guided Chemistry Practice
          </span>
          <h1 style={{ fontSize: 40, marginBottom: 12, color: "#F6F8F6", letterSpacing: "-0.01em" }}>ChemKnowledge Builder</h1>
          <p style={{ fontSize: 15, maxWidth: 420, color: "#9FB2BE" }}>
            Build confidence in general chemistry with focused, AI-generated practice, instant feedback, and topic-by-topic review.
          </p>
        </div>
        <svg width="110" height="140" viewBox="0 0 120 150" aria-hidden="true">
          <rect x="54" y="0" width="12" height="30" fill="#F6F8F633" />
          <circle className="drop" cx="60" cy="34" r="4" fill="#D9A441" />
          <path d="M40 60 L48 100 L38 140 L82 140 L72 100 L80 60 Z" fill="none" stroke="#F6F8F655" strokeWidth="2" />
          <path className="flask-liquid" d="M43 100 L38 140 L82 140 L77 100 Z" />
        </svg>
      </div>
    </div>
  );
}

function ElementTile({ topic, accent, stats, onStart }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onStart(topic)}
      style={{
        borderRadius: 12,
        padding: 20,
        background: "white",
        cursor: "pointer",
        transition: "all 0.2s",
        border: `1px solid ${hover ? accent : "#1B2A3D14"}`,
        boxShadow: hover ? `0 8px 20px -8px ${accent}55` : "0 1px 2px #1B2A3D08",
        transform: hover ? "translateY(-3px)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "monospace", background: `${accent}14`, color: accent, border: `1px solid ${accent}33` }}>
          <span style={{ fontSize: 9, lineHeight: 1 }}>{topic.num}</span>
          <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1, marginTop: 2 }}>{topic.symbol}</span>
        </div>
        {stats && (
          <span style={{ fontFamily: "monospace", fontSize: 11, color: stats.correct === stats.answered && stats.answered > 0 ? "#2A7F7E" : "#4B5F6F" }}>
            {stats.correct}/{stats.answered}
          </span>
        )}
      </div>
      <h3 style={{ fontSize: 16, marginBottom: 4, color: "#1B2A3D" }}>{topic.title}</h3>
      <p style={{ fontSize: 14, marginBottom: 16, color: "#4B5F6F" }}>{topic.desc}</p>
      <span style={{ fontFamily: "monospace", fontSize: 12, padding: "6px 12px", borderRadius: 6, display: "inline-block", background: hover ? accent : `${accent}14`, color: hover ? "#fff" : accent }}>
        Start →
      </span>
    </div>
  );
}

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
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#1B2A3Dcc" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 520, borderRadius: 12, background: "white", padding: 24, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontFamily: "monospace", fontSize: 12, padding: "2px 8px", borderRadius: 4, background: `${accent}14`, color: accent }}>{topic.title}</span>
          <button onClick={onClose} style={{ fontFamily: "monospace", fontSize: 14, color: "#4B5F6F", background: "none", border: "none", cursor: "pointer" }}>close ✕</button>
        </div>

        {loading && <p style={{ textAlign: "center", padding: "40px 0", fontFamily: "monospace", fontSize: 14, color: accent }}>generating problem…</p>}
        {error && <p style={{ textAlign: "center", padding: "40px 0", fontSize: 14, color: "#E0527A" }}>{error}</p>}

        {question && !loading && !error && (
          <div>
            <p style={{ marginBottom: 20, lineHeight: 1.5 }}>{question.question}</p>
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
                      textAlign: "left", padding: "10px 16px", borderRadius: 6, fontFamily: "monospace", fontSize: 14, cursor: "pointer",
                      border: `1px solid ${isRight ? "#2A7F7E" : isWrong ? "#E0527A" : selectedOption === opt ? accent : "#1B2A3D22"}`,
                      background: isRight ? "#2A7F7E14" : isWrong ? "#E0527A14" : selectedOption === opt ? `${accent}0d` : "white",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {!submitted ? (
              <button
                onClick={submit}
                disabled={!selectedOption}
                style={{ marginTop: 20, padding: "10px 20px", borderRadius: 6, fontSize: 14, color: "white", border: "none", cursor: "pointer", background: accent, opacity: !selectedOption ? 0.4 : 1 }}
              >
                Submit answer
              </button>
            ) : (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 14, marginBottom: 8, fontWeight: 600, color: isCorrect ? "#2A7F7E" : "#E0527A" }}>
                  {isCorrect ? "Correct." : `Not quite — correct answer: ${question.correctAnswer}`}
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: "#4B5F6F" }}>{question.explanation}</p>
                <button onClick={load} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 6, fontSize: 14, color: "#F6F8F6", background: "#1B2A3D", border: "none", cursor: "pointer" }}>
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

export default function Home() {
  const [activeCourse, setActiveCourse] = useState("Chem1");
  const [difficulty, setDifficulty] = useState("Intro");
  const [openTopic, setOpenTopic] = useState(null);
  const [topicStats, setTopicStats] = useState({});

  const handleAnswered = (topicId, correct) => {
    setTopicStats((prev) => {
      const cur = prev[topicId] || { answered: 0, correct: 0 };
      return { ...prev, [topicId]: { answered: cur.answered + 1, correct: cur.correct + (correct ? 1 : 0) } };
    });
  };

  const totalTopics = COURSES.Chem1.length + COURSES.Chem2.length;
  const accent = TAB_COLOR[activeCourse];

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>
      <TitrationHero />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
        {[["2", "Courses"], [String(totalTopics), "Topics"], ["10", "Questions / Session"], ["Free", "Practice Quizzes"]].map(([n, l]) => (
          <div key={l} style={{ borderRadius: 8, background: "white", padding: 16, border: "1px solid #1B2A3D14" }}>
            <div style={{ fontSize: 24, color: "#2A7F7E" }}>{n}</div>
            <div style={{ fontSize: 12, color: "#4B5F6F" }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#4B5F6F" }}>DIFFICULTY</span>
        <div style={{ display: "flex", gap: 8 }}>
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              style={{
                padding: "6px 14px", borderRadius: 999, fontSize: 13, cursor: "pointer",
                background: difficulty === d ? "#1B2A3D" : "transparent",
                color: difficulty === d ? "white" : "#4B5F6F",
                border: `1px solid ${difficulty === d ? "#1B2A3D" : "#1B2A3D22"}`,
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontFamily: "monospace", fontSize: 12, marginBottom: 4, color: "#4B5F6F" }}>BROWSE TOPICS</p>
          <h2 style={{ fontSize: 24 }}>{activeCourse}</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {Object.keys(COURSES).map((c) => (
            <button
              key={c}
              onClick={() => setActiveCourse(c)}
              style={{
                padding: "6px 16px", borderRadius: 999, fontSize: 14, cursor: "pointer",
                background: activeCourse === c ? TAB_COLOR[c] : "transparent",
                color: activeCourse === c ? "white" : "#4B5F6F",
                border: `1px solid ${activeCourse === c ? TAB_COLOR[c] : "#1B2A3D22"}`,
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {COURSES[activeCourse].map((t) => (
          <ElementTile key={t.id} topic={t} accent={accent} stats={topicStats[t.id]} onStart={setOpenTopic} />
        ))}
      </div>

      {openTopic && (
        <QuizModal topic={openTopic} difficulty={difficulty} accent={accent} onClose={() => setOpenTopic(null)} onAnswered={handleAnswered} />
      )}
    </main>
  );
}
