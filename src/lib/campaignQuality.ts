// Quality guard for AI-generated campaign packs.
// If any check fails, we do NOT save the pack as final customer output and
// we do NOT deduct credits. The user can retry.
//
// Rules enforced (mirrors the edge-function system prompt):
// - No invented CTAs
// - No unsupported claims / hype vocabulary
// - No broken grammar patterns
// - Subject lines / headlines within length
// - No long verbatim brief-field reuse across assets
// - No placeholder or QA-seed leaks

import { getCampaignChannelConfig, normaliseCampaignChannel, type CampaignBrief, type CampaignPack } from "@/lib/campaignPack";

export interface QualityIssue {
  code: string;
  message: string;
  where?: string;
  matchedSnippet?: string;
  source?: "ai_output" | "fallback_merge" | "selected_channel_filter" | "quality_guard_logic";
}

export interface QualityResult {
  ok: boolean;
  issues: QualityIssue[];
}

const BANNED_PHRASES = [
  "fastest way",
  "fastest",
  "guaranteed",
  "we guarantee",
  "proven",
  "hit their goal",
  "faster than ever",
  "launch in days, not quarters",
  "launch in days not quarters",
  "the offer changes",
  "free guide",
  "start your trial",
  "start a trial",
  "reply yes",
  "reply \"yes\"",
  "book a 15-min call",
  "book a 15 min call",
  "in 14 days",
  "in 7 days",
  "qa-seed://",
];

// Allowed personalization tokens permitted in email bodies/subjects/previews.
// These get neutralised before grammar/broken-pattern checks so normal punctuation
// like "Hi {{first_name}}," does not trip the broken-phrase regex.
const ALLOWED_TOKENS: Record<string, string> = {
  first_name: "Alex",
  sender: "Sam",
  company: "Acme",
};

// Disallowed brief-field tokens — must never leak into rendered output.
const DISALLOWED_TOKEN_RE = /\{\{\s*(offer|audience|industry|geography|goal|cta)\s*\}\}/i;

// Any unresolved token that isn't in the allow-list is treated as a leak.
const UNKNOWN_TOKEN_RE = /\{\{\s*([a-z_][a-z0-9_]*)\s*\}\}/gi;

