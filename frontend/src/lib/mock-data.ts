export const mockProfile = {
  name: "Alex Johnson",
  role: "Junior Software Developer",
  education: "B.S. Computer Science, UC Berkeley",
  level: "Intermediate" as const,
  careerPath: "Full-Stack Engineer",
  confidenceScore: 78,
};

export const mockRoadmapStages = [
  {
    id: 1,
    title: "Foundation",
    duration: "4 weeks",
    progress: 100,
    tasks: [
      { label: "HTML & CSS Fundamentals", done: true },
      { label: "JavaScript ES6+ Essentials", done: true },
      { label: "Git & Version Control", done: true },
      { label: "Command Line Basics", done: true },
    ],
  },
  {
    id: 2,
    title: "Core Skills",
    duration: "8 weeks",
    progress: 60,
    tasks: [
      { label: "React.js & Component Architecture", done: true },
      { label: "Node.js & Express APIs", done: true },
      { label: "SQL & Database Design", done: false },
      { label: "RESTful API Design Patterns", done: false },
      { label: "TypeScript Fundamentals", done: false },
    ],
  },
  {
    id: 3,
    title: "Advanced Skills",
    duration: "8 weeks",
    progress: 0,
    tasks: [
      { label: "System Design Basics", done: false },
      { label: "CI/CD & DevOps Pipelines", done: false },
      { label: "Cloud Services (AWS/GCP)", done: false },
      { label: "Testing Strategies (Unit, Integration, E2E)", done: false },
    ],
  },
  {
    id: 4,
    title: "Industry Readiness",
    duration: "4 weeks",
    progress: 0,
    tasks: [
      { label: "Portfolio Projects", done: false },
      { label: "Mock Interviews & Coding Challenges", done: false },
      { label: "Open Source Contributions", done: false },
      { label: "Networking & Job Applications", done: false },
    ],
  },
];

export const mockSkillGap = [
  { skill: "React", current: 75, required: 90, importance: "Critical", reason: "Core framework for modern web apps" },
  { skill: "Node.js", current: 60, required: 85, importance: "High", reason: "Server-side JS is essential for full-stack roles" },
  { skill: "TypeScript", current: 30, required: 80, importance: "Critical", reason: "Industry standard for scalable codebases" },
  { skill: "SQL", current: 40, required: 75, importance: "High", reason: "Database management is fundamental" },
  { skill: "System Design", current: 15, required: 70, importance: "Medium", reason: "Required for mid-senior level interviews" },
  { skill: "DevOps", current: 10, required: 60, importance: "Medium", reason: "CI/CD knowledge accelerates team productivity" },
  { skill: "Testing", current: 20, required: 70, importance: "High", reason: "Quality assurance is non-negotiable in production" },
];

export const mockLearningPlan = {
  "3 Month": [
    { week: "Week 1–2", topic: "TypeScript Deep Dive", milestone: "Build a typed Express API" },
    { week: "Week 3–4", topic: "Advanced React Patterns", milestone: "Refactor a project with hooks & context" },
    { week: "Week 5–6", topic: "SQL & PostgreSQL", milestone: "Design and query a relational DB" },
    { week: "Week 7–8", topic: "REST API Best Practices", milestone: "Build a full CRUD API" },
    { week: "Week 9–10", topic: "Testing Fundamentals", milestone: "Add unit & integration tests" },
    { week: "Week 11–12", topic: "Portfolio & Interview Prep", milestone: "Deploy 2 polished projects" },
  ],
  "6 Month": [
    { week: "Month 1", topic: "TypeScript & Advanced JS", milestone: "Typed full-stack starter" },
    { week: "Month 2", topic: "React Ecosystem (Router, Query, Forms)", milestone: "Complex SPA" },
    { week: "Month 3", topic: "Backend & Databases", milestone: "REST + GraphQL APIs" },
    { week: "Month 4", topic: "DevOps & Cloud", milestone: "Deploy to AWS with CI/CD" },
    { week: "Month 5", topic: "System Design & Architecture", milestone: "Design doc for a scalable app" },
    { week: "Month 6", topic: "Portfolio, OSS & Job Prep", milestone: "3 deployed projects + resume" },
  ],
  "1 Year": [
    { week: "Q1", topic: "Core Fundamentals & TypeScript", milestone: "Strong foundation across stack" },
    { week: "Q2", topic: "Full-Stack Development", milestone: "End-to-end app with auth & DB" },
    { week: "Q3", topic: "Advanced Topics & Specialization", milestone: "Deep expertise in 1–2 areas" },
    { week: "Q4", topic: "Industry Readiness & Career", milestone: "Job offers & open source presence" },
  ],
};

export const mockExplanation = {
  quote: "Based on your background in Computer Science and experience with JavaScript, this Full-Stack Engineer path aligns with your existing strengths while strategically filling critical gaps in TypeScript, system design, and DevOps.",
  reasons: [
    { title: "Market Demand", description: "Full-stack engineers are among the most sought-after roles in tech, with a 34% increase in job postings over the past year. Companies prefer developers who can work across the entire stack." },
    { title: "Skill Alignment", description: "Your existing JavaScript and React knowledge provides a strong foundation. The recommended path builds on these skills rather than starting from scratch, maximizing your learning efficiency." },
    { title: "Growth Trajectory", description: "This path positions you for rapid career progression. Full-stack engineers typically advance to senior roles within 2-3 years and have clear paths to tech lead and architect positions." },
  ],
};

export const mockResumes = [
  { id: 1, name: "Alex_Johnson_Resume_2024.pdf", date: "2024-01-15", status: "Analyzed" },
  { id: 2, name: "Alex_Resume_v2.pdf", date: "2024-02-20", status: "Analyzed" },
];

export const mockSavedRoadmaps = [
  { id: 1, title: "Full-Stack Engineer Path", date: "2024-01-15", progress: 35 },
  { id: 2, title: "Frontend Specialist Path", date: "2024-02-20", progress: 10 },
];
