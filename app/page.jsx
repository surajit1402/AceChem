"use client";
import React, { useState, useCallback, useEffect } from "react";

/* ================= COURSES ================= */
const COURSES = {
  Intro: [
    { id: "matter", symbol: "Mm", num: 1, title: "Matter & Measurement", desc: "States of matter, sig figs, units, density.", skills: ["sig figs", "SI units", "density"] },
    { id: "conversions", symbol: "Uc", num: 2, title: "Unit Conversions", desc: "Dimensional analysis and metric prefixes.", skills: ["dim. analysis", "prefixes", "conversions"] },
    { id: "atoms", symbol: "Ai", num: 3, title: "Atoms, Elements & Isotopes", desc: "Subatomic particles, isotopes, average atomic mass.", skills: ["p⁺ n⁰ e⁻", "isotopes", "avg mass"] },
    { id: "ptable", symbol: "Pt", num: 4, title: "The Periodic Table", desc: "Groups, periods, metals vs nonmetals.", skills: ["groups", "periods", "metal/nonmetal"] },
    { id: "compounds", symbol: "Cp", num: 5, title: "Ionic & Molecular Compounds", desc: "Formulas, simple naming, ions.", skills: ["formulas", "ions", "naming"] },
    { id: "moleintro", symbol: "Mo", num: 6, title: "The Mole Concept", desc: "Mole-to-mass conversions and molar mass.", skills: ["molar mass", "mol ↔ g", "counting"] },
  ],
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
    { id: "kinetics", symbol: "Kn", num: 1, title: "Kinetics", desc: "Rate laws, integrated rate laws, activation energy.", skills: ["rate laws", "half-life", "Eₐ"] },
    { id: "equilibrium", symbol: "Eq", num: 2, title: "Equilibrium", desc: "Kc, Kp, ICE tables, Le Chatelier's principle.", skills: ["Kc / Kp", "ICE", "Le Chatelier"] },
    { id: "acidsbases", symbol: "Ab", num: 3, title: "Acids & Bases", desc: "pH, pKa, buffers, titration curves.", skills: ["pH", "buffers", "titration"] },
    { id: "thermo", symbol: "Td", num: 4, title: "Thermodynamics", desc: "Entropy, Gibbs free energy, spontaneity.", skills: ["ΔS", "ΔG", "spontaneity"] },
    { id: "electrochem", symbol: "Ec", num: 5, title: "Electrochemistry", desc: "Redox, galvanic cells, the Nernst equation.", skills: ["redox", "E°cell", "Nernst"] },
  ],
};

const COURSE_META = {
  Intro: { color: "#D9A441", label: "Intro · Chemistry Basics" },
  Chem1: { color: "#2A7F7E", label: "Chem 1 · First Semester" },
  Chem2: { color: "#E0527A", label: "Chem 2 · Second Semester" },
};

const DIFFICULTIES = [
  { key: "Intro", desc: "single-step" },
  { key: "Intermediate", desc: "multi-step" },
  { key: "Advanced", desc: "exam-style" },
];

