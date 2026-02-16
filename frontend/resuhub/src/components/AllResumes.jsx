import React, { useEffect, useState } from 'react';
import { fetchResumes, deleteResume } from '../utils/api';
import ResumeCard from './Resumecard';
import { Loader2, Plus, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const AllResumes = () => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadResumes();
    }, []);

    const loadResumes = async () => {
        try {
            const data = await fetchResumes();
            setResumes(data);
        } catch (err) {
            setError('Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this resume?')) {
            try {
                await deleteResume(id);
                setResumes(resumes.filter(r => r.id !== id));
            } catch (err) {
                alert('Failed to delete resume');
            }
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <FileText className="w-8 h-8 text-indigo-400" />
                        My Resumes
                    </h1>
                    <p className="text-slate-400 mt-2">Manage and track your resume versions</p>
                </div>
                <Link to="/upload" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" /> New Upload
                </Link>
            </div>

            {error && <div className="text-rose-400 mb-4">{error}</div>}

            {resumes.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No resumes found</h3>
                    <p className="text-slate-400 mb-6">Upload your first resume to get started</p>
                    <Link to="/upload" className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all">
                        Upload Resume
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resumes.map(resume => (
                        <ResumeCard
                            key={resume.id}
                            resume={resume}
                            onDelete={() => handleDelete(resume.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllResumes;
