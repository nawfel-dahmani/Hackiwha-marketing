import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import LiquidGlassPanel from '../components/LiquidGlassPanel';

// ============================================================
// LearnFirst — Loading Screen
// Cinematic spinner with stage cycling text
// ============================================================

interface LoadingScreenProps {
  stage: string;
}

export default function LoadingScreen({ stage }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLParagraphElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Stage text transition
  useEffect(() => {
    if (!stageRef.current) return;
    gsap.fromTo(
      stageRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, [stage]);

  // Spinner continuous animation via CSS
  useEffect(() => {
    if (!spinnerRef.current) return;
    gsap.to(spinnerRef.current, {
      rotation: 360,
      duration: 1.2,
      repeat: -1,
      ease: 'none',
    });
  }, []);

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
      <div ref={containerRef} style={{ opacity: 0 }}>
        <LiquidGlassPanel
          style={{
            width: '100%',
            maxWidth: 480,
            padding: '48px 40px',
            textAlign: 'center',
          }}
        >
          {/* Spinner */}
          <div
            ref={spinnerRef}
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 28px',
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.06)',
              borderTopColor: 'rgba(200, 170, 130, 0.7)',
              borderRightColor: 'rgba(138, 154, 138, 0.4)',
            }}
          />

          <h2
            style={{
              fontFamily: "'EB Garamond', serif",
              fontSize: 24,
              fontWeight: 400,
              color: '#ffffff',
              margin: '0 0 8px',
            }}
          >
            Analyzing your startup&hellip;
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 200,
              color: 'rgba(255,255,255,0.4)',
              margin: '0 0 20px',
            }}
          >
            Ranking experiments and preparing the founder report.
          </p>

          {/* Stage */}
          <p
            ref={stageRef}
            style={{
              fontFamily: "'GeistMono', monospace",
              fontSize: 12,
              fontWeight: 300,
              color: 'rgba(200, 170, 130, 0.7)',
              minHeight: '1.5em',
              letterSpacing: '0.5px',
            }}
          >
            {stage}
          </p>
        </LiquidGlassPanel>
      </div>
    </section>
  );
}