/* ================= PERIODIC TABLE DATA ================= */
/* [symbol, name, mass, category] indexed by Z-1 */
const ELEMENTS = [
  ["H","Hydrogen",1.008,"n"],["He","Helium",4.003,"g"],["Li","Lithium",6.94,"a"],["Be","Beryllium",9.012,"b"],["B","Boron",10.81,"m"],["C","Carbon",12.01,"n"],["N","Nitrogen",14.01,"n"],["O","Oxygen",16.00,"n"],["F","Fluorine",19.00,"h"],["Ne","Neon",20.18,"g"],
  ["Na","Sodium",22.99,"a"],["Mg","Magnesium",24.31,"b"],["Al","Aluminum",26.98,"p"],["Si","Silicon",28.09,"m"],["P","Phosphorus",30.97,"n"],["S","Sulfur",32.07,"n"],["Cl","Chlorine",35.45,"h"],["Ar","Argon",39.95,"g"],
  ["K","Potassium",39.10,"a"],["Ca","Calcium",40.08,"b"],["Sc","Scandium",44.96,"t"],["Ti","Titanium",47.87,"t"],["V","Vanadium",50.94,"t"],["Cr","Chromium",52.00,"t"],["Mn","Manganese",54.94,"t"],["Fe","Iron",55.85,"t"],["Co","Cobalt",58.93,"t"],["Ni","Nickel",58.69,"t"],["Cu","Copper",63.55,"t"],["Zn","Zinc",65.38,"t"],["Ga","Gallium",69.72,"p"],["Ge","Germanium",72.63,"m"],["As","Arsenic",74.92,"m"],["Se","Selenium",78.97,"n"],["Br","Bromine",79.90,"h"],["Kr","Krypton",83.80,"g"],
  ["Rb","Rubidium",85.47,"a"],["Sr","Strontium",87.62,"b"],["Y","Yttrium",88.91,"t"],["Zr","Zirconium",91.22,"t"],["Nb","Niobium",92.91,"t"],["Mo","Molybdenum",95.95,"t"],["Tc","Technetium",98,"t"],["Ru","Ruthenium",101.07,"t"],["Rh","Rhodium",102.91,"t"],["Pd","Palladium",106.42,"t"],["Ag","Silver",107.87,"t"],["Cd","Cadmium",112.41,"t"],["In","Indium",114.82,"p"],["Sn","Tin",118.71,"p"],["Sb","Antimony",121.76,"m"],["Te","Tellurium",127.60,"m"],["I","Iodine",126.90,"h"],["Xe","Xenon",131.29,"g"],
  ["Cs","Cesium",132.91,"a"],["Ba","Barium",137.33,"b"],["La","Lanthanum",138.91,"l"],["Ce","Cerium",140.12,"l"],["Pr","Praseodymium",140.91,"l"],["Nd","Neodymium",144.24,"l"],["Pm","Promethium",145,"l"],["Sm","Samarium",150.36,"l"],["Eu","Europium",151.96,"l"],["Gd","Gadolinium",157.25,"l"],["Tb","Terbium",158.93,"l"],["Dy","Dysprosium",162.50,"l"],["Ho","Holmium",164.93,"l"],["Er","Erbium",167.26,"l"],["Tm","Thulium",168.93,"l"],["Yb","Ytterbium",173.05,"l"],["Lu","Lutetium",174.97,"l"],
  ["Hf","Hafnium",178.49,"t"],["Ta","Tantalum",180.95,"t"],["W","Tungsten",183.84,"t"],["Re","Rhenium",186.21,"t"],["Os","Osmium",190.23,"t"],["Ir","Iridium",192.22,"t"],["Pt","Platinum",195.08,"t"],["Au","Gold",196.97,"t"],["Hg","Mercury",200.59,"t"],["Tl","Thallium",204.38,"p"],["Pb","Lead",207.2,"p"],["Bi","Bismuth",208.98,"p"],["Po","Polonium",209,"p"],["At","Astatine",210,"h"],["Rn","Radon",222,"g"],
  ["Fr","Francium",223,"a"],["Ra","Radium",226,"b"],["Ac","Actinium",227,"c"],["Th","Thorium",232.04,"c"],["Pa","Protactinium",231.04,"c"],["U","Uranium",238.03,"c"],["Np","Neptunium",237,"c"],["Pu","Plutonium",244,"c"],["Am","Americium",243,"c"],["Cm","Curium",247,"c"],["Bk","Berkelium",247,"c"],["Cf","Californium",251,"c"],["Es","Einsteinium",252,"c"],["Fm","Fermium",257,"c"],["Md","Mendelevium",258,"c"],["No","Nobelium",259,"c"],["Lr","Lawrencium",266,"c"],
  ["Rf","Rutherfordium",267,"t"],["Db","Dubnium",268,"t"],["Sg","Seaborgium",269,"t"],["Bh","Bohrium",270,"t"],["Hs","Hassium",277,"t"],["Mt","Meitnerium",278,"t"],["Ds","Darmstadtium",281,"t"],["Rg","Roentgenium",282,"t"],["Cn","Copernicium",285,"t"],["Nh","Nihonium",286,"p"],["Fl","Flerovium",289,"p"],["Mc","Moscovium",290,"p"],["Lv","Livermorium",293,"p"],["Ts","Tennessine",294,"h"],["Og","Oganesson",294,"g"],
];

