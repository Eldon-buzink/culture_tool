/**
 * Energy Model Calculator
 * Processes answers and generates results
 */

import { AssessmentAnswer, EnergyResults } from '@/types/discovery';
import { ENERGY_QUESTIONS } from './questions';

export function calculateEnergyResults(answers: AssessmentAnswer[]): EnergyResults {
  // Analyze answers to determine energy patterns
  const boosters = {
    activities: [] as string[],
    contexts: [] as string[],
    people: [] as string[],
    pace: '',
  };
  
  const drainers = {
    activities: [] as string[],
    contexts: [] as string[],
    people: [] as string[],
    pace: '',
  };
  
  const patterns: {
    timeOfDay?: string;
    socialVsSolo?: string;
    taskType?: string;
  } = {};

  // Question 1: Morning energy
  const morningAnswer = answers.find(a => a.questionId === 'energy-1');
  if (morningAnswer?.value === 'energized') {
    patterns.timeOfDay = 'morning';
  } else if (morningAnswer?.value === 'tired') {
    patterns.timeOfDay = 'evening';
  }

  // Question 2: Social energy
  const socialAnswer = answers.find(a => a.questionId === 'energy-2');
  if (socialAnswer?.value === 'energized') {
    boosters.contexts.push('social interactions');
    boosters.people.push('groups');
  } else if (socialAnswer?.value === 'drained') {
    drainers.contexts.push('large groups');
    patterns.socialVsSolo = 'solo';
  }

  // Question 3: Task switching
  const taskSwitchAnswer = answers.find(a => a.questionId === 'energy-3');
  if (taskSwitchAnswer?.value === 'energizes') {
    boosters.activities.push('variety and task switching');
    boosters.pace = 'varied';
  } else if (taskSwitchAnswer?.value === 'draining' || taskSwitchAnswer?.value === 'exhausting') {
    drainers.activities.push('frequent task switching');
    drainers.pace = 'constant switching';
    patterns.taskType = 'focused';
  }

  // Question 4: Alone time
  const aloneAnswer = answers.find(a => a.questionId === 'energy-4');
  if (aloneAnswer?.value === 'refreshed') {
    boosters.contexts.push('alone time');
    if (!patterns.socialVsSolo) patterns.socialVsSolo = 'solo';
  }

  // Question 5: Decision-making
  const decisionAnswer = answers.find(a => a.questionId === 'energy-5');
  if (decisionAnswer?.value === 'drained' || decisionAnswer?.value === 'exhausted') {
    drainers.activities.push('making multiple decisions');
  }

  // Question 6: Creative work
  const creativeAnswer = answers.find(a => a.questionId === 'energy-6');
  if (creativeAnswer?.value === 'gives-energy') {
    boosters.activities.push('creative and innovative work');
  } else if (creativeAnswer?.value === 'drains') {
    drainers.activities.push('unstructured creative work');
  }

  // Question 7: Routine vs novelty
  const routineAnswer = answers.find(a => a.questionId === 'energy-7');
  if (routineAnswer?.value === 'routine-energy') {
    boosters.contexts.push('predictable routine');
  } else if (routineAnswer?.value === 'novelty-needed') {
    drainers.contexts.push('too much routine');
    boosters.contexts.push('novelty and new experiences');
  }

  // Question 8: End of day
  const endDayAnswer = answers.find(a => a.questionId === 'energy-8');
  if (endDayAnswer?.value === 'energy-left') {
    patterns.timeOfDay = 'evening';
  } else if (endDayAnswer?.value === 'drained') {
    // Already captured in patterns
  }

  // Generate insights based on patterns
  const insights = generateInsights(boosters, drainers, patterns);

  return {
    boosters,
    drainers,
    patterns,
    insights,
  };
}

function generateInsights(
  boosters: EnergyResults['boosters'],
  drainers: EnergyResults['drainers'],
  patterns: EnergyResults['patterns']
): EnergyResults['insights'] {
  // Determine primary booster
  const primaryBooster = boosters.activities[0] || boosters.contexts[0] || 'activities that energize you';
  
  // Determine primary drainer
  const primaryDrainer = drainers.activities[0] || drainers.contexts[0] || 'certain activities';

  // Generate headline
  let headline = '';
  if (primaryDrainer && drainers.activities.length > 0) {
    headline = `You protect your energy when you have clear boundaries around ${primaryDrainer}.`;
  } else if (primaryBooster && boosters.activities.length > 0) {
    headline = `You feel most energized when ${primaryBooster}.`;
  } else {
    headline = 'Your energy flows best when you balance different activities and contexts.';
  }

  // Generate "noticed" insights
  const noticed: string[] = [];
  
  if (boosters.activities.length > 0) {
    noticed.push(`You feel most alive when ${boosters.activities[0]}. This isn't just preference—it's how you recharge.`);
  }
  
  if (drainers.activities.length > 0) {
    noticed.push(`We noticed that ${drainers.activities[0]} consistently drains your energy. This is something to be aware of.`);
  }
  
  if (patterns.timeOfDay) {
    noticed.push(`Your energy seems to follow a pattern: you're most energized during ${patterns.timeOfDay === 'morning' ? 'morning' : 'evening'} hours. Understanding this can help you plan your days better.`);
  }

  // Generate "meaning" insights
  const meaning: string[] = [];
  
  if (drainers.activities.length > 0) {
    meaning.push(`At work, you might want to batch similar tasks together and avoid frequent switching to protect your energy.`);
  }
  
  if (boosters.contexts.length > 0) {
    meaning.push(`In your personal life, prioritizing ${boosters.contexts[0]} can help you feel more energized overall.`);
  }

  // Generate action
  let action = '';
  if (drainers.activities.length > 0) {
    action = `This week, try blocking out 30 minutes after ${drainers.activities[0]} to recharge. For example: take a short walk, do some deep breathing, or just sit quietly for a few minutes.`;
  } else if (boosters.activities.length > 0) {
    action = `This week, try scheduling your ${boosters.activities[0]} during times when your energy is typically lower, and notice how it affects you.`;
  } else {
    action = `This week, try noticing when you feel most energized and when you feel drained. Keep a simple log and see what patterns emerge.`;
  }

  return {
    headline,
    noticed: noticed.length > 0 ? noticed : ['Your energy patterns are unique to you.'],
    meaning: meaning.length > 0 ? meaning : ['Understanding your energy can help you structure your days better.'],
    action,
  };
}
