import { useState, useCallback, useRef } from 'react';
import { questions } from '../data/questions';
import { buildFounderInputs } from '../data/mappers';
import { analyzeStartup } from '../data/api';
import type { Screen, AnalysisResult, ResultTab } from '../data/types';

// ============================================================
// LearnFirst — Wizard State Management
// ============================================================

const loadingStages = [
  'Filtering experiments by your constraints\u2026',
  'Running SAW ranking algorithm\u2026',
  'Scoring branding readiness\u2026',
  'AI agent analyzing recommendations\u2026',
  'Building your execution roadmap\u2026',
  'Generating founder report\u2026',
];

export function useWizard() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [useAI, setUseAI] = useState(true);
  const [loadingStage, setLoadingStage] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>('rankings');
  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToScreen = useCallback((target: Screen) => {
    setScreen(target);
  }, []);

  const startWizard = useCallback(() => {
    setCurrentQuestion(0);
    setAnswers({});
    setError(null);
    setResult(null);
    goToScreen('question');
  }, [goToScreen]);

  const setAnswer = useCallback((key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  const goNext = useCallback(async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // All questions answered — run analysis
      goToScreen('loading');
      setLoadingStage(loadingStages[0]);

      let stageIdx = 0;
      loadingIntervalRef.current = setInterval(() => {
        stageIdx++;
        if (stageIdx < loadingStages.length) {
          setLoadingStage(loadingStages[stageIdx]);
        }
      }, 2200);

      try {
        const founderInputs = buildFounderInputs(answers);
        const analysis = await analyzeStartup(founderInputs, useAI);
        if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
        setResult(analysis);
        setError(null);
        goToScreen('result');
      } catch (err) {
        if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
        setError(err instanceof Error ? err.message : 'Unknown error');
        goToScreen('result');
      }
    }
  }, [currentQuestion, answers, useAI, goToScreen]);

  const goBack = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const restart = useCallback(() => {
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    setCurrentQuestion(0);
    setAnswers({});
    setError(null);
    setResult(null);
    setLoadingStage('');
    setActiveTab('rankings');
    goToScreen('welcome');
  }, [goToScreen]);

  const q = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const canGoNext = q?.type === 'text' ? true : !!answers[q?.key];

  return {
    screen,
    currentQuestion,
    totalQuestions: questions.length,
    q,
    answers,
    useAI,
    setUseAI,
    loadingStage,
    result,
    error,
    activeTab,
    setActiveTab,
    progress,
    canGoNext,
    goToScreen,
    startWizard,
    setAnswer,
    goNext,
    goBack,
    restart,
  };
}
