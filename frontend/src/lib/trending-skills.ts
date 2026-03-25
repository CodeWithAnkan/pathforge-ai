export interface TrendingSkill {
  skill: string;
  count: number;
}

interface AnalysisSkillRow {
  user_id: string;
  created_at: string;
  extracted_skills: unknown;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeSkillKey(value: string): string | null {
  const normalized = normalizeWhitespace(value).toLowerCase();
  return normalized || null;
}

function formatToken(token: string): string {
  if (/^[a-z]{1,4}$/i.test(token)) {
    return token.toUpperCase();
  }

  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

export function formatSkillLabel(value: string): string {
  return normalizeWhitespace(value)
    .split(" ")
    .filter(Boolean)
    .map((part) => part.split("-").map(formatToken).join("-"))
    .join(" ");
}

export function extractSkillNames(extractedSkills: unknown): string[] {
  const uniqueSkills = new Map<string, string>();

  const addSkill = (value: unknown) => {
    if (typeof value !== "string") return;
    const key = normalizeSkillKey(value);
    if (!key || uniqueSkills.has(key)) return;
    uniqueSkills.set(key, formatSkillLabel(value));
  };

  if (Array.isArray(extractedSkills)) {
    for (const item of extractedSkills) {
      if (typeof item === "string") {
        addSkill(item);
        continue;
      }

      if (item && typeof item === "object" && "skill" in item) {
        addSkill((item as { skill?: unknown }).skill);
      }
    }
  } else if (extractedSkills && typeof extractedSkills === "object") {
    for (const skill of Object.keys(extractedSkills as Record<string, unknown>)) {
      addSkill(skill);
    }
  }

  return [...uniqueSkills.values()];
}

export function buildTrendingSkills(rows: AnalysisSkillRow[]): TrendingSkill[] {
  const latestByUser = new Map<string, AnalysisSkillRow>();

  for (const row of rows) {
    const existing = latestByUser.get(row.user_id);
    if (!existing || new Date(row.created_at).getTime() > new Date(existing.created_at).getTime()) {
      latestByUser.set(row.user_id, row);
    }
  }

  const skillCounts = new Map<string, TrendingSkill>();

  for (const row of latestByUser.values()) {
    for (const skill of extractSkillNames(row.extracted_skills)) {
      const key = normalizeSkillKey(skill);
      if (!key) continue;

      const existing = skillCounts.get(key);
      if (existing) {
        existing.count += 1;
        continue;
      }

      skillCounts.set(key, { skill, count: 1 });
    }
  }

  return [...skillCounts.values()]
    .sort((a, b) => b.count - a.count || a.skill.localeCompare(b.skill))
    .slice(0, 8);
}
