import type { Question } from './types';

// ============================================================
// LearnFirst — 13-Question Wizard
// ============================================================

export const questions: Question[] = [
  {
    key: 'startup_name',
    title: "What's your startup called?",
    subtitle: 'Give us a name and a short description so the report feels personal.',
    type: 'text',
    placeholder: 'e.g. LearnFirst — a marketing experiment ranker',
    hint: 'Optional: add a dash and a one-liner about what you do.',
  },
  {
    key: 'industry',
    title: 'What market are you building for?',
    subtitle: 'This determines which experiments are most relevant to your space.',
    type: 'choice',
    options: ['B2B SaaS', 'Consumer App', 'Marketplace', 'Education', 'Healthcare', 'E-commerce', 'Fintech', 'AI / ML', 'Food & Beverage', 'Media & Entertainment'],
  },
  {
    key: 'target_audience',
    title: 'Who is the first audience you want to validate?',
    subtitle: "Pick the group you'd test with this week — not your total addressable market.",
    type: 'choice',
    options: ['Small Businesses', 'Startups', 'Consumers', 'Enterprise Teams', 'Developers', 'Students', 'Nonprofits', 'Creators'],
  },
  {
    key: 'stage',
    title: 'How far along is the product right now?',
    subtitle: 'This affects which experiments make sense given your current maturity.',
    type: 'choice',
    options: ['Idea only', 'Prototype', 'MVP', 'Launched'],
  },
  {
    key: 'goal',
    title: "What's the one thing you need this experiment to prove?",
    subtitle: 'Focus on the single biggest unknown — what would change your next decision?',
    type: 'choice',
    options: ['Validate demand', 'Prove messaging', 'Confirm audience', 'Generate leads', 'Drive sales', 'Build awareness'],
  },
  {
    key: 'budget',
    title: 'How much can you spend on the first test?',
    subtitle: 'Be realistic — the engine filters out experiments you can\u2019t afford.',
    type: 'choice',
    options: ['<$100', '$100–$250', '$250–$500', '$500–$1000', '>$1000'],
  },
  {
    key: 'max_days',
    title: 'How quickly do you need a signal?',
    subtitle: 'Faster timelines mean fewer experiment options, but sharper focus.',
    type: 'choice',
    options: ['7 days', '14 days', '30 days', '60 days'],
  },
  {
    key: 'team_size',
    title: 'How many people can actively execute this test?',
    subtitle: 'Count only people who can dedicate real hours this week.',
    type: 'choice',
    options: ['1 person', '2 people', '3–4 people', '5+ people'],
  },
  {
    key: 'audience_clarity',
    title: 'How clear is your target audience today?',
    subtitle: 'Do you know exactly who you\u2019re building for, or is it still fuzzy?',
    type: 'scale',
    scaleLabels: ['Undefined', 'Vague', 'Partial', 'Mostly clear', 'Crystal clear'],
    scaleEmojis: ['😶', '🤔', '🙂', '😊', '🎯'],
  },
  {
    key: 'value_prop_clarity',
    title: 'How clear is your value proposition?',
    subtitle: 'Can you explain what you do and why it matters in one sentence?',
    type: 'scale',
    scaleLabels: ['Unclear', 'Rough idea', 'Getting there', 'Clear', 'Razor sharp'],
    scaleEmojis: ['😶', '🤔', '🙂', '😊', '💎'],
  },
  {
    key: 'has_visual_identity',
    title: 'Do you already have brand assets ready to use?',
    subtitle: 'Logo, color palette, basic visual style — anything beyond a plain doc.',
    type: 'choice',
    options: ['No, nothing yet', 'Some basics', 'Yes, solid kit'],
  },
  {
    key: 'messaging_consistency',
    title: 'How consistent is your messaging across channels?',
    subtitle: 'Does your landing page, social bio, and pitch deck tell the same story?',
    type: 'scale',
    scaleLabels: ['Inconsistent', 'Mixed', 'Okay', 'Aligned', 'Unified'],
    scaleEmojis: ['🔀', '😐', '🙂', '✅', '🔗'],
  },
  {
    key: 'differentiation_known',
    title: 'How clearly can you explain what makes you different?',
    subtitle: "If a customer asked 'why not the competitor?', would you have a sharp answer?",
    type: 'scale',
    scaleLabels: ['No clue', 'Some idea', 'Decent', 'Strong', 'Obvious'],
    scaleEmojis: ['❓', '🤔', '🙂', '💪', '⭐'],
  },
];
