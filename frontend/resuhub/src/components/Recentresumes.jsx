import React from 'react';
import { ArrowRight } from 'lucide-react';
import ResumeCard from './Resumecard';

const RecentResumes = ({
  resumes = [],
  isLoaded = true,
  delay = 0,
  onViewAll,
  onResumeClick,
  onDelete
}) => {
  return (
    <div
      className={`transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="glass-card p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-extrabold mb-1 gradient-text-animated">
              📑 Resume Version History
            </h3>
            <p className="text-xs text-slate-500 font-medium">Manage your resume versions and history</p>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="btn-arrow flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 hover:bg-indigo-500/20 hover:scale-105 transition-all duration-300"
            >
              View All
              <ArrowRight className="arrow-icon w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Grid */}
        {resumes.length > 0 ? (
          <div className="grid grid-cols-3 gap-5">
            {resumes.map((resume, i) => (
              <div
                key={resume.id}
                className="stagger-in"
                style={{ animationDelay: `${delay + 100 + i * 100}ms` }}
              >
                <ResumeCard
                  resume={resume}
                  onClick={() => onResumeClick?.(resume)}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">📄</p>
            <p className="text-slate-400 text-base font-semibold mb-1">No resumes uploaded yet</p>
            <p className="text-slate-600 text-sm">Upload your first resume to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentResumes;