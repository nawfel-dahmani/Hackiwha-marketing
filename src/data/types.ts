// ============================================================
// LearnFirst — Type Definitions
// ============================================================

export type QuestionType = 'choice' | 'scale' | 'text';

export interface ScaleOption {
  value: number;
  emoji: string;
  label: string;
}

export interface Question {
  key: string;
  title: string;
  subtitle: string;
  type: QuestionType;
  options?: string[];
  scaleLabels?: string[];
  scaleEmojis?: string[];
  placeholder?: string;
  hint?: string;
}

export interface FounderInputs {
  startup_description: string;
  industry: string;
  target_audience: string;
  goal: string;
  budget: number;
  team_size: number;
  max_days: number;
  audience_clarity: number;
  value_prop_clarity: number;
  has_visual_identity: number;
  messaging_consistency: number;
  differentiation_known: number;
}

export interface RankedExperiment {
  rank: number;
  score: number;
  experiment: {
    id: string;
    name: string;
    description: string;
    cost: number;
    time_days: number;
    team_size: number;
    type: string;
    why_score: string;
    tags?: string[];
    brand_strategy_tags?: string[];
    brand_clarity_boost?: number;
    required_brand_score?: number;
  };
  normalized_breakdown?: Record<string, number>;
}

export interface AlgorithmOutput {
  mode: 'marketing_ready' | 'branding_first' | 'error';
  brand_score: number;
  threshold: number;
  recommendations?: RankedExperiment[];
  branding_recommendations?: RankedExperiment[];
  marketing_recommendations?: RankedExperiment[];
  projected_score_after_branding?: number;
  rationale?: string;
  message?: string;
}

export interface AIRecommendation {
  id: string;
  name: string;
  score: number;
  reason: string;
}

export interface AIOutput {
  mode: string;
  brand_score: number;
  summary: string;
  top_branding_recommendations: AIRecommendation[];
  top_marketing_recommendations: AIRecommendation[];
  risks: string[];
}

export interface RoadmapPhase {
  phase: string;
  timeframe: string;
  actions: string[];
  success_metrics: string[];
}

export interface RoadmapReport {
  agreement: string[];
  differences: Array<{
    topic: string;
    algorithm_view: string;
    ai_view: string;
    recommended_decision: string;
  }>;
  roadmap: RoadmapPhase[];
  founder_report: string;
}

export interface HFStatus {
  enabled: boolean;
  used_fallback: boolean;
  error: string | null;
}

export interface AnalysisResult {
  founder_inputs: FounderInputs;
  algorithm_output: AlgorithmOutput;
  ai_output: AIOutput;
  roadmap_report: RoadmapReport;
  hf_status: HFStatus;
  report_path?: string;
  pdf_report_path?: string;
}

export type Screen = 'welcome' | 'question' | 'loading' | 'result';

export type ResultTab = 'rankings' | 'ai' | 'roadmap' | 'profile';
