# Vercel Deployment Guide - AI Resume Analyzer

Complete guide to deploy the AI Resume Analyzer application to Vercel.

## Architecture Overview

The application uses a **monorepo structure** - all code lives in a single GitHub repository, but deploys as 3 separate Vercel projects:

1. **Frontend** - Vite React application (`frontend/resuhub/`)
2. **Node.js Backend** - Express API for Supabase operations (`backend/node/`)
3. **Python Backend** - FastAPI for AI resume analysis (`backend/python/`)

Each Vercel project points to the same repository but uses a different **Root Directory** setting. This allows you to:
- ✅ Manage all code in one place
- ✅ Deploy everything with a single `git push`
- ✅ Keep environment configurations separate per service

---

## Prerequisites

- [Vercel Account](https://vercel.com/signup) (free tier works)
- [Vercel CLI](https://vercel.com/docs/cli) installed: `npm i -g vercel`
- Git repository (GitHub, GitLab, or Bitbucket)
- Supabase project with configured storage and database
- Google Gemini API key

---

## Deployment Methods

You can deploy using either method:

### **Method 1: Vercel CLI** (Recommended - Used in this guide)
- Navigate to each directory and run `vercel`
- Automatically sets the correct root directory
- Faster for initial setup

### **Method 2: Vercel Dashboard UI**
- Import the same GitHub repository 3 times
- Manually configure **Root Directory** for each project:
  - Frontend: `frontend/resuhub`
  - Node Backend: `backend/node`
  - Python Backend: `backend/python`
- Better for team collaboration and CI/CD setup

This guide uses **Method 1 (CLI)** for simplicity.

---

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

From the **root directory** of your project (the `Ai Resume Analyzer` folder):

```bash
cd "Ai Resume Analyzer"
git init
git add .
git commit -m "Initial commit - prepare for Vercel deployment"
```

> **Note:** This creates a **single repository** containing all three services (frontend, Node backend, Python backend).

### 1.2 Push to GitHub

Create a new repository on GitHub and push your **entire monorepo**:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-resume-analyzer.git
git branch -M main
git push -u origin main
```

> **Important:** You'll use this **same repository** for all 3 Vercel projects. Each project will just point to a different subdirectory.

---

## Step 2: Deploy Python Backend (AI Service)

Deploy this **FIRST** because you'll need its URL for the frontend.

### 2.1 Navigate to Python Backend

```bash
cd backend/python
```

### 2.2 Deploy to Vercel

```bash
vercel
```

> **How it works:** By running `vercel` from the `backend/python` directory, Vercel automatically sets this as the **Root Directory** for this project. You don't need to manually configure it in the dashboard.

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name:** `ai-resume-analyzer-python` (or your choice)
- **Directory:** `./`
- **Override settings?** No

### 2.3 Set Environment Variables

In the Vercel dashboard for this project, go to **Settings > Environment Variables** and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `GEMINI_API_KEY` | Your Gemini API key | Production, Preview, Development |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Production, Preview, Development |
| `FRONTEND_URL` | (will add after frontend deployment) | Production |
| `FRONTEND_URL_ALT` | `http://localhost:5173` | Development |

### 2.4 Redeploy

After setting environment variables:

```bash
vercel --prod
```

### 2.5 Save the URL

Copy your Python API URL (e.g., `https://ai-resume-analyzer-python.vercel.app`)

---

## Step 3: Deploy Node.js Backend (Supabase Service)

### 3.1 Navigate to Node.js Backend

```bash
cd ../node
```

### 3.2 Deploy to Vercel

```bash
vercel
```

> **Note:** Running `vercel` from `backend/node` automatically configures this directory as the Root Directory for this Vercel project.

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name:** `ai-resume-analyzer-node` (or your choice)
- **Directory:** `./`
- **Override settings?** No

### 3.3 Set Environment Variables

In the Vercel dashboard, go to **Settings > Environment Variables** and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key | Production, Preview, Development |
| `GEMINI_API_KEY` | Your Gemini API key | Production, Preview, Development |
| `GEMINI_MODEL` | `gemini-2.0-flash-exp` | Production, Preview, Development |
| `FRONTEND_URL` | (will add after frontend deployment) | Production |
| `FRONTEND_URL_ALT` | `http://localhost:5173` | Development |

### 3.4 Redeploy

```bash
vercel --prod
```

### 3.5 Save the URL

Copy your Node.js API URL (e.g., `https://ai-resume-analyzer-node.vercel.app`)

---

## Step 4: Deploy Frontend

### 4.1 Navigate to Frontend

```bash
cd ../../frontend/resuhub
```

### 4.2 Update Environment Variables

Create/update `.env.production` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_NODE_API_BASE=https://ai-resume-analyzer-node.vercel.app/api
VITE_PYTHON_API_BASE=https://ai-resume-analyzer-python.vercel.app
```

### 4.3 Test Build Locally

```bash
npm run build
npm run preview
```

Verify the app works with production API URLs.

### 4.4 Deploy to Vercel

```bash
vercel
```

> **Note:** Running `vercel` from `frontend/resuhub` automatically configures this directory as the Root Directory for this Vercel project.

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name:** `ai-resume-analyzer` (or your choice)
- **Directory:** `./`
- **Override settings?** No

### 4.5 Set Environment Variables

In the Vercel dashboard, go to **Settings > Environment Variables** and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `VITE_NODE_API_BASE` | `https://ai-resume-analyzer-node.vercel.app/api` | Production |
| `VITE_PYTHON_API_BASE` | `https://ai-resume-analyzer-python.vercel.app` | Production |

### 4.6 Redeploy

```bash
vercel --prod
```

### 4.7 Save the URL

Copy your frontend URL (e.g., `https://ai-resume-analyzer.vercel.app`)

---

## Step 5: Update Backend CORS Settings

Now that you have the frontend URL, update the backend environment variables.

### 5.1 Update Python Backend

In Python backend Vercel project:
- Go to **Settings > Environment Variables**
- Add/Update `FRONTEND_URL` = `https://ai-resume-analyzer.vercel.app`
- Redeploy: `vercel --prod` (from `backend/python` directory)

### 5.2 Update Node.js Backend

In Node.js backend Vercel project:
- Go to **Settings > Environment Variables**
- Add/Update `FRONTEND_URL` = `https://ai-resume-analyzer.vercel.app`
- Redeploy: `vercel --prod` (from `backend/node` directory)

---

## Step 6: Configure Supabase Storage

### 6.1 Update Storage Policies

In Supabase dashboard, ensure your storage bucket has proper policies:

```sql
-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

-- Allow public downloads
CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');
```

### 6.2 Update CORS Settings

In Supabase dashboard > Storage > Configuration, add your Vercel domains:
- `https://ai-resume-analyzer.vercel.app`
- `https://ai-resume-analyzer-node.vercel.app`

---

## Step 7: Test Your Deployment

### 7.1 Test Frontend

Visit your frontend URL and verify:
- ✅ Page loads correctly
- ✅ Navigation works
- ✅ No console errors

### 7.2 Test Resume Upload

1. Go to **AI Review** page
2. Upload a PDF resume
3. Verify analysis completes
4. Check all sections populate:
   - ATS Score
   - Executive Summary
   - Strengths/Weaknesses
   - Recommendations

### 7.3 Test Resume Management

1. Go to **Resumes** page
2. Verify uploaded resumes appear
3. Test download functionality
4. Test delete functionality

### 7.4 Test Version History

1. Upload same resume multiple times
2. Go to **Versions** page
3. Verify version tracking works

---

## Troubleshooting

### Issue: CORS Errors

**Solution:** Ensure `FRONTEND_URL` is set correctly in both backend projects and redeploy.

### Issue: AI Analysis Fails

**Solution:** 
- Check `GEMINI_API_KEY` is set correctly in Python backend
- Verify API key has sufficient quota
- Check Python backend logs in Vercel dashboard

### Issue: File Upload Fails

**Solution:**
- Verify Supabase storage policies are configured
- Check `SUPABASE_SERVICE_KEY` is set in Node.js backend
- Ensure storage bucket exists and is public

### Issue: Environment Variables Not Working

**Solution:**
- After adding/updating env vars, always redeploy
- Ensure env vars are set for "Production" environment
- Check for typos in variable names

### Issue: Build Fails

**Solution:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

---

## Continuous Deployment

### Monorepo Benefits

Since all your code is in **one repository**, a single `git push` triggers deployments for all relevant services:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel automatically detects which services changed and redeploys only those projects:
- Changed `frontend/resuhub/`? → Frontend redeploys
- Changed `backend/node/`? → Node backend redeploys  
- Changed `backend/python/`? → Python backend redeploys

### Deployment Triggers

Once set up, Vercel will automatically deploy:
- **Production:** When you push to `main` branch
- **Preview:** When you create a pull request

### Configure Deployment Settings

To customize auto-deployment behavior:
- Go to each project's **Settings > Git**
- Configure deployment branches
- Set up ignored build paths (optional)

---

## Local Development After Deployment

Your local development setup still works! Just use:

```bash
# Frontend
cd frontend/resuhub
npm run dev

# Node.js Backend
cd backend/node
npm run dev

# Python Backend
cd backend/python
py main.py
```

Local `.env` files will be used for development.

---

## Cost Estimate

With Vercel's free tier:
- ✅ **Frontend:** Free (100 GB bandwidth/month)
- ✅ **Node.js Backend:** Free (100 GB bandwidth, 100 hours serverless)
- ✅ **Python Backend:** Free (100 GB bandwidth, 100 hours serverless)

**Total:** $0/month for moderate usage

---

## Next Steps

1. **Custom Domain:** Add a custom domain in Vercel dashboard
2. **Analytics:** Enable Vercel Analytics for insights
3. **Monitoring:** Set up error tracking (Sentry, etc.)
4. **CI/CD:** Add automated tests before deployment

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Gemini API Docs:** https://ai.google.dev/docs

---

**Deployment Complete! 🎉**

Your AI Resume Analyzer is now live and production-ready on Vercel.
