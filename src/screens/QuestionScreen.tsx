import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import LiquidGlassPanel from '../components/LiquidGlassPanel';
import type { Question } from '../data/types';

// ============================================================
// LearnFirst — Question Screen
// Wizard card with progress bar, options, and navigation
// ============================================================

interface QuestionScreenProps {
  q: Question;
  currentQuestion: number;
  totalQuestions: number;
  answers: Record<string, string>;
  progress: number;
  canGoNext: boolean;
  onAnswer: (key: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function QuestionScreen({
  q,
  currentQuestion,
  totalQuestions,
  answers,
  progress,
  canGoNext,
  onAnswer,
  onNext,
  onBack,
}: QuestionScreenProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const isText = q.type === 'text';
  const isScale = q.type === 'scale';

  // Entrance animation
  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 24, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
      );
    }, cardRef);
    return () => ctx.revert();
  }, [currentQuestion]);

  // Options stagger animation
  useEffect(() => {
    if (!optionsRef.current) return;
    const ctx = gsap.context(() => {
      const opts = optionsRef.current?.querySelectorAll('.option-btn');
      if (opts) {
        gsap.fromTo(
          opts,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: 'power2.out', delay: 0.15 }
        );
      }
    }, optionsRef);
    return () => ctx.revert();
  }, [currentQuestion]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canGoNext) {
        onNext();
        return;
      }
      if (isText) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        const opts = optionsRef.current?.querySelectorAll('.option-btn');
        if (opts && num <= opts.length) {
          (opts[num - 1] as HTMLButtonElement).click();
        }
      }
    },
    [canGoNext, isText, onNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentAnswer = answers[q.key] || '';

  const renderOptions = () => {
    if (isText) {
      return (
        <input
          type="text"
          value={currentAnswer}
          onChange={(e) => onAnswer(q.key, e.target.value)}
          placeholder={q.placeholder || ''}
          autoFocus
          style={{
            width: '100%',
            padding: '16px 20px',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.03)',
            color: '#ffffff',
            fontFamily: "'Inter', sans-serif",
            fontSize: 15,
            fontWeight: 200,
            outline: 'none',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(200, 170, 130, 0.4)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200, 170, 130, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      );
    }

    if (isScale && q.scaleLabels && q.scaleEmojis) {
      return (
        <div
          ref={optionsRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 10,
          }}
        >
          {q.scaleLabels.map((label, i) => {
            const value = String(i + 1);
            const selected = currentAnswer === value;
            return (
              <button
                key={i}
                className="option-btn"
                onClick={() => onAnswer(q.key, value)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '14px 8px',
                  borderRadius: 14,
                  border: `1px solid ${selected ? 'rgba(200, 170, 130, 0.5)' : 'rgba(255,255,255,0.08)'}`,
                  background: selected
                    ? 'rgba(200, 170, 130, 0.1)'
                    : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  if (!selected) {
                    e.currentTarget.style.borderColor = 'rgba(200, 170, 130, 0.25)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selected) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{q.scaleEmojis?.[i] ?? ''}</span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: 300,
                    color: selected ? 'rgba(200, 170, 130, 0.8)' : 'rgba(255,255,255,0.35)',
                    lineHeight: 1.2,
                    textAlign: 'center',
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    // Choice options
    return (
      <div
        ref={optionsRef}
        style={{
          display: 'grid',
          gridTemplateColumns: q.options && q.options.length <= 4 ? '1fr' : 'repeat(2, 1fr)',
          gap: 10,
        }}
      >
        {q.options?.map((opt, i) => {
          const selected = currentAnswer === opt;
          return (
            <button
              key={i}
              className="option-btn"
              onClick={() => onAnswer(q.key, opt)}
              style={{
                padding: '14px 18px',
                borderRadius: 14,
                border: `1px solid ${selected ? 'rgba(200, 170, 130, 0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: selected
                  ? 'rgba(200, 170, 130, 0.08)'
                  : 'rgba(255,255,255,0.02)',
                color: selected ? 'rgba(200, 170, 130, 0.9)' : 'rgba(255,255,255,0.7)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                fontWeight: 300,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                opacity: 0,
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  e.currentTarget.style.borderColor = 'rgba(200, 170, 130, 0.25)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {opt}
              {selected && (
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 12,
                    fontSize: 12,
                    color: 'rgba(200, 170, 130, 0.8)',
                  }}
                >
                  &#10003;
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <section
      style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div ref={cardRef} style={{ width: '100%', maxWidth: 720, opacity: 0 }}>
        <LiquidGlassPanel style={{ padding: '36px 36px 32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 8 }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 12px',
                  borderRadius: 999,
                  background: 'rgba(200, 170, 130, 0.06)',
                  border: '1px solid rgba(200, 170, 130, 0.12)',
                  fontFamily: "'GeistMono', monospace",
                  fontSize: 10,
                  fontWeight: 300,
                  color: 'rgba(200, 170, 130, 0.7)',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                Startup profile
              </div>
              <h2
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontSize: 'clamp(1.3rem, 2.5vw, 1.7rem)',
                  fontWeight: 400,
                  color: '#ffffff',
                  margin: 0,
                  lineHeight: 1.25,
                }}
              >
                {q.title}
              </h2>
              {q.subtitle && (
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    fontWeight: 200,
                    color: 'rgba(255,255,255,0.35)',
                    marginTop: 6,
                    lineHeight: 1.5,
                  }}
                >
                  {q.subtitle}
                </p>
              )}
            </div>
            <div
              style={{
                padding: '7px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: "'GeistMono', monospace",
                fontSize: 11,
                fontWeight: 300,
                color: 'rgba(255,255,255,0.35)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {currentQuestion + 1} / {totalQuestions}
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: 4,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 999,
              margin: '20px 0 28px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, rgba(200,170,130,0.8), rgba(138,154,138,0.6))',
                borderRadius: 'inherit',
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: -4,
                  top: -3,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'rgba(200, 170, 130, 0.6)',
                  boxShadow: '0 0 8px rgba(200, 170, 130, 0.3)',
                }}
              />
            </div>
          </div>

          {/* Options */}
          <div style={{ marginBottom: 24 }}>
            {renderOptions()}
          </div>

          {/* Hint for text */}
          {isText && q.hint && (
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 200,
                color: 'rgba(255,255,255,0.25)',
                marginTop: 8,
                marginBottom: 16,
              }}
            >
              {q.hint}
            </p>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {currentQuestion > 0 && (
              <button
                onClick={onBack}
                style={{
                  padding: '10px 20px',
                  borderRadius: 12,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 300,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(200, 170, 130, 0.3)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                &larr; Back
              </button>
            )}
            <button
              onClick={onNext}
              disabled={!canGoNext}
              style={{
                padding: '12px 28px',
                borderRadius: 14,
                background: canGoNext
                  ? 'linear-gradient(135deg, rgba(200,170,130,0.25), rgba(138,154,138,0.15))'
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${canGoNext ? 'rgba(200, 170, 130, 0.35)' : 'rgba(255,255,255,0.08)'}`,
                color: canGoNext ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                fontFamily: "'GeistMono', monospace",
                fontSize: 13,
                fontWeight: 300,
                cursor: canGoNext ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
                opacity: canGoNext ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                if (canGoNext) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(200, 170, 130, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {currentQuestion < totalQuestions - 1 ? 'Next \u2192' : 'Analyze \u2192'}
            </button>
          </div>
        </LiquidGlassPanel>
      </div>
    </section>
  );
}
