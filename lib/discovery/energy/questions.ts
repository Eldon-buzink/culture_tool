/**
 * Energy Model Questions
 * Based on MODEL_CONTENT_ENERGY_ATTACHMENT.md
 */

import { Question } from '@/types/discovery';

export const ENERGY_QUESTIONS: Question[] = [
  {
    id: 'energy-1',
    text: 'When you wake up, how do you typically feel?',
    order: 1,
    options: [
      { id: 'e1-a', text: 'Energized and ready to go', value: 'energized' },
      { id: 'e1-b', text: 'Slow to start, but I get going', value: 'slow-start' },
      { id: 'e1-c', text: "It takes me a while to feel fully awake", value: 'slow-wake' },
      { id: 'e1-d', text: "I'm usually tired regardless of sleep", value: 'tired' },
    ],
  },
  {
    id: 'energy-2',
    text: 'After spending time with a group of people, how do you usually feel?',
    order: 2,
    options: [
      { id: 'e2-a', text: 'Energized and inspired', value: 'energized' },
      { id: 'e2-b', text: 'Pretty good, maybe a bit tired', value: 'good-tired' },
      { id: 'e2-c', text: 'Drained and need alone time', value: 'drained' },
      { id: 'e2-d', text: "It depends on the people", value: 'depends' },
    ],
  },
  {
    id: 'energy-3',
    text: 'How do you feel when you have to switch between different types of tasks frequently?',
    order: 3,
    options: [
      { id: 'e3-a', text: "It energizes me—I like variety", value: 'energizes' },
      { id: 'e3-b', text: "It's fine, doesn't really affect me", value: 'neutral' },
      { id: 'e3-c', text: "It's draining—I prefer to focus on one thing", value: 'draining' },
      { id: 'e3-d', text: 'It completely exhausts me', value: 'exhausting' },
    ],
  },
  {
    id: 'energy-4',
    text: 'After a period of being alone, how do you typically feel?',
    order: 4,
    options: [
      { id: 'e4-a', text: 'Refreshed and recharged', value: 'refreshed' },
      { id: 'e4-b', text: 'Ready to connect with others', value: 'ready-connect' },
      { id: 'e4-c', text: 'Still prefer to be alone', value: 'prefer-alone' },
      { id: 'e4-d', text: "It depends on what I was doing", value: 'depends' },
    ],
  },
  {
    id: 'energy-5',
    text: 'How do you feel after making several important decisions in a short time?',
    order: 5,
    options: [
      { id: 'e5-a', text: "Fine—decisions don't drain me", value: 'fine' },
      { id: 'e5-b', text: 'A bit tired, but manageable', value: 'tired-manageable' },
      { id: 'e5-c', text: "Pretty drained—I need a break", value: 'drained' },
      { id: 'e5-d', text: 'Completely exhausted', value: 'exhausted' },
    ],
  },
  {
    id: 'energy-6',
    text: "When you're doing creative or innovative work, how does it affect your energy?",
    order: 6,
    options: [
      { id: 'e6-a', text: "It gives me energy—I feel alive", value: 'gives-energy' },
      { id: 'e6-b', text: "It's neutral—doesn't affect my energy much", value: 'neutral' },
      { id: 'e6-c', text: "It drains me—I prefer more structured work", value: 'drains' },
      { id: 'e6-d', text: "It depends on the type of creativity", value: 'depends' },
    ],
  },
  {
    id: 'energy-7',
    text: 'How do you feel about having a predictable routine vs. trying new things?',
    order: 7,
    options: [
      { id: 'e7-a', text: "I need routine—it gives me energy", value: 'routine-energy' },
      { id: 'e7-b', text: 'I like a mix of both', value: 'mix' },
      { id: 'e7-c', text: "I need novelty—routine drains me", value: 'novelty-needed' },
      { id: 'e7-d', text: "Routine feels safe but boring", value: 'routine-boring' },
    ],
  },
  {
    id: 'energy-8',
    text: 'By the end of a typical day, how do you usually feel?',
    order: 8,
    options: [
      { id: 'e8-a', text: 'Still have energy left', value: 'energy-left' },
      { id: 'e8-b', text: 'Pretty tired but okay', value: 'tired-ok' },
      { id: 'e8-c', text: 'Completely drained', value: 'drained' },
      { id: 'e8-d', text: "It varies a lot day to day", value: 'varies' },
    ],
  },
];
