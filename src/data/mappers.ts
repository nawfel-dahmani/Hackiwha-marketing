import type { FounderInputs } from './types';

// ============================================================
// LearnFirst — Answer Mappers
// Converts user-friendly answers to API-compatible values
// ============================================================

function mapBudget(value: string): number {
  const budgets: Record<string, number> = {
    '<$100': 100,
    '$100–$250': 250,
    '$250–$500': 500,
    '$500–$1000': 1000,
    '>$1000': 5000,
  };
  return budgets[value] || 0;
}

function mapTeamSize(value: string): number {
  const teams: Record<string, number> = {
    '1 person': 1,
    '2 people': 2,
    '3–4 people': 4,
    '5+ people': 5,
  };
  return teams[value] || 1;
}

function mapScaleChoice(value: string | number): number {
  const cleaned = String(value || '1').split(' ')[0].trim();
  return parseInt(cleaned, 10) || 1;
}

function mapBoolean(value: string): number {
  return value === 'Yes, solid kit' || value === 'Some basics' ? 1 : 0;
}

function mapDays(value: string): number {
  return parseInt(String(value || '14').split(' ')[0], 10) || 14;
}

export function buildFounderInputs(answers: Record<string, string>): FounderInputs {
  const startupName = answers.startup_name || '';
  const industry = answers.industry || 'Unknown';
  const targetAudience = answers.target_audience || 'unknown audience';

  return {
    startup_description: startupName
      ? `${startupName} — ${industry} startup for ${targetAudience}`
      : `${industry} startup for ${targetAudience}`,
    industry,
    target_audience: targetAudience,
    goal: (answers.goal || 'validation').toLowerCase(),
    budget: mapBudget(answers.budget),
    team_size: mapTeamSize(answers.team_size),
    max_days: mapDays(answers.max_days),
    audience_clarity: mapScaleChoice(answers.audience_clarity),
    value_prop_clarity: mapScaleChoice(answers.value_prop_clarity),
    has_visual_identity: mapBoolean(answers.has_visual_identity),
    messaging_consistency: mapScaleChoice(answers.messaging_consistency),
    differentiation_known: mapScaleChoice(answers.differentiation_known),
  };
}
