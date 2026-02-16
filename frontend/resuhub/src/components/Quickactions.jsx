import React from 'react';
import { Plus, Zap, Download, ArrowRight } from 'lucide-react';

const QuickActions = ({
  isLoaded = true,
  delay = 0,
  onUpload,
  onReview,
  onExport
}) => {
  const actions = [
    {
      id: 'upload',
      icon: Plus,
      label: 'Upload Resume',
      subtitle: 'Add new version',
      variant: 'primary',
      onClick: onUpload
    },
    {
      id: 'review',
      icon: Zap,
      label: 'AI Review',
      subtitle: 'Get instant feedback',
      variant: 'secondary',
      color: 'purple',
      onClick: onReview
    },
    {
      id: 'export',
      icon: Download,
      label: 'Export Report',
      subtitle: 'Download analytics',
      variant: 'secondary',
      color: 'blue',
      onClick: onExport
    }
  ];

  const getStyles = (action) => {
    if (action.variant === 'primary') {
      return {
        bg: 'bg-gradient-to-r from-indigo-600 to-purple-600',
        hover: 'hover:shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.03]',
        iconBg: 'bg-white/15',
        iconColor: 'text-white',
        subColor: 'text-indigo-200',
      };
    }
    const map = {
      purple: {
        border: 'border-purple-500/10 hover:border-purple-500/30',
        iconBg: 'bg-purple-500/10',
        iconColor: 'text-purple-400',
      },
      blue: {
        border: 'border-blue-500/10 hover:border-blue-500/30',
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-400',
      }
    };
    const c = map[action.color] || map.purple;
    return {
      bg: 'bg-white/[0.03]',
      hover: 'hover:bg-white/[0.06] hover:scale-[1.03]',
      border: c.border,
      iconBg: c.iconBg,
      iconColor: c.iconColor,
      subColor: 'text-slate-500',
    };
  };

  return (
    <div
      className={`transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="glass-card h-full p-7 flex flex-col">
        <h3 className="text-lg font-extrabold mb-5 gradient-text-animated">
          ⚡ Quick Actions
        </h3>

        <div className="space-y-3 flex-1">
          {actions.map((action) => {
            const s = getStyles(action);
            const Icon = action.icon;

            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`btn-arrow w-full group/btn rounded-2xl p-4 text-left transition-all duration-500 flex items-center gap-4 border ${s.bg} ${s.hover} ${s.border || 'border-transparent'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg} transition-transform duration-500 group-hover/btn:scale-110 group-hover/btn:rotate-6`}>
                  <Icon className={`w-5 h-5 ${s.iconColor || 'text-white'}`} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white">{action.label}</p>
                  <p className={`text-[10px] ${s.subColor} font-medium`}>{action.subtitle}</p>
                </div>
                <ArrowRight className="arrow-icon w-4 h-4 text-slate-600 group-hover/btn:text-white/60 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;