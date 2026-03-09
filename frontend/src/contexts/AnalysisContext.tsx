import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import {
  mockProfile,
  mockRoadmapStages,
  mockSkillGap,
  mockLearningPlan,
  mockExplanation,
} from "@/lib/mock-data";

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
}

interface AnalysisContextType {
  analysis: AnalysisData;
  setAnalysisFromResponse: (data: any) => void;
  loading: boolean;
  hasRealData: boolean;
}

const defaultAnalysis: AnalysisData = {
  profile: mockProfile,
  roadmapStages: mockRoadmapStages,
  skillGap: mockSkillGap,
  learningPlan: mockLearningPlan,
  explanation: mockExplanation,
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

        // Also fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setAnalysis({
          profile: {
            name: profile?.full_name || mockProfile.name,
            role: profile?.role || mockProfile.role,
            education: profile?.education || mockProfile.education,
            level: mockProfile.level,
            careerPath: mockProfile.careerPath,
            confidenceScore: mockProfile.confidenceScore,
          },
          roadmapStages: rp || mockRoadmapStages,
          skillGap: sg || mockSkillGap,
          learningPlan: lp || mockLearningPlan,
          explanation: ex || mockExplanation,
        });
        setHasRealData(true);
      }
      setLoading(false);
    };

    fetchLatest();
  }, [user]);

  const setAnalysisFromResponse = (data: any) => {
    setAnalysis({
      profile: data.profile || defaultAnalysis.profile,
      roadmapStages: data.recommended_path || defaultAnalysis.roadmapStages,
      skillGap: data.skill_gap || defaultAnalysis.skillGap,
      learningPlan: data.learning_plan || defaultAnalysis.learningPlan,
      explanation: data.explanation || defaultAnalysis.explanation,
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
