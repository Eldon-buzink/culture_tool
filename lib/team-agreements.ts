// lib/team-agreements.ts
import { scoreToBand } from "./interpretation";

export type Trait = 'openness'|'conscientiousness'|'extraversion'|'agreeableness'|'neuroticism';
export type Band = 'lower'|'balanced'|'higher';
export type Profile = Record<Trait, number>;

// Median → band
export function teamBand(scores: number[]): Band {
  if (!scores?.length) return 'balanced';
  const s = [...scores].sort((a,b)=>a-b);
  const med = s[Math.floor(s.length/2)];
  return scoreToBand(med);
}

// Safety: short, neutral, non-techy; add emojis for clarity only.
const HARD_CAP = 6; // max agreements shown

// Fallback templates if interpretation.needs is sparse
const FALLBACK: Record<Trait, Record<Band, string[]>> = {
  openness: {
    lower: [
      "🤝 Working agreement • Share the 'why' before any change.",
      "🧭 Team tip • Pilot one small change for two weeks, then review."
    ],
    balanced: [
      "🧭 Team tip • Timebox exploration to 1 hour weekly and share one idea.",
      "🤝 Working agreement • Write a short one-pager before adopting methods."
    ],
    higher: [
      "🤝 Working agreement • Set exit criteria before experiments.",
      "🧭 Team tip • Share one new idea monthly with a concrete next step."
    ]
  },
  conscientiousness: {
    lower: [
      "🤝 Working agreement • Use a simple 'definition of done' checklist.",
      "🧭 Team tip • Spend 10 minutes planning before starting work."
    ],
    balanced: [
      "🧭 Team tip • Run a weekly start/stop/continue review.",
      "🤝 Working agreement • Check capacity before adding new work."
    ],
    higher: [
      "🤝 Working agreement • Timebox polishing to 30 minutes, then ship.",
      "🧭 Team tip • Track improvements for a v2 after release."
    ]
  },
  extraversion: {
    lower: [
      "🤝 Working agreement • Share thoughts in writing before big meetings.",
      "🧭 Team tip • Provide agendas 24 hours before workshops."
    ],
    balanced: [
      "🧭 Team tip • Block 15 minutes debrief after big sessions.",
      "🤝 Working agreement • Rotate facilitation to balance voices."
    ],
    higher: [
      "🤝 Working agreement • Invite two quiet voices before deciding.",
      "🧭 Team tip • Pause, summarize, then ask for objections."
    ]
  },
  agreeableness: {
    lower: [
      "🤝 Working agreement • Pair every challenge with a proposal.",
      "🧭 Team tip • Set shared norms for direct feedback."
    ],
    balanced: [
      "🧭 Team tip • End debates with a short decision log.",
      "🤝 Working agreement • Name a decision owner per topic."
    ],
    higher: [
      "🤝 Working agreement • Use 'disagree & commit' when stuck.",
      "🧭 Team tip • State boundaries before offering help."
    ]
  },
  neuroticism: {
    lower: [
      "🧭 Team tip • Run a monthly pulse on workload stress.",
      "🤝 Working agreement • Ask for early warning signs in standups."
    ],
    balanced: [
      "🧭 Team tip • Add buffer time around deadlines.",
      "🤝 Working agreement • Name one risk and one mitigation per task."
    ],
    higher: [
      "🤝 Working agreement • Limit WIP to two items per person.",
      "🧭 Team tip • Do a 5-minute daily priority reset."
    ]
  }
};

// Optional sanitizer (keeps lines short & neutral)
function sanitize(line: string) {
  let s = line.replace(/\s+/g, ' ').trim();
  if (s.length > 140) s = s.slice(0, 137) + '…';
  return s;
}

export function buildTeamAgreements(team: Profile[]) {
  const traits: Trait[] = ['openness','conscientiousness','extraversion','agreeableness','neuroticism'];
  const items: string[] = [];
  for (const trait of traits) {
    const scores = team.map(p => p?.[trait]).filter(n => typeof n === 'number') as number[];
    if (!scores.length) continue;
    const band = teamBand(scores);
    const suggestions = FALLBACK[trait][band];
    for (const s of suggestions) {
      const clean = sanitize(s);
      if (!items.includes(clean)) items.push(clean);
      if (items.length >= HARD_CAP) return items;
    }
  }
  return items.slice(0, HARD_CAP);
}
