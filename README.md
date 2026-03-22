# PathForge AI

**From where you are to where you want to be.**

PathForge AI is an AI-powered career recommendation platform that analyzes your resume and generates a personalized career roadmap, skill gap analysis, and structured learning plan tailored to your profile.

---

## Features

- **Resume Analysis** — Upload a PDF or DOCX resume and extract skills automatically using keyword frequency scoring
- **Career Recommendations** — ML pipeline predicts the top 3 career matches with confidence scores
- **Skill Gap Analysis** — Visual comparison of your current skill levels against industry requirements for your best-matched career
- **Personalized Roadmap** — Month-by-month learning plan with curated course recommendations prioritized by market demand
- **Explainable AI** — SHAP-based reasoning that explains why a specific career was recommended
- **Market Insights** — Career demand scores and average salary data sourced from a jobs dataset
- **Community Feed** — Share tips, resources, and experiences with other users; upvote posts; view trending skills across all analyses
- **Authentication** — Email/password signup, confirmation, password reset, and reauthentication with custom branded email templates
- **Profile Management** — View resume history, delete resumes and their associated analyses, account management
- **Dark/Light Mode** — Full theme support with persistent preference

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| shadcn/ui + Radix UI | Component primitives |
| Framer Motion | Animations and transitions |
| Recharts | Skill gap bar charts |
| React Router v6 | Client-side routing with SPA rewrite fix |
| TanStack Query | Server state management |

### Backend

| Technology | Purpose |
|---|---|
| Python + FastAPI | ML API server |
| scikit-learn | Random Forest career classifier |
| SHAP | Explainable AI for career reasoning |
| pdfplumber | Resume text extraction |
| joblib | Model serialization and loading |
| pandas | Skill matrix and dataset operations |

### Infrastructure

| Technology | Purpose |
|---|---|
| Supabase | PostgreSQL database, Auth, Storage, Edge Functions |
| Vercel | Frontend deployment |
| Render | FastAPI backend deployment (Singapore region) |

---

## Architecture

```
User Browser (React — Vercel)
         |
         | supabase.functions.invoke("analyze-resume")
         v
Supabase Edge Function (Deno)
  1. Authenticate user via JWT
  2. Download resume blob from Supabase Storage
  3. POST multipart/form-data to FastAPI /analyze
  4. Transform ML response into frontend data shapes
  5. Insert into analyses table (JSONB)
  6. Update profiles and resumes tables
         |
         |---> Supabase PostgreSQL
         |       - profiles
         |       - resumes
         |       - analyses
         |       - posts
         |       - post_upvotes
         |
         v
FastAPI Backend (Render)
  - Extract skills from resume text
  - TF-IDF -> SVD -> Random Forest predict top 3 careers
  - Calculate skill gap against career_skill_matrix
  - Compute priority scores (gap x market demand)
  - Generate monthly learning roadmap
  - SHAP explainability pass
  - Job market insights from jobs_dataset.csv
```

---

## Project Structure

```
pathforge-ai/
|
|-- frontend/
|   |-- public/
|   |   |-- logo.svg
|   |   |-- favicon.svg
|   |   `-- robots.txt
|   |
|   |-- src/
|   |   |-- components/
|   |   |   |-- dashboard/
|   |   |   |   |-- RecommendedPath.tsx
|   |   |   |   |-- SkillGapAnalysis.tsx
|   |   |   |   |-- LearningRoadmap.tsx
|   |   |   |   `-- WhyThisPath.tsx
|   |   |   |-- ui/                     (shadcn/ui components)
|   |   |   |-- Navbar.tsx
|   |   |   |-- Footer.tsx
|   |   |   |-- Layout.tsx
|   |   |   `-- ProtectedRoute.tsx
|   |   |
|   |   |-- contexts/
|   |   |   |-- AuthContext.tsx
|   |   |   `-- AnalysisContext.tsx
|   |   |
|   |   |-- pages/
|   |   |   |-- LandingPage.tsx
|   |   |   |-- LoginPage.tsx
|   |   |   |-- UploadPage.tsx
|   |   |   |-- DashboardPage.tsx
|   |   |   |-- CommunityPage.tsx
|   |   |   |-- ProfilePage.tsx
|   |   |   `-- ResetPasswordPage.tsx
|   |   |
|   |   |-- integrations/
|   |   |   `-- supabase/
|   |   |       |-- client.ts
|   |   |       `-- types.ts
|   |   |
|   |   |-- lib/
|   |   |   |-- utils.ts
|   |   |   `-- theme.tsx
|   |   |
|   |   |-- hooks/
|   |   |   |-- use-toast.ts
|   |   |   `-- use-mobile.tsx
|   |   |
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |   `-- index.css
|   |
|   |-- supabase/
|   |   |-- functions/
|   |   |   `-- analyze-resume/
|   |   |       `-- index.ts
|   |   `-- migrations/
|   |       `-- 20260304065119_*.sql
|   |
|   |-- index.html
|   |-- vercel.json
|   |-- tailwind.config.ts
|   `-- vite.config.ts
|
`-- backend/
    |-- main.py
    |-- resume_parser.py
    |-- skills_list.py
    |-- report_generator.py
    |-- explainable_ai.py
    |-- job_analyzer.py
    |-- industry_analyzer.py
    |-- train_model.py
    |
    |-- engine/
    |   |-- model_loader.py
    |   |-- recommendation_engine.py
    |   |-- skill_gap_engine.py
    |   `-- roadmap_generator.py
    |
    |-- models/
    |   |-- career_model.pkl
    |   |-- career_similarity_model.pkl
    |   |-- career_skill_matrix.pkl
    |   |-- label_encoder.pkl
    |   |-- learning_resource_model.pkl
    |   |-- skill_demand_model.pkl
    |   |-- skill_difficulty_model.pkl
    |   |-- skill_priority_model.pkl
    |   |-- shap_model.pkl
    |   |-- shap_mlb.pkl
    |   |-- svd_model.pkl
    |   `-- tfidf_vectorizer.pkl
    |
    `-- data/
        |-- dataset.csv
        `-- jobs_dataset.csv
```

