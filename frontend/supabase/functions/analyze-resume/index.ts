import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Mock analysis data — matches the frontend data shapes exactly
function getMockAnalysis() {
  return {
    profile: {
      name: "Alex Johnson",
      role: "Junior Software Developer",
      education: "B.S. Computer Science, UC Berkeley",
      level: "Intermediate",
      careerPath: "Full-Stack Engineer",
      confidenceScore: 78,
    },
    recommended_path: [
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
    ],
    skill_gap: [
      { skill: "React", current: 75, required: 90, importance: "Critical", reason: "Core framework for modern web apps" },
      { skill: "Node.js", current: 60, required: 85, importance: "High", reason: "Server-side JS is essential for full-stack roles" },
      { skill: "TypeScript", current: 30, required: 80, importance: "Critical", reason: "Industry standard for scalable codebases" },
      { skill: "SQL", current: 40, required: 75, importance: "High", reason: "Database management is fundamental" },
      { skill: "System Design", current: 15, required: 70, importance: "Medium", reason: "Required for mid-senior level interviews" },
      { skill: "DevOps", current: 10, required: 60, importance: "Medium", reason: "CI/CD knowledge accelerates team productivity" },
      { skill: "Testing", current: 20, required: 70, importance: "High", reason: "Quality assurance is non-negotiable in production" },
    ],
    learning_plan: {
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
    },
    explanation: {
      quote: "Based on your background in Computer Science and experience with JavaScript, this Full-Stack Engineer path aligns with your existing strengths while strategically filling critical gaps in TypeScript, system design, and DevOps.",
      reasons: [
        { title: "Market Demand", description: "Full-stack engineers are among the most sought-after roles in tech, with a 34% increase in job postings over the past year." },
        { title: "Skill Alignment", description: "Your existing JavaScript and React knowledge provides a strong foundation. The recommended path builds on these skills rather than starting from scratch." },
        { title: "Growth Trajectory", description: "This path positions you for rapid career progression. Full-stack engineers typically advance to senior roles within 2-3 years." },
      ],
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const { resume_id } = await req.json();

    if (!resume_id) {
      return new Response(JSON.stringify({ error: "resume_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update resume status to analyzing
    await supabase
      .from("resumes")
      .update({ status: "analyzing" })
      .eq("id", resume_id)
      .eq("user_id", userId);

    // =============================================================
    // TODO: Replace with your ML model API calls
    // const ML_API_URL = Deno.env.get("ML_API_BASE_URL");
    //
    // // 1. Get resume file from storage
    // const { data: resume } = await supabase
    //   .from("resumes")
    //   .select("file_path")
    //   .eq("id", resume_id)
    //   .single();
    // const { data: fileData } = await supabase.storage
    //   .from("resumes")
    //   .download(resume.file_path);
    //
    // // 2. Call your 4 ML model endpoints
    // const pathResult = await fetch(`${ML_API_URL}/recommended-path`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/octet-stream" },
    //   body: fileData,
    // }).then(r => r.json());
    //
    // const skillResult = await fetch(`${ML_API_URL}/skill-gap`, {
    //   method: "POST",
    //   body: fileData,
    // }).then(r => r.json());
    //
    // const roadmapResult = await fetch(`${ML_API_URL}/learning-plan`, {
    //   method: "POST",
    //   body: fileData,
    // }).then(r => r.json());
    //
    // const whyResult = await fetch(`${ML_API_URL}/explanation`, {
    //   method: "POST",
    //   body: fileData,
    // }).then(r => r.json());
    // =============================================================

    // For now, return mock data
    const analysis = getMockAnalysis();

    // Store results in DB
    const { data: analysisRow, error: insertError } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        resume_id,
        recommended_path: analysis.recommended_path,
        skill_gap: analysis.skill_gap,
        learning_plan: analysis.learning_plan,
        explanation: analysis.explanation,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Preserve user-entered full_name. Only backfill when profile name is empty.
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    const resolvedName = existingProfile?.full_name || analysis.profile.name;

    await supabase
      .from("profiles")
      .update({
        full_name: resolvedName,
        role: analysis.profile.role,
        education: analysis.profile.education,
      })
      .eq("id", userId);

    // Update resume status
    await supabase
      .from("resumes")
      .update({ status: "analyzed" })
      .eq("id", resume_id)
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({
        success: true,
        analysis_id: analysisRow.id,
        ...analysis,
        profile: {
          ...analysis.profile,
          name: resolvedName,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
