import { useEffect, useState } from 'react';
import DigitalRainBackground from './components/DigitalRainBackground';
import WelcomeScreen from './screens/WelcomeScreen';
import QuestionScreen from './screens/QuestionScreen';
import LoadingScreen from './screens/LoadingScreen';
import ResultScreen from './screens/ResultScreen';
import { useWizard } from './hooks/useWizard';

// ============================================================
// LearnFirst — Main App
// 4-screen wizard with cinematic digital rain background
// ============================================================

export default function App() {
  const wizard = useWizard();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay to allow fonts to load before showing
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          {'LEARNFIRST'.split('').map((char, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                color: '#ffffff',
                fontFamily: "'GeistMono', monospace",
                fontWeight: 300,
                fontSize: 18,
                letterSpacing: 8,
                filter: 'blur(0px)',
                animation: `blur-text 1.5s infinite linear alternate`,
                animationDelay: `${i * 0.15}s`,
              }}
            >
              {char}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#0a0a0a',
        overflow: 'hidden',
      }}
    >
      {/* Ambient digital rain background */}
      <DigitalRainBackground opacity={0.4} />

      {/* Screen Router */}
      {wizard.screen === 'welcome' && (
        <WelcomeScreen
          useAI={wizard.useAI}
          setUseAI={wizard.setUseAI}
          onStart={wizard.startWizard}
        />
      )}

      {wizard.screen === 'question' && wizard.q && (
        <QuestionScreen
          q={wizard.q}
          currentQuestion={wizard.currentQuestion}
          totalQuestions={wizard.totalQuestions}
          answers={wizard.answers}
          progress={wizard.progress}
          canGoNext={wizard.canGoNext}
          onAnswer={wizard.setAnswer}
          onNext={wizard.goNext}
          onBack={wizard.goBack}
        />
      )}

      {wizard.screen === 'loading' && (
        <LoadingScreen stage={wizard.loadingStage} />
      )}

      {wizard.screen === 'result' && (
        <ResultScreen
          result={wizard.result}
          error={wizard.error}
          activeTab={wizard.activeTab}
          onTabChange={wizard.setActiveTab}
          onRestart={wizard.restart}
        />
      )}
    </div>
  );
}
