// AI-powered campaign pack generator.
// Uses Lovable AI Gateway (google/gemini-3-flash-preview).
// SECURITY: server-side credit reservation is performed BEFORE the AI call
// so the paid AI Gateway request cannot be triggered without deducting
// credits. If AI generation fails, the reservation is refunded.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const CAMPAIGN_PACK_COST = 10;
const CAMPAIGN_PACK_ACTION = "full_campaign_pack";

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
const SIGNOFF_LINE_RE = /^(Best regards|Best|Thanks|Thank you|Cheers|Kind regards|Regards|Warmly|Speak soon|Sincerely),?$/i;
const SIGNOFF_INLINE_RE = /^(Best regards|Best|Thanks|Thank you|Cheers|Kind regards|Regards|Warmly|Speak soon|Sincerely),?\s+\S.+$/i;
const SENDER_ONLY_RE = /^[-—]?\s*(\{\{\s*sender\s*\}\}|\[sender\])\s*$/i;

function stripInvisible(value: unknown): string {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/[\u200B-\u200D\uFEFF]/g, "");
}

function hasMeaningfulText(value: unknown, minLength: number): boolean {
  return stripInvisible(value).trim().length >= minLength;
}

function defaultObjectionResponse(objection: string, brief: Brief): string {
  const clean = stripInvisible(objection).trim();
  if (/time|learn|tool/i.test(clean)) {
    return "The workspace is designed to keep setup focused, with reviewable drafts and controls before anything goes live.";
  }
  if (/agency|tried|before/i.test(clean)) {
    return "This is a customer-managed workspace, so your team keeps control of the campaign, data and approvals.";
  }
  if (/sound|voice|brand/i.test(clean)) {
    return "The campaign uses the tone and context from your brief, and every asset can be reviewed before launch.";
  }
  return `${brief.name || "The campaign"} keeps the work reviewable and customer-controlled, so the team can decide what to use before launch.`;
}

function normaliseObjections(pack: any, brief: Brief) {
  const fallback = [
    { objection: "We do not have time to learn a new tool.", response: "The workspace is designed to keep setup focused, with reviewable drafts and controls before anything goes live." },
    { objection: "We have tried outsourced marketing before.", response: "This is a customer-managed workspace, so your team keeps control of the campaign, data and approvals." },
    { objection: "Will it sound like our business?", response: "The campaign uses the tone and context from your brief, and every asset can be reviewed before launch." },
  ];
  const raw = Array.isArray(pack?.offer?.objections) ? pack.offer.objections : [];
  const count = Math.max(3, raw.length, fallback.length);
  pack.offer = pack.offer && typeof pack.offer === "object" ? pack.offer : {};
  pack.offer.objections = Array.from({ length: count }, (_, i) => {
    const current = raw[i] || {};
    const base = fallback[i % fallback.length];
    const objection = hasMeaningfulText(current.objection, 4) ? stripInvisible(current.objection).trim() : base.objection;
    const response = hasMeaningfulText(current.response, 8)
      ? stripInvisible(current.response).trim()
      : defaultObjectionResponse(objection, brief);
    return { objection, response };
  });
}

