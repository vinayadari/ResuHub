import React from 'react';
import { Trash2 } from 'lucide-react';

const ResumeCard = ({ resume, onClick, onDelete }) => {
  // Normalize field names (Supabase uses file_name/created_at, mock uses name/date)
  const displayName = resume.name || resume.file_name || 'Untitled Resume';
  const displayDate = resume.date || (resume.created_at ? new Date(resume.created_at).toLocaleDateString() : '—');
  const score = resume.score || resume.ats_score || 0;

  // Try to get industry from parsed_data or default
  const displayIndustry = resume.industry || (resume.parsed_data && resume.parsed_data.industry) || 'General';
  const displayViews = resume.views || 0;

  // Score ring calculations
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (s) => {
    if (s >= 85) return { stroke: '#34d399', text: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (s >= 75) return { stroke: '#fbbf24', text: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { stroke: '#f43f5e', text: 'text-rose-400', bg: 'bg-rose-500/10' };
  };

  const scoreStyle = getScoreColor(score);

  const industryColors = {
    'Tech': 'from-indigo-500 to-purple-500',
    'Business': 'from-amber-500 to-orange-500',
    'Analytics': 'from-cyan-500 to-blue-500',
    'Design': 'from-pink-500 to-rose-500',
    'Marketing': 'from-emerald-500 to-teal-500',
    'it': 'from-violet-500 to-indigo-500',
  };

  const accent = industryColors[displayIndustry] || 'from-indigo-500 to-purple-500';

  return (
    <div
      className="glass-card shimmer group/card cursor-pointer hover:scale-[1.03] hover:border-white/15 transition-all duration-500 p-5 relative"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(); }}
      aria-label={`Resume: ${displayName}`}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r ${accent} opacity-40 group-hover/card:opacity-80 transition-opacity duration-500 rounded-full`} />

      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Are you sure you want to delete this resume?')) {
              onDelete(resume.id);
            }
          }}
          className="absolute top-3 right-3 p-2 rounded-full text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all opacity-0 group-hover/card:opacity-100 z-10"
          title="Delete Resume"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Score ring + Content */}
      <div className="flex items-start gap-4">
        {/* SVG Score Ring */}
        <div className="relative flex-shrink-0">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle
              cx="28" cy="28" r={radius}
              className="score-ring-track"
              strokeWidth="4"
            />
            <circle
              cx="28" cy="28" r={radius}
              className="score-ring-fill"
              stroke={scoreStyle.stroke}
              strokeWidth="4"
              strokeDasharray={circumference}
              style={{
                '--ring-circumference': circumference,
                '--ring-offset': offset,
                strokeDashoffset: circumference,
                animation: 'scoreRingDraw 1.5s var(--ease-out-expo) 0.3s forwards',
              }}
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-sm font-extrabold ${scoreStyle.text}`}>
            {score}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-8">
          <p className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase mb-1">DOCUMENT</p>
          <p className="text-sm font-bold text-white truncate group-hover/card:text-indigo-300 transition-colors duration-300" title={displayName}>
            {displayName}
          </p>
          <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide ${scoreStyle.bg} ${scoreStyle.text}`}>
            {displayIndustry}
          </span>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/5">
        <div>
          <p className="text-[9px] text-slate-600 font-medium uppercase mb-0.5">Date</p>
          <p className="text-xs font-semibold text-slate-400">{displayDate}</p>
        </div>
        <div>
          <p className="text-[9px] text-slate-600 font-medium uppercase mb-0.5">Views</p>
          <p className="text-xs font-semibold text-slate-400">{displayViews}</p>
        </div>
      </div>
    </div>
  );
};

export default ResumeCard;