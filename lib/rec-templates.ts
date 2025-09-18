// lib/rec-templates.ts
export const recTemplates = {
  openness: {
    lower: [
      "Ask for a brief 'why' before any change.",
      "Pilot one small change for two weeks, then review.",
    ],
    balanced: [
      "Timebox exploration to 1 hour weekly; share one idea.",
      "Write a one-pager before adopting new methods.",
    ],
    higher: [
      "Set exit criteria before starting an experiment.",
      "Share one new idea monthly with a concrete next step.",
    ],
  },
  conscientiousness: {
    lower: [
      "Adopt a simple 'definition of done' checklist.",
      "Spend 10 minutes planning before starting work.",
    ],
    balanced: [
      "Run a weekly start/stop/continue review.",
      "Check capacity before taking on new tasks.",
    ],
    higher: [
      "Timebox polishing to 30 minutes, then ship.",
      "Track improvements for v2 after release.",
    ],
  },
  extraversion: {
    lower: [
      "Post thoughts in writing before meetings.",
      "Ask for an agenda 24 hours before workshops.",
    ],
    balanced: [
      "Block 15 minutes debrief after big meetings.",
      "Rotate facilitation to balance voices.",
    ],
    higher: [
      "Invite two quieter voices before deciding.",
      "Pause, summarize, then ask for objections.",
    ],
  },
  agreeableness: {
    lower: [
      "Pair every challenge with a proposal.",
      "Agree norms for direct feedback.",
    ],
    balanced: [
      "End debates with a decision log.",
      "Name a decision owner per topic.",
    ],
    higher: [
      "Use 'disagree + commit' for stuck topics.",
      "State boundaries before offering help.",
    ],
  },
  neuroticism: {
    lower: [
      "Run a monthly pulse on workload stress.",
      "Ask a teammate for early warning signs.",
    ],
    balanced: [
      "Add buffer time around deadlines.",
      "Name one risk and one mitigation.",
    ],
    higher: [
      "Limit WIP to two items.",
      "Do a 5-minute daily priority reset.",
    ],
  },
} as const;
