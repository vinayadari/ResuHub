import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, RotateCcw, Upload, Download, Check } from 'lucide-react';
import Navigation from './Navigation';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';
import { parseResume } from '../utils/resumeParser';
import { uploadResume } from '../utils/api';

// Default empty resume data
const emptyResume = {
    personal: { name: '', phone: '', email: '', linkedin: '', github: '' },
    education: [{ school: '', degree: '', location: '', dates: '', coursework: '' }],
    experience: [{ title: '', company: '', location: '', dates: '', bullets: [''] }],
    projects: [{ name: '', tech: '', bullets: [''] }],
    skills: [{ category: '', items: '' }],
};

// Jake Ryan's sample data
const sampleResume = {
    personal: {
        name: 'Jake Ryan',
        phone: '123-456-7890',
        email: 'jake@su.edu',
        linkedin: 'linkedin.com/in/jake',
        github: 'github.com/jakeryan',
    },
    education: [
        {
            school: 'Southwestern University',
            degree: 'Bachelor of Arts in Computer Science, Minor in Business',
            location: 'Georgetown, TX',
            dates: 'Aug 2018 – May 2021',
            coursework: 'Data Structures, Software Engineering, Algorithms, Databases, Computer Architecture',
        },
        {
            school: 'Blinn College',
            degree: 'Associate of Arts in Liberal Arts',
            location: 'Bryan, TX',
            dates: 'Aug 2014 – May 2018',
            coursework: '',
        },
    ],
    experience: [
        {
            title: 'Undergraduate Research Assistant',
            company: 'Texas A&M University',
            location: 'College Station, TX',
            dates: 'Jun 2020 – Present',
            bullets: [
                'Developed a REST API using FastAPI and PostgreSQL to store data from learning management systems',
                'Developed a full-stack web application using Flask, React, PostgreSQL and Docker to analyze university, lmses',
                'Explored ways to visualize GitHub collaboration in a classroom setting',
            ],
        },
        {
            title: 'Information Technology Support Specialist',
            company: 'Southwestern University',
            location: 'Georgetown, TX',
            dates: 'Sep 2018 – Present',
            bullets: [
                'Communicate with managers to set up campus dependencies in a timely manner',
                'Assess and troubleshoot computer problems brought by students, extract, or faculty',
                'Maintain upkeep of computers, extract, extract, and other related equipment',
            ],
        },
    ],
    projects: [
        {
            name: 'Gitlytics',
            tech: 'Python, Flask, React, PostgreSQL, Docker',
            bullets: [
                'Developed a full-stack web application using Flask serving a REST API with React as the frontend',
                'Implemented GitHub OAuth to get data from user\'s repositories',
                'Visualized GitHub data to show collaboration in a classroom setting',
                'Used Celery and Redis for asynchronous tasks',
            ],
        },
        {
            name: 'Simple Paintball',
            tech: 'Spigot API, Java, Maven, TravisCI, Git',
            bullets: [
                'Developed a Minecraft server plugin to entertain kids, extract, extract',
                'Published plugin to websites gaining 2K+ downloads and an extract positive rating',
                'Implemented extract game extract and extract for extract extract extract',
            ],
        },
    ],
    skills: [
        { category: 'Languages', items: 'Java, Python, C/C++, SQL (Postgres), JavaScript, HTML/CSS, R' },
        { category: 'Frameworks', items: 'React, Node.js, Flask, JUnit, WordPress, Material-UI, FastAPI' },
        { category: 'Developer Tools', items: 'Git, Docker, TravisCI, Google Cloud Platform, VS Code, Visual Studio, PyCharm, IntelliJ, Eclipse' },
        { category: 'Libraries', items: 'pandas, NumPy, Matplotlib' },
    ],
};

function AmbientBackground() {
    return (
        <>
            <div className="mesh-bg"><div className="mesh-orb" /></div>
            <div className="particles">
                {[...Array(8)].map((_, i) => <div key={i} className="particle" />)}
            </div>
        </>
    );
}

