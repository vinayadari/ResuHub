import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { uploadResume } from '../utils/api';

const UploadResume = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            await uploadResume(file, { name: file.name });
            // Redirect to dashboard or resumes list
            navigate('/resumes');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-20 animate-fade-in">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-extrabold text-white mb-3">Upload Resume</h1>
                <p className="text-slate-400">Drag and drop or browse to get your ATS score instantly</p>
            </div>

            <div className="glass-card p-10 border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/50 transition-all rounded-3xl flex flex-col items-center justify-center text-center gap-6">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center animate-pulse">
                    <Upload className="w-10 h-10 text-indigo-400" />
                </div>

                <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload-page"
                />

                {!file ? (
                    <label
                        htmlFor="resume-upload-page"
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl cursor-pointer hover:shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:scale-105"
                    >
                        Select Resume
                    </label>
                ) : (
                    <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-xl border border-white/10">
                        <FileText className="w-6 h-6 text-indigo-400" />
                        <div className="text-left">
                            <p className="text-sm font-bold text-white max-w-[200px] truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button onClick={() => setFile(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                )}

                {file && (
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="mt-4 px-10 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {uploading ? 'Uploading...' : 'Upload & Scrape'}
                    </button>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-sm">
                        <AlertTriangle className="w-4 h-4" /> {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadResume;
