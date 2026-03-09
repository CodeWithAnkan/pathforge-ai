import { motion } from "framer-motion";
import { User, GraduationCap, Briefcase, Target, TrendingUp, DollarSign, BarChart2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { RecommendedPath } from "@/components/dashboard/RecommendedPath";
import { SkillGapAnalysis } from "@/components/dashboard/SkillGapAnalysis";
import { LearningRoadmap } from "@/components/dashboard/LearningRoadmap";
import { WhyThisPath } from "@/components/dashboard/WhyThisPath";

function ConfidenceCircle({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <motion.circle
          cx="40" cy="40" r="36" fill="none"
          stroke="url(#grad)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold">{value}%</span>
      </div>
    </div>
  );
}

function formatSalary(amount: number | null): string {
  if (!amount) return "N/A";
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function DashboardPage() {
  const { analysis } = useAnalysis();
  const { profile } = analysis;
  const careerInsight = (analysis as any).careerInsight ?? null;

  return (
    <div className="min-h-[80vh] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Profile card */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full gradient-bg flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">{profile.role}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  {profile.education}
                </div>
              </div>
            </div>

            {/* Career stats card */}
            <div className="glass rounded-2xl p-6 space-y-5">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Level</p>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium gradient-bg text-primary-foreground">
                  {profile.level}
                </span>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Career Path</p>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{profile.careerPath}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Confidence Score</p>
                <div className="flex justify-center">
                  <ConfidenceCircle value={profile.confidenceScore} />
                </div>
              </div>

              {/* ── Career insight: demand + salary ──────────────────────── */}
              {careerInsight && (
                <>
                  <div className="border-t border-border/40 pt-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Market Insight
                    </p>

                    {/* Demand score */}
                    {careerInsight.demand_score != null && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BarChart2 className="h-4 w-4 text-primary" />
                          <span>Industry Demand</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className="h-full gradient-bg rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${careerInsight.demand_score}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-primary">
                            {careerInsight.demand_score}/100
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Average salary */}
                    {careerInsight.average_salary_inr != null && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4 text-accent" />
                          <span>Avg. Salary</span>
                        </div>
                        <span className="text-sm font-semibold text-accent">
                          {formatSalary(careerInsight.average_salary_inr)}
                        </span>
                      </div>
                    )}

                    {/* Key skills from dataset */}
                    {careerInsight.key_skills && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">Key Skills Needed</p>
                        <div className="flex flex-wrap gap-1">
                          {careerInsight.key_skills.split(";").map((skill: string) => (
                            <span
                              key={skill}
                              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.aside>

          {/* ── Main content ─────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Tabs defaultValue="path" className="w-full">
              <TabsList className="glass w-full justify-start rounded-xl h-12 p-1 mb-6">
                <TabsTrigger value="path" className="rounded-lg data-[state=active]:gradient-bg data-[state=active]:text-primary-foreground">
                  <Target className="h-4 w-4 mr-2" /> Recommended Path
                </TabsTrigger>
                <TabsTrigger value="skills" className="rounded-lg data-[state=active]:gradient-bg data-[state=active]:text-primary-foreground">
                  <TrendingUp className="h-4 w-4 mr-2" /> Skill Gap
                </TabsTrigger>
                <TabsTrigger value="roadmap" className="rounded-lg data-[state=active]:gradient-bg data-[state=active]:text-primary-foreground">
                  <Briefcase className="h-4 w-4 mr-2" /> Roadmap
                </TabsTrigger>
                <TabsTrigger value="why" className="rounded-lg data-[state=active]:gradient-bg data-[state=active]:text-primary-foreground">
                  <GraduationCap className="h-4 w-4 mr-2" /> Why This Path
                </TabsTrigger>
              </TabsList>

              <TabsContent value="path"><RecommendedPath /></TabsContent>
              <TabsContent value="skills"><SkillGapAnalysis /></TabsContent>
              <TabsContent value="roadmap"><LearningRoadmap /></TabsContent>
              <TabsContent value="why"><WhyThisPath /></TabsContent>
            </Tabs>
          </motion.div>

        </div>
      </div>
    </div>
  );
}