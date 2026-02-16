import React from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

// Collapsible section wrapper
function Section({ title, emoji, isOpen, onToggle, children }) {
    return (
        <div className="mb-3">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all text-left"
            >
                <span className="font-bold text-sm text-white flex items-center gap-2">
                    <span>{emoji}</span> {title}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="mt-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3" style={{ animation: 'staggerFadeIn 0.3s var(--ease-out-expo) forwards' }}>
                    {children}
                </div>
            )}
        </div>
    );
}

// Input field
function Field({ label, value, onChange, placeholder, type = 'text' }) {
    return (
        <div>
            <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/8 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all"
            />
        </div>
    );
}

// Textarea
function TextArea({ label, value, onChange, placeholder, rows = 2 }) {
    return (
        <div>
            <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/8 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all resize-none"
            />
        </div>
    );
}

const ResumeForm = ({ data, onChange }) => {
    const [openSections, setOpenSections] = React.useState({
        personal: true,
        education: false,
        experience: false,
        projects: false,
        skills: false,
    });

    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const updateField = (path, value) => {
        const newData = JSON.parse(JSON.stringify(data));
        const keys = path.split('.');
        let obj = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        onChange(newData);
    };

    const addItem = (section) => {
        const newData = JSON.parse(JSON.stringify(data));
        const templates = {
            education: { school: '', degree: '', location: '', dates: '', coursework: '' },
            experience: { title: '', company: '', location: '', dates: '', bullets: [''] },
            projects: { name: '', tech: '', bullets: [''] },
            skills: { category: '', items: '' },
        };
        newData[section].push(templates[section]);
        onChange(newData);
    };

    const removeItem = (section, index) => {
        const newData = JSON.parse(JSON.stringify(data));
        newData[section].splice(index, 1);
        onChange(newData);
    };

    const addBullet = (section, index) => {
        const newData = JSON.parse(JSON.stringify(data));
        if (newData[section][index].bullets.length < 5) {
            newData[section][index].bullets.push('');
        }
        onChange(newData);
    };

    const removeBullet = (section, index, bulletIndex) => {
        const newData = JSON.parse(JSON.stringify(data));
        newData[section][index].bullets.splice(bulletIndex, 1);
        onChange(newData);
    };

    return (
        <div className="space-y-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            {/* ─── Personal Info ─── */}
            <Section title="Personal Information" emoji="👤" isOpen={openSections.personal} onToggle={() => toggleSection('personal')}>
                <Field label="Full Name" value={data.personal.name} onChange={(v) => updateField('personal.name', v)} placeholder="Jake Ryan" />
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Phone" value={data.personal.phone} onChange={(v) => updateField('personal.phone', v)} placeholder="123-456-7890" />
                    <Field label="Email" value={data.personal.email} onChange={(v) => updateField('personal.email', v)} placeholder="jake@su.edu" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="LinkedIn" value={data.personal.linkedin} onChange={(v) => updateField('personal.linkedin', v)} placeholder="linkedin.com/in/jake" />
                    <Field label="GitHub" value={data.personal.github} onChange={(v) => updateField('personal.github', v)} placeholder="github.com/jake" />
                </div>
            </Section>

            {/* ─── Education ─── */}
            <Section title="Education" emoji="🎓" isOpen={openSections.education} onToggle={() => toggleSection('education')}>
                {data.education.map((edu, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-2 relative">
                        {data.education.length > 1 && (
                            <button onClick={() => removeItem('education', i)} className="absolute top-2 right-2 text-slate-600 hover:text-rose-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <Field label="School" value={edu.school} onChange={(v) => updateField(`education.${i}.school`, v)} placeholder="Southwestern University" />
                        <Field label="Degree" value={edu.degree} onChange={(v) => updateField(`education.${i}.degree`, v)} placeholder="Bachelor of Arts in Computer Science" />
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Location" value={edu.location} onChange={(v) => updateField(`education.${i}.location`, v)} placeholder="Georgetown, TX" />
                            <Field label="Dates" value={edu.dates} onChange={(v) => updateField(`education.${i}.dates`, v)} placeholder="Aug 2018 – May 2021" />
                        </div>
                        <Field label="Relevant Coursework" value={edu.coursework} onChange={(v) => updateField(`education.${i}.coursework`, v)} placeholder="Data Structures, Algorithms, Databases..." />
                    </div>
                ))}
                <button onClick={() => addItem('education')} className="w-full py-2 rounded-lg border border-dashed border-white/10 text-xs font-semibold text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-1">
                    <Plus className="w-3 h-3" /> Add Education
                </button>
            </Section>

            {/* ─── Experience ─── */}
            <Section title="Experience" emoji="💼" isOpen={openSections.experience} onToggle={() => toggleSection('experience')}>
                {data.experience.map((exp, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-2 relative">
                        {data.experience.length > 1 && (
                            <button onClick={() => removeItem('experience', i)} className="absolute top-2 right-2 text-slate-600 hover:text-rose-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Title" value={exp.title} onChange={(v) => updateField(`experience.${i}.title`, v)} placeholder="Software Engineer" />
                            <Field label="Company" value={exp.company} onChange={(v) => updateField(`experience.${i}.company`, v)} placeholder="Google" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Location" value={exp.location} onChange={(v) => updateField(`experience.${i}.location`, v)} placeholder="Mountain View, CA" />
                            <Field label="Dates" value={exp.dates} onChange={(v) => updateField(`experience.${i}.dates`, v)} placeholder="Jun 2021 – Present" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Bullet Points</label>
                            {exp.bullets.map((bullet, bi) => (
                                <div key={bi} className="flex items-center gap-2 mb-1.5">
                                    <input
                                        value={bullet}
                                        onChange={(e) => updateField(`experience.${i}.bullets.${bi}`, e.target.value)}
                                        placeholder={`Achievement ${bi + 1}...`}
                                        className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/8 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-all"
                                    />
                                    {exp.bullets.length > 1 && (
                                        <button onClick={() => removeBullet('experience', i, bi)} className="text-slate-600 hover:text-rose-400 transition-colors">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {exp.bullets.length < 5 && (
                                <button onClick={() => addBullet('experience', i)} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold mt-1 flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Add bullet
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                <button onClick={() => addItem('experience')} className="w-full py-2 rounded-lg border border-dashed border-white/10 text-xs font-semibold text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-1">
                    <Plus className="w-3 h-3" /> Add Experience
                </button>
            </Section>

            {/* ─── Projects ─── */}
            <Section title="Projects" emoji="🚀" isOpen={openSections.projects} onToggle={() => toggleSection('projects')}>
                {data.projects.map((proj, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-2 relative">
                        {data.projects.length > 1 && (
                            <button onClick={() => removeItem('projects', i)} className="absolute top-2 right-2 text-slate-600 hover:text-rose-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Project Name" value={proj.name} onChange={(v) => updateField(`projects.${i}.name`, v)} placeholder="Gitlytics" />
                            <Field label="Technologies" value={proj.tech} onChange={(v) => updateField(`projects.${i}.tech`, v)} placeholder="Python, Flask, React" />
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Bullet Points</label>
                            {proj.bullets.map((bullet, bi) => (
                                <div key={bi} className="flex items-center gap-2 mb-1.5">
                                    <input
                                        value={bullet}
                                        onChange={(e) => updateField(`projects.${i}.bullets.${bi}`, e.target.value)}
                                        placeholder={`Description ${bi + 1}...`}
                                        className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/8 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-all"
                                    />
                                    {proj.bullets.length > 1 && (
                                        <button onClick={() => removeBullet('projects', i, bi)} className="text-slate-600 hover:text-rose-400 transition-colors">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {proj.bullets.length < 5 && (
                                <button onClick={() => addBullet('projects', i)} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold mt-1 flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Add bullet
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                <button onClick={() => addItem('projects')} className="w-full py-2 rounded-lg border border-dashed border-white/10 text-xs font-semibold text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-1">
                    <Plus className="w-3 h-3" /> Add Project
                </button>
            </Section>

            {/* ─── Technical Skills ─── */}
            <Section title="Technical Skills" emoji="⚙️" isOpen={openSections.skills} onToggle={() => toggleSection('skills')}>
                {data.skills.map((skill, i) => (
                    <div key={i} className="flex items-start gap-2 relative">
                        <div className="grid grid-cols-2 gap-2 flex-1">
                            <Field label="Category" value={skill.category} onChange={(v) => updateField(`skills.${i}.category`, v)} placeholder="Languages" />
                            <Field label="Skills (comma separated)" value={skill.items} onChange={(v) => updateField(`skills.${i}.items`, v)} placeholder="Python, Java, C++" />
                        </div>
                        {data.skills.length > 1 && (
                            <button onClick={() => removeItem('skills', i)} className="mt-5 text-slate-600 hover:text-rose-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ))}
                <button onClick={() => addItem('skills')} className="w-full py-2 rounded-lg border border-dashed border-white/10 text-xs font-semibold text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-1">
                    <Plus className="w-3 h-3" /> Add Skill Category
                </button>
            </Section>
        </div>
    );
};

export default ResumeForm;