const CAT_INFO = {
  a: ["Alkali metal", "#E0527A"], b: ["Alkaline earth", "#D9A441"], t: ["Transition metal", "#2A7F7E"],
  p: ["Post-transition", "#8B7BC7"], m: ["Metalloid", "#5B8DB8"], n: ["Nonmetal", "#6BA36B"],
  h: ["Halogen", "#C77B4F"], g: ["Noble gas", "#9A6FB0"], l: ["Lanthanide", "#4F97C7"], c: ["Actinide", "#C75E8A"],
};

function elementPos(z) {
  if (z === 1) return [1, 1]; if (z === 2) return [1, 18];
  if (z <= 4) return [2, z - 2]; if (z <= 10) return [2, z + 8];
  if (z <= 12) return [3, z - 10]; if (z <= 18) return [3, z - 0];
  if (z <= 36) return [4, z - 18]; if (z <= 54) return [5, z - 36];
  if (z <= 56) return [6, z - 54]; if (z <= 71) return [9, z - 54];
  if (z <= 86) return [6, z - 68];
  if (z <= 88) return [7, z - 86]; if (z <= 103) return [10, z - 86];
  return [7, z - 100];
}

/* ================= FORMULA & CONSTANT DATA ================= */
const FORMULAS = [
  ["Moles & Stoichiometry", ["n = m / M (moles = mass / molar mass)", "% yield = (actual / theoretical) × 100", "% composition = (mass of element / mass of compound) × 100", "density: d = m / V"]],
  ["Solutions", ["Molarity: M = mol solute / L solution", "Dilution: M₁V₁ = M₂V₂", "mole fraction: χA = molA / mol total"]],
  ["Gases", ["Ideal gas law: PV = nRT", "Combined: P₁V₁/T₁ = P₂V₂/T₂", "Dalton: P_total = P₁ + P₂ + …", "Graham: rate₁/rate₂ = √(M₂/M₁)"]],
  ["Thermochemistry", ["q = m·c·ΔT", "ΔH°rxn = Σ ΔH°f(products) − Σ ΔH°f(reactants)", "Hess's law: ΔH_total = ΔH₁ + ΔH₂ + …"]],
  ["Quantum & Light", ["c = λν", "E = hν = hc/λ", "Rydberg: 1/λ = R_H (1/n₁² − 1/n₂²)"]],
  ["Kinetics", ["rate = k[A]ᵐ[B]ⁿ", "1st order: ln[A]t = −kt + ln[A]₀ ; t½ = 0.693/k", "2nd order: 1/[A]t = kt + 1/[A]₀", "Arrhenius: k = A·e^(−Eₐ/RT)"]],
  ["Equilibrium", ["Kc = [products]/[reactants] (each raised to coeff.)", "Kp = Kc(RT)^Δn", "Q vs K → direction of shift"]],
  ["Acids & Bases", ["pH = −log[H₃O⁺] ; pOH = −log[OH⁻]", "pH + pOH = 14.00 (25 °C)", "Kw = Ka × Kb = 1.0 × 10⁻¹⁴", "Henderson–Hasselbalch: pH = pKa + log([A⁻]/[HA])"]],
  ["Thermodynamics", ["ΔG = ΔH − TΔS", "ΔG° = −RT ln K", "ΔG = ΔG° + RT ln Q"]],
  ["Electrochemistry", ["E°cell = E°cathode − E°anode", "ΔG° = −nFE°cell", "Nernst: E = E° − (0.0592/n) log Q (25 °C)"]],
];

const CONSTANTS = [
  ["Gas constant R", "0.08206 L·atm·mol⁻¹·K⁻¹  =  8.314 J·mol⁻¹·K⁻¹"],
  ["Avogadro's number Nₐ", "6.022 × 10²³ mol⁻¹"],
  ["Planck's constant h", "6.626 × 10⁻³⁴ J·s"],
  ["Speed of light c", "2.998 × 10⁸ m/s"],
  ["Faraday constant F", "96,485 C/mol e⁻"],
  ["Boltzmann constant k_B", "1.381 × 10⁻²³ J/K"],
  ["Rydberg constant R_H", "1.097 × 10⁷ m⁻¹  (2.18 × 10⁻¹⁸ J)"],
  ["Water ion product Kw (25 °C)", "1.0 × 10⁻¹⁴"],
  ["Molar volume at STP (0 °C, 1 atm)", "22.4 L/mol"],
  ["Specific heat of water", "4.184 J·g⁻¹·°C⁻¹  (1 cal = 4.184 J)"],
  ["Pressure conversions", "1 atm = 760 torr = 760 mmHg = 101.325 kPa"],
  ["Temperature", "K = °C + 273.15"],
  ["Electron mass", "9.109 × 10⁻³¹ kg"],
  ["Proton / neutron mass", "1.673 × 10⁻²⁷ kg / 1.675 × 10⁻²⁷ kg"],
  ["Elementary charge e", "1.602 × 10⁻¹⁹ C"],
];