---

## ML Pipeline

**Step 1 — Skill Extraction**

`resume_parser.py` opens the PDF with `pdfplumber`, extracts raw text, then scans for known skills from `skills_list.py`. Each skill is assigned a confidence weight based on mention frequency (0.7 for 1 mention, 0.8 for 2, 0.9 for 3+).

**Step 2 — Career Prediction**

The user's skill dictionary is converted to a weighted skill text string, transformed via TF-IDF vectorizer, reduced with SVD, then passed through a trained Random Forest classifier. The top 3 predicted careers are returned with probability scores.

**Step 3 — Skill Gap Calculation**

`skill_gap_engine.py` looks up the required skill levels for the best-matched career from `career_skill_matrix.pkl` and subtracts the user's current skill levels. The top 6 gaps are returned sorted by magnitude.

**Step 4 — Priority Scoring**

Each skill gap is multiplied by its market demand score from `skill_demand_model.pkl` to produce a priority score, ensuring the learning plan focuses on high-impact skills first.

**Step 5 — Roadmap Generation**

`roadmap_generator.py` maps priority skills to courses using `learning_resource_model.pkl`, with fallbacks for common skills not in the trained model. Skills are grouped two per month.

**Step 6 — Explainability**

`explainable_ai.py` uses SHAP TreeExplainer on the career model to identify which skills most strongly drove the top career prediction, returning human-readable reasons for the recommendation.

---

## Database Schema

```sql
-- Auto-created on user signup
profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  full_name text,
  role text,
  education text,
  created_at timestamptz,
  updated_at timestamptz
)

-- Resume upload records
resumes (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  file_name text,
  file_path text,
  status text,  -- pending | analyzing | analyzed | failed
  created_at timestamptz
)

-- ML pipeline results stored as JSONB
analyses (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  resume_id uuid REFERENCES resumes,
  recommended_path jsonb,
  skill_gap jsonb,
  learning_plan jsonb,
  explanation jsonb,
  career_recommendations jsonb,
  career_insight jsonb,
  industry_insight jsonb,
  created_at timestamptz
)

-- Community posts
posts (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  content text,  -- max 280 chars
  tag text,      -- Resource | Tip | Experience | Question
  upvote_count integer DEFAULT 0,
  created_at timestamptz
)

-- One upvote per user per post
post_upvotes (
  id uuid PRIMARY KEY,
  post_id uuid REFERENCES posts,
  user_id uuid REFERENCES auth.users,
  created_at timestamptz,
  UNIQUE (post_id, user_id)
)
```

---

## Local Development

### Prerequisites

- Node.js 20+
- Python 3.10+
- Supabase account

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

```bash
npm run dev
```

### Backend

```bash
cd backend
pip install fastapi uvicorn pdfplumber scikit-learn shap pandas joblib python-multipart
uvicorn api:app --reload
```

### Supabase Setup

1. Run the migration file in `frontend/supabase/migrations/` via the Supabase SQL editor
2. Create a storage bucket named `resumes` (private)
3. Add the following secret to your Edge Function environment:

```
ML_API_BASE_URL=https://your-render-backend-url
```

### Vercel

The `frontend/vercel.json` file contains a rewrite rule to handle client-side routing on direct URL access or page refresh:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render (Singapore region) |
| Database / Auth / Storage | Supabase |

---

## Team

| Name | Contribution |
|---|---|
| Ankan Chatterjee | Full stack development, ML integration, deployment |
| Abin Mukherjee | Backend, ML pipeline |
| Pritam Kundu | Backend, ML pipeline |
| Saptarshi Giri | Model Training |
| Shruti Dasgupta | Model Training |

---

## License

This project was built for academic purposes.
