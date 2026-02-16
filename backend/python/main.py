import os
import json
import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pypdf import PdfReader
from dotenv import load_dotenv

# Load env
load_dotenv()

# Load env variables
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))

FRONTEND_URL = os.getenv("FRONTEND_URL")
FRONTEND_URL_ALT = os.getenv("FRONTEND_URL_ALT")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Validate critical API key
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env")

# Validate CORS configuration
if not FRONTEND_URL and not FRONTEND_URL_ALT:
    raise ValueError("At least one FRONTEND_URL must be configured in .env")

# Create FastAPI app
app = FastAPI()

# Configure CORS from env
origins = [url for url in [FRONTEND_URL, FRONTEND_URL_ALT] if url]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)


@app.get("/")
def read_root():
    return {
        "status": "AI Service Running",
        "model": GEMINI_MODEL
    }


@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    try:

        # Validate file
        if file.content_type != "application/pdf":
            raise HTTPException(400, "Only PDF files are supported")

        # Read PDF
        content = await file.read()
        pdf_file = io.BytesIO(content)
        reader = PdfReader(pdf_file)

        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""

        if len(text) < 50:
            raise HTTPException(400, "Could not extract enough text")

        print(f"Extracted {len(text)} chars")

        # Prompt
        prompt = f"""
You are a HIGHLY CRITICAL expert ATS (Applicant Tracking System) and Senior Career Coach with 15+ years of experience. 
You have reviewed thousands of resumes and have VERY HIGH STANDARDS.

EVALUATION PHILOSOPHY:
- Be STRICT and RIGOROUS in your assessment
- Identify EVERY flaw, weakness, and missed opportunity
- Most resumes are mediocre (scores 40-65) - only exceptional ones deserve 80+
- A score of 70+ means the resume is truly impressive
- Generic content, vague descriptions, and missing metrics should be heavily penalized
- Do not be lenient or encouraging - be brutally honest

Resume Text:
{text[:15000]}

Required JSON Structure:
{{
    "ats_score": (integer 0-100, be STRICT - most resumes score 40-85),
    "score_breakdown": {{
        "impact": (integer 0-100, penalize lack of metrics and quantifiable achievements),
        "brevity": (integer 0-100, penalize wordiness and fluff),
        "style": (integer 0-100, penalize generic language and buzzwords),
        "structure": (integer 0-100, penalize poor formatting and organization)
    }},
    "executive_summary": (string, 2-3 sentences - be CRITICAL and direct about major issues),
    "strengths": [(string), (string), ... - only list GENUINE strengths, 2-3 max],
    "weaknesses": [(string), (string), ... - be THOROUGH, list 5-8 specific weaknesses],
    "improvements": [
        {{ "section": (string), "suggestion": (string - be SPECIFIC and actionable) }},
        ... - provide 6-10 concrete improvements
    ],
    "keywords_detected": [(string), ... - only industry-relevant technical keywords],
    "missing_keywords": [(string), ... - critical keywords that SHOULD be present]
}}

SCORING GUIDELINES:
- 0-30: Severely flawed, unprofessional, or incomplete
- 31-50: Below average, multiple major issues
- 51-65: Average, needs significant improvement
- 66-75: Above average, some good elements but clear weaknesses
- 76-85: Strong resume with minor improvements needed
- 86-95: Excellent, professional, compelling
- 96-100: Near perfect, exceptional (VERY RARE)

Focus on: quantifiable impact, action verbs, ATS optimization, formatting consistency, keyword density, and professional presentation.
Be HARSH on generic statements, missing metrics, and vague descriptions.
"""

        # Call Gemini using env model with deterministic settings
        # Generate a consistent seed from the resume text hash
        import hashlib
        text_hash = hashlib.md5(text.encode()).hexdigest()
        seed = int(text_hash[:8], 16) % (2**31)  # Convert hash to integer seed
        
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.0,  # Deterministic output
                top_p=1.0,        # No nucleus sampling
                top_k=1,          # Only select the most likely token
                seed=seed         # Consistent seed for same resume
            )
        )

        raw_text = response.text

        clean_json = raw_text.replace("```json", "").replace("```", "").strip()

        return json.loads(clean_json)

    except json.JSONDecodeError:
        return {
            "error": "Invalid JSON from Gemini",
            "raw": raw_text
        }

    except Exception as e:
        raise HTTPException(500, str(e))


# Run server using env HOST and PORT
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=True
    )
