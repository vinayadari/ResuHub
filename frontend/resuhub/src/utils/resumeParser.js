/**
 * resumeParser.js  —  v2 (improved heuristics)
 *
 * Client-side resume text extraction (PDF via pdfjs-dist, DOCX via mammoth)
 * and smart heuristic parsing into structured data.
 *
 * Improvements over v1:
 *  - Better PDF line reconstruction (Y-position + font-size grouping)
 *  - Section detection handles ALL CAPS, colons, underlines, bold markers
 *  - Expanded date range regex (handles "2020-2024", "2020 to Present", etc.)
 *  - Smarter experience/project entry boundary detection
 *  - Location extraction from common patterns like "City, ST"
 */

import mammoth from 'mammoth';

// ═══════════════════════════════════════════════════
// TEXT EXTRACTION
// ═══════════════════════════════════════════════════

async function extractTextFromPDF(file) {
    const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');

    if (!pdfjsLib.GlobalWorkerOptions.workerPort && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }

    const arrayBuffer = await file.arrayBuffer();

    let pdf;
    try {
        pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    } catch (err) {
        console.warn('PDF worker failed, retrying without worker:', err.message);
        pdf = await pdfjsLib.getDocument({
            data: arrayBuffer,
            useWorkerFetch: false,
            isEvalSupported: false,
            useSystemFonts: true,
        }).promise;
    }

    const allLines = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const items = content.items.filter(it => it.str.trim() !== '');

        if (items.length === 0) continue;

        // Group items by Y position (same line = similar Y)
        let currentLine = [];
        let lastY = items[0].transform[5];

        for (const item of items) {
            const y = item.transform[5];
            // If Y changes by more than half the font height → new line
            const threshold = Math.max(item.height || 6, 4) * 0.6;
            if (Math.abs(y - lastY) > threshold && currentLine.length > 0) {
                allLines.push(mergeLineItems(currentLine));
                currentLine = [];
            }
            currentLine.push(item);
            lastY = y;
        }
        if (currentLine.length > 0) {
            allLines.push(mergeLineItems(currentLine));
        }
    }

    return allLines.join('\n');
}

function mergeLineItems(items) {
    // Sort left-to-right, then join with spaces
    items.sort((a, b) => a.transform[4] - b.transform[4]);
    let text = '';
    for (let i = 0; i < items.length; i++) {
        const str = items[i].str;
        if (i > 0) {
            // Insert space if there's a gap between items
            const prevEnd = items[i - 1].transform[4] + (items[i - 1].width || 0);
            const curStart = items[i].transform[4];
            const gap = curStart - prevEnd;
            if (gap > 3) text += ' ';
        }
        text += str;
    }
    return text.trim();
}

async function extractTextFromDOCX(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

export async function extractText(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf')) return extractTextFromPDF(file);
    if (name.endsWith('.docx') || name.endsWith('.doc')) return extractTextFromDOCX(file);
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}

// ═══════════════════════════════════════════════════
// SECTION SPLITTING (improved)
// ═══════════════════════════════════════════════════

// Section header keywords — ordered by priority
const SECTION_DEFS = [
    { key: 'education', re: /\b(education|academic\s*background|qualifications?)\b/i },
    { key: 'experience', re: /\b(experience|employment|work\s*history|professional\s*experience|internships?)\b/i },
    { key: 'projects', re: /\b(projects?|personal\s*projects?|academic\s*projects?|side\s*projects?)\b/i },
    { key: 'skills', re: /\b(skills?|technical\s*skills?|technologies|core\s*competenc|proficienc|tools?\s*(?:&|and)\s*technolog)/i },
    { key: 'certifications', re: /\b(certifications?|licenses?|awards?|honors?|achievements?)\b/i },
    { key: 'summary', re: /\b(summary|objective|profile|about\s*me)\b/i },
];

function isSectionHeader(line) {
    const stripped = line.replace(/[-–—_=:]/g, '').trim();
    if (stripped.length === 0) return null;
    if (stripped.length > 70) return null; // too long to be a header

    // Check if line is ALL CAPS and short (typical section headers)
    const isAllCaps = stripped === stripped.toUpperCase() && /[A-Z]/.test(stripped) && stripped.length < 40;

    for (const { key, re } of SECTION_DEFS) {
        if (re.test(stripped)) {
            // Extra confidence if it's short or ALL CAPS
            if (stripped.length < 40 || isAllCaps) return key;
            // If the line is longer, the keyword must be near the start
            const match = stripped.match(re);
            if (match && match.index < 5) return key;
        }
    }

    return null;
}

function splitIntoSections(text) {
    const lines = text.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);
    const sections = {
        header: [],
        education: [],
        experience: [],
        projects: [],
        skills: [],
        certifications: [],
        summary: [],
    };
    let current = 'header';
    let headerDone = false;

    for (const line of lines) {
        const sectionKey = isSectionHeader(line);
        if (sectionKey) {
            current = sectionKey;
            headerDone = true;
            continue; // don't push the header line itself into content
        }
        // Once we see any section header, header phase is over
        if (!headerDone) {
            sections.header.push(line);
        } else {
            sections[current].push(line);
        }
    }

    return sections;
}

