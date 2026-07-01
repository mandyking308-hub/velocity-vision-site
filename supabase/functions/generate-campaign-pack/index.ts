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

const SOCIAL_PLATFORMS = ["LinkedIn", "Instagram", "X", "Facebook", "TikTok"];

function normaliseChannel(c: string): string {
  const s = (c || "").toLowerCase().trim();
  if (s === "linkedin") return "LinkedIn";
  if (s === "instagram" || s === "ig") return "Instagram";
  if (s === "x" || s === "twitter") return "X";
  if (s === "facebook" || s === "fb") return "Facebook";
  if (s === "tiktok") return "TikTok";
  if (s === "email") return "Email";
  if (s === "pr" || s === "press") return "PR";
  if (s === "paid ads" || s === "paid" || s === "ads") return "Paid ads";
  if (s === "video") return "Video";
  return c;
}

function buildSystemPrompt(selectedSocial: string[], includeEmail: boolean, includePress: boolean, includeVideo: boolean): string {
  const socialLines = selectedSocial.length
    ? `- Generate ONE launch post AND ONE follow-up post for EACH of these platforms ONLY: ${selectedSocial.join(", ")}. Do NOT generate posts for any other platform.`
    : `- The user did not select any social channels. Return "social": { "launchPosts": [], "followUps": [], "hooks": [], "ctas": [], "launchWeek": [], "repostIdeas": [] }.`;

  const emailLine = includeEmail
    ? `- Generate 5 sequenced emails.`
    : `- The user did not select Email. Return "emails": [].`;
  const pressLine = includePress
    ? `- Generate a full press release pack.`
    : `- The user did not select PR. Return "press": null.`;
  const videoLine = includeVideo
    ? `- Generate a full video pack.`
    : `- The user did not select Video. Return "video": null.`;

  return `You are a senior direct-response copywriter for Velocity Vision.
You are producing a commercial-grade multi-asset campaign pack from a short brief.

STRICT RULES (breaking any of these makes the output unusable):
1. REWRITE the brief into clean, natural sales copy. NEVER paste raw brief fields verbatim into headlines, hooks, emails or scripts.
2. Do NOT repeat long phrases across assets. Each asset must read as fresh copy.
3. Headlines must be under 12 words. Email subject lines must be under 70 characters. Social hooks must be under 20 words.
4. USE ONLY the customer's chosen CTA (provided as "cta"). Do not invent alternative CTAs unless that exact CTA is what the user chose.
5. Do NOT invent: free guides, trials, discounts, case studies, customer results, specific timeframes, guarantees, or closing deadlines the user did not provide.
6. Do NOT promise: sales, replies, revenue, deliverability, inbox placement, media coverage, or legal compliance.
7. Do NOT use words like "fastest", "guaranteed", "proven", "hit their goal", "faster than ever", "launch in days not quarters".
8. Every sentence must be grammatical. Never produce broken fragments.
9. Press release must read like a genuine business announcement — no hype, no unverifiable claims, no fabricated quotes attributed to specific people. Use "a company spokesperson" if a quote is included.
10. RESPECT SELECTED CHANNELS. Only produce assets for the channels the user selected. Do NOT invent Facebook, Instagram, TikTok, Paid Ads, Email, PR or Video content if the user did not select it.
11. EVERY objection object in offer.objections MUST include BOTH a non-empty "objection" (>= 4 chars) AND a non-empty "response" (>= 8 chars, ideally a full sentence). Never emit an objection with a blank, missing, or placeholder response.
12. EMAIL BODY STRUCTURE. Each email body MUST end in this exact order: (a) 1–2 short paragraphs of body copy, then (b) a single CTA sentence using the user's chosen CTA verbatim, then (c) the sign-off line ("Best," / "Thanks," etc.) followed by "{{sender}}". The CTA MUST appear BEFORE the sign-off. Never place the CTA after the signature. Never append the CTA as a trailing fragment after the sender name.
13. Return ONLY the JSON object described below. No prose, no markdown fences, no commentary.

Channel-specific rules for THIS brief:
${socialLines}
${emailLine}
${pressLine}
${videoLine}

Output JSON schema:
{
  "strategy": { "positioning": string, "bigIdea": string, "messagingPillars": [string x4], "successMetric": string },
  "landing":  { "headline": string, "subheadline": string, "sections": [{"title": string, "body": string}] (5 items), "cta": string },
  "offer":    { "framing": string, "benefits": [string x5], "objections": [{"objection": string, "response": string}] (3 items), "cta": string },
  "emails":   [ { "subject": string (<=70 chars), "preview": string, "body": string } ] (5 items OR empty per rule above; use {{first_name}} / {{sender}} tokens),
  "social":   {
    "launchPosts": [ { "platform": string, "hook": string, "short": string, "long": string, "cta": string, "visualPrompt": string } ] (one per selected social platform, or empty),
    "followUps":   [ same shape ] (one per selected social platform, different hooks),
    "hooks":       [string x6] (or empty if no social selected),
    "ctas":        [string x3] (variations of the user CTA only, or empty if no social selected),
    "launchWeek":  [ {"day": string, "theme": string, "post": string } ] (7 items Mon..Sun, or empty),
    "repostIdeas": [string x4] (or empty)
  },
  "press":       { "headline": string, "subheadline": string, "opening": string, "body": [string x3], "quote": string, "boilerplate": string, "contactLine": string } OR null,
  "video":       { "hooks": [string x3], "script30": string, "script60": string, "talkingHead": string, "bRoll": string, "shotList": [string x5], "storyboard": [string x5], "onScreenText": [string x4], "captionText": string, "ctaEndings": [string x3] } OR null,
  "leadCapture": { "formTitle": string, "fields": [ {"label": string, "type": "text"|"email"|"textarea", "required": boolean } ] (4 items), "ctaLabel": string, "thankYou": string }
}
The "cta" field on landing/offer and the "ctaLabel" on leadCapture MUST equal the user's chosen CTA verbatim.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!LOVABLE_API_KEY) return json({ error: "ai_not_configured" }, 503);

  let payload: { brief: Brief };
  try { payload = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const brief = payload?.brief;
  if (!brief || typeof brief !== "object") return json({ error: "brief required" }, 400);

  const normalisedChannels = (brief.channels || []).map(normaliseChannel);
  const selectedSocial = SOCIAL_PLATFORMS.filter((p) => normalisedChannels.includes(p));
  const includeEmail = normalisedChannels.includes("Email");
  const includePress = normalisedChannels.includes("PR");
  const includeVideo = normalisedChannels.includes("Video") || (brief.outputs || []).includes("video");

  const language = brief.language || "en";
  const SYSTEM = buildSystemPrompt(selectedSocial, includeEmail, includePress, includeVideo);

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
- Selected channels (respect strictly): ${normalisedChannels.join(", ") || "unspecified"}
- Selected social platforms: ${selectedSocial.join(", ") || "none"}
- Email selected: ${includeEmail ? "YES" : "NO"}
- PR selected: ${includePress ? "YES" : "NO"}
- Video selected: ${includeVideo ? "YES" : "NO"}
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
    let pack: any;
    try {
      pack = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) return json({ error: "invalid_ai_output", detail: raw.slice(0, 400) }, 502);
      try { pack = JSON.parse(m[0]); } catch (e) {
        return json({ error: "invalid_ai_output", detail: String(e).slice(0, 400) }, 502);
      }
    }

    // Server-side enforcement — strip any unselected channels, split any extras to "optional"
    if (pack && typeof pack === "object") {
      if (!includeEmail) pack.emails = [];
      if (!includePress) pack.press = null;
      if (!includeVideo) pack.video = null;

      if (pack.social && typeof pack.social === "object") {
        const filterBy = (arr: any[]) =>
          Array.isArray(arr)
            ? arr.filter((p) => selectedSocial.includes(normaliseChannel(p?.platform || "")))
            : [];
        const extraBy = (arr: any[]) =>
          Array.isArray(arr)
            ? arr.filter((p) => !selectedSocial.includes(normaliseChannel(p?.platform || "")))
            : [];

        const launchExtras = extraBy(pack.social.launchPosts);
        const followExtras = extraBy(pack.social.followUps);

        pack.social.launchPosts = filterBy(pack.social.launchPosts);
        pack.social.followUps = filterBy(pack.social.followUps);

        if (launchExtras.length || followExtras.length) {
          pack.social.optionalAdditional = {
            note: "Optional additional channels — not part of the selected pack.",
            launchPosts: launchExtras,
            followUps: followExtras,
          };
        }

        if (selectedSocial.length === 0) {
          pack.social.hooks = [];
          pack.social.ctas = [];
          pack.social.launchWeek = [];
          pack.social.repostIdeas = [];
        }
      }

      // Defensive: reorder any email body that ends with "sign-off … sender … CTA"
      // so the CTA sits BEFORE the sign-off. Uses the user's chosen CTA verbatim.
      const chosenCta = (brief.cta || "").trim();
      if (chosenCta && Array.isArray(pack.emails)) {
        const signoffRe = /\n\s*(Best|Thanks|Cheers|Kind regards|Regards|Warmly|Speak soon|Sincerely)\s*,?\s*\n[\s\S]*$/i;
        const ctaTrailingRe = new RegExp(`([\\s\\S]*?)(\\n\\s*(?:Best|Thanks|Cheers|Kind regards|Regards|Warmly|Speak soon|Sincerely)[\\s\\S]*?)(\\n[^\\n]*${chosenCta.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}[^\\n]*)\\s*$`, "i");
        pack.emails = pack.emails.map((e: any) => {
          if (!e || typeof e.body !== "string") return e;
          let body: string = e.body;
          const m = body.match(ctaTrailingRe);
          if (m) {
            const before = m[1].trimEnd();
            const signoffBlock = m[2].replace(/^\n+/, "");
            const ctaLine = m[3].trim();
            body = `${before}\n\n${ctaLine}\n\n${signoffBlock}`.replace(/\n{3,}/g, "\n\n").trimEnd();
          }
          return { ...e, body };
        });
      }
    }

    return json({ pack, language, generatedAs: language, selectedChannels: normalisedChannels });
  } catch (e) {
    return json({ error: "exception", detail: String(e).slice(0, 400) }, 500);
  }
});
