import { z } from "zod";

/* Canonical course/topic map for the content bank.
   Topic ids mirror COURSES in app/page.jsx — keep the two in sync when adding a topic. */
export const COURSE_TOPICS: Record<
  string,
  { id: string; title: string; desc: string; skills: string[] }[]
> = {
  intro: [
    { id: "matter", title: "Matter & Measurement", desc: "States of matter, sig figs, units, density.", skills: ["sig figs", "SI units", "density"] },
    { id: "conversions", title: "Unit Conversions", desc: "Dimensional analysis and metric prefixes.", skills: ["dim. analysis", "prefixes", "conversions"] },
    { id: "atoms", title: "Atoms, Elements & Isotopes", desc: "Subatomic particles, isotopes, average atomic mass.", skills: ["p⁺ n⁰ e⁻", "isotopes", "avg mass"] },
    { id: "ptable", title: "The Periodic Table", desc: "Groups, periods, metals vs nonmetals.", skills: ["groups", "periods", "metal/nonmetal"] },
    { id: "compounds", title: "Ionic & Molecular Compounds", desc: "Formulas, simple naming, ions.", skills: ["formulas", "ions", "naming"] },
    { id: "moleintro", title: "The Mole Concept", desc: "Mole-to-mass conversions and molar mass.", skills: ["molar mass", "mol ↔ g", "counting"] },
  ],
  chem1: [
    { id: "atomic", title: "Atomic Structure & Periodic Trends", desc: "Electron configs, periodic trends, quantum numbers.", skills: ["e⁻ configs", "trends", "quantum #s"] },
    { id: "bonding", title: "Chemical Bonding", desc: "Lewis structures, VSEPR, polarity, hybridization.", skills: ["Lewis", "VSEPR", "polarity"] },
    { id: "nomenclature", title: "Nomenclature", desc: "Naming ionic, covalent, and acid compounds.", skills: ["ionic", "covalent", "acids"] },
    { id: "reactions", title: "Reactions & Equations", desc: "Balancing, reaction types, predicting products.", skills: ["balancing", "types", "products"] },
    { id: "stoich", title: "Stoichiometry", desc: "Mole ratios, limiting reagent, percent yield.", skills: ["moles", "limiting", "% yield"] },
    { id: "gases", title: "Gases", desc: "Ideal gas law, partial pressure, kinetic theory.", skills: ["PV=nRT", "Dalton", "KMT"] },
    { id: "thermochem", title: "Thermochemistry", desc: "Enthalpy, calorimetry, Hess's law.", skills: ["ΔH", "q=mcΔT", "Hess"] },
    { id: "solutions", title: "Solutions & Concentration", desc: "Molarity, dilution, colligative properties.", skills: ["molarity", "dilution", "colligative"] },
  ],
  chem2: [
    { id: "kinetics", title: "Kinetics", desc: "Rate laws, integrated rate laws, activation energy.", skills: ["rate laws", "half-life", "Eₐ"] },
    { id: "equilibrium", title: "Equilibrium", desc: "Kc, Kp, ICE tables, Le Chatelier's principle.", skills: ["Kc / Kp", "ICE", "Le Chatelier"] },
    { id: "acidsbases", title: "Acids & Bases", desc: "pH, pKa, buffers, titration curves.", skills: ["pH", "buffers", "titration"] },
    { id: "thermo", title: "Thermodynamics", desc: "Entropy, Gibbs free energy, spontaneity.", skills: ["ΔS", "ΔG", "spontaneity"] },
    { id: "electrochem", title: "Electrochemistry", desc: "Redox, galvanic cells, the Nernst equation.", skills: ["redox", "E°cell", "Nernst"] },
    { id: "nuclear", title: "Nuclear Chemistry", desc: "Radioactive decay, half-life, nuclear equations.", skills: ["α β γ decay", "half-life", "balancing"] },
  ],
};

export const COURSE_IDS = ["intro", "chem1", "chem2"] as const;
export const DIFFICULTY_LEVELS = ["Intro", "Intermediate", "Advanced"] as const;

