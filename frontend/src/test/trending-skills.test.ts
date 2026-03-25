import { describe, expect, it } from "vitest";
import { buildTrendingSkills, extractSkillNames } from "@/lib/trending-skills";

describe("extractSkillNames", () => {
  it("supports object-shaped extracted skills", () => {
    expect(extractSkillNames({ html: 0.9, css: 0.8 })).toEqual(["HTML", "CSS"]);
  });

  it("deduplicates mixed casing and object items", () => {
    expect(extractSkillNames(["html", "HTML", { skill: "Html" }, { skill: "css" }])).toEqual(["HTML", "CSS"]);
  });
});

describe("buildTrendingSkills", () => {
  it("limits the result to the top 5 skills", () => {
    const trending = buildTrendingSkills([
      { user_id: "u1", created_at: "2026-03-20T10:00:00.000Z", extracted_skills: { html: 1, css: 1, js: 1, sql: 1, react: 1, node: 1 } },
      { user_id: "u2", created_at: "2026-03-21T10:00:00.000Z", extracted_skills: { html: 1, css: 1, js: 1, sql: 1, react: 1, api: 1 } },
    ]);

    expect(trending).toHaveLength(5);
    expect(trending.map((item) => item.skill)).toEqual(["CSS", "HTML", "JS", "React", "SQL"]);
  });

  it("counts shared skills across different users' latest resumes", () => {
    const trending = buildTrendingSkills([
      { user_id: "u1", created_at: "2026-03-20T10:00:00.000Z", extracted_skills: { html: 0.9, css: 0.7 } },
      { user_id: "u2", created_at: "2026-03-21T10:00:00.000Z", extracted_skills: { HTML: 0.8, js: 0.6 } },
    ]);

    expect(trending[0]).toEqual({ skill: "HTML", count: 2 });
  });

  it("uses only the latest analysis per user", () => {
    const trending = buildTrendingSkills([
      { user_id: "u1", created_at: "2026-03-20T10:00:00.000Z", extracted_skills: { html: 0.9 } },
      { user_id: "u1", created_at: "2026-03-21T10:00:00.000Z", extracted_skills: { css: 0.8 } },
      { user_id: "u2", created_at: "2026-03-21T11:00:00.000Z", extracted_skills: { html: 0.7 } },
    ]);

    expect(trending).toContainEqual({ skill: "CSS", count: 1 });
    expect(trending).toContainEqual({ skill: "HTML", count: 1 });
    expect(trending).not.toContainEqual({ skill: "HTML", count: 2 });
  });

  it("counts a skill once per user even if repeated in the latest resume payload", () => {
    const trending = buildTrendingSkills([
      { user_id: "u1", created_at: "2026-03-20T10:00:00.000Z", extracted_skills: ["html", "HTML", { skill: "Html" }] },
      { user_id: "u2", created_at: "2026-03-21T10:00:00.000Z", extracted_skills: { html: 0.8 } },
    ]);

    expect(trending[0]).toEqual({ skill: "HTML", count: 2 });
  });

  it("ignores empty or malformed extracted skills", () => {
    const trending = buildTrendingSkills([
      { user_id: "u1", created_at: "2026-03-20T10:00:00.000Z", extracted_skills: null },
      { user_id: "u2", created_at: "2026-03-21T10:00:00.000Z", extracted_skills: [{ nope: "x" }] },
      { user_id: "u3", created_at: "2026-03-22T10:00:00.000Z", extracted_skills: { html: 0.8 } },
    ]);

    expect(trending).toEqual([{ skill: "HTML", count: 1 }]);
  });
});
