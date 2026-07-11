import { useEffect, useRef, useState } from 'react';

// ============================================================
// LearnFirst — Animated Score Gauge
// SVG ring with animated fill and counter
// ============================================================

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export default function ScoreGauge({ score, size = 120, strokeWidth = 6, label = 'Brand Score' }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const circumference = 2 * Math.PI * (size / 2 - strokeWidth * 2);
  const offset = circumference - (Math.min(Math.max(animatedScore, 0), 100) / 100) * circumference;
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1500;
    const startVal = 0;

    function update(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (score - startVal) * eased);
      setAnimatedScore(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(update);
      }
    }

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [score]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c8aa82" />
              <stop offset="100%" stopColor="#8a9a8a" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - strokeWidth * 2}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - strokeWidth * 2}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'GeistMono', monospace",
            fontSize: size * 0.3,
            fontWeight: 400,
            color: '#ffffff',
            letterSpacing: '-1px',
          }}
        >
          {animatedScore}
        </div>
      </div>
      <span
        style={{
          fontFamily: "'GeistMono', monospace",
          fontSize: 10,
          fontWeight: 300,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}
      >
        {label}
      </span>
    </div>
  );
}
