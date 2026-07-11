import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import LiquidGlassPanel from '../components/LiquidGlassPanel';
import ScoreGauge from '../components/ScoreGauge';
import LiquidGlassButton from '../components/LiquidGlassButton';
import type { AnalysisResult, ResultTab } from '../data/types';

// ============================================================
// LearnFirst — Result Screen
// ============================================================

interface ResultScreenProps {
  result: AnalysisResult | null;
  error: string | null;
  activeTab: ResultTab;
  onTabChange: (tab: ResultTab) => void;
  onRestart: () => void;
}

const tabs: { key: ResultTab; label: string }[] = [
  { key: 'rankings', label: 'Rankings' },
  { key: 'ai', label: 'AI Review' },
  { key: 'roadmap', label: 'Roadmap' },
  { key: 'profile', label: 'Profile' },
];

export default function ResultScreen({ result, error, activeTab, onTabChange, onRestart }: ResultScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const algorithm = result?.algorithm_output;
  const ai = result?.ai_output;
  const roadmap = result?.roadmap_report;
  const hfStatus = result?.hf_status;

  const mode = algorithm?.mode || 'branding_first';
  const brandScore = algorithm?.brand_score ?? 0;
  const isMarketingReady = mode === 'marketing_ready';
  const startupName = result?.founder_inputs?.startup_description?.split(' — ')[0] || 'Your Startup';

  // Mount animation: header / hero / nav ONLY
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const cards = containerRef.current?.querySelectorAll('.header-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.2 }
        );
      }
    }, containerRef);
    return () => ctx.revert();
  }, []);

  if (error) {
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
        <LiquidGlassPanel style={{ maxWidth: 520, width: '100%', padding: '48px 36px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: 28, color: '#e57373', margin: '0 0 12px' }}>
            Analysis Failed
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 200, color: 'rgba(255,255,255,0.5)', margin: '0 0 24px' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <LiquidGlassButton onClick={onRestart}>Start Over</LiquidGlassButton>
          </div>
        </LiquidGlassPanel>
      </section>
    );
  }

  if (!result) return null;

  // Build experiments list
  const recommendedExperiments = isMarketingReady
    ? (algorithm?.recommendations || [])
    : (algorithm?.marketing_recommendations || []);
  const brandingExperiments = algorithm?.branding_recommendations || [];

  const displayExperiments = (isMarketingReady
    ? recommendedExperiments
    : [...brandingExperiments.slice(0, 2), ...recommendedExperiments]
  ).slice(0, 5);

  const maxScore = displayExperiments[0]?.score || 1;

  // Profile items
  const fi = result.founder_inputs;
  const profileItems = [
    { label: 'Startup', value: startupName },
    { label: 'Industry', value: fi?.industry || '—' },
    { label: 'Audience', value: fi?.target_audience || '—' },
    { label: 'Stage', value: fi?.industry ? 'MVP' : '—' },
    { label: 'Goal', value: fi?.goal || '—' },
    { label: 'Budget', value: fi?.budget ? `$${fi.budget}` : '—' },
    { label: 'Timeline', value: fi?.max_days ? `${fi.max_days}d` : '—' },
    { label: 'Team', value: fi?.team_size ? `${fi.team_size}` : '—' },
  ];

  return (
    <section style={{ position: 'relative', zIndex: 2, width: '100%', minHeight: '100vh', padding: '40px 24px' }}>
      {/* CSS animation for tab content — React cannot break this */}
      <style>{`
        @keyframes tabEnter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tab-enter {
          animation: tabEnter 0.35s ease-out forwards;
        }
        .tab-enter .result-card {
          opacity: 0;
          animation: tabEnter 0.4s ease-out forwards;
        }
        ${displayExperiments.map((_, i) => `.tab-enter .result-card:nth-child(${i + 1}) { animation-delay: ${0.04 + i * 0.05}s; }`).join('')}
      `}</style>

      <div ref={containerRef} style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            className="header-card"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 14px',
              borderRadius: 999,
              background: 'rgba(200, 170, 130, 0.06)',
              border: '1px solid rgba(200, 170, 130, 0.12)',
              fontFamily: "'GeistMono', monospace",
              fontSize: 10,
              fontWeight: 300,
              color: 'rgba(200, 170, 130, 0.7)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginBottom: 16,
              opacity: 0,
            }}
          >
            <span style={{ fontSize: 9 }}>&#9670;</span>
            Judge-ready output
          </div>
          <h1
            className="header-card"
            style={{
              fontFamily: "'GeistMono', monospace",
              fontWeight: 400,
              fontSize: 'clamp(32px, 4vw, 56px)',
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              color: '#ffffff',
              margin: '0 0 10px',
              opacity: 0,
            }}
          >
            Your LearnFirst Report
          </h1>
          <p
            className="header-card"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              fontWeight: 200,
              color: 'rgba(255,255,255,0.4)',
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.6,
              opacity: 0,
            }}
          >
            The deterministic engine ranked the experiments, then AI explained the outcome and built an execution plan.
          </p>
        </div>

        {/* Executive Summary Hero */}
        <div
          className="header-card"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 28,
            alignItems: 'center',
            padding: '28px 32px',
            marginBottom: 20,
            opacity: 0,
          }}
        >
          <LiquidGlassPanel style={{ padding: '28px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 28, alignItems: 'center' }}>
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
                    marginBottom: 10,
                  }}
                >
                  Quick read
                </div>
                <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontWeight: 400, color: '#ffffff', margin: '10px 0 8px' }}>
                  {startupName}
                </h2>
                <div style={{ margin: '8px 0 10px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 12px',
                      borderRadius: 999,
                      fontFamily: "'GeistMono', monospace",
                      fontSize: 11,
                      fontWeight: 300,
                      background: isMarketingReady ? 'rgba(100, 160, 120, 0.1)' : 'rgba(200, 170, 100, 0.1)',
                      border: `1px solid ${isMarketingReady ? 'rgba(100, 160, 120, 0.2)' : 'rgba(200, 170, 100, 0.2)'}`,
                      color: isMarketingReady ? 'rgba(100, 200, 140, 0.8)' : 'rgba(200, 170, 100, 0.8)',
                    }}
                  >
                    {isMarketingReady ? '\uD83D\uDE80 Marketing-Ready' : '\uD83C\uDFA8 Branding-First'}
                  </span>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 200, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 6px' }}>
                  {ai?.summary || 'Analysis complete.'}
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 300, color: 'rgba(200, 170, 130, 0.7)', margin: 0 }}>
                  {isMarketingReady
                    ? "You're ready to run marketing experiments, with AI acting as a strategic reviewer."
                    : "Start with branding clarity, then move into marketing experiments once the foundation is stronger."}
                </p>
              </div>
              <ScoreGauge score={brandScore} size={110} />
            </div>
          </LiquidGlassPanel>
        </div>

        {/* Tab Navigation */}
        <div
          className="header-card"
          style={{
            display: 'flex',
            gap: 4,
            padding: 4,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            marginBottom: 20,
            overflowX: 'auto',
            opacity: 0,
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              style={{
                flex: 1,
                padding: '11px 20px',
                borderRadius: 10,
                background: activeTab === t.key
                  ? 'linear-gradient(135deg, rgba(200,170,130,0.12), rgba(138,154,138,0.08))'
                  : 'transparent',
                border: 'none',
                color: activeTab === t.key ? 'rgba(200, 170, 130, 0.85)' : 'rgba(255,255,255,0.35)',
                fontFamily: "'GeistMono', monospace",
                fontSize: 12,
                fontWeight: 300,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeTab === t.key ? '0 2px 12px rgba(200, 170, 130, 0.08)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content — key forces remount, CSS handles animation */}
        <div key={activeTab} className="tab-enter">
          {/* Rankings Tab */}
          {activeTab === 'rankings' && (
            <div>
              {displayExperiments.map((item, i) => {
                const exp = item.experiment;
                const score = item.score ?? 0;
                const barWidth = Math.round((score / maxScore) * 100);
                return (
                  <div
                    key={i}
                    className="result-card"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: 16,
                      alignItems: 'start',
                      padding: '20px 24px',
                      marginBottom: 10,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: i === 0
                          ? 'linear-gradient(135deg, rgba(200,170,130,0.5), rgba(180,140,90,0.4))'
                          : 'linear-gradient(135deg, rgba(200,170,130,0.2), rgba(138,154,138,0.15))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: "'GeistMono', monospace",
                        fontSize: 14,
                        fontWeight: 400,
                        color: i === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
                        flexShrink: 0,
                        boxShadow: i === 0 ? '0 4px 16px rgba(200,170,130,0.2)' : 'none',
                      }}
                    >
                      {item.rank || i + 1}
                    </div>

                    <div>
                      <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 17, fontWeight: 400, color: '#ffffff', margin: '0 0 4px' }}>
                        {exp.name}
                      </h3>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 200, color: 'rgba(255,255,255,0.4)', margin: '0 0 10px', lineHeight: 1.5 }}>
                        {exp.why_score || exp.description}
                      </p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {exp.cost !== undefined && (
                          <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', fontFamily: "'GeistMono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                            ${exp.cost}
                          </span>
                        )}
                        {exp.time_days !== undefined && (
                          <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', fontFamily: "'GeistMono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                            {exp.time_days}d
                          </span>
                        )}
                        {exp.team_size !== undefined && (
                          <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', fontFamily: "'GeistMono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                            {exp.team_size}p
                          </span>
                        )}
                        <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(200, 170, 130, 0.08)', border: '1px solid rgba(200, 170, 130, 0.15)', fontFamily: "'GeistMono', monospace", fontSize: 10, color: 'rgba(200, 170, 130, 0.6)' }}>
                          {exp.type}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 999, marginTop: 10, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${barWidth}%`, background: 'linear-gradient(90deg, rgba(200,170,130,0.6), rgba(138,154,138,0.4))', borderRadius: 'inherit', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 10px', borderRadius: 10, background: 'rgba(200, 170, 130, 0.06)', border: '1px solid rgba(200, 170, 130, 0.1)', flexShrink: 0 }}>
                      <span style={{ fontFamily: "'GeistMono', monospace", fontSize: 15, fontWeight: 400, color: 'rgba(200, 170, 130, 0.8)' }}>
                        {score.toFixed ? score.toFixed(2) : score}
                      </span>
                      <span style={{ fontFamily: "'GeistMono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        score
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* AI Review Tab */}
          {activeTab === 'ai' && (
            <div>
              <div className="result-card" style={{ padding: '24px 28px', marginBottom: 12 }}>
                <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 19, fontWeight: 400, color: '#ffffff', margin: '0 0 12px' }}>
                  AI Summary
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 200, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
                  {ai?.summary || 'No AI summary available.'}
                </p>
              </div>

              <div className="result-card" style={{ padding: '24px 28px', marginBottom: 12 }}>
                <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 19, fontWeight: 400, color: '#ffffff', margin: '0 0 12px' }}>
                  Risks
                </h3>
                {ai?.risks && ai.risks.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ai.risks.map((risk, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '10px 14px',
                          borderRadius: 10,
                          background: 'rgba(200, 100, 100, 0.05)',
                          border: '1px solid rgba(200, 100, 100, 0.1)',
                        }}
                      >
                        <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: '50%', background: 'rgba(200, 100, 100, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'rgba(220, 120, 120, 0.7)', marginTop: 2 }}>
                          !
                        </span>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 200, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                          {risk}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                    No risks identified.
                  </p>
                )}
              </div>

              {ai?.top_branding_recommendations && ai.top_branding_recommendations.length > 0 && (
                <div className="result-card" style={{ padding: '24px 28px', marginBottom: 12 }}>
                  <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 19, fontWeight: 400, color: '#ffffff', margin: '0 0 12px' }}>
                    Branding Recommendations
                  </h3>
                  <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                    {ai.top_branding_recommendations.map((item, i) => (
                      <li
                        key={i}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 14,
                          fontWeight: 200,
                          color: 'rgba(255,255,255,0.5)',
                          lineHeight: 1.7,
                          padding: '6px 0',
                          borderBottom: i < ai.top_branding_recommendations!.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        }}
                      >
                        <strong style={{ color: 'rgba(200, 170, 130, 0.7)', fontWeight: 400 }}>{item.name}</strong>
                        {' — '}
                        {item.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ai?.top_marketing_recommendations && ai.top_marketing_recommendations.length > 0 && (
                <div className="result-card" style={{ padding: '24px 28px', marginBottom: 12 }}>
                  <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 19, fontWeight: 400, color: '#ffffff', margin: '0 0 12px' }}>
                    Marketing Recommendations
                  </h3>
                  <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                    {ai.top_marketing_recommendations.map((item, i) => (
                      <li
                        key={i}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 14,
                          fontWeight: 200,
                          color: 'rgba(255,255,255,0.5)',
                          lineHeight: 1.7,
                          padding: '6px 0',
                          borderBottom: i < ai.top_marketing_recommendations!.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        }}
                      >
                        <strong style={{ color: 'rgba(200, 170, 130, 0.7)', fontWeight: 400 }}>{item.name}</strong>
                        {' — '}
                        {item.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Roadmap Tab */}
          {activeTab === 'roadmap' && (
            <div>
              <div className="result-card" style={{ padding: '24px 28px', marginBottom: 16 }}>
                <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 19, fontWeight: 400, color: '#ffffff', margin: '0 0 10px' }}>
                  Founder Report
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 200, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
                  {roadmap?.founder_report || 'No roadmap summary available.'}
                </p>
              </div>

              <div style={{ position: 'relative', paddingLeft: 28 }}>
                <div style={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 1.5, background: 'linear-gradient(180deg, rgba(200,170,130,0.4), rgba(138,154,138,0.2))', borderRadius: 2 }} />

                {roadmap?.roadmap?.map((phase, i) => (
                  <div
                    key={i}
                    className="result-card"
                    style={{
                      position: 'relative',
                      padding: '20px 24px',
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: -22,
                        top: 26,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: i === (roadmap?.roadmap?.length ?? 0) - 1
                          ? 'rgba(138, 154, 138, 0.6)'
                          : 'rgba(200, 170, 130, 0.6)',
                        border: '2px solid #0a0a0a',
                        boxShadow: `0 0 0 1.5px ${i === (roadmap?.roadmap?.length ?? 0) - 1 ? 'rgba(138,154,138,0.4)' : 'rgba(200,170,130,0.3)'}`,
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ fontFamily: "'EB Garamond', serif", fontSize: 16, fontWeight: 400, color: '#ffffff', margin: 0 }}>
                        {phase.phase}
                      </h4>
                      <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(138, 154, 138, 0.08)', border: '1px solid rgba(138, 154, 138, 0.12)', fontFamily: "'GeistMono', monospace", fontSize: 10, color: 'rgba(138, 154, 138, 0.6)', fontWeight: 300 }}>
                        {phase.timeframe}
                      </span>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <span style={{ display: 'block', fontFamily: "'GeistMono', monospace", fontSize: 9, fontWeight: 300, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>
                        Actions
                      </span>
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                        {phase.actions.map((action, j) => (
                          <li
                            key={j}
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 13,
                              fontWeight: 200,
                              color: 'rgba(255,255,255,0.45)',
                              padding: '3px 0 3px 16px',
                              position: 'relative',
                              lineHeight: 1.5,
                            }}
                          >
                            <span style={{ position: 'absolute', left: 0, color: 'rgba(200, 170, 130, 0.5)', fontSize: 11 }}>&rarr;</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontFamily: "'GeistMono', monospace", fontSize: 9, fontWeight: 300, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>
                        Success Metrics
                      </span>
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                        {phase.success_metrics.map((metric, j) => (
                          <li
                            key={j}
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 13,
                              fontWeight: 200,
                              color: 'rgba(255,255,255,0.45)',
                              padding: '3px 0 3px 16px',
                              position: 'relative',
                              lineHeight: 1.5,
                            }}
                          >
                            <span style={{ position: 'absolute', left: 0, color: 'rgba(138, 154, 138, 0.5)', fontSize: 7, top: 8 }}>&#9670;</span>
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <div className="result-card" style={{ padding: '24px 28px', marginBottom: 12 }}>
                <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 19, fontWeight: 400, color: '#ffffff', margin: '0 0 16px' }}>
                  Your Startup Profile
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                  {profileItems.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div style={{ fontFamily: "'GeistMono', monospace", fontSize: 9, fontWeight: 300, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>
                        {p.label}
                      </div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>
                        {p.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="result-card" style={{ padding: '24px 28px', marginBottom: 12 }}>
                <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 19, fontWeight: 400, color: '#ffffff', margin: '0 0 12px' }}>
                  Run Status
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>Hugging Face</span>
                    <span style={{ color: hfStatus?.enabled ? 'rgba(100, 200, 140, 0.7)' : 'rgba(255,255,255,0.4)' }}>
                      {hfStatus?.enabled ? 'Enabled \u2713' : 'Disabled'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>Fallback used</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {hfStatus?.used_fallback ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {result?.report_path && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
                      <span style={{ color: 'rgba(255,255,255,0.35)' }}>Report</span>
                      <span style={{ color: 'rgba(200, 170, 130, 0.5)', fontSize: 11 }}>
                        {result.report_path}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* First Move Callout */}
        <div
          className="header-card"
          style={{
            padding: '24px 28px',
            marginTop: 16,
            marginBottom: 16,
            opacity: 0,
            border: '1px solid rgba(100, 160, 120, 0.15)',
            background: 'rgba(100, 160, 120, 0.04)',
          }}
        >
          <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 19, fontWeight: 400, color: 'rgba(100, 200, 140, 0.8)', margin: '0 0 8px' }}>
            &#127919; First Move
          </h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.6 }}>
            {roadmap?.roadmap?.[0]?.actions?.[0] || 'Review the highest-ranked experiment and prepare the first test assets.'}
          </p>
        </div>

        {/* Restart */}
        <div className="header-card" style={{ display: 'flex', gap: 12, marginTop: 8, opacity: 0 }}>
          <LiquidGlassButton onClick={onRestart}>
            &#8630; Start Over
          </LiquidGlassButton>
        </div>
      </div>
    </section>
  );
}