const ResumeBuilder = () => {
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState('resumes');
    const [resumeData, setResumeData] = useState(JSON.parse(JSON.stringify(sampleResume)));
    const previewRef = useRef(null);
    const fileInputRef = useRef(null);
    const [parsing, setParsing] = useState(false);
    const [parseError, setParseError] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    const handleNavChange = (nav) => {
        setActiveNav(nav);
        const routes = { dashboard: '/', versions: '/versions', resumes: '/resumes', aireview: '/ai-review' };
        navigate(routes[nav] || '/');
    };

    const handleExportPDF = async () => {
        const element = previewRef.current?.querySelector('.resume-page');
        if (!element) return;

        setExporting(true);
        setExportSuccess(false);

        try {
            const html2pdf = (await import('html2pdf.js')).default;

            const fileName = resumeData.personal.name
                ? `${resumeData.personal.name.replace(/\s+/g, '_')}_Resume.pdf`
                : 'Resume.pdf';

            // Generate PDF blob
            const pdfBlob = await html2pdf()
                .set({
                    margin: 0,
                    filename: fileName,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
                })
                .from(element)
                .outputPdf('blob');

            // Download locally
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Upload to Supabase so it shows in Recent Resumes
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
            await uploadResume(file, {
                name: resumeData.personal.name || fileName.replace('.pdf', ''),
                industry: 'General',
                parsed_data: resumeData,
            });

            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        } catch (err) {
            console.error('Export error:', err);
            setParseError('Export failed: ' + err.message);
            setTimeout(() => setParseError(null), 5000);
        } finally {
            setExporting(false);
        }
    };

    const handleReset = () => {
        if (window.confirm('Reset all fields to empty?')) {
            setResumeData(JSON.parse(JSON.stringify(emptyResume)));
        }
    };

    const handleLoadSample = () => {
        setResumeData(JSON.parse(JSON.stringify(sampleResume)));
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setParsing(true);
        setParseError(null);
        try {
            const parsed = await parseResume(file);
            setResumeData(parsed);
        } catch (err) {
            console.error('Parse error:', err);
            setParseError(err.message || 'Failed to parse resume. Please try a different file.');
            setTimeout(() => setParseError(null), 5000);
        } finally {
            setParsing(false);
            // Reset file input so the same file can be uploaded again
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen text-white relative">
            <AmbientBackground />
            <div className="relative z-10">
                <Navigation activeNav={activeNav} onNavChange={handleNavChange} />

                <div className="page-enter">
                    {/* Top bar */}
                    <div className="max-w-[1800px] mx-auto px-6 pt-6 pb-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/resumes')}
                                className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <div>
                                <p className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">📝 Builder</p>
                                <h1 className="text-xl font-extrabold gradient-text-animated">Build Resume</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <button
                                onClick={handleUploadClick}
                                disabled={parsing}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-400 border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {parsing ? (
                                    <>
                                        <span className="w-3 h-3 border-2 border-indigo-300/30 border-t-indigo-300 rounded-full animate-spin" />
                                        Extracting...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-3 h-3" /> Upload &amp; Auto-Fill
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleLoadSample}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all"
                            >
                                Load Sample
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all flex items-center gap-1.5"
                            >
                                <RotateCcw className="w-3 h-3" /> Reset
                            </button>
                            <button
                                onClick={handleExportPDF}
                                disabled={exporting}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 hover:shadow-lg flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-wait ${exportSuccess
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/20'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/20'
                                    }`}
                            >
                                {exporting ? (
                                    <>
                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Exporting...
                                    </>
                                ) : exportSuccess ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" /> Saved & Downloaded!
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-3.5 h-3.5" /> Export PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Split pane */}
                    <div className="max-w-[1800px] mx-auto px-6 pb-8 flex gap-5" style={{ height: 'calc(100vh - 140px)' }}>
                        {/* Left: Form */}
                        <div className="w-[420px] flex-shrink-0">
                            <div className="glass-card p-5 h-full overflow-hidden">
                                <ResumeForm data={resumeData} onChange={setResumeData} />
                            </div>
                        </div>

                        {/* Right: Preview */}
                        <div className="flex-1 overflow-y-auto rounded-2xl" style={{ background: 'rgba(128,128,128,0.08)' }}>
                            <ResumePreview ref={previewRef} data={resumeData} />
                        </div>
                    </div>

                    {/* Parsing error toast */}
                    {parseError && (
                        <div
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm font-semibold shadow-xl z-50"
                            style={{ animation: 'staggerFadeIn 0.3s var(--ease-out-expo) forwards' }}
                        >
                            ⚠️ {parseError}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;
