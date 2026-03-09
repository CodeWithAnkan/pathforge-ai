import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { useAnalysis } from "@/contexts/AnalysisContext";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function RecommendedPath() {
  const { analysis } = useAnalysis();
  const stages = analysis.roadmapStages;

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Your Recommended Path</h2>
        <p className="text-sm text-muted-foreground">A structured roadmap from where you are to where you want to be.</p>
      </div>
      <Accordion type="multiple" defaultValue={["1", "2"]} className="space-y-3">
        {stages.map((stage, i) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <AccordionItem value={String(stage.id)} className="glass rounded-xl border-0 overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    stage.progress === 100 ? "gradient-bg text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{stage.title}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {stage.duration}
                      </span>
                    </div>
                    <Progress value={stage.progress} className="h-1.5 mt-2 w-48" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{stage.progress}%</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <ul className="space-y-2 ml-14">
                  {stage.tasks.map((task, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      {task.done ? (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={task.done ? "text-muted-foreground line-through" : ""}>{task.label}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  );
}
