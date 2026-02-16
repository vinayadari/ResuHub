import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, X, CheckCircle, AlertTriangle, Zap, FileText, ChevronRight, Award, TrendingUp, Cpu, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { analyzeResume, uploadResume } from '../utils/api';

const AIReview = () => {
    const location = useLocation();
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (location.state && location.state.analysis) {
            setResult(location.state.analysis);
            if (location.state.fileUrl) {
                setFileUrl(location.state.fileUrl);
                setShowPreview(true); // Auto-show preview if URL is available
            }
        }
    }, [location]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            handleAnalyze(e.target.files[0]);
        }
    };

    const handleAnalyze = async (resumeFile) => {
        setAnalyzing(true);
        setError(null);
        setResult(null); // Clear previous results when a new file is selected
        setFileUrl(null);
        setShowPreview(false);

        // Client-side validation
        if (resumeFile.type !== 'application/pdf') {
            setError('Only PDF files are supported. Please upload a PDF file.');
            setAnalyzing(false);
            return;
        }

        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (resumeFile.size > maxSize) {
            setError('File size exceeds 10MB. Please upload a smaller file.');
            setAnalyzing(false);
            return;
        }

        try {
            // 1. Analyze with AI (Python Backend)
            const data = await analyzeResume(resumeFile);
            setResult(data);

            // 2. Auto-save to Supabase (Node Backend)
            setSaving(true);
            try {
                const uploadRes = await uploadResume(resumeFile, {
                    name: resumeFile.name.replace(/\.[^/.]+$/, ""),
                    score: data.ats_score,
                    parsed_data: data // Store the full AI feedback here!
                });
                if (uploadRes.public_url) {
                    setFileUrl(uploadRes.public_url);
                    setShowPreview(true);
                }
                console.log("Resume and Feedback saved to Supabase!");
            } catch (saveErr) {
                console.error("Auto-save failed:", saveErr);
                // Don't block UI, just log it. User still sees results.
            } finally {
                setSaving(false);
            }

        } catch (err) {
            console.error(err);
            setError(err.message || 'Analysis failed. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-400 border-emerald-500/50';
        if (score >= 60) return 'text-amber-400 border-amber-500/50';
        return 'text-rose-400 border-rose-500/50';
    };

    return (
        <div className={`mx-auto px-6 py-6 space-y-8 animate-fade-in ${showPreview ? 'max-w-[1800px]' : 'max-w-7xl'}`}>
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <Cpu className="w-8 h-8 text-indigo-400" />
                    AI Resume Intelligence
                </h1>
                <p className="text-slate-400 mt-2 text-lg">
                    Upload your resume to get instant actionable feedback powered by Gemini 2.5 Flash.
                </p>
            </div>

            {/* Upload Section (Only show if no result) */}
            {!result && (
                <div className="glass-card p-10 border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/50 transition-all rounded-3xl flex flex-col items-center justify-center text-center gap-6">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center animate-pulse">
                        <Upload className="w-10 h-10 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Upload your Resume (PDF)</h3>
                        <p className="text-slate-400">Drag & drop or click to browse</p>
                    </div>

                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="resume-upload"
                    />

                    {!file ? (
                        <label
                            htmlFor="resume-upload"
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl cursor-pointer hover:shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:scale-105"
                        >
                            Select File
                        </label>
                    ) : (
                        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-xl border border-white/10">
                            <FileText className="w-6 h-6 text-indigo-400" />
                            <div className="text-left">
                                <p className="text-sm font-bold text-white">{file.name}</p>
                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button onClick={() => setFile(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    )}

                    {file && (
                        <button
                            onClick={() => handleAnalyze(file)}
                            disabled={analyzing}
                            className="mt-4 px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {analyzing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Analyzing with AI...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" /> Run Analysis
                                </>
                            )}
                        </button>
                    )}

                    {error && (
                        <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400">
                            <AlertTriangle className="w-5 h-5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Main Content Area */}
            {result && (
                <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>

                    {/* Left Column: PDF Preview */}
                    {showPreview && fileUrl && (
                        <div className="h-[calc(100vh-140px)] sticky top-6 animate-fade-in-left">
                            <div className="glass-card h-full p-1 overflow-hidden relative group">
                                <iframe
                                    src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                    className="w-full h-full rounded-xl bg-slate-800"
                                    title="Resume Preview"
                                />
                                {/* External Link Overlay */}
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute bottom-4 right-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg flex items-center gap-2"
                                >
                                    <ExternalLink className="w-3 h-3" /> Open in New Tab
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Right Column: Analysis */}
                    <div className="space-y-6">
                        {/* Control Bar */}
                        <div className="flex items-center justify-between mb-2">
                            <button
                                onClick={() => setResult(null)}
                                className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                            >
                                ← Upload another
                            </button>

                            {fileUrl && (
                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition-all ${showPreview
                                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    {showPreview ? 'Hide Resume' : 'View Resume'}
                                </button>
                            )}
                        </div>

                        {/* Top Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {/* Score Card */}
                            <div className="glass-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                <div className={`w-32 h-32 rounded-full border-8 ${getScoreColor(result.ats_score)} flex items-center justify-center text-4xl font-black mb-4 bg-white/5`}>
                                    {result.ats_score}
                                </div>
                                <h3 className="text-lg font-bold text-white">ATS Score</h3>
                                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Overall Impact</p>

                                {result.score_breakdown && (
                                    <div className="w-full mt-6 space-y-3 pt-4 border-t border-white/5">
                                        {Object.entries(result.score_breakdown).map(([key, val]) => (
                                            <div key={key} className="space-y-1">
                                                <div className="flex justify-between text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                    <span>{key}</span>
                                                    <span className={val >= 70 ? 'text-emerald-400' : 'text-amber-400'}>{val}/100</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${val >= 70 ? 'bg-emerald-500' : val >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                        style={{ width: `${val}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Summary Card */}
                            <div className="glass-card p-6 md:col-span-1 lg:col-span-1 xl:col-span-2 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <FileText className="w-32 h-32" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-amber-400" /> Executive Summary
                                </h3>
                                <p className="text-slate-300 leading-relaxed text-sm">
                                    {result.executive_summary}
                                </p>

                                {/* Keywords detected */}
                                <div className="mt-6">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Detected Keywords</p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.keywords_detected?.slice(0, 8).map((kw, i) => (
                                            <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                                                {kw}
                                            </span>
                                        ))}
                                        {result.keywords_detected?.length > 8 && (
                                            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-medium">
                                                +{result.keywords_detected.length - 8} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SWOT Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Strengths */}
                            <div className="glass-card p-6 border-l-4 border-l-emerald-500">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" /> Key Strengths
                                </h3>
                                <ul className="space-y-3">
                                    {result.strengths?.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                            <CheckCircle className="w-5 h-5 text-emerald-500/60 shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Weaknesses */}
                            <div className="glass-card p-6 border-l-4 border-l-rose-500">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-rose-400" /> Areas to Improve
                                </h3>
                                <ul className="space-y-3">
                                    {result.weaknesses?.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2"></div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Improvements List */}
                        <div className="glass-card p-8">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Zap className="w-6 h-6 text-yellow-400" /> Recommended Actions
                            </h3>
                            <div className="space-y-4">
                                {result.improvements?.map((imp, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 uppercase tracking-wide">
                                                {imp.section}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                                        </div>
                                        <p className="text-slate-300 text-sm font-medium leading-relaxed">
                                            {imp.suggestion}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIReview;
