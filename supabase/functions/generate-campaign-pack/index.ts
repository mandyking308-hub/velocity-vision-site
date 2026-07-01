// AI-powered campaign pack generator.
// Uses Lovable AI Gateway (google/gemini-3-flash-preview).
// Returns a structured JSON CampaignPack. The caller runs a quality guard
// and only saves/deducts credits when the guard passes.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface Brief {
  name: string;
  goal: string;
  kind: string;
  offer: string;
  audience: string;
  industry: string;
  geography: string;
  pricePoint: string;
  tone: string;
  cta: string;
  channels: string[];
  deadline: string;
  notes: string;
  outputs: string[];
  language?: string;
}

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SYSTEM = `You are a senior direct-response copywriter for Velocity Vision.
You are producing a commercial-grade multi-asset campaign pack from a short brief.

STRICT RULES (breaking any of these makes the output unusable):
1. REWRITE the brief into clean, natural sales copy. NEVER paste raw brief fields verbatim into headlines, hooks, emails or scripts.
2. Do NOT repeat long phrases across assets. Each asset must read as fresh copy.
3. Headlines must be under 12 words. Email subject lines must be under 70 characters. Social hooks must be under 20 words.
4. USE ONLY the customer's chosen CTA (provided as "cta"). Do not invent alternative CTAs like "Book a call", "Start your trial", "Get the free guide", "Reply YES", or "Book a 15-min call" unless that exact CTA is what the user chose.
5. Do NOT invent: free guides, trials, discounts, case studies, customer results, specific timeframes ("in 14 days", "in 7 days"), guarantees, or closing deadlines the user did not provide.
6. Do NOT promise: sales, replies, revenue, deliverability, inbox placement, media coverage, or legal compliance.
7. Do NOT use words like "fastest", "guaranteed", "proven", "hit their goal", "faster than ever", "launch in days not quarters", "the offer changes".
8. Every sentence must be grammatical. Never produce broken fragments like "If you're a activity." or "you're a {audience_word}".
9. Press release must read like a genuine business announcement — no hype, no unverifiable claims, no fabricated quotes attributed to specific people. Use "a company spokesperson" if a quote is included.
10. Return ONLY the JSON object described below. No prose, no markdown fences, no commentary.

Output JSON schema (all fields required unless marked optional):
{
  "strategy": { "positioning": string, "bigIdea": string, "messagingPillars": [string, string, string, string], "successMetric": string },
  "landing": { "headline": string, "subheadline": string, "sections": [{"title": string, "body": string}] (5 items), "cta": string },
  "offer":   { "framing": string, "benefits": [string x5], "objections": [{"objection": string, "response": string}] (3 items), "cta": string },
  "emails":  [ { "subject": string (<=70 chars), "preview": string, "body": string } ] (5 items, use {{first_name}} / {{sender}} tokens),
  "social":  {
    "launchPosts": [ { "platform": one of "LinkedIn"|"Instagram"|"X"|"Facebook"|"TikTok", "hook": string, "short": string, "long": string, "cta": string, "visualPrompt": string } ] (5 items, one per platform),
    "followUps":   [ same shape ] (5 items, different hooks from launchPosts),
    "hooks":       [string x6],
    "ctas":        [string x3, ALL variations of the user CTA only],
    "launchWeek":  [ {"day": string, "theme": string, "post": string } ] (7 items, Mon..Sun),
    "repostIdeas": [string x4]
  },
  "press": { "headline": string, "subheadline": string, "opening": string, "body": [string x3], "quote": string, "boilerplate": string, "contactLine": string },
  "video": { "hooks": [string x3], "script30": string, "script60": string, "talkingHead": string, "bRoll": string, "shotList": [string x5], "storyboard": [string x5], "onScreenText": [string x4], "captionText": string, "ctaEndings": [string x3] },
  "leadCapture": { "formTitle": string, "fields": [ {"label": string, "type": "text"|"email"|"textarea", "required": boolean } ] (4 items), "ctaLabel": string, "thankYou": string }
}
The "cta" field on landing/offer and the "ctaLabel" on leadCapture MUST equal the user's chosen CTA verbatim.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!LOVABLE_API_KEY) return json({ error: "ai_not_configured" }, 503);

  let payload: { brief: Brief };
  try { payload = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const brief = payload?.brief;
  if (!brief || typeof brief !== "object") return json({ error: "brief required" }, 400);

  const language = brief.language || "en";
  const userMsg = `Generate the campaign pack.

Brief:
- Campaign name: ${brief.name}
- Goal: ${brief.goal}
- Type: ${brief.kind}
- Offer / product / service: ${brief.offer}
- Target audience: ${brief.audience}
- Industry: ${brief.industry}
- Geography: ${brief.geography}
- Price point: ${brief.pricePoint || "(not provided — do not invent one)"}
- Tone of voice: ${brief.tone}
- CHOSEN CTA (use this exact wording): "${brief.cta}"
- Preferred channels: ${(brief.channels || []).join(", ") || "unspecified"}
- Deadline / timing: ${brief.deadline || "(not provided — do not invent one)"}
- Extra notes: ${brief.notes || "(none)"}

Language: write the entire pack in ${language === "es" ? "Spanish (Spain)" : language === "en" ? "English (UK)" : "English (UK) with target language " + language}.

Return the JSON object only.`;

  try {
    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (upstream.status === 429) return json({ error: "rate_limited" }, 429);
    if (upstream.status === 402) return json({ error: "credits_exhausted" }, 402);
    if (!upstream.ok) {
      const detail = await upstream.text();
      return json({ error: "upstream_error", detail: detail.slice(0, 400) }, 502);
    }
    const data = await upstream.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    let pack: unknown;
    try {
      pack = JSON.parse(raw);
    } catch {
      // Try to strip fences if the model wrapped it
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) return json({ error: "invalid_ai_output", detail: raw.slice(0, 400) }, 502);
      try { pack = JSON.parse(m[0]); } catch (e) {
        return json({ error: "invalid_ai_output", detail: String(e).slice(0, 400) }, 502);
      }
    }
    return json({ pack, language, generatedAs: language });
  } catch (e) {
    return json({ error: "exception", detail: String(e).slice(0, 400) }, 500);
  }
});