function ensureEmailCtaBeforeSignoff(body: string, chosenCta: string): string {
  const cta = stripInvisible(chosenCta).trim();
  if (!body || !cta) return body || "";
  const lines = body.replace(/\r\n/g, "\n").split("\n").map((line) => line.trim());
  const nonEmpty = lines.filter(Boolean);
  const ctaNeedle = cta.toLowerCase();
  const ctaLine = nonEmpty.find((line) => line.toLowerCase().includes(ctaNeedle)) || cta;
  const withoutCta = nonEmpty.filter((line) => !line.toLowerCase().includes(ctaNeedle));
  const signoffIndex = withoutCta.findIndex((line) => SIGNOFF_LINE_RE.test(line) || SIGNOFF_INLINE_RE.test(line) || SENDER_ONLY_RE.test(line));
  const bodyLines = signoffIndex >= 0 ? withoutCta.slice(0, signoffIndex) : withoutCta;
  const signoffLines = signoffIndex >= 0 ? withoutCta.slice(signoffIndex) : ["Best,", "{{sender}}"];
  if (signoffLines.length === 1 && SIGNOFF_LINE_RE.test(signoffLines[0])) signoffLines.push("{{sender}}");
  return [...bodyLines, "", ctaLine, "", ...signoffLines].join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

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

function buildSystemPrompt(selectedSocial: string[], includeEmail: boolean, includePress: boolean, includeVideo: boolean, includePaidAds: boolean): string {
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
  const paidAdsLine = includePaidAds
    ? `- Generate a Paid Ads section as draft ad copy for the user to review before use. It must contain: 1 campaignAngle, exactly 3 headlines, exactly 3 primaryText options, exactly 3 descriptions, an audienceNote and a complianceNote. Use ONLY the user's chosen CTA. Do NOT promise ROAS, leads, conversions, low CPC, platform approval, or ad compliance. Do NOT invent free guides, trials, discounts, urgency, guarantees, statistics or case studies. The complianceNote must state clearly that the copy is a draft for review against the ad platform's policies (Meta, Google, LinkedIn, TikTok, X) and local advertising rules, with no promises made.`
    : `- The user did not select Paid ads. Return "paidAds": null.`;

  return `You are a senior direct-response copywriter for Velocity Vision.
You are producing a commercial-grade multi-asset campaign pack from a short brief.

STRICT RULES (breaking any of these makes the output unusable):
1. REWRITE the brief into clean, natural sales copy. NEVER paste raw brief fields verbatim into headlines, hooks, emails or scripts.
2. Do NOT repeat long phrases across assets. Each asset must read as fresh copy.
3. Headlines must be under 12 words. Email subject lines must be under 70 characters. Social hooks must be under 20 words.
4. USE ONLY the customer's chosen CTA (provided as "cta"). Do not invent alternative CTAs unless that exact CTA is what the user chose.
5. Do NOT invent: free guides, trials, discounts, case studies, customer results, specific timeframes, guarantees, or closing deadlines the user did not provide.
6. Do NOT promise: sales, replies, revenue, deliverability, inbox placement, media coverage, ad approval, ROAS, CPC, leads, or legal compliance.
7. Do NOT use words like "fastest", "guaranteed", "proven", "hit their goal", "faster than ever", "launch in days not quarters".
8. Every sentence must be grammatical. Never produce broken fragments.
9. Press release must read like a genuine business announcement — no hype, no unverifiable claims, no fabricated quotes attributed to specific people. Use "a company spokesperson" if a quote is included.
10. RESPECT SELECTED CHANNELS. Only produce assets for the channels the user selected. Do NOT invent Facebook, Instagram, TikTok, Paid Ads, Email, PR or Video content if the user did not select it.
11. EVERY objection object in offer.objections MUST include BOTH a complete non-empty "objection" (>= 4 chars) AND a complete non-empty "response" (>= 8 chars, ideally a full sentence). Do not emit empty strings, whitespace, dashes, placeholders, nulls, or missing values for objection responses.
12. EMAIL BODY STRUCTURE. Each email body MUST use this exact order: greeting, then 1–2 short paragraphs of body copy, then one CTA sentence using the user's chosen CTA verbatim, then the sign-off line ("Best," / "Thanks," etc.) followed by "{{sender}}". The CTA MUST appear BEFORE the sign-off. Never place the CTA after "Best regards", "Best", "Thanks", "Regards", "{{sender}}", or the signature block. Never append the CTA as a trailing fragment after the sender name.
13. Return ONLY the JSON object described below. No prose, no markdown fences, no commentary.

Channel-specific rules for THIS brief:
${socialLines}
${emailLine}
${pressLine}
${videoLine}
${paidAdsLine}

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
  "paidAds":     { "campaignAngle": string, "headlines": [string x3], "primaryText": [string x3], "descriptions": [string x3], "audienceNote": string, "complianceNote": string } OR null,
  "leadCapture": { "formTitle": string, "fields": [ {"label": string, "type": "text"|"email"|"textarea", "required": boolean } ] (4 items), "ctaLabel": string, "thankYou": string }
}
The "cta" field on landing/offer and the "ctaLabel" on leadCapture MUST equal the user's chosen CTA verbatim.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!LOVABLE_API_KEY) return json({ error: "ai_not_configured" }, 503);

  // Auth: require a valid JWT and scope the Supabase client to the caller.
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return json({ error: "unauthorized" }, 401);
  }
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.slice(7);
  const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims?.sub) {
    return json({ error: "unauthorized" }, 401);
  }

  let payload: { brief: Brief };
  try { payload = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const brief = payload?.brief;
  if (!brief || typeof brief !== "object") return json({ error: "brief required" }, 400);

  // Server-side credit gate — reserve BEFORE the paid AI call. Refund on any
  // failure below so users are never charged for a failed generation.
  const { data: reservedId, error: reserveErr } = await userClient.rpc(
    "reserve_campaign_credits",
    { _cost: CAMPAIGN_PACK_COST, _action: CAMPAIGN_PACK_ACTION },
  );
  if (reserveErr || !reservedId) {
    const msg = String(reserveErr?.message || "");
    if (msg.includes("insufficient_credits")) return json({ error: "insufficient_credits" }, 402);
    if (msg.includes("starter_expired")) return json({ error: "starter_expired" }, 402);
    if (msg.includes("no_plan")) return json({ error: "no_plan" }, 402);
    return json({ error: "credit_reservation_failed", detail: msg.slice(0, 200) }, 402);
  }
  const ledgerId = reservedId as string;
  const refund = async () => {
    try { await userClient.rpc("refund_campaign_credits", { _ledger_id: ledgerId }); } catch (_e) { /* best-effort */ }
  };

  const normalisedChannels = (brief.channels || []).map(normaliseChannel);
  const selectedSocial = SOCIAL_PLATFORMS.filter((p) => normalisedChannels.includes(p));
  const includeEmail = normalisedChannels.includes("Email");
  const includePress = normalisedChannels.includes("PR");
  const includeVideo = normalisedChannels.includes("Video") || (brief.outputs || []).includes("video");
  const includePaidAds = normalisedChannels.includes("Paid ads") || (brief.outputs || []).includes("ads");

  const language = brief.language || "en";
  const SYSTEM = buildSystemPrompt(selectedSocial, includeEmail, includePress, includeVideo, includePaidAds);


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
- Paid ads selected: ${includePaidAds ? "YES" : "NO"}
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

    if (upstream.status === 429) { await refund(); return json({ error: "rate_limited" }, 429); }
    if (upstream.status === 402) { await refund(); return json({ error: "credits_exhausted" }, 402); }
    if (!upstream.ok) {
      const detail = await upstream.text();
      await refund();
      return json({ error: "upstream_error", detail: detail.slice(0, 400) }, 502);
    }
    const data = await upstream.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    let pack: any;
    try {
      pack = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) { await refund(); return json({ error: "invalid_ai_output", detail: raw.slice(0, 400) }, 502); }
      try { pack = JSON.parse(m[0]); } catch (e) {
        await refund();
        return json({ error: "invalid_ai_output", detail: String(e).slice(0, 400) }, 502);
      }
    }


    // Server-side enforcement — strip any unselected channels, split any extras to "optional"
    if (pack && typeof pack === "object") {
      if (!includeEmail) pack.emails = [];
      if (!includePress) pack.press = null;
      if (!includeVideo) pack.video = null;
      if (!includePaidAds) {
        pack.paidAds = null;
      } else {
        pack.paidAds = normalisePaidAds(pack.paidAds, brief);
      }

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

      // Defensive: never return blank objection responses; the client quality
      // guard still blocks any invalid pack before save/credit deduction.
      normaliseObjections(pack, brief);

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
          return { ...e, body: ensureEmailCtaBeforeSignoff(body, chosenCta) };
        });
      }
    }

    return json({ pack, language, generatedAs: language, selectedChannels: normalisedChannels, ledgerId });
  } catch (e) {
    await refund();
    return json({ error: "exception", detail: String(e).slice(0, 400) }, 500);
  }
});