/* ================= SMALL COMPONENTS ================= */
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

function HexBackground() {
  return (
    <svg aria-hidden="true" style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, opacity: 0.05, pointerEvents: "none" }}>
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

/* ================= TOOL MODAL SHELL ================= */
function ToolModal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 12, background: "#1B2A3Dd9", backdropFilter: "blur(3px)" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: wide ? 920 : 560, borderRadius: 16, background: "white", padding: 22, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px -12px #00000066" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "var(--display)", fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{ fontFamily: "var(--mono)", fontSize: 14, color: "#4B5F6F", background: "none", border: "none", cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ================= PERIODIC TABLE ================= */
function PeriodicTable() {
  const [sel, setSel] = useState(null);
  return (
    <div>
      <div style={{ minHeight: 64, marginBottom: 12, borderRadius: 10, border: "1px solid #1B2A3D14", background: "#F6F8F6", padding: "10px 14px", display: "flex", alignItems: "center", gap: 16 }}>
        {sel ? (
          <>
            <span style={{ fontFamily: "var(--display)", fontSize: 30, color: CAT_INFO[sel.cat][1] }}>{sel.symbol}</span>
            <div>
              <div style={{ fontFamily: "var(--display)", fontSize: 15 }}>{sel.name} <span style={{ color: "#4B5F6F", fontFamily: "var(--mono)", fontSize: 12 }}>· Z = {sel.z}</span></div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#4B5F6F" }}>atomic mass {sel.mass} · {CAT_INFO[sel.cat][0]}</div>
            </div>
          </>
        ) : (
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#4B5F6F" }}>tap any element for details</span>
        )}
      </div>
      <div style={{ overflowX: "auto", paddingBottom: 6 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(18, 44px)", gridAutoRows: "44px", gap: 3, minWidth: 18 * 47 }}>
          {ELEMENTS.map((e, i) => {
            const z = i + 1;
            const [row, col] = elementPos(z);
            const [, color] = CAT_INFO[e[3]];
            const active = sel && sel.z === z;
            return (
              <button
                key={z}
                onClick={() => setSel({ z, symbol: e[0], name: e[1], mass: e[2], cat: e[3] })}
                style={{
                  gridRow: row, gridColumn: col, borderRadius: 5, cursor: "pointer", padding: 0,
                  border: `1px solid ${active ? color : color + "44"}`,
                  background: active ? color : color + "1a",
                  color: active ? "white" : "#1B2A3D",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}
                title={e[1]}
              >
                <span style={{ fontSize: 7.5, lineHeight: 1, opacity: 0.7, fontFamily: "var(--mono)" }}>{z}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.1, fontFamily: "var(--display)" }}>{e[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        {Object.entries(CAT_INFO).map(([k, [label, color]]) => (
          <span key={k} style={{ fontFamily: "var(--mono)", fontSize: 10.5, padding: "3px 9px", borderRadius: 999, background: color + "1a", color: "#1B2A3D", border: `1px solid ${color}44` }}>{label}</span>
        ))}
      </div>
    </div>
  );
}

/* ================= CALCULATOR ================= */
function Calculator() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState(null);

  const press = (v) => { setResult(null); setExpr((e) => e + v); };
  const clear = () => { setExpr(""); setResult(null); };
  const back = () => { setResult(null); setExpr((e) => e.slice(0, -1)); };

  const evaluate = () => {
    try {
      let js = expr
        .replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-")
        .replace(/\^/g, "**")
        .replace(/√\(/g, "Math.sqrt(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/π/g, "(3.141592653589793)");
      // allow only safe characters/tokens
      const stripped = js.replace(/Math\.(sqrt|log10|log)/g, "");
      if (/[^0-9+\-*/().eE\s]/.test(stripped)) throw new Error("bad char");
      const val = Function('"use strict"; return (' + js + ")")();
      if (typeof val !== "number" || !isFinite(val)) throw new Error("bad result");
      const out = Math.abs(val) !== 0 && (Math.abs(val) >= 1e7 || Math.abs(val) < 1e-4) ? val.toExponential(4) : parseFloat(val.toPrecision(8)).toString();
      setResult(out);
    } catch {
      setResult("Error");
    }
  };

  const keys = [
    ["C", clear], ["⌫", back], ["(", () => press("(")], [")", () => press(")")], ["÷", () => press("÷")],
    ["7", () => press("7")], ["8", () => press("8")], ["9", () => press("9")], ["^", () => press("^")], ["×", () => press("×")],
    ["4", () => press("4")], ["5", () => press("5")], ["6", () => press("6")], ["√(", () => press("√(")], ["−", () => press("−")],
    ["1", () => press("1")], ["2", () => press("2")], ["3", () => press("3")], ["log(", () => press("log(")], ["+", () => press("+")],
    ["0", () => press("0")], [".", () => press(".")], ["EE", () => press("e")], ["ln(", () => press("ln(")], ["π", () => press("π")],
  ];

  return (
    <div style={{ maxWidth: 340, margin: "0 auto" }}>
      <div style={{ borderRadius: 10, border: "1px solid #1B2A3D22", background: "#F6F8F6", padding: "14px 16px", marginBottom: 12, textAlign: "right" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 14, minHeight: 20, wordBreak: "break-all", color: "#4B5F6F" }}>{expr || "0"}</div>
        <div style={{ fontFamily: "var(--display)", fontSize: 24, minHeight: 30, color: result === "Error" ? "#E0527A" : "#1B2A3D" }}>{result ?? ""}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
        {keys.map(([label, fn]) => (
          <button key={label} onClick={fn} style={{ padding: "12px 0", borderRadius: 8, border: "1px solid #1B2A3D1c", background: "white", fontFamily: "var(--mono)", fontSize: 14, cursor: "pointer" }}>
            {label}
          </button>
        ))}
        <button onClick={evaluate} style={{ gridColumn: "1 / -1", padding: "13px 0", borderRadius: 8, border: "none", background: "#1B2A3D", color: "#F6F8F6", fontFamily: "var(--display)", fontSize: 15, cursor: "pointer" }}>
          =
        </button>
      </div>
      <p style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "#4B5F6F", marginTop: 10 }}>EE = ×10^ (e.g. 6.022EE23) · ^ = power · √ log ln take parentheses</p>
    </div>
  );
}

/* ================= FORMULA & CONSTANTS SHEETS ================= */
function FormulaSheet() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
      {FORMULAS.map(([section, items]) => (
        <div key={section} style={{ borderRadius: 10, border: "1px solid #1B2A3D14", padding: "12px 14px", background: "#F6F8F6" }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 14, marginBottom: 8, color: "#2A7F7E" }}>{section}</div>
          {items.map((f) => (
            <div key={f} style={{ fontFamily: "var(--mono)", fontSize: 12.5, lineHeight: 1.7, color: "#1B2A3D" }}>{f}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ConstantsSheet() {
  return (
    <div>
      {CONSTANTS.map(([name, value]) => (
        <div key={name} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "9px 4px", borderBottom: "1px solid #1B2A3D0d", flexWrap: "wrap" }}>
          <span style={{ fontSize: 13.5 }}>{name}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "#2A7F7E" }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

/* ================= QUIZ MODAL ================= */
function QuizModal({ topic, difficulty, accent, onClose, onAnswered }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null); setSubmitted(false); setSelectedOption("");
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
    setIsCorrect(correct); setSubmitted(true); onAnswered(topic.id, correct);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#1B2A3Dd9", backdropFilter: "blur(3px)" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 540, borderRadius: 16, background: "white", padding: 26, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 60px -12px #00000066" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
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
                style={{ marginTop: 22, padding: "12px 26px", borderRadius: 8, fontSize: 14, fontFamily: "var(--display)", color: "white", border: "none", cursor: "pointer", background: accent, opacity: !selectedOption ? 0.4 : 1 }}
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

/* ================= PAGE PIECES ================= */
function TitrationHero() {
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, marginBottom: 26, background: "linear-gradient(135deg, #1B2A3D 0%, #24384f 60%, #1B2A3D 100%)" }}>
      <div style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24, padding: "38px 32px" }}>
        <div style={{ flex: 1, minWidth: 250 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, padding: "5px 14px", borderRadius: 999, display: "inline-block", marginBottom: 16, background: "#F6F8F612", color: "#D9A441", letterSpacing: "0.06em" }}>
            ⚗ GUIDED CHEMISTRY PRACTICE
          </span>
          <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(28px, 5vw, 42px)", marginBottom: 12, color: "#F6F8F6", letterSpacing: "-0.015em", lineHeight: 1.08 }}>
            Master chemistry,<br />one reaction at a time.
          </h1>
          <p style={{ fontSize: 15, maxWidth: 440, color: "#9FB2BE", lineHeight: 1.6 }}>
            Unlimited AI-generated practice across three courses — plus a periodic table, calculator, formula sheet, and constants, all in one place.
          </p>
        </div>
        <svg width="110" height="140" viewBox="0 0 120 150" aria-hidden="true" style={{ flexShrink: 0 }}>
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

function SessionBar({ score, answered, streak }) {
  const pct = answered ? Math.round((score / answered) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, borderRadius: 12, background: "#1B2A3D", color: "#F6F8F6", padding: "13px 20px", marginBottom: 26, flexWrap: "wrap" }}>
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

function ElementTile({ topic, accent, stats, onStart }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onStart(topic)}
      style={{
        borderRadius: 14, padding: 20, background: "#ffffffe6", backdropFilter: "blur(4px)", cursor: "pointer", transition: "all 0.2s",
        border: `1px solid ${hover ? accent : "#1B2A3D14"}`,
        boxShadow: hover ? `0 10px 24px -10px ${accent}66` : "0 1px 3px #1B2A3D0a",
        transform: hover ? "translateY(-3px)" : "none",
        display: "flex", flexDirection: "column",
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

/* ================= MAIN PAGE ================= */
const TOOLS = [
  { id: "ptable", icon: "▦", label: "Periodic Table" },
  { id: "calc", icon: "⌨", label: "Calculator" },
  { id: "formulas", icon: "ƒ", label: "Formula Sheet" },
  { id: "constants", icon: "π", label: "Constants" },
];

export default function Home() {
  const [activeCourse, setActiveCourse] = useState("Intro");
  const [difficulty, setDifficulty] = useState("Intro");
  const [openTopic, setOpenTopic] = useState(null);
  const [openTool, setOpenTool] = useState(null);
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

  const accent = COURSE_META[activeCourse].color;

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
        .layout { display: flex; min-height: 100vh; position: relative; z-index: 1; }
        .sidebar { width: 236px; flex-shrink: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; border-right: 1px solid #1B2A3D12; background: #F6F8F6f0; backdrop-filter: blur(8px); padding: 20px 16px; box-sizing: border-box; }
        .mobiletools { display: none; }
        @media (max-width: 900px) {
          .sidebar { display: none; }
          .mobiletools { display: flex; gap: 8; overflow-x: auto; padding: 10px 16px; background: #F6F8F6f0; border-bottom: 1px solid #1B2A3D12; position: sticky; top: 0; z-index: 5; }
        }
        @media (prefers-reduced-motion: reduce) { .drop, .flask-liquid, .bubble { animation: none; } }
      `}</style>

      <HexBackground />

      <div className="layout">
        {/* ---------- SIDEBAR (desktop) ---------- */}
        <aside className="sidebar">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
            <Logo size={30} />
            <div>
              <div style={{ fontFamily: "var(--display)", fontSize: 17, letterSpacing: "-0.01em", color: "#1B2A3D" }}>AceChem</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9.5, color: "#4B5F6F", letterSpacing: "0.05em" }}>CHEMISTRY PRACTICE</div>
            </div>
          </div>

          <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "#4B5F6F", letterSpacing: "0.08em", marginBottom: 8 }}>COURSES</div>
          {Object.keys(COURSES).map((c) => {
            const active = activeCourse === c;
            const col = COURSE_META[c].color;
            return (
              <button
                key={c}
                onClick={() => setActiveCourse(c)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 8, marginBottom: 4, cursor: "pointer",
                  border: "none", background: active ? col + "14" : "transparent",
                  color: active ? "#1B2A3D" : "#4B5F6F", fontFamily: "var(--body)", fontSize: 13.5,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 999, background: col, opacity: active ? 1 : 0.35 }} />
                <span style={{ flex: 1 }}>{c === "Intro" ? "Intro to Chemistry" : c === "Chem1" ? "Chem 1" : "Chem 2"}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "#4B5F6F" }}>{COURSES[c].length}</span>
              </button>
            );
          })}

          <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "#4B5F6F", letterSpacing: "0.08em", margin: "22px 0 8px" }}>TOOLBOX</div>
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setOpenTool(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 8, marginBottom: 4, cursor: "pointer", border: "none", background: "transparent", color: "#4B5F6F", fontFamily: "var(--body)", fontSize: 13.5 }}
            >
              <span style={{ fontFamily: "var(--mono)", width: 18, textAlign: "center", color: "#2A7F7E" }}>{t.icon}</span>
              {t.label}
            </button>
          ))}

          <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid #1B2A3D12", fontFamily: "var(--mono)", fontSize: 10, color: "#4B5F6F", lineHeight: 1.7 }}>
            AI-generated questions.<br />Double-check anything<br />that looks off.
          </div>
        </aside>

        {/* ---------- MAIN ---------- */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* mobile tool bar */}
          <div className="mobiletools">
            <span style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <Logo size={22} />
              <span style={{ fontFamily: "var(--display)", fontSize: 14, color: "#1B2A3D" }}>AceChem</span>
            </span>
            {TOOLS.map((t) => (
              <button key={t.id} onClick={() => setOpenTool(t.id)} style={{ flexShrink: 0, fontFamily: "var(--mono)", fontSize: 11.5, padding: "6px 12px", borderRadius: 999, border: "1px solid #1B2A3D22", background: "white", color: "#1B2A3D", cursor: "pointer" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <main style={{ maxWidth: 900, margin: "0 auto", padding: "26px 20px 60px", color: "#1B2A3D" }}>
            <TitrationHero />
            <SessionBar score={session.score} answered={session.answered} streak={session.streak} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
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
                <h2 style={{ fontFamily: "var(--display)", fontSize: 25, letterSpacing: "-0.01em" }}>{COURSE_META[activeCourse].label}</h2>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.keys(COURSES).map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCourse(c)}
                    style={{
                      padding: "7px 16px", borderRadius: 999, fontSize: 13.5, cursor: "pointer", fontFamily: "var(--display)", transition: "all 0.15s",
                      background: activeCourse === c ? COURSE_META[c].color : "#ffffffb3",
                      color: activeCourse === c ? "white" : "#4B5F6F",
                      border: `1px solid ${activeCourse === c ? COURSE_META[c].color : "#1B2A3D22"}`,
                    }}
                  >
                    {c === "Intro" ? "Intro" : c} <span style={{ opacity: 0.7, fontSize: 11.5 }}>({COURSES[c].length})</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {COURSES[activeCourse].map((t) => (
                <ElementTile key={t.id} topic={t} accent={accent} stats={topicStats[t.id]} onStart={setOpenTopic} />
              ))}
            </div>

            <footer style={{ marginTop: 56, paddingTop: 20, borderTop: "1px solid #1B2A3D12", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Logo size={22} />
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#4B5F6F" }}>
                AceChem · unlimited AI-generated chemistry practice · questions are generated fresh — double-check anything that looks off
              </span>
            </footer>
          </main>
        </div>
      </div>

      {/* ---------- MODALS ---------- */}
      {openTopic && (
        <QuizModal topic={openTopic} difficulty={difficulty} accent={accent} onClose={() => setOpenTopic(null)} onAnswered={handleAnswered} />
      )}
      {openTool === "ptable" && (
        <ToolModal title="Periodic Table of the Elements" onClose={() => setOpenTool(null)} wide>
          <PeriodicTable />
        </ToolModal>
      )}
      {openTool === "calc" && (
        <ToolModal title="Scientific Calculator" onClose={() => setOpenTool(null)}>
          <Calculator />
        </ToolModal>
      )}
      {openTool === "formulas" && (
        <ToolModal title="Formula Sheet" onClose={() => setOpenTool(null)} wide>
          <FormulaSheet />
        </ToolModal>
      )}
      {openTool === "constants" && (
        <ToolModal title="Useful Constants & Conversions" onClose={() => setOpenTool(null)}>
          <ConstantsSheet />
        </ToolModal>
      )}
    </div>
  );
}
