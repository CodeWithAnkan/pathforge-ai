import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp,
    MessageSquare,
    ChevronUp,
    Lightbulb,
    BookOpen,
    HelpCircle,
    Star,
    Send,
    Loader2,
    BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────────
type Tag = "Resource" | "Tip" | "Experience" | "Question";

interface Post {
    id: string;
    user_id: string;
    content: string;
    tag: Tag;
    upvote_count: number;
    created_at: string;
    author_name: string;
    has_upvoted: boolean;
}

interface TrendingSkill {
    skill: string;
    count: number;
}

interface CareerDist {
    career: string;
    count: number;
}

// ── Tag config ────────────────────────────────────────────────────────────────
const TAG_CONFIG: Record<Tag, { icon: React.ElementType; color: string }> = {
    Resource: { icon: BookOpen, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    Tip: { icon: Lightbulb, color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    Experience: { icon: Star, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    Question: { icon: HelpCircle, color: "bg-green-500/10 text-green-400 border-green-500/20" },
};

const ALL_TAGS: Tag[] = ["Resource", "Tip", "Experience", "Question"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

function formatCareer(s: string): string {
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Trending skills ───────────────────────────────────────────────────────────
async function fetchTrendingSkills(): Promise<TrendingSkill[]> {
    const { data } = await supabase
        .from("analyses")
        .select("skill_gap");

    if (!data) return [];

    const counts: Record<string, number> = {};
    for (const row of data) {
        const gap = row.skill_gap as any[];
        if (!Array.isArray(gap)) continue;
        for (const item of gap) {
            const skill = item?.skill as string;
            if (skill) counts[skill] = (counts[skill] || 0) + 1;
        }
    }

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([skill, count]) => ({ skill, count }));
}

// ── Career distribution ───────────────────────────────────────────────────────
async function fetchCareerDist(): Promise<CareerDist[]> {
    const { data } = await supabase
        .from("analyses")
        .select("career_recommendations");

    if (!data) return [];

    const counts: Record<string, number> = {};
    for (const row of data) {
        const recs = (row as any).career_recommendations as any[];
        if (!Array.isArray(recs) || recs.length === 0) continue;
        const top = recs[0]?.career as string;
        if (top) counts[top] = (counts[top] || 0) + 1;
    }

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([career, count]) => ({ career, count }));
}

// ── Posts fetcher ─────────────────────────────────────────────────────────────
async function fetchPosts(userId: string | undefined): Promise<Post[]> {
    const { data: posts } = await supabase
        .from("posts")
        .select("id, user_id, content, tag, upvote_count, created_at")
        .order("created_at", { ascending: false });

    if (!posts) return [];

    // fetch author names
    const userIds = [...new Set(posts.map((p) => p.user_id))];
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

    const nameMap: Record<string, string> = {};
    for (const p of profiles || []) {
        nameMap[p.id] = p.full_name || "Anonymous";
    }

    // fetch current user's upvotes
    let upvotedIds = new Set<string>();
    if (userId) {
        const { data: upvotes } = await supabase
            .from("post_upvotes")
            .select("post_id")
            .eq("user_id", userId);
        upvotedIds = new Set((upvotes || []).map((u) => u.post_id));
    }

    return posts.map((p) => ({
        ...p,
        tag: p.tag as Tag,
        author_name: nameMap[p.user_id] || "Anonymous",
        has_upvoted: upvotedIds.has(p.id),
    }));
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CommunityPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [posts, setPosts] = useState<Post[]>([]);
    const [trendingSkills, setTrendingSkills] = useState<TrendingSkill[]>([]);
    const [careerDist, setCareerDist] = useState<CareerDist[]>([]);
    const [activeTag, setActiveTag] = useState<Tag | "All">("All");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [hasAnalysis, setHasAnalysis] = useState(false);

    // compose state
    const [content, setContent] = useState("");
    const [selectedTag, setSelectedTag] = useState<Tag>("Tip");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [p, ts, cd] = await Promise.all([
                fetchPosts(user?.id),
                fetchTrendingSkills(),
                fetchCareerDist(),
            ]);
            setPosts(p);
            setTrendingSkills(ts);
            setCareerDist(cd);

            // check if user has at least one analyzed resume
            if (user) {
                const { count } = await supabase
                    .from("analyses")
                    .select("id", { count: "exact", head: true })
                    .eq("user_id", user.id);
                setHasAnalysis((count ?? 0) > 0);
            }

            setLoading(false);
        };
        load();
    }, [user]);

    const handleUpvote = async (post: Post) => {
        if (!user) {
            toast({ title: "Sign in to upvote", variant: "destructive" });
            return;
        }

        // optimistic update
        setPosts((prev) =>
            prev.map((p) =>
                p.id === post.id
                    ? {
                        ...p,
                        has_upvoted: !p.has_upvoted,
                        upvote_count: p.has_upvoted ? p.upvote_count - 1 : p.upvote_count + 1,
                    }
                    : p
            )
        );

        if (post.has_upvoted) {
            await supabase
                .from("post_upvotes")
                .delete()
                .eq("post_id", post.id)
                .eq("user_id", user.id);
            await supabase.rpc("decrement_upvote", { post_id: post.id });
        } else {
            await supabase
                .from("post_upvotes")
                .insert({ post_id: post.id, user_id: user.id });
            await supabase.rpc("increment_upvote", { post_id: post.id });
        }
    };

    const handleSubmit = async () => {
        if (!user || !content.trim()) return;
        setSubmitting(true);
        try {
            const { data, error } = await supabase
                .from("posts")
                .insert({ user_id: user.id, content: content.trim(), tag: selectedTag })
                .select("id, user_id, content, tag, upvote_count, created_at")
                .single();

            if (error) throw error;

            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", user.id)
                .single();

            const newPost: Post = {
                ...data,
                tag: data.tag as Tag,
                author_name: profile?.full_name || "Anonymous",
                has_upvoted: false,
            };

            setPosts((prev) => [newPost, ...prev]);
            setContent("");
            toast({ title: "Posted!" });
        } catch (err: any) {
            toast({ title: "Failed to post", description: err.message, variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    const filteredPosts = activeTag === "All" ? posts : posts.filter((p) => p.tag === activeTag);
    const maxCareer = careerDist[0]?.count || 1;

    return (
        <div className="min-h-[80vh] py-8 px-4">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-2xl font-bold mb-1">Community</h1>
                    <p className="text-sm text-muted-foreground">
                        Trending skills, career insights, and shared knowledge from PathForge users.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-[1fr_300px] gap-6">

                    {/* ── Left column ─────────────────────────────────────────────── */}
                    <div className="space-y-5">

                        {/* Compose */}
                        {user && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                                className="glass rounded-2xl p-5"
                            >
                                {!hasAnalysis ? (
                                    <p className="text-sm text-muted-foreground text-center py-2">
                                        Analyze a resume first to unlock posting.
                                    </p>
                                ) : (
                                    <>
                                        <div className="flex gap-2 mb-3 flex-wrap">
                                            {ALL_TAGS.map((t) => {
                                                const cfg = TAG_CONFIG[t];
                                                const Icon = cfg.icon;
                                                return (
                                                    <button
                                                        key={t}
                                                        onClick={() => setSelectedTag(t)}
                                                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${selectedTag === t
                                                                ? cfg.color
                                                                : "border-border text-muted-foreground hover:border-primary/40"
                                                            }`}
                                                    >
                                                        <Icon className="h-3 w-3" />
                                                        {t}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <textarea
                                            ref={textareaRef}
                                            value={content}
                                            onChange={(e) => setContent(e.target.value.slice(0, 280))}
                                            placeholder="Share a resource, tip, or experience…"
                                            rows={3}
                                            className="w-full bg-muted/40 border border-border/50 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground"
                                        />
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-muted-foreground">{content.length}/280</span>
                                            <Button
                                                size="sm"
                                                disabled={!content.trim() || submitting}
                                                onClick={handleSubmit}
                                                className="rounded-lg h-8 text-xs gradient-bg text-primary-foreground px-4"
                                            >
                                                {submitting ? (
                                                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                                                ) : (
                                                    <Send className="h-3 w-3 mr-1.5" />
                                                )}
                                                Post
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* Tag filter */}
                        <div className="flex gap-2 flex-wrap">
                            {(["All", ...ALL_TAGS] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTag(t)}
                                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${activeTag === t
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* Posts */}
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="glass rounded-2xl p-10 text-center">
                                <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No posts yet. Be the first!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {filteredPosts.map((post, i) => {
                                        const cfg = TAG_CONFIG[post.tag];
                                        const Icon = cfg.icon;
                                        return (
                                            <motion.div
                                                key={post.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="glass rounded-2xl p-5"
                                            >
                                                <div className="flex gap-4">
                                                    {/* Upvote */}
                                                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                                        <button
                                                            onClick={() => handleUpvote(post)}
                                                            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${post.has_upvoted
                                                                    ? "bg-primary/20 text-primary"
                                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                                }`}
                                                        >
                                                            <ChevronUp className="h-4 w-4" />
                                                        </button>
                                                        <span className="text-xs font-medium text-muted-foreground">
                                                            {post.upvote_count}
                                                        </span>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                            <span
                                                                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}
                                                            >
                                                                <Icon className="h-2.5 w-2.5" />
                                                                {post.tag}
                                                            </span>
                                                            <span className="text-xs font-medium text-foreground">
                                                                {post.author_name}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                · {timeAgo(post.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-foreground/90 leading-relaxed">
                                                            {post.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* ── Right sidebar ────────────────────────────────────────────── */}
                    <div className="space-y-5">

                        {/* Trending skills */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass rounded-2xl p-5"
                        >
                            <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                Trending skills
                            </h3>
                            {trendingSkills.length === 0 ? (
                                <p className="text-xs text-muted-foreground">Not enough data yet.</p>
                            ) : (
                                <div className="space-y-2.5">
                                    {trendingSkills.map((s, i) => {
                                        const maxCount = trendingSkills[0].count;
                                        const pct = Math.round((s.count / maxCount) * 100);
                                        return (
                                            <div key={s.skill}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-medium text-foreground">{s.skill}</span>
                                                    <span className="text-xs text-muted-foreground">{s.count} users</span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                                    <motion.div
                                                        className="h-full rounded-full bg-primary"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ delay: i * 0.05 + 0.2, duration: 0.5 }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>

                        {/* Career distribution */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                            className="glass rounded-2xl p-5"
                        >
                            <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                                <BarChart2 className="h-4 w-4 text-primary" />
                                Top career matches
                            </h3>
                            {careerDist.length === 0 ? (
                                <p className="text-xs text-muted-foreground">Not enough data yet.</p>
                            ) : (
                                <div className="space-y-2.5">
                                    {careerDist.map((c, i) => {
                                        const pct = Math.round((c.count / maxCareer) * 100);
                                        return (
                                            <div key={c.career}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-medium text-foreground truncate pr-2">
                                                        {formatCareer(c.career)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                                        {c.count}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                                    <motion.div
                                                        className="h-full rounded-full"
                                                        style={{ background: "hsl(var(--accent))" }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ delay: i * 0.05 + 0.3, duration: 0.5 }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
}