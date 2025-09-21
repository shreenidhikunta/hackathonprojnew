import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors() } });
}
function safeJsonExtract(t: string) { try { const m=t.match(/\{[\s\S]*\}/); return m?JSON.parse(m[0]):null; } catch { return null; } }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors() });

  try {
    const { url } = await req.json().catch(() => ({}));
    if (!url) return json({ error: "Missing { url }" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GEMINI = Deno.env.get("GEMINI_API_KEY")!;
    const EXTRACTOR = Deno.env.get("EXTRACTOR_URL")!;
    const DEV_USER_ID = Deno.env.get("DEV_USER_ID") ?? null;

    // Prefer caller's JWT; fall back to DEV_USER_ID for quick testing
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization") ?? "";
    if (authHeader.startsWith("Bearer ")) {
      const client = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
      const { data: { user } } = await client.auth.getUser();
      if (user) userId = user.id;
    }
    if (!userId) userId = DEV_USER_ID;
    if (!userId) return json({ error: "Unauthorized: provide JWT or set DEV_USER_ID" }, 401);

    // 1) Extract content from your Cloud Run service
    const xr = await fetch(EXTRACTOR + "/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    if (!xr.ok) return json({ error: "Extractor failed", details: await xr.text() }, 500);
    const extracted = await xr.json() as { title: string; text: string; type: string; source?: string };

    // 2) Summarize into an action plan with Gemini
    const prompt = `
Return JSON with this shape:
{"objective":"one clear objective","steps":[{"text":"step 1","est_min":15},{"text":"step 2","est_min":30}]}
Use 3–7 practical steps. CONTENT:
${(extracted.text ?? "").slice(0,3000)}
`.trim();

    const gr = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + GEMINI,
      { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }]}], generationConfig: { temperature: 0.4 } }) }
    );
    if (!gr.ok) return json({ error: "Gemini failed", details: await gr.text() }, 500);
    const g = await gr.json();
    const out: string = g?.candidates?.[0]?.content?.parts?.map((p: any)=>p.text).join("\n") ?? "";
    const parsed = safeJsonExtract(out) ?? { objective: "Untitled", steps: [] };

    // 3) Insert into Supabase with service role (writes the correct user_id)
    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: item, error: itemErr } = await admin.from("items").insert({
      user_id: userId, url, source: extracted.source ?? "web",
      title: extracted.title ?? "Untitled", raw_text: extracted.text ?? "", type: extracted.type ?? "article"
    }).select().single();
    if (itemErr) return json({ error: "DB insert item failed", details: itemErr }, 400);

    const nodes = [{
      item_id: item.id, user_id: userId, kind: "objective" as const, text: parsed.objective || "Objective", est_min: null, done: false
    }, ...((parsed.steps ?? []).map((s: any) => ({
      item_id: item.id, user_id: userId, kind: "step" as const, text: String(s.text ?? "Step"),
      est_min: Number.isFinite(s.est_min) ? s.est_min : null, done: false
    })))];

    const { data: inserted, error: nodeErr } = await admin.from("graph_nodes").insert(nodes).select();
    if (nodeErr) return json({ error: "DB insert nodes failed", details: nodeErr }, 400);

    return json({ ok: true, item, nodes: inserted });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
