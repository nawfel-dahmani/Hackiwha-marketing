import { type ReactNode } from 'react';

// ============================================================
// LearnFirst — Liquid Glass Panel
// A translucent panel with subtle border and glass-morphism
// Used as the card container throughout the wizard.
// ============================================================

interface LiquidGlassPanelProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function LiquidGlassPanel({ children, className = '', style = {} }: LiquidGlassPanelProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.03)',
        backgroundBlendMode: 'luminosity',
        backdropFilter: 'blur(6px) saturate(140%)',
        WebkitBackdropFilter: 'blur(6px) saturate(140%)',
        border: 'none',
        borderRadius: 22,
        overflow: 'hidden',
        boxShadow: `
          inset 0 1px 1px rgba(255, 255, 255, 0.1),
          0 8px 32px rgba(0, 0, 0, 0.15)
        `,
        ...style,
      }}
    >
      {/* Edge refraction pseudo-element via inline overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          padding: '1.4px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.5) 100%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          opacity: 0.25,
        }}
      />
      {/* Specular highlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `
            radial-gradient(ellipse 90% 40% at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 60% 35% at 65% 10%, rgba(255,255,255,0.08) 0%, transparent 50%)
          `,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
