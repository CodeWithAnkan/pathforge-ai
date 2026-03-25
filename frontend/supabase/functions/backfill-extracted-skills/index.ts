declare global {
  namespace Deno {
    function serve(handler: (req: Request) => Response | Promise<Response>): void;
    namespace env {
      function get(key: string): string | undefined;
    }
  }
}

import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-backfill-secret",
};

type BackfillRequest = {
  dry_run?: boolean;
  limit?: number;
};

function normalizeExtractedSkills(extractedSkills: unknown): string[] {
  const uniqueSkills = new Set<string>();

  const addSkill = (value: unknown) => {
    if (typeof value !== "string") return;

    const normalized = value.replace(/_/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
    if (!normalized) return;

    uniqueSkills.add(normalized);
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

  return [...uniqueSkills];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const backfillSecret = Deno.env.get("ANALYSIS_BACKFILL_SECRET");
    const suppliedSecret = req.headers.get("x-backfill-secret");
    if (!backfillSecret || suppliedSecret !== backfillSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const mlApiUrl = Deno.env.get("ML_API_BASE_URL");

    if (!supabaseUrl || !serviceRoleKey || !mlApiUrl) {
      throw new Error("Required secrets are missing: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or ML_API_BASE_URL.");
    }

    const { dry_run = false, limit = 25 } = (await req.json().catch(() => ({}))) as BackfillRequest;
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: analyses, error: analysesError } = await supabase
      .from("analyses")
      .select("id, user_id, resume_id")
      .is("extracted_skills", null)
      .order("created_at", { ascending: true })
      .limit(safeLimit);

    if (analysesError) throw analysesError;

    if (!analyses || analyses.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        dry_run,
        processed: 0,
        updated: 0,
        failed: 0,
        results: [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ analysis_id: string; status: "updated" | "failed" | "skipped"; detail?: string }> = [];
    let updated = 0;
    let failed = 0;

    for (const analysis of analyses) {
      try {
        const { data: resumeRow, error: resumeError } = await supabase
          .from("resumes")
          .select("file_path, file_name")
          .eq("id", analysis.resume_id)
          .eq("user_id", analysis.user_id)
          .single();

        if (resumeError || !resumeRow) {
          throw new Error("Resume record not found.");
        }

        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from("resumes")
          .download(resumeRow.file_path);

        if (downloadError || !fileBlob) {
          throw new Error("Failed to download resume from storage.");
        }

        const formData = new FormData();
        formData.append("file", new File([fileBlob], resumeRow.file_name, { type: "application/pdf" }));

        const mlResponse = await fetch(`${mlApiUrl}/analyze`, {
          method: "POST",
          body: formData,
        });

        if (!mlResponse.ok) {
          const errText = await mlResponse.text();
          throw new Error(`ML API error (${mlResponse.status}): ${errText}`);
        }

        const mlResult = await mlResponse.json();
        const extractedSkills = normalizeExtractedSkills(mlResult.extracted_skills);

        if (extractedSkills.length === 0) {
          results.push({
            analysis_id: analysis.id,
            status: "skipped",
            detail: "ML API returned no extracted skills.",
          });
          continue;
        }

        if (!dry_run) {
          const { error: updateError } = await supabase
            .from("analyses")
            .update({ extracted_skills: extractedSkills })
            .eq("id", analysis.id);

          if (updateError) throw updateError;
        }

        updated += 1;
        results.push({
          analysis_id: analysis.id,
          status: "updated",
          detail: `${extractedSkills.length} skills ${dry_run ? "would be written" : "written"}.`,
        });
      } catch (error) {
        failed += 1;
        results.push({
          analysis_id: analysis.id,
          status: "failed",
          detail: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      dry_run,
      processed: analyses.length,
      updated,
      failed,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal server error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
