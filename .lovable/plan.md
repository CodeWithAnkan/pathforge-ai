

# PathForge AI — Implementation Plan

## Overview
A modern, production-grade AI-powered educational platform with a polished SaaS aesthetic (Coursera × Notion × Linear). Built with mock data and UI-only auth, ready for real backend integration later.

---

## 1. Design System & Theme
- Custom color palette with blue → purple gradient accents
- Glassmorphism effects (frosted glass cards, subtle transparency)
- Inter font, 16px+ rounded corners, soft shadows
- Dark mode toggle support
- Smooth micro-animations (hover effects, transitions, fade-ins)
- Clean dashboard aesthetic inspired by Vercel / Linear

## 2. Landing Page
- **Hero section** with animated gradient background and abstract AI-themed decorative elements (glowing path lines, neural network patterns via CSS/SVG)
- Large heading: *"Turn Your Resume Into a Career Roadmap"* with subtext
- Two CTA buttons: "Upload Resume" (primary gradient) and "See Demo" (secondary outline)
- Smooth scroll and subtle entrance animations

## 3. Resume Upload Flow
- Centered card with drag & drop upload zone (accepts PDF, DOCX visually)
- Upload progress bar animation
- Security note beneath the upload box
- After "upload": animated AI thinking state with pulsing indicator and loading text *"Analyzing your profile and building your roadmap…"*
- Transitions to the Results Dashboard with mock data after a short delay

## 4. Results Dashboard
**Left Sidebar:**
- Profile summary card (name, role, education from mock data)
- Quick stats: current level badge, recommended career path, animated confidence score (circular progress)

**Main Content with 4 Tabs:**

### Tab 1: Recommended Path
- Vertical timeline roadmap with 4 stages (Foundation → Core Skills → Advanced Skills → Industry Readiness)
- Each stage expandable with checklist-style tasks and estimated durations
- Progress indicators per stage

### Tab 2: Skill Gap Analysis
- Bar chart (using Recharts) comparing current skills vs. industry requirements
- Missing skills highlighted in red/destructive color
- Skill cards showing name, importance level, and reasoning

### Tab 3: Personalized Learning Roadmap
- Week-by-week structured learning plan
- Milestones and suggested topics
- Toggle between 3 Month / 6 Month / 1 Year plan views

### Tab 4: Why This Path?
- Clean paragraph-style AI explanation
- Styled quote/highlight box with reasoning
- Bullet points covering market demand, skill alignment, and growth trajectory

## 5. Auth Pages (UI Only)
- Login page with email/password form, social login buttons (visual only)
- Signup page with matching design
- No real authentication — just polished UI

## 6. Profile Page (UI Only)
- Uploaded resumes history list
- Saved roadmaps section
- "Download Roadmap as PDF" button (visual)
- "Refine Path" button (navigates back to upload)

## 7. Navigation & Layout
- Top navigation bar with logo, nav links (Home, Dashboard, Profile), and dark mode toggle
- Responsive layout — desktop-first with mobile-friendly breakpoints
- Smooth page transitions

## 8. Footer
- Clean footer with links: About, Privacy, Contact
- "Built with AI" branding badge

