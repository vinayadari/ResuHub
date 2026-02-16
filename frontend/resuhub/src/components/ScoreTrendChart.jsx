import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const ScoreTrendChart = ({ data, isLoaded, delay = 0 }) => {
    // Format data for chart
    const chartData = data
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map(r => ({
            date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: r.score || 0,
            name: r.name
        }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/90 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
                    <p className="text-slate-300 text-xs font-medium mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                        <p className="text-white font-bold text-sm">
                            Score: <span className="text-indigo-300">{payload[0].value}</span>
                        </p>
                    </div>
                    {payload[0].payload.name && (
                        <p className="text-slate-500 text-[10px] mt-1 truncate max-w-[150px]">
                            {payload[0].payload.name}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div
            className={`col-span-2 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="glass-card h-full p-6 flex flex-col">
                <div className="mb-6">
                    <h3 className="text-xl font-extrabold mb-1 gradient-text-animated">
                        Score History
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Your resume improvement over time</p>
                </div>

                <div className="flex-1 w-full min-h-[200px]">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                    domain={[0, 100]}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#818cf8"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                            <p className="text-sm">Not enough data yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScoreTrendChart;
