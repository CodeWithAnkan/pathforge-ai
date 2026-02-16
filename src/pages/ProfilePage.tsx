import { motion } from "framer-motion";
import { User, FileText, Map, Download, RefreshCw, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockResumes, mockSavedRoadmaps, mockProfile } from "@/lib/mock-data";

export default function ProfilePage() {
  return (
    <div className="min-h-[80vh] py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="glass rounded-2xl p-6 flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full gradient-bg flex items-center justify-center">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{mockProfile.name}</h1>
              <p className="text-sm text-muted-foreground">{mockProfile.role}</p>
              <p className="text-xs text-muted-foreground">{mockProfile.education}</p>
            </div>
          </div>

          {/* Resumes */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Uploaded Resumes
            </h2>
            <div className="space-y-3">
              {mockResumes.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {r.date}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{r.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Roadmaps */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Map className="h-4 w-4 text-primary" /> Saved Roadmaps
            </h2>
            <div className="space-y-3">
              {mockSavedRoadmaps.map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{r.title}</p>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={r.progress} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground">{r.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="gradient-bg text-primary-foreground rounded-xl flex-1 h-11 font-semibold shadow-lg shadow-primary/25">
              <Download className="h-4 w-4 mr-2" /> Download Roadmap as PDF
            </Button>
            <Link to="/upload" className="flex-1">
              <Button variant="outline" className="rounded-xl w-full h-11 font-semibold">
                <RefreshCw className="h-4 w-4 mr-2" /> Refine Path
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
