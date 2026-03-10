import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface Profile {
  name: string;
  role: string;
  education: string;
  level: string;
  careerPath: string;
  confidenceScore: number;
}

interface RoadmapStage {
  id: number;
  title: string;
  duration: string;
  progress: number;
  tasks: { label: string; done: boolean }[];
}

interface SkillGapItem {
  skill: string;
  current: number;
  required: number;
  importance: string;
  reason: string;
}

interface LearningPlanItem {
  week: string;
  topic: string;
  milestone: string;
}

interface Explanation {
  quote: string;
  reasons: { title: string; description: string }[];
}

interface AnalysisData {
  profile: Profile;
  roadmapStages: RoadmapStage[];
  skillGap: SkillGapItem[];
  learningPlan: Record<string, LearningPlanItem[]>;
  explanation: Explanation;
  careerInsight?: any;
  industryInsight?: any;
}

interface AnalysisContextType {
  analysis: AnalysisData;
  setAnalysisFromResponse: (data: any) => void;
  loading: boolean;
  hasRealData: boolean;
}

const defaultAnalysis: AnalysisData = {
  profile: {
    name: "",
    role: "",
    education: "",
    level: "",
    careerPath: "",
    confidenceScore: 0,
  },
  roadmapStages: [],
  skillGap: [],
  learningPlan: {},
  explanation: { quote: "", reasons: [] },
  careerInsight: null,
  industryInsight: null,
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisData>(defaultAnalysis);
  const [loading, setLoading] = useState(false);
  const [hasRealData, setHasRealData] = useState(false);

  // Fetch latest analysis from DB when user logs in
  useEffect(() => {
    if (!user) {
      setAnalysis(defaultAnalysis);
      setHasRealData(false);
      return;
    }

    const fetchLatest = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        const rp = data.recommended_path as any;
        const sg = data.skill_gap as any;
        const lp = data.learning_plan as any;
        const ex = data.explanation as any;
        const ci = (data as any).career_insight ?? null;
        const ii = (data as any).industry_insight ?? null;

        // Also fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setAnalysis({
          profile: {
            name:            profile?.full_name || "",
            role:            profile?.role      || "",
            education:       profile?.education || "",
            level:           rp?.[0] ? (
              ex?.quote?.includes("Advanced") ? "Advanced" :
              ex?.quote?.includes("Beginner") ? "Beginner" : "Intermediate"
            ) : "",
            careerPath:      profile?.role || "",
            confidenceScore: rp?.[0]?.confidenceScore ?? 0,
          },
          roadmapStages: rp  || [],
          skillGap:      sg  || [],
          learningPlan:  lp  || {},
          explanation:   ex  || { quote: "", reasons: [] },
          careerInsight: ci,
          industryInsight: ii,
        });
        setHasRealData(true);
      }

      setLoading(false);
    };

    fetchLatest();
  }, [user]);

  const setAnalysisFromResponse = (data: any) => {
    setAnalysis({
      profile:        data.profile        || defaultAnalysis.profile,
      roadmapStages:  data.recommended_path || [],
      skillGap:       data.skill_gap      || [],
      learningPlan:   data.learning_plan  || {},
      explanation:    data.explanation    || { quote: "", reasons: [] },
      careerInsight:  data.career_insight  ?? null,
      industryInsight: data.industry_insight ?? null,
    });
    setHasRealData(true);
  };

  return (
    <AnalysisContext.Provider value={{ analysis, setAnalysisFromResponse, loading, hasRealData }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) throw new Error("useAnalysis must be used within AnalysisProvider");
  return context;
}
