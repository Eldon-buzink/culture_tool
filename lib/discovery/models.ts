/**
 * Model definitions and mappings for Personal Discovery Flow
 * Maps selection options to models and defines model metadata
 */

import { ModelOption, ModelSlug } from '@/types/discovery';

export const MODEL_OPTIONS: ModelOption[] = [
  {
    slug: 'energy',
    curiosity: 'What energizes me?',
    outcome: 'Feel more energized',
    category: 'personal',
    timeEstimate: '~5 min',
    description: 'Discover what boosts your energy and what drains it',
  },
  {
    slug: 'energy',
    curiosity: 'What drains me?',
    outcome: 'Protect your energy',
    category: 'personal',
    timeEstimate: '~5 min',
    description: 'Identify energy drainers and learn how to protect yourself',
  },
  {
    slug: 'attachment',
    curiosity: 'How do I connect with others?',
    outcome: 'Better relationships',
    category: 'relationship',
    timeEstimate: '~8 min',
    description: 'Understand how you form emotional bonds and what you need',
  },
  {
    slug: 'love-languages',
    curiosity: 'How do I love?',
    outcome: 'Express love better',
    category: 'relationship',
    timeEstimate: '~6 min',
    description: 'Discover how you give and receive love',
  },
  {
    slug: 'conflict-style',
    curiosity: 'How do I handle conflict?',
    outcome: 'Resolve disagreements better',
    category: 'relationship',
    timeEstimate: '~7 min',
    description: 'Understand your natural approach to disagreements',
  },
  {
    slug: 'what-moves-you',
    curiosity: 'What truly motivates me?',
    outcome: 'Align with what matters',
    category: 'personal',
    timeEstimate: '~8 min',
    description: 'Discover your deeper motivations and what gives meaning',
  },
  {
    slug: 'decision-compass',
    curiosity: 'How do I make decisions?',
    outcome: 'Decide with confidence',
    category: 'personal',
    timeEstimate: '~7 min',
    description: 'Understand your decision-making style and what influences you',
  },
];

export function getModelOptionsBySlug(slug: ModelSlug): ModelOption[] {
  return MODEL_OPTIONS.filter(option => option.slug === slug);
}

export function getModelOptionByCuriosity(curiosity: string): ModelOption | undefined {
  return MODEL_OPTIONS.find(option => option.curiosity === curiosity);
}

export function getRelatedModels(currentSlug: ModelSlug): ModelOption[] {
  // Return other models in the same category, excluding current
  const currentOption = MODEL_OPTIONS.find(opt => opt.slug === currentSlug);
  if (!currentOption) return [];
  
  return MODEL_OPTIONS.filter(
    option => option.category === currentOption.category && option.slug !== currentSlug
  ).slice(0, 3); // Limit to 3 related options
}
