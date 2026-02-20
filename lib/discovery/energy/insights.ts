/**
 * Energy Model Progressive Insights
 * Rules for when to show insights during assessment
 */

import { ProgressiveInsight, AssessmentAnswer } from '@/types/discovery';

export const ENERGY_PROGRESSIVE_INSIGHTS: ProgressiveInsight[] = [
  {
    id: 'energy-hint-1',
    triggerAfterQuestion: 3,
    condition: (answers) => {
      // If user shows clear draining pattern (questions 2, 3, 4)
      const drainingAnswers = answers.filter(a => 
        a.value === 'drained' || 
        a.value === 'exhausting' || 
        a.value === 'drains'
      );
      return drainingAnswers.length >= 2;
    },
    text: "We're noticing something interesting... It looks like certain situations might be draining your energy. Want to keep going to learn more?",
    type: 'hint',
  },
  {
    id: 'energy-pattern-1',
    triggerAfterQuestion: 5,
    condition: (answers) => {
      // If user consistently shows energy drain from task switching or decisions
      const taskSwitchAnswer = answers.find(a => a.questionId === 'energy-3');
      const decisionAnswer = answers.find(a => a.questionId === 'energy-5');
      return (
        (taskSwitchAnswer?.value === 'draining' || taskSwitchAnswer?.value === 'exhausting') &&
        (decisionAnswer?.value === 'drained' || decisionAnswer?.value === 'exhausted')
      );
    },
    text: "Here's something we're seeing: frequent task switching and decision-making seem to really drain your energy. This is common, and there are ways to protect yourself.",
    type: 'pattern',
  },
];
