import React from 'react';

/**
 * ResumePreview — Renders resume data in Jake's Resume template style.
 * Clean, single-column, ATS-friendly, black-and-white.
 * Uses @media print to produce a clean PDF via window.print().
 */
const ResumePreview = React.forwardRef(({ data }, ref) => {
  const { personal, education, experience, projects, skills } = data;

  const hasContent = (section) => {
    if (!section || section.length === 0) return false;
    return section.some(item => {
      return Object.values(item).some(v => {
        if (Array.isArray(v)) return v.some(b => b.trim() !== '');
        return typeof v === 'string' && v.trim() !== '';
      });
    });
  };

  return (
    <div ref={ref} className="resume-preview-container">
      <div className="resume-page" id="resume-print-area">
        {/* ═══ HEADER ═══ */}
        <div className="resume-header">
          <h1 className="resume-name">{personal.name || 'Your Name'}</h1>
          <div className="resume-contact">
            {[
              personal.phone && { text: personal.phone, href: `tel:${personal.phone.replace(/\s/g, '')}` },
              personal.email && { text: personal.email, href: `mailto:${personal.email}` },
              personal.linkedin && { text: personal.linkedin, href: personal.linkedin.startsWith('http') ? personal.linkedin : `https://${personal.linkedin}` },
              personal.github && { text: personal.github, href: personal.github.startsWith('http') ? personal.github : `https://${personal.github}` },
            ]
              .filter(Boolean)
              .map((item, i, arr) => (
                <span key={i}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="resume-link">{item.text}</a>
                  {i < arr.length - 1 && <span className="resume-sep"> | </span>}
                </span>
              ))
            }
          </div>
        </div>

        {/* ═══ EDUCATION ═══ */}
        {hasContent(education) && (
          <div className="resume-section">
            <h2 className="resume-section-title">Education</h2>
            {education.map((edu, i) => (
              edu.school || edu.degree ? (
                <div key={i} className="resume-entry">
                  <div className="resume-entry-row">
                    <span className="resume-entry-primary">{edu.school}</span>
                    <span className="resume-entry-right">{edu.location}</span>
                  </div>
                  <div className="resume-entry-row">
                    <span className="resume-entry-secondary">{edu.degree}</span>
                    <span className="resume-entry-right-italic">{edu.dates}</span>
                  </div>
                  {edu.coursework && (
                    <div className="resume-coursework">
                      <span className="resume-bold">Relevant Coursework:</span> {edu.coursework}
                    </div>
                  )}
                </div>
              ) : null
            ))}
          </div>
        )}

        {/* ═══ EXPERIENCE ═══ */}
        {hasContent(experience) && (
          <div className="resume-section">
            <h2 className="resume-section-title">Experience</h2>
            {experience.map((exp, i) => (
              exp.title || exp.company ? (
                <div key={i} className="resume-entry">
                  <div className="resume-entry-row">
                    <span className="resume-entry-primary">
                      {exp.title}{exp.company && <> — <em>{exp.company}</em></>}
                    </span>
                    <span className="resume-entry-right">{exp.location}</span>
                  </div>
                  <div className="resume-entry-row">
                    <span></span>
                    <span className="resume-entry-right-italic">{exp.dates}</span>
                  </div>
                  <ul className="resume-bullets">
                    {exp.bullets.filter(b => b.trim()).map((bullet, bi) => (
                      <li key={bi}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ) : null
            ))}
          </div>
        )}

        {/* ═══ PROJECTS ═══ */}
        {hasContent(projects) && (
          <div className="resume-section">
            <h2 className="resume-section-title">Projects</h2>
            {projects.map((proj, i) => (
              proj.name ? (
                <div key={i} className="resume-entry">
                  <div className="resume-entry-row">
                    <span className="resume-entry-primary">
                      {proj.name}{proj.tech && <> | <em>{proj.tech}</em></>}
                    </span>
                  </div>
                  <ul className="resume-bullets">
                    {proj.bullets.filter(b => b.trim()).map((bullet, bi) => (
                      <li key={bi}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ) : null
            ))}
          </div>
        )}

        {/* ═══ TECHNICAL SKILLS ═══ */}
        {hasContent(skills) && (
          <div className="resume-section">
            <h2 className="resume-section-title">Technical Skills</h2>
            <div className="resume-skills">
              {skills.map((skill, i) => (
                skill.category || skill.items ? (
                  <div key={i} className="resume-skill-row">
                    <span className="resume-bold">{skill.category}:</span> {skill.items}
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!personal.name && !hasContent(education) && !hasContent(experience) && !hasContent(projects) && !hasContent(skills) && (
          <div className="resume-empty">
            Fill in the form on the left to see your resume preview here.
          </div>
        )}
      </div>

      {/* ═══ JAKE'S TEMPLATE STYLES ═══ */}
      <style>{`
        .resume-preview-container {
          display: flex;
          justify-content: center;
          padding: 16px;
        }

        .resume-page {
          width: 8.5in;
          min-height: 11in;
          background: #ffffff;
          color: #000000;
          padding: 0.5in 0.6in;
          font-family: 'CMU Serif', 'Computer Modern', 'Latin Modern Roman', 'Times New Roman', 'Georgia', serif;
          font-size: 10pt;
          line-height: 1.35;
          box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);
          border-radius: 4px;
        }

        /* Header */
        .resume-header {
          text-align: center;
          margin-bottom: 8px;
          padding-bottom: 4px;
        }

        .resume-name {
          font-size: 22pt;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin: 0 0 4px 0;
          color: #000;
        }

        .resume-contact {
          font-size: 9pt;
          color: #333;
        }

        .resume-sep {
          color: #999;
          margin: 0 2px;
        }

        .resume-link {
          color: #333;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s;
        }

        .resume-link:hover {
          color: #000;
          border-bottom-color: #000;
        }

        /* Sections */
        .resume-section {
          margin-top: 10px;
        }

        .resume-section-title {
          font-size: 11pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          border-bottom: 1.5px solid #000;
          padding-bottom: 2px;
          margin: 0 0 6px 0;
          color: #000;
        }

        /* Entries */
        .resume-entry {
          margin-bottom: 8px;
        }

        .resume-entry-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .resume-entry-primary {
          font-weight: 700;
          font-size: 10pt;
        }

        .resume-entry-primary em {
          font-weight: 400;
          font-style: italic;
        }

        .resume-entry-secondary {
          font-style: italic;
          font-size: 10pt;
        }

        .resume-entry-right {
          font-size: 9.5pt;
          color: #333;
          text-align: right;
          flex-shrink: 0;
          margin-left: 16px;
        }

        .resume-entry-right-italic {
          font-size: 9.5pt;
          font-style: italic;
          color: #333;
          text-align: right;
          flex-shrink: 0;
          margin-left: 16px;
        }

        /* Bullet points */
        .resume-bullets {
          margin: 3px 0 0 0;
          padding-left: 18px;
          list-style-type: disc;
        }

        .resume-bullets li {
          font-size: 10pt;
          margin-bottom: 1px;
          line-height: 1.4;
        }

        /* Skills */
        .resume-skills {
          font-size: 10pt;
        }

        .resume-skill-row {
          margin-bottom: 1px;
        }

        .resume-bold {
          font-weight: 700;
        }

        /* Coursework */
        .resume-coursework {
          font-size: 9.5pt;
          margin-top: 2px;
          color: #333;
        }

        /* Empty state */
        .resume-empty {
          text-align: center;
          color: #999;
          font-size: 12pt;
          padding: 60px 20px;
          font-style: italic;
        }

        /* ═══ PRINT STYLES ═══ */
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          body > *:not(#resume-print-area),
          nav, .mesh-bg, .particles, .glass-card,
          [class*="bg-gradient"], [class*="glass"],
          .resume-preview-container > *:not(.resume-page) {
            display: none !important;
          }

          .resume-preview-container {
            padding: 0 !important;
          }

          .resume-page {
            box-shadow: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            min-height: auto !important;
            padding: 0.4in 0.5in !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;