export type CourseId = (typeof COURSE_IDS)[number];
export type Difficulty = (typeof DIFFICULTY_LEVELS)[number];

/* Parse the leading numeric value of an answer choice, tolerating unicode
   scientific notation (e.g. "3.2 × 10⁻³ mol"). Returns [value, unitRemainder] or null. */
const SUPERSCRIPTS: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-", "⁺": "+",
};

export function parseChoiceNumber(choice: string): { value: number; unit: string } | null {
  let s = choice.trim().replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, (c) => SUPERSCRIPTS[c]);
  // "3.2 × 10-3" (superscripts already flattened) → "3.2e-3"
  s = s.replace(/(-?\d+(?:\.\d+)?)\s*[×x*]\s*10\s*\^?\s*([+-]?\d+)/, "$1e$2");
  const m = s.match(/^([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*(.*)$/);
  if (!m) return null;
  const value = parseFloat(m[1]);
  if (!isFinite(value)) return null;
  return { value, unit: m[2].trim().toLowerCase() };
}

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

export const ProvenanceSchema = z.object({
  model: z.string().min(1),
  promptVersion: z.string().min(1),
  generatedAt: z.string().min(1),
  reviewedBy: z.string().nullable(),
  reviewedAt: z.string().nullable(),
  editedFromOriginal: z.boolean(),
});

export const QuestionSchema = z
  .object({
    id: z.string().uuid(),
    course: z.enum(COURSE_IDS),
    topic: z.string().min(1),
    difficulty: z.enum(DIFFICULTY_LEVELS),
    status: z.enum(["draft", "approved", "rejected"]),
    stem: z.string().min(10),
    choices: z.array(z.string().min(1)).length(4),
    correctIndex: z.number().int().min(0).max(3),
    solution: z.string().min(80, "solution must be a full worked solution, not a one-liner"),
    distractorRationales: z.array(z.string().min(10)).length(3),
    provenance: ProvenanceSchema,
    rejectionReason: z.string().optional(),
  })
  .superRefine((q, ctx) => {
    const topics = COURSE_TOPICS[q.course] || [];
    if (!topics.some((t) => t.id === q.topic)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["topic"],
        message: `unknown topic "${q.topic}" for course "${q.course}" (valid: ${topics.map((t) => t.id).join(", ")})`,
      });
    }
    const seen = new Map<string, number>();
    q.choices.forEach((c, i) => {
      const key = normalize(c);
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["choices", i],
          message: `duplicate choice: ${JSON.stringify(c)} matches choice ${seen.get(key)! + 1}`,
        });
      } else {
        seen.set(key, i);
      }
    });
    // numerically identical choices with the same unit (e.g. "0.50 g" vs "5.0 × 10⁻¹ g")
    const parsed = q.choices.map(parseChoiceNumber);
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const a = parsed[i];
        const b = parsed[j];
        if (!a || !b || a.unit !== b.unit) continue;
        const scale = Math.max(Math.abs(a.value), Math.abs(b.value), 1e-12);
        if (Math.abs(a.value - b.value) / scale < 1e-6) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["choices", j],
            message: `choices ${i + 1} and ${j + 1} are numerically identical (${q.choices[i]} vs ${q.choices[j]})`,
          });
        }
      }
    }
  });

export type Question = z.infer<typeof QuestionSchema>;

/* Shape for live "extra practice" generation — same student-facing fields as the
   bank, but no id/provenance/rationales. Never written to the content bank. */
export const LiveQuestionSchema = z.object({
  stem: z.string().min(10),
  choices: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  solution: z.string().min(20),
});

export type LiveQuestion = z.infer<typeof LiveQuestionSchema>;

export function validateQuestion(item: unknown):
  | { success: true; data: Question }
  | { success: false; error: string } {
  const result = QuestionSchema.safeParse(item);
  if (result.success) return { success: true, data: result.data };
  const error = result.error.issues
    .map((iss) => `${iss.path.join(".") || "(root)"}: ${iss.message}`)
    .join("; ");
  return { success: false, error };
}