// ═══════════════════════════════════════════════════
// REGEX PATTERNS (expanded)
// ═══════════════════════════════════════════════════

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;
const LINKEDIN_RE = /(?:linkedin\.com\/in\/[\w-]+)/i;
const GITHUB_RE = /(?:github\.com\/[\w-]+)/i;
const PORTFOLIO_RE = /(?:(?:https?:\/\/)?[\w-]+\.(?:com|io|dev|me|org|net)(?:\/\S*)?)/i;

// Expanded date range:  "Jan 2020 – May 2024", "2020–2024", "Aug 2019 - Present", "01/2020 - 12/2023"
const MONTH = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
const DATE_RANGE_RE = new RegExp(
    '(?:' +
    // Month Year – Month Year / Present
    `${MONTH}\\.?\\s*\\d{2,4}\\s*[-–—to]+\\s*(?:${MONTH}\\.?\\s*\\d{2,4}|Present|Current|Now|Ongoing)` +
    '|' +
    // MM/YYYY – MM/YYYY
    `\\d{1,2}\\/\\d{4}\\s*[-–—to]+\\s*(?:\\d{1,2}\\/\\d{4}|Present|Current)` +
    '|' +
    // YYYY – YYYY
    `\\d{4}\\s*[-–—to]+\\s*(?:\\d{4}|Present|Current)` +
    ')',
    'i'
);

const DEGREE_RE = /\b(?:Bachelor|Master|Doctor|Associate|Diploma|B\.?S\.?c?|B\.?A\.?|B\.?E\.?|B\.?Tech|M\.?S\.?c?|M\.?A\.?|M\.?B\.?A\.?|M\.?E\.?|M\.?Tech|Ph\.?D\.?|A\.?A\.?|A\.?S\.?)\b/i;
const LOCATION_RE = /([A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|[A-Z][a-z]+))\s*$/;
const BULLET_RE = /^[•\-–—*▪▸►◦○⬥✦✓→]\s|^\d+[.)]\s/;
const GPA_RE = /\b(?:GPA|CGPA|Grade)\s*:?\s*[\d.]+(?:\s*\/\s*[\d.]+)?\b/i;

// ═══════════════════════════════════════════════════
// PERSONAL INFO PARSING (improved)
// ═══════════════════════════════════════════════════

function parsePersonal(headerLines) {
    const personal = { name: '', phone: '', email: '', linkedin: '', github: '' };
    const allText = headerLines.join(' ');

    // Extract structured fields from all header text
    const emailMatch = allText.match(EMAIL_RE);
    if (emailMatch) personal.email = emailMatch[0];

    const phoneMatch = allText.match(PHONE_RE);
    if (phoneMatch) personal.phone = phoneMatch[0].trim();

    const linkedinMatch = allText.match(LINKEDIN_RE);
    if (linkedinMatch) personal.linkedin = linkedinMatch[0];

    const githubMatch = allText.match(GITHUB_RE);
    if (githubMatch) personal.github = githubMatch[0];

    // Name: first line that isn't just contact info
    // In most resumes, the name is the first line and is the longest non-contact text
    for (const line of headerLines) {
        let cleaned = line;
        // Strip out all known contact patterns
        cleaned = cleaned.replace(EMAIL_RE, '');
        cleaned = cleaned.replace(PHONE_RE, '');
        cleaned = cleaned.replace(LINKEDIN_RE, '');
        cleaned = cleaned.replace(GITHUB_RE, '');
        cleaned = cleaned.replace(PORTFOLIO_RE, '');
        cleaned = cleaned.replace(/https?:\/\/\S+/gi, '');
        cleaned = cleaned.replace(/[|·•,\-–—]/g, '').trim();

        // Name is usually 2-50 chars, no digits
        if (cleaned.length >= 2 && cleaned.length < 50 && !/\d{3}/.test(cleaned) && !cleaned.includes('@')) {
            personal.name = cleaned;
            break;
        }
    }

    return personal;
}

// ═══════════════════════════════════════════════════
// EDUCATION PARSING (improved)
// ═══════════════════════════════════════════════════

