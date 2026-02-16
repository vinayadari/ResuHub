import React from 'react';

const PerformanceChart = ({
  userScore,
  percentile = 15,
  isLoaded = true,
  delay = 0
}) => {
  const calculatePosition = (score) => {
    if (score < 60) return 40 + (score / 60) * 160;
    if (score < 80) return 200 + ((score - 60) / 20) * 60;
    return 260 + ((score - 80) / 20) * 100;
  };

  const userPosition = calculatePosition(userScore);

  return (
    <div
      className={`col-span-2 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="glass-card h-full p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-extrabold mb-1 gradient-text-animated">
              ATS Performance Distribution
            </h3>
            <p className="text-xs text-slate-500 font-medium">Your resume scores vs. industry benchmark</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15">
              <span className="text-xs font-bold text-emerald-400">🏆 TOP {percentile}%</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative">
          <svg viewBox="0 0 400 210" className="w-full h-auto" role="img" aria-label="Performance distribution chart">
            <defs>
              <linearGradient id="curveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="hireZoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="strokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Grid lines */}
            <g opacity="0.06">
              {[40, 80, 120, 160, 180].map(y => (
                <line key={`g-${y}`} x1="40" y1={y} x2="360" y2={y} stroke="#94a3b8" strokeWidth="1" />
              ))}
            </g>

            {/* Hire zone */}
            <rect x="260" y="0" width="100" height="180" fill="url(#hireZoneGrad)" rx="8" />

            {/* Curve fill */}
            <path
              d="M 40 180 Q 50 160, 80 120 Q 110 80, 140 50 Q 170 30, 200 25 Q 230 30, 260 50 Q 290 80, 320 120 Q 350 160, 360 180 Z"
              fill="url(#curveGradient2)"
              style={{ opacity: 0, animation: 'staggerFadeIn 0.8s ease-out 1.2s forwards' }}
            />

            {/* Curve stroke */}
            <path
              d="M 40 180 Q 50 160, 80 120 Q 110 80, 140 50 Q 170 30, 200 25 Q 230 30, 260 50 Q 290 80, 320 120 Q 350 160, 360 180"
              fill="none"
              stroke="url(#strokeGrad)"
              strokeWidth="2.5"
              strokeDasharray="2000"
              strokeDashoffset="2000"
              style={{ animation: 'drawStroke 2s ease-out 0.3s forwards' }}
            />

            {/* User marker line */}
            <line
              x1={userPosition} y1="55" x2={userPosition} y2="180"
              stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.5"
            />

            {/* Glow behind marker */}
            <circle cx={userPosition} cy="55" r="20" fill="url(#dotGlow)" style={{ animation: 'pulseDot 2s ease-in-out infinite' }} />

            {/* User marker dot */}
            <circle cx={userPosition} cy="55" r="5" fill="#60a5fa" filter="url(#glow)" />
            <circle cx={userPosition} cy="55" r="3" fill="white" />

            {/* YOU label */}
            <g style={{ opacity: 0, animation: 'staggerFadeIn 0.5s ease-out 1.5s forwards' }}>
              <rect x={userPosition - 22} y="28" width="44" height="20" rx="6" fill="rgba(96, 165, 250, 0.15)" stroke="rgba(96, 165, 250, 0.3)" strokeWidth="1" />
              <text x={userPosition} y="42" fill="#60a5fa" fontSize="10" fontWeight="800" textAnchor="middle">YOU</text>
            </g>

            {/* HIRE ZONE label */}
            <text x="310" y="22" fill="#34d399" fontSize="10" fontWeight="700" textAnchor="middle" opacity="0.7">HIRE ZONE</text>

            {/* X-axis labels */}
            <text x="80" y="198" fill="#475569" fontSize="10" textAnchor="middle">Poor</text>
            <text x="200" y="198" fill="#475569" fontSize="10" textAnchor="middle">Average</text>
            <text x="310" y="198" fill="#34d399" fontSize="10" fontWeight="600" textAnchor="middle">Excellent</text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            <span className="text-[10px] text-slate-500 font-medium">Score Distribution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span className="text-[10px] text-slate-500 font-medium">Your Position</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-slate-500 font-medium">Hire Zone</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes drawStroke {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default PerformanceChart;