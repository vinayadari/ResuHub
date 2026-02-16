# ResuHub — AI Resume Analyzer

> **Professional Resume Intelligence Platform** — Upload, analyze, and optimize your resumes with AI-powered ATS scoring and actionable feedback.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Dashboard** | Overview with stat cards (avg ATS score, top score, total resumes, profile views), performance chart, quick actions, and recent resumes |
| **Resume Upload** | Drag-and-drop or browse file upload supporting PDF, DOC, and DOCX formats (max 10 MB) |
| **AI Review** | Select a resume and receive instant AI-powered feedback — strengths and areas for improvement |
| **All Resumes** | Browse and manage every uploaded resume in a searchable list |
| **Resume Detail** | Deep-dive into a single resume — ATS score, keyword detection, and section-by-section analysis |
| **Version Tracking** | Compare resume versions side-by-side and track score improvements over time |

---

## 🛠️ Tech Stack

### Frontend (`frontend/resuhub/`)

- **Framework** — [React 18](https://react.dev/) (JSX)
- **Build Tool** — [Vite 5](https://vitejs.dev/)
- **Styling** — [Tailwind CSS 3](https://tailwindcss.com/) with custom Inter font family
- **Routing** — [React Router v6](https://reactrouter.com/)
- **Icons** — [Lucide React](https://lucide.dev/)

### Backend (`backend/`)

| Service | Stack | Key Dependencies |
|---|---|---|
| **Node API** (`backend/node/`) | Express 5 | `cors`, `dotenv`, `mongodb` |
| **Python API** (`backend/fastapi/`) | FastAPI | — |

---

## 📁 Project Structure

```
Ai Resume Analyzer/
├── frontend/
│   └── resuhub/               # Vite + React SPA
│       ├── src/
│       │   ├── App.jsx        # Routes & page components
│       │   ├── main.jsx       # Entry point
│       │   ├── index.css      # Global styles
│       │   ├── App.css        # App-level styles
│       │   ├── components/    # Reusable UI components
│       │   │   ├── Navigation.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Statcard.jsx
│       │   │   ├── Performancechart.jsx
│       │   │   ├── Quickactions.jsx
│       │   │   ├── Recentresumes.jsx
│       │   │   ├── Resumecard.jsx
│       │   │   ├── Welcomeheader.jsx
│       │   │   └── index.js   # Barrel exports
│       │   ├── assets/
│       │   └── libs/
│       ├── index.html
│       ├── tailwind.config.js
│       ├── vite.config.js
│       └── package.json
├── backend/
│   ├── node/                  # Express + MongoDB API
│   │   └── package.json
│   └── fastapi/               # Python FastAPI service
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. Clone the Repository

```bash
git clone <repo-url>
cd "Ai Resume Analyzer"
```

### 2. Install Frontend Dependencies

```bash
cd frontend/resuhub
npm install
```

### 3. Run the Dev Server

```bash
npm run dev
```

The app opens automatically at **http://localhost:5173**.

### 4. Build for Production

```bash
npm run build
```

Output is written to `frontend/resuhub/dist/`.

---

## 🔌 Backend Setup

### Node.js API

```bash
cd backend/node
npm install
# Create a .env file with your MongoDB connection string
node index.js
```

### FastAPI (Python)

```bash
cd backend/fastapi
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| **Dev** | `npm run dev` | Start Vite dev server with hot reload |
| **Build** | `npm run build` | Create optimized production build |
| **Preview** | `npm run preview` | Preview the production build locally |
| **Lint** | `npm run lint` | Run ESLint across JS/JSX files |

---

## 🎨 Design Language

- **Color palette** — Indigo / purple / pink gradients on a dark slate background
- **Typography** — Inter (Google Fonts) with system-ui fallback
- **UI patterns** — Glassmorphism cards, gradient badges, smooth hover transitions, animated stat counters
- **Layout** — Responsive grid system with a sticky frosted-glass navigation bar

---

## 📄 License

This project is for personal / educational use.