function parseEducation(lines) {
    if (lines.length === 0) return [{ school: '', degree: '', location: '', dates: '', coursework: '' }];

    const entries = [];
    let current = null;

    const newEntry = () => ({ school: '', degree: '', location: '', dates: '', coursework: '' });

    for (const line of lines) {
        const dateMatch = line.match(DATE_RANGE_RE);
        const hasDegree = DEGREE_RE.test(line);
        const isBullet = BULLET_RE.test(line);
        const gpaMatch = line.match(GPA_RE);

        // New entry on degree keyword or first date
        if (hasDegree || (dateMatch && !current)) {
            if (current) entries.push(current);
            current = newEntry();
        }

        if (!current) current = newEntry();

        // Dates
        if (dateMatch) {
            current.dates = dateMatch[0];
        }

        // Location: "City, State" pattern
        const locMatch = line.match(LOCATION_RE);
        if (locMatch && !current.location) {
            current.location = locMatch[1].trim();
        }

        // Degree line
        if (hasDegree) {
            let degreeLine = line
                .replace(DATE_RANGE_RE, '')
                .replace(LOCATION_RE, '')
                .replace(/[|·•]/g, '')
                .trim();
            current.degree = degreeLine;
        } else if (gpaMatch) {
            // GPA line — append to coursework
            current.coursework = (current.coursework ? current.coursework + ' | ' : '') + gpaMatch[0];
        } else if (/\b(coursework|courses|relevant)\b/i.test(line)) {
            current.coursework = line.replace(/.*?(?:coursework|courses|relevant\s*coursework)\s*[:–—\-]?\s*/i, '').trim();
        } else if (!isBullet && !current.school && !dateMatch && line.length > 2 && line.length < 100) {
            // School name
            current.school = line.replace(DATE_RANGE_RE, '').replace(LOCATION_RE, '').replace(/[|·•]/g, '').trim();
        } else if (isBullet) {
            // Bullets in education = coursework or activities
            const bulletText = line.replace(BULLET_RE, '').trim();
            if (/\b(coursework|courses)\b/i.test(bulletText)) {
                current.coursework = bulletText.replace(/.*?(?:coursework|courses)\s*[:–—\-]?\s*/i, '').trim();
            } else if (current.coursework) {
                current.coursework += ', ' + bulletText;
            }
        }
    }

    if (current) entries.push(current);
    return entries.length > 0 ? entries : [newEntry()];
}

// ═══════════════════════════════════════════════════
// EXPERIENCE PARSING (improved)
// ═══════════════════════════════════════════════════

function parseExperience(lines) {
    if (lines.length === 0) return [{ title: '', company: '', location: '', dates: '', bullets: [''] }];

    const entries = [];
    let current = null;

    const newEntry = () => ({ title: '', company: '', location: '', dates: '', bullets: [] });

    // Pass 1: identify entry boundaries (lines with dates that aren't bullets)
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const dateMatch = line.match(DATE_RANGE_RE);
        const isBullet = BULLET_RE.test(line);
        const locMatch = line.match(LOCATION_RE);

        if (isBullet) {
            // Bullet → add to current entry
            if (!current) current = newEntry();
            current.bullets.push(line.replace(BULLET_RE, '').trim());
            continue;
        }

        if (dateMatch) {
            // Date line → may be a new entry or second line of current entry
            const isNewEntry = !current || current.dates;
            if (isNewEntry) {
                if (current) entries.push(current);
                current = newEntry();
            }
            current.dates = dateMatch[0];

            // Extract location from this line
            if (locMatch) current.location = locMatch[1].trim();

            // Extract title/company from the non-date part
            const rest = line.replace(dateMatch[0], '').replace(LOCATION_RE, '').replace(/[|·•]/g, '').trim();
            if (rest) {
                assignTitleCompany(current, rest);
            }
            continue;
        }

        // Non-bullet, non-date line
        if (!current) {
            // Start a new entry with this as title/company
            current = newEntry();
            if (locMatch) current.location = locMatch[1].trim();
            const rest = line.replace(LOCATION_RE, '').replace(/[|·•]/g, '').trim();
            if (rest) assignTitleCompany(current, rest);
        } else if (!current.title || !current.company) {
            // Second line of an entry — fill in missing title/company
            if (locMatch && !current.location) current.location = locMatch[1].trim();
            const rest = line.replace(LOCATION_RE, '').replace(/[|·•]/g, '').trim();
            if (rest) {
                if (!current.title) {
                    assignTitleCompany(current, rest);
                } else if (!current.company) {
                    current.company = rest;
                }
            }
        }
    }

    if (current) {
        if (current.bullets.length === 0) current.bullets = [''];
        entries.push(current);
    }

    // Ensure all entries have at least one bullet
    entries.forEach(e => { if (e.bullets.length === 0) e.bullets = ['']; });

    return entries.length > 0 ? entries : [newEntry()];
}

