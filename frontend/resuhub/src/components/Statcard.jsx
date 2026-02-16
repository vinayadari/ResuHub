import React, { useState, useEffect, useRef } from 'react';

const StatCard = ({
  icon: Icon,
  label,
  subtitle,
  value,
  badge,
  trend,
  suffix,
  gradientFrom,
  gradientTo,
  delay = 0,
  isLoaded = true,
  iconFill = false
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  // Animated number counter
  useEffect(() => {
    if (!isLoaded || hasAnimated.current) return;
    hasAnimated.current = true;

    const numericValue = typeof value === 'number' ? value : parseInt(value, 10);
    if (isNaN(numericValue)) { setDisplayValue(value); return; }

    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * numericValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => requestAnimationFrame(animate), delay);
    return () => clearTimeout(timer);
  }, [isLoaded, value, delay]);

  const colorMap = {
    indigo: {
      gradient: 'from-indigo-600 to-purple-600',
      iconBg: 'from-indigo-500/15 to-purple-500/15',
      iconBorder: 'border-indigo-500/20',
      iconColor: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/10',
      badgeBorder: 'border-indigo-500/15',
      badgeText: 'text-indigo-400',
      valueGradient: 'from-indigo-300 via-purple-300 to-pink-300',
      glow: 'rgba(99, 102, 241, 0.15)',
    },
    purple: {
      gradient: 'from-purple-600 to-pink-600',
      iconBg: 'from-purple-500/15 to-pink-500/15',
      iconBorder: 'border-purple-500/20',
      iconColor: 'text-purple-400',
      badgeBg: 'bg-purple-500/10',
      badgeBorder: 'border-purple-500/15',
      badgeText: 'text-purple-400',
      valueGradient: 'from-purple-300 via-pink-300 to-rose-300',
      trendColor: 'text-amber-400',
      glow: 'rgba(139, 92, 246, 0.15)',
    },
    blue: {
      gradient: 'from-blue-600 to-cyan-600',
      iconBg: 'from-blue-500/15 to-cyan-500/15',
      iconBorder: 'border-blue-500/20',
      iconColor: 'text-blue-400',
      badgeBg: 'bg-blue-500/10',
      badgeBorder: 'border-blue-500/15',
      badgeText: 'text-blue-400',
      valueGradient: 'from-blue-300 via-cyan-300 to-teal-300',
      suffixColor: 'text-slate-500',
      glow: 'rgba(59, 130, 246, 0.15)',
    },
    emerald: {
      gradient: 'from-emerald-600 to-teal-600',
      iconBg: 'from-emerald-500/15 to-teal-500/15',
      iconBorder: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10',
      badgeBorder: 'border-emerald-500/15',
      badgeText: 'text-emerald-400',
      valueGradient: 'from-emerald-300 via-teal-300 to-cyan-300',
      trendColor: 'text-emerald-400',
      glow: 'rgba(52, 211, 153, 0.15)',
    }
  };

  const colors = colorMap[gradientFrom] || colorMap.indigo;

  return (
    <div
      className={`transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative group">
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-3xl blur-2xl transition-opacity duration-700 opacity-0 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle, ${colors.glow}, transparent 70%)` }}
        />

        {/* Card */}
        <div className="glass-card shimmer relative p-6 group-hover:border-white/10">
          {/* Top row: icon + badge */}
          <div className="flex items-start justify-between mb-5">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.iconBg} border ${colors.iconBorder} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
              <Icon
                className={`w-6 h-6 ${colors.iconColor}`}
                strokeWidth={2}
                fill={iconFill ? "currentColor" : "none"}
              />
            </div>
            <div className={`px-2.5 py-1 rounded-lg ${colors.badgeBg} border ${colors.badgeBorder}`}>
              <span className={`text-[10px] font-bold tracking-wider ${colors.badgeText}`}>
                {badge}
              </span>
            </div>
          </div>

          {/* Labels */}
          <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mb-1">{label}</p>
          <p className="text-[10px] text-slate-600 truncate mb-3" title={subtitle}>{subtitle}</p>

          {/* Value */}
          <div className="flex items-baseline gap-2">
            <p className={`text-4xl font-extrabold bg-gradient-to-r ${colors.valueGradient} bg-clip-text text-transparent tabular-nums`}>
              {displayValue}
            </p>
            {trend && (
              <span className={`text-xs font-bold ${colors.trendColor || 'text-emerald-400'} bg-emerald-500/10 px-2 py-0.5 rounded-md`}>
                {trend}
              </span>
            )}
            {suffix && (
              <span className={`text-xs font-semibold ${colors.suffixColor || 'text-slate-600'}`}>
                {suffix}
              </span>
            )}
          </div>

          {/* Bottom line accent */}
          <div className={`absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r ${colors.gradient} rounded-full opacity-20 group-hover:opacity-50 transition-opacity duration-500`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;