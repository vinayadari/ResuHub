import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchResume } from '../utils/api';
import { Loader2, ArrowLeft, Download, Eye } from 'lucide-react';

const ResumeDetail = () => {
    const { id } = useParams();
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResume(id).then(setResume).catch(console.error).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
    if (!resume) return <div className="text-center text-white py-20">Resume not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-6 py-6">
            <Link to="/resumes" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Resumes
            </Link>

            <div className="glass-card p-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-white">{resume.file_name}</h1>
                    <div className="flex gap-3">
                        {resume.public_url && (
                            <a href={resume.public_url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 transition-colors">
                                <Eye className="w-4 h-4" /> View PDF
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass-card p-6 bg-white/5">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Metadata</h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-slate-500">Uploaded</p>
                                <p className="text-white font-medium">{new Date(resume.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Industry</p>
                                <p className="text-white font-medium">{resume.industry || 'General'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">ATS Score</p>
                                <div className="text-emerald-400 font-bold text-lg">{resume.score || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 text-slate-300">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Parsed Content (JSON)</h3>
                        <pre className="bg-black/30 p-4 rounded-xl overflow-auto text-xs font-mono max-h-[500px] border border-white/5">
                            {JSON.stringify(resume.parsed_data || {}, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeDetail;