function assignTitleCompany(entry, text) {
    // Try to split "Title at Company", "Title — Company", "Title, Company", "Title | Company"
    const splitters = [
        /\s+at\s+/i,
        /\s*[|–—]\s*/,
        /,\s+(?=[A-Z])/,     // comma followed by capital letter
    ];
    for (const splitter of splitters) {
        const parts = text.split(splitter);
        if (parts.length >= 2) {
            entry.title = parts[0].trim();
            entry.company = parts.slice(1).join(' ').trim();
            return;
        }
    }
    // Couldn't split — use as title if empty, otherwise company
    if (!entry.title) {
        entry.title = text;
    } else if (!entry.company) {
        entry.company = text;
    }
}

// ═══════════════════════════════════════════════════
// PROJECTS PARSING (improved)
// ═══════════════════════════════════════════════════

function parseProjects(lines) {
    if (lines.length === 0) return [{ name: '', tech: '', bullets: [''] }];

    const entries = [];
    let current = null;

    const newEntry = () => ({ name: '', tech: '', bullets: [] });

    for (const line of lines) {
        const isBullet = BULLET_RE.test(line);
        const dateMatch = line.match(DATE_RANGE_RE);

        if (isBullet) {
            if (!current) current = newEntry();
            current.bullets.push(line.replace(BULLET_RE, '').trim());
            continue;
        }

        // Non-bullet line → project header
        if (line.length > 2 && line.length < 120) {
            if (current && (current.name || current.bullets.length > 0)) {
                entries.push(current);
            }
            current = newEntry();

            // Extract tech from "Project Name | Tech1, Tech2" or "Project Name (Tech1, Tech2)"
            let rest = line;
            if (dateMatch) rest = rest.replace(dateMatch[0], '').trim();

            // Parenthetical tech
            const parenMatch = rest.match(/\(([^)]+)\)\s*$/);
            if (parenMatch) {
                current.tech = parenMatch[1].trim();
                rest = rest.replace(parenMatch[0], '').trim();
            }

            // Pipe/dash separated tech
            const pipeMatch = rest.match(/^(.+?)\s*[|–—]\s*(.+)$/);
            if (pipeMatch) {
                current.name = pipeMatch[1].trim();
                if (!current.tech) current.tech = pipeMatch[2].trim();
            } else {
                current.name = rest.replace(/[|·•]/g, '').trim();
            }
        }
    }

    if (current) {
        if (current.bullets.length === 0) current.bullets = [''];
        entries.push(current);
    }

    entries.forEach(e => { if (e.bullets.length === 0) e.bullets = ['']; });

    return entries.length > 0 ? entries : [newEntry()];
}

// ═══════════════════════════════════════════════════
// SKILLS PARSING (improved)
// ═══════════════════════════════════════════════════

function parseSkills(lines) {
    if (lines.length === 0) return [{ category: '', items: '' }];

    const entries = [];

    for (const line of lines) {
        // "Category: item1, item2" or "Category — item1, item2"
        const colonMatch = line.match(/^([^:–—]+?)\s*[:–—]\s*(.+)$/);
        if (colonMatch) {
            const category = colonMatch[1].replace(BULLET_RE, '').replace(/[•\-*]/g, '').trim();
            const items = colonMatch[2].trim();
            if (category && items) {
                entries.push({ category, items });
                continue;
            }
        }

        // Bullet list of skills → append to last entry or create new
        if (BULLET_RE.test(line)) {
            const skillText = line.replace(BULLET_RE, '').trim();
            if (entries.length > 0) {
                entries[entries.length - 1].items += ', ' + skillText;
            } else {
                entries.push({ category: 'Skills', items: skillText });
            }
        } else if (line.length > 3) {
            entries.push({ category: '', items: line.replace(/^[•\-–—*]\s*/, '').trim() });
        }
    }

    return entries.length > 0 ? entries : [{ category: '', items: '' }];
}

// ═══════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════

export async function parseResume(file) {
    const rawText = await extractText(file);
    console.log('[ResumeParser] Extracted text:\n', rawText);

    const sections = splitIntoSections(rawText);
    console.log('[ResumeParser] Sections:', sections);

    // Merge summary into header if summary was detected
    if (sections.summary.length > 0) {
        sections.header.push(...sections.summary);
    }

    const result = {
        personal: parsePersonal(sections.header),
        education: parseEducation(sections.education),
        experience: parseExperience(sections.experience),
        projects: parseProjects(sections.projects),
        skills: parseSkills(sections.skills),
    };

    console.log('[ResumeParser] Final result:', result);
    return result;
}
