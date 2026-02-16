const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configure Multer for memory storage (files are processed immediately)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp"
});

/**
 * POST /api/ai/analyze
 * expecting 'file' field with PDF
 */
router.post('/analyze', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log(`Processing AI analysis for: ${req.file.originalname}`);

        // 1. Extract Text from PDF
        let text = '';
        if (req.file.mimetype === 'application/pdf') {
            const data = await pdf(req.file.buffer);
            text = data.text;
        } else {
            // Fallback for text files (if supported later)
            text = req.file.buffer.toString('utf-8');
        }

        if (!text || text.length < 50) {
            return res.status(400).json({ error: 'Could not extract enough text from resume.' });
        }

        console.log(`Extracted ${text.length} chars. Sending to Gemini...`);

        // 2. Prompt Engineering
        const prompt = `
        You are an expert ATS (Applicant Tracking System) and Career Coach. 
        Analyze the following resume text deeply and strictly return a JSON object. 
        Do not return markdown formatting (no backticks), just the raw valid JSON.

        Resume Text:
        ${text}

        Required JSON Structure:
        {
            "ats_score": (integer 0-100),
            "score_breakdown": {
                "impact": (integer 0-100),
                "brevity": (integer 0-100),
                "style": (integer 0-100),
                "structure": (integer 0-100)
            },
            "executive_summary": (string, 2-3 sentences max),
            "strengths": [(string), (string), ...],
            "weaknesses": [(string), (string), ...],
            "improvements": [
                { "section": (string), "suggestion": (string) },
                ...
            ],
            "keywords_detected": [(string), ...],
            "missing_keywords": [(string), ...]
        }

        Focus on impact, metrics, formatting errors, and keyword optimization.
        `;

        // 3. Call Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();

        // 4. Clean and Parse JSON
        // Remove markdown code blocks if Gemini includes them
        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const analysis = JSON.parse(cleanJson);
            res.json(analysis);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Raw Gemini Response:', rawText);
            res.status(500).json({ error: 'AI analysis failed to return valid JSON', raw: rawText });
        }

    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
