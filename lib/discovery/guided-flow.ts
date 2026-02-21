/**
 * Hybrid conversational flow: Q1 → Q2 → model
 * Routes users based on "What's on your mind?" and follow-up questions
 */

import { ModelSlug } from '@/types/discovery';

// Question 1: Broad "What's on your mind?"
export type Q1OptionId =
  | 'drained'
  | 'relationships'
  | 'work-career'
  | 'personal-growth'
  | 'curious';

export interface Q1Option {
  id: Q1OptionId;
  label: string;
  sublabel?: string;
}

export const Q1_OPTIONS: Q1Option[] = [
  { id: 'drained', label: 'Feeling drained or low energy', sublabel: "I want to understand what's costing me energy" },
  { id: 'relationships', label: 'Relationship challenges', sublabel: 'With partners, family, or friends' },
  { id: 'work-career', label: 'Work or career questions', sublabel: 'Motivation, decisions, or fit' },
  { id: 'personal-growth', label: 'Personal growth / self-discovery', sublabel: "I want to understand myself better" },
  { id: 'curious', label: 'Just curious', sublabel: "I'd like to explore" },
];

// Question 2: Contextual follow-up (only when needed)
export interface Q2Option {
  id: string;
  label: string;
  modelSlug: ModelSlug;
}

export type Q2Config = Record<Q1OptionId, { question: string; options: Q2Option[] }>;

export const Q2_CONFIG: Q2Config = {
  drained: {
    question: 'What seems to drain you most?',
    options: [
      { id: 'tasks', label: 'Tasks, work, or switching between things', modelSlug: 'energy' },
      { id: 'people', label: 'People or social situations', modelSlug: 'energy' },
      { id: 'decisions', label: 'Making decisions or uncertainty', modelSlug: 'energy' },
      { id: 'not-sure', label: "I'm not sure yet", modelSlug: 'energy' },
    ],
  },
  relationships: {
    question: 'What kind of relationship challenge?',
    options: [
      { id: 'love-connection', label: 'Feeling loved or expressing love', modelSlug: 'love-languages' },
      { id: 'conflict', label: 'Arguments or conflict', modelSlug: 'conflict-style' },
      { id: 'connection-bonds', label: 'Connection, trust, or getting close', modelSlug: 'attachment' },
      { id: 'not-sure', label: "I'm not sure yet", modelSlug: 'attachment' },
    ],
  },
  'work-career': {
    question: 'What feels most relevant right now?',
    options: [
      { id: 'motivation', label: "What motivates me or gives meaning", modelSlug: 'what-moves-you' },
      { id: 'decisions', label: 'Making decisions with confidence', modelSlug: 'decision-compass' },
      { id: 'energy-work', label: 'Energy and how I work best', modelSlug: 'energy' },
      { id: 'not-sure', label: "I'm not sure yet", modelSlug: 'what-moves-you' },
    ],
  },
  'personal-growth': {
    question: 'Where would you like to start?',
    options: [
      { id: 'energy', label: 'Understanding my energy', modelSlug: 'energy' },
      { id: 'motivation', label: 'What truly moves me', modelSlug: 'what-moves-you' },
      { id: 'decisions', label: 'How I make decisions', modelSlug: 'decision-compass' },
      { id: 'relationships', label: 'How I connect with others', modelSlug: 'attachment' },
    ],
  },
  curious: {
    question: "What sounds interesting?",
    options: [
      { id: 'energy', label: 'What energizes or drains me', modelSlug: 'energy' },
      { id: 'love', label: 'How I give and receive love', modelSlug: 'love-languages' },
      { id: 'motivation', label: 'What motivates me', modelSlug: 'what-moves-you' },
      { id: 'decisions', label: 'How I make decisions', modelSlug: 'decision-compass' },
    ],
  },
};

/**
 * Get Q2 for a given Q1 answer. Returns null if we can route directly without Q2.
 */
export function getQ2ForQ1(q1Id: Q1OptionId): { question: string; options: Q2Option[] } | null {
  return Q2_CONFIG[q1Id] ?? null;
}

/**
 * Resolve model from Q1 + Q2 (or Q1 only if no Q2).
 */
export function getModelFromFlow(q1Id: Q1OptionId, q2OptionId?: string): ModelSlug {
  const q2 = Q2_CONFIG[q1Id];
  if (!q2) return 'energy'; // fallback
  if (q2OptionId) {
    const option = q2.options.find(o => o.id === q2OptionId);
    return option?.modelSlug ?? q2.options[0].modelSlug;
  }
  return q2.options[0].modelSlug;
}