const BROKEN_PATTERNS: { rx: RegExp; label: string }[] = [
  { rx: /\bif you're a\s+(activity|goal|offer|audience|industry|geography)\b/i, label: "if-you-are-a-<brief-token>" },
  { rx: /\bif you are a\s+(activity|goal|offer|audience|industry|geography)\b/i, label: "if-you-are-a-<brief-token>" },
  { rx: /\b(a|an)\s+(activity|goal|offer|audience)\b\.?/i, label: "a-<brief-token>" },
  { rx: /\s{4,}/, label: "excess-whitespace" },
];

const INVENTED_CTAS = [
  "book a call",
  "book a 15-min call",
  "book a 15 min call",
  "start your trial",
  "start a trial",
  "get the free guide",
  "reply yes",
  "reply \"yes\"",
];

const norm = (s: string) => (s || "").toLowerCase();

function neutraliseAllowedTokens(text: string): string {
  return text.replace(/\{\{\s*([a-z_][a-z0-9_]*)\s*\}\}/gi, (m, name) => {
    const key = String(name).toLowerCase();
    return ALLOWED_TOKENS[key] ?? m;
  });
}

function collectAllText(pack: CampaignPack, brief?: CampaignBrief): { key: string; text: string }[] {
  const out: { key: string; text: string }[] = [];
  const cfg = brief ? getCampaignChannelConfig(brief) : null;
  const push = (k: string, v: unknown) => {
    if (typeof v === "string") out.push({ key: k, text: v });
    else if (Array.isArray(v)) v.forEach((x, i) => push(`${k}[${i}]`, x));
    else if (v && typeof v === "object") for (const [k2, v2] of Object.entries(v)) push(`${k}.${k2}`, v2);
  };
  const selectedSocial = new Set(cfg?.selectedSocial || []);
  const visiblePack = {
    strategy: pack.strategy,
    landing: pack.landing,
    offer: pack.offer,
    emails: cfg?.includeEmail === false ? [] : pack.emails,
    social: pack.social ? {
      ...pack.social,
      launchPosts: (pack.social.launchPosts || []).filter((p) => !cfg?.hasSelection || selectedSocial.has(normaliseCampaignChannel(p?.platform || ""))),
      followUps: (pack.social.followUps || []).filter((p) => !cfg?.hasSelection || selectedSocial.has(normaliseCampaignChannel(p?.platform || ""))),
    } : pack.social,
    press: cfg?.includePress === false ? null : pack.press,
    video: cfg?.includeVideo === false ? null : pack.video,
    leadCapture: pack.leadCapture,
  };
  push("pack", visiblePack);
  return out;
}

function snippet(text: string, rx: RegExp, radius = 40): string | undefined {
  const m = text.match(rx);
  if (!m || m.index === undefined) return undefined;
  const start = Math.max(0, m.index - radius);
  const end = Math.min(text.length, m.index + m[0].length + radius);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

export function checkPackQuality(pack: CampaignPack, brief: CampaignBrief): QualityResult {
  const issues: QualityIssue[] = [];
  const chosenCta = norm(brief.cta).trim();

  const all = collectAllText(pack, brief);
  // Use a single-space join so field boundaries don't create phantom "excess whitespace".
  const joined = all.map((a) => a.text).join(" ");
  const nJoined = norm(joined);

  // 1) Banned phrases
  for (const p of BANNED_PHRASES) {
    if (nJoined.includes(p)) {
      issues.push({ code: "banned_phrase", message: `Contains disallowed phrase: "${p}"`, where: "pack", matchedSnippet: p, source: "quality_guard_logic" });
    }
  }

  // 2) Broken patterns — run on grammar-normalised text where allowed tokens are neutralised
  const grammarText = neutraliseAllowedTokens(joined);
  for (const { rx, label } of BROKEN_PATTERNS) {
    // Locate the specific field so we can point at it, not just the joined blob.
    const hit = all.find((a) => rx.test(neutraliseAllowedTokens(a.text)));
    if (hit) {
      const snip = snippet(neutraliseAllowedTokens(hit.text), rx);
      issues.push({
        code: "broken_phrase",
        message: `Broken grammar (${label})${snip ? `: "${snip}"` : ""}`,
        where: hit.key,
        matchedSnippet: snip,
        source: "quality_guard_logic",
      });
    } else if (rx.test(grammarText)) {
      issues.push({ code: "broken_phrase", message: `Broken grammar (${label})`, source: "quality_guard_logic" });
    }
  }

  // 3) Placeholder leaks — disallowed brief tokens
  if (DISALLOWED_TOKEN_RE.test(joined)) {
    const snip = snippet(joined, DISALLOWED_TOKEN_RE);
    issues.push({ code: "placeholder_leak", message: `Unrendered brief token in output${snip ? `: "${snip}"` : ""}`, where: "pack", matchedSnippet: snip, source: "quality_guard_logic" });
  }
  // Any other unresolved token that isn't in the allow-list is also a leak.
  const seenUnknown = new Set<string>();
  for (const m of joined.matchAll(UNKNOWN_TOKEN_RE)) {
    const name = m[1].toLowerCase();
    if (ALLOWED_TOKENS[name]) continue;
    if (/^(offer|audience|industry|geography|goal|cta)$/.test(name)) continue; // handled above
    if (seenUnknown.has(name)) continue;
    seenUnknown.add(name);
    issues.push({ code: "placeholder_leak", message: `Unknown unresolved token: {{${name}}}`, where: "pack", matchedSnippet: `{{${name}}}`, source: "quality_guard_logic" });
  }

  // 4) Blanks in key fields
  const cfg = getCampaignChannelConfig(brief);
  const mustHaveNonEmpty: [string, string | undefined][] = [
    ["strategy.positioning", pack.strategy?.positioning],
    ["strategy.bigIdea", pack.strategy?.bigIdea],
    ["landing.headline", pack.landing?.headline],
    ["landing.subheadline", pack.landing?.subheadline],
    ["offer.framing", pack.offer?.framing],
    ["leadCapture.formTitle", pack.leadCapture?.formTitle],
  ];
  if (cfg.includePress) mustHaveNonEmpty.push(["press.opening", pack.press?.opening]);
  if (cfg.includeVideo) mustHaveNonEmpty.push(["video.script30", pack.video?.script30]);
  if (cfg.includeEmail) mustHaveNonEmpty.push(["emails[0].subject", pack.emails?.[0]?.subject]);
  for (const [k, v] of mustHaveNonEmpty) {
    if (!v || v.trim().length < 4) issues.push({ code: "blank_field", message: `Missing or too short: ${k}`, where: k, source: "quality_guard_logic" });
  }

  // 5) Subject lines <= 90 chars (allow slight slack over the 70 target)
  if (cfg.includeEmail) {
    (pack.emails || []).forEach((e, i) => {
      if (!e?.subject || e.subject.length > 90) {
        issues.push({ code: "subject_too_long", message: `Email #${i + 1} subject too long (${e?.subject?.length ?? 0} chars)`, where: `emails[${i}].subject`, matchedSnippet: e?.subject, source: "quality_guard_logic" });
      }
    });
  }

  // 6) Landing headline concise
  if (pack.landing?.headline && pack.landing.headline.length > 120) {
    issues.push({ code: "headline_too_long", message: `Landing headline too long (${pack.landing.headline.length} chars)`, where: "landing.headline", matchedSnippet: pack.landing.headline, source: "quality_guard_logic" });
  }

  // 7) CTA — invented CTAs anywhere that don't match user's chosen CTA
  if (chosenCta) {
    for (const invented of INVENTED_CTAS) {
      if (invented === chosenCta) continue;
      if (nJoined.includes(invented)) {
        issues.push({ code: "invented_cta", message: `Invented CTA present: "${invented}"`, where: "pack", matchedSnippet: invented, source: "quality_guard_logic" });
      }
    }
    // Landing / offer / leadCapture CTA fields must match user's CTA
    const ctaChecks: [string, string | undefined][] = [
      ["landing.cta", pack.landing?.cta],
      ["offer.cta", pack.offer?.cta],
      ["leadCapture.ctaLabel", pack.leadCapture?.ctaLabel],
    ];
    for (const [k, v] of ctaChecks) {
      if (v && norm(v).trim() !== chosenCta) {
        issues.push({ code: "cta_mismatch", message: `${k} does not match chosen CTA`, where: k, matchedSnippet: v, source: "quality_guard_logic" });
      }
    }
  }

  // 8) Raw brief-field stuffing — only fail when a long, distinctive slice is copied repeatedly.
  // Short product/category names (e.g. "AI-supported growth workspace") are allowed to recur.
  const bigFields = [brief.offer, brief.audience].filter((f) => f && f.length >= 30);
  for (const f of bigFields) {
    const cleanField = f.replace(/\s+/g, " ").trim();
    const slice = cleanField.slice(0, 90).toLowerCase();
    if (slice.split(/\s+/).length < 10) continue;
    const hits = all.filter((a) => norm(a.text).replace(/\s+/g, " ").includes(slice)).map((a) => a.key);
    if (hits.length > 3) {
      issues.push({
        code: "raw_brief_stuffing",
        message: `Long raw brief slice repeated across ${hits.length} assets`,
        where: hits.slice(0, 3).join(", "),
        matchedSnippet: `${slice}…`,
        source: "quality_guard_logic",
      });
    }
  }

  return { ok: issues.length === 0, issues };
}
