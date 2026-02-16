import React from 'react';
import { Tag } from 'lucide-react';

const SkillsCloud = ({ resumes, isLoaded, delay = 0 }) => {
    // Aggregate top keywords
    const getTopKeywords = () => {
        const counts = {};
        if (!resumes) return [];

        resumes.forEach(r => {
            if (r.parsed_data && r.parsed_data.keywords_detected) {
                r.parsed_data.keywords_detected.forEach(kw => {
                    // Simple normalization
                    const k = kw.toLowerCase().trim();
                    counts[k] = (counts[k] || 0) + 1;
                });
            }
        });

        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 15) // Top 15
            .map(([text, count]) => ({ text, count }));
    };

    const keywords = getTopKeywords();

    return (
        <div
            className={`col-span-1 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="glass-card h-full p-6 flex flex-col">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-extrabold mb-1 gradient-text-animated">
                            Top Skills
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Detected across your resumes</p>
                    </div>
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Tag className="w-5 h-5 text-indigo-400" />
                    </div>
                </div>

                <div className="flex-1">
                    {keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {keywords.map((kw, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10 hover:text-white transition-all cursor-default"
                                    style={{
                                        fontSize: Math.max(12, Math.min(24, 12 + (kw.count - 1) * 2)) // Scale size by count
                                    }}
                                >
                                    {kw.text}
                                    {kw.count > 1 && <span className="ml-1 opacity-50 text-[10px]">x{kw.count}</span>}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                            No skills detected yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillsCloud;
