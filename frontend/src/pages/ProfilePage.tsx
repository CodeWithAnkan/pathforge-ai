import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Calendar, LogOut, Upload, Trash2, AlertCircle, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAnalysis } from "@/contexts/AnalysisContext";

interface ResumeRow {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  file_path: string;
}

function InitialsAvatar({ name, email }: { name: string | null; email: string | undefined }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (email?.[0] ?? "?").toUpperCase();
  return (
    <div className="h-14 w-14 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-lg font-semibold flex-shrink-0 border-2 border-background">
      {initials}
    </div>
  );
}

function DeleteResumeDialog({
  resume,
  onConfirm,
  onCancel,
  loading,
}: {
  resume: ResumeRow;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="glass rounded-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1">Delete resume?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">{resume.file_name}</span> and its
              analysis will be permanently removed. This cannot be undone.
            </p>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading} className="rounded-lg text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<{
    full_name: string | null;
    role: string | null;
    education: string | null;
    created_at: string | null;
  } | null>(null);
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [pendingDelete, setPendingDelete] = useState<ResumeRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, role, education, created_at")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      const { data: resumeData } = await supabase
        .from("resumes")
        .select("id, file_name, status, created_at, file_path")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setResumes(resumeData || []);
    };
    fetchData();
  }, [user]);

  const { resetAnalysis } = useAnalysis();

  const handleDeleteResume = async () => {
    if (!pendingDelete || !user) return;
    setDeleteLoading(true);
    try {
      // 1. Delete from storage
      const { error: storageError } = await supabase.storage
        .from("resumes")
        .remove([pendingDelete.file_path]);

      if (storageError) throw storageError;

      // 2. Delete related analyses (cascade via FK, but explicit for safety)
      await supabase
        .from("analyses")
        .delete()
        .eq("resume_id", pendingDelete.id)
        .eq("user_id", user.id);

      // 3. Delete the resume record
      const { error: dbError } = await supabase
        .from("resumes")
        .delete()
        .eq("id", pendingDelete.id)
        .eq("user_id", user.id);

      if (dbError) throw dbError;

      setResumes((prev) => prev.filter((r) => r.id !== pendingDelete.id));
      toast({ title: "Resume deleted", description: `${pendingDelete.file_name} was removed.` });
      resetAnalysis();
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setPendingDelete(null);
    }
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <>
      <AnimatePresence>
        {pendingDelete && (
          <DeleteResumeDialog
            resume={pendingDelete}
            onConfirm={handleDeleteResume}
            onCancel={() => setPendingDelete(null)}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>

      <div className="min-h-[80vh] py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* ── Profile header ─────────────────────────────────────────── */}
            <div className="glass rounded-2xl overflow-hidden">
              {/* Banner */}
              <div className="h-16 gradient-bg-subtle border-b border-border" />
              <div className="px-6 pb-6">
                <div className="flex items-end justify-between -mt-7 mb-4">
                  <InitialsAvatar name={profile?.full_name ?? null} email={user?.email} />
                </div>

                <h1 className="text-lg font-semibold">{displayName}</h1>
                <p className="text-sm text-muted-foreground mb-3">{user?.email}</p>

                <div className="flex gap-2 flex-wrap">
                  {memberSince && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      Member since {memberSince}
                    </span>
                  )}
                  <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                    {resumes.length} {resumes.length === 1 ? "resume" : "resumes"} analyzed
                  </span>
                </div>
              </div>
            </div>

            {/* ── Resume history ──────────────────────────────────────────── */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Resume history
                </h2>
                <Link to="/upload">
                  <Button size="sm" className="rounded-lg h-7 text-xs gradient-bg text-primary-foreground px-3">
                    <Upload className="h-3 w-3 mr-1.5" /> Upload new
                  </Button>
                </Link>
              </div>

              {resumes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No resumes uploaded yet.</p>
                  <Link to="/upload">
                    <Button size="sm" variant="outline" className="rounded-lg mt-3 text-xs">
                      Upload your first resume
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {resumes.map((r, i) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{r.file_name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Calendar className="h-2.5 w-2.5" />
                              {new Date(r.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              r.status === "analyzed"
                                ? "bg-primary/10 text-primary"
                                : r.status === "failed"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {r.status}
                          </span>
                          <button
                            onClick={() => setPendingDelete(r)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* ── Account section ─────────────────────────────────────────── */}
            <div className="glass rounded-2xl p-5">
              <h2 className="font-semibold text-sm mb-4">Account</h2>

              <div className="space-y-0 divide-y divide-border/50">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-foreground">Email address</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-destructive">Delete account</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Permanently remove all your data
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
