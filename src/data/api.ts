import type { AnalysisResult, FounderInputs } from './types';

// ============================================================
// LearnFirst — API Client
// ============================================================

const API_BASE = '/api';

export async function analyzeStartup(
  founderInputs: FounderInputs,
  useHuggingFace: boolean = true,
  threshold: number = 60,
): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      founder_inputs: founderInputs,
      threshold,
      use_hugging_face: useHuggingFace,
      save_report: true,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return data as AnalysisResult;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}
