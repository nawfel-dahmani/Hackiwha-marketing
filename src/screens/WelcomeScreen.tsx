import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import LiquidGlassPanel from '../components/LiquidGlassPanel';
import LiquidGlassButton from '../components/LiquidGlassButton';

// ============================================================
// LearnFirst — Welcome Screen
// Cinematic hero with feature cards and start CTA
// ============================================================

interface WelcomeScreenProps {
  useAI: boolean;
  setUseAI: (v: boolean) => void;
  onStart: () => void;
}

export default function WelcomeScreen({ useAI, setUseAI, onStart }: WelcomeScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(eyebrowRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.2)
        .fromTo(titleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, 0.4)
        .fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.6)
        .fromTo(pillsRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7 }, 0.8)
        .fromTo(actionsRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7 }, 1.0)
        .fromTo(toggleRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, 1.2);

      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.feature-card');
        tl.fromTo(cards, { opacity: 0, y: 30, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12 }, 0.7);
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
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
      <div style={{ maxWidth: 1100, width: '100%' }}>
        {/* Main hero content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 56, alignItems: 'center' }}>
          {/* Left: copy */}
          <div>
            {/* Eyebrow */}
            <div
              ref={eyebrowRef}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 999,
                background: 'rgba(200, 170, 130, 0.08)',
                border: '1px solid rgba(200, 170, 130, 0.15)',
                fontFamily: "'GeistMono', monospace",
                fontSize: 11,
                fontWeight: 300,
                color: 'rgba(200, 170, 130, 0.8)',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginBottom: 20,
                opacity: 0,
              }}
            >
              <span style={{ fontSize: 10 }}>&#9670;</span>
              Built for startup validation
            </div>

            {/* Title */}
            <h1
              ref={titleRef}
              style={{
                fontFamily: "'GeistMono', monospace",
                fontWeight: 400,
                fontSize: 'clamp(48px, 6vw, 96px)',
                lineHeight: 1.05,
                letterSpacing: '-2px',
                color: '#ffffff',
                margin: 0,
                opacity: 0,
              }}
            >
              LearnFirst
            </h1>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 200,
                fontSize: 16,
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.55)',
                maxWidth: 480,
                marginTop: 20,
                marginBottom: 0,
                opacity: 0,
              }}
            >
              A judge-ready decision system that ranks marketing experiments first, then uses AI to explain the strategy in plain founder language.
            </p>

            {/* Pills */}
            <div
              ref={pillsRef}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                marginTop: 28,
                marginBottom: 36,
                opacity: 0,
              }}
            >
              {['Deterministic ranking', 'Explainable AI review', 'Execution roadmap'].map((text) => (
                <span
                  key={text}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontFamily: "'GeistMono', monospace",
                    fontSize: 12,
                    fontWeight: 300,
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.3px',
                    transition: 'border-color 0.3s ease, color 0.3s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(200, 170, 130, 0.3)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                  }}
                >
                  {text}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div
              ref={actionsRef}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                flexWrap: 'wrap',
                opacity: 0,
              }}
            >
              <LiquidGlassButton onClick={onStart}>
                Start Demo &rarr;
              </LiquidGlassButton>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 200,
                  color: 'rgba(255,255,255,0.3)',
                }}
              >
                13 quick questions &middot; 2 min &middot; personalized report
              </span>
            </div>

            {/* AI Toggle */}
            <div
              ref={toggleRef}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginTop: 24,
                opacity: 0,
              }}
            >
              <button
                onClick={() => setUseAI(!useAI)}
                style={{
                  position: 'relative',
                  width: 40,
                  height: 22,
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: useAI ? 'rgba(200, 170, 130, 0.2)' : 'rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: useAI ? 18 : 2,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: useAI ? 'rgba(200, 170, 130, 0.9)' : 'rgba(255,255,255,0.3)',
                    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </button>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 200,
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                Include AI Strategic Review (takes ~15s)
              </span>
            </div>
          </div>

          {/* Right: feature cards */}
          <div ref={cardsRef} style={{ display: 'grid', gap: 14 }}>
            {[
              {
                kicker: '1',
                title: 'Deterministic engine first',
                desc: 'SAW-based ranking compares experiments using explicit criteria, so every recommendation is reproducible.',
                highlight: true,
              },
              {
                kicker: '2',
                title: 'AI second opinion',
                desc: 'The AI explains the ranked result, surfaces risks, and adds qualitative context without changing the decision.',
                highlight: false,
              },
              {
                kicker: '3',
                title: 'Founder-ready output',
                desc: 'A ranked shortlist, roadmap, and report the team can act on immediately.',
                highlight: false,
              },
            ].map((card) => (
              <LiquidGlassPanel
                key={card.kicker}
                className="feature-card"
                style={{
                  padding: '22px 24px',
                  opacity: 0,
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: card.highlight
                        ? 'rgba(200, 170, 130, 0.15)'
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${card.highlight ? 'rgba(200, 170, 130, 0.25)' : 'rgba(255,255,255,0.08)'}`,
                      fontFamily: "'GeistMono', monospace",
                      fontSize: 13,
                      fontWeight: 400,
                      color: card.highlight ? 'rgba(200, 170, 130, 0.9)' : 'rgba(255,255,255,0.5)',
                      flexShrink: 0,
                    }}
                  >
                    {card.kicker}
                  </span>
                  <div>
                    <h3
                      style={{
                        fontFamily: "'EB Garamond', serif",
                        fontSize: 18,
                        fontWeight: 400,
                        color: '#ffffff',
                        margin: '0 0 6px',
                        lineHeight: 1.3,
                      }}
                    >
                      {card.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        fontWeight: 200,
                        color: 'rgba(255,255,255,0.4)',
                        margin: 0,
                        lineHeight: 1.55,
                      }}
                    >
                      {card.desc}
                    </p>
                  </div>
                </div>
              </LiquidGlassPanel>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
