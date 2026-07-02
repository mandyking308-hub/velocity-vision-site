import { getCampaignChannelConfig, normaliseCampaignChannel, filterSupportedChannels, type CampaignBrief, type CampaignPack } from "./campaignPack";

const clean = (v: any): string => {
  if (v === null || v === undefined) return "";
  const s = String(v)
    .replace(/\{\{\s*first_name\s*\}\}/gi, "[First name]")
    .replace(/\{\{\s*sender\s*\}\}/gi, "[Sender]")
    .replace(/\{\{\s*company\s*\}\}/gi, "[Company]")
    .replace(/\{\{\s*([^}]+)\s*\}\}/g, (_m, token) => `[${String(token).trim().replace(/_/g, " ")}]`)
    .replace(/[{}]/g, "")
    .trim();
  if (!s) return "";
  if (/^(undefined|null|qa-seed:\/\/)/i.test(s)) return "";
  return s;
};

const line = (label: string, value: any): string => {
  const v = clean(value);
  return v ? `- **${label}:** ${v}\n` : "";
};

const heading = (level: number, text: string) => `${"#".repeat(level)} ${text}\n\n`;

const bullets = (items: any[] | undefined): string => {
  if (!items?.length) return "";
  return items.map((i) => `- ${clean(i)}`).filter((l) => l !== "- ").join("\n") + "\n\n";
};

export function slugify(s: string): string {
  return (s || "campaign")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "campaign";
}

export function formatCampaignPackMarkdown(campaign: { name: string; slug?: string | null; cadenceSummary?: string }, brief: CampaignBrief | null, pack: CampaignPack): string {
  return buildCampaignMarkdown({
    name: campaign.name,
    brief,
    pack,
    cadenceSummary: campaign.cadenceSummary,
  });
}

export function buildCampaignMarkdown(opts: {
  name: string;
  brief: CampaignBrief | null;
  pack: CampaignPack;
  cadenceSummary?: string;
}): string {
  const { name, brief, pack, cadenceSummary } = opts;
  const cfg = getCampaignChannelConfig(brief);
  const hasSelection = cfg.hasSelection;
  const selectedSocial = cfg.selectedSocial;
  const includeEmail = cfg.includeEmail;
  const includePress = cfg.includePress;
  const includeVideo = cfg.includeVideo;
  const includeSocial = cfg.includeSocial;
  let md = "";


  md += heading(1, `Campaign Pack: ${clean(name) || "Untitled"}`);
  md += `_Generated ${new Date().toLocaleString()}_\n\n---\n\n`;

  // Summary
  md += heading(2, "Campaign Summary");
  md += line("Offer", brief?.offer);
  md += line("Audience", brief?.audience);
  md += line("Goal", brief?.goal);
  md += line("Channels", brief?.channels?.join(", "));
  md += line("CTA", brief?.cta || pack.landing?.cta);
  md += line("Timing", cadenceSummary || brief?.deadline);
  md += "\n";

  // Strategy
  if (pack.strategy) {
    md += heading(2, "Strategy");
    md += line("Positioning", pack.strategy.positioning);
    md += line("Big idea", pack.strategy.bigIdea);
    md += line("Success metric", pack.strategy.successMetric);
    if (pack.strategy.messagingPillars?.length) {
      md += `\n**Messaging pillars**\n\n${bullets(pack.strategy.messagingPillars)}`;
    }
  }

  // Landing
  if (pack.landing) {
    md += heading(2, "Landing Page Copy");
    md += line("Headline", pack.landing.headline);
    md += line("Subheadline", pack.landing.subheadline);
    md += line("CTA", pack.landing.cta);
    if (pack.landing.sections?.length) {
      md += `\n**Sections**\n\n`;
      pack.landing.sections.forEach((s) => {
        const t = clean(s.title), b = clean(s.body);
        if (t || b) md += `### ${t || "Section"}\n\n${b}\n\n`;
      });
    }
  }

  // Offer
  if (pack.offer) {
    md += heading(2, "Offer Framing");
    md += line("Framing", pack.offer.framing);
    if (pack.offer.benefits?.length) {
      md += `**Benefits**\n\n${bullets(pack.offer.benefits)}`;
    }
    if (pack.offer.objections?.length) {
      md += `**Objection handling**\n\n`;
      pack.offer.objections.forEach((o) => {
        const q = clean(o.objection), a = clean(o.response);
        if (q || a) md += `- **${q}** — ${a}\n`;
      });
      md += "\n";
    }
  }

  // Emails
  if (includeEmail && pack.emails?.length) {
    md += heading(2, "Email Sequence");
    pack.emails.forEach((e, i) => {
      md += `### Email ${i + 1}\n\n`;
      md += line("Subject", e.subject);
      md += line("Preview", e.preview);
      const body = clean(e.body);
      if (body) md += `\n**Body**\n\n${body}\n\n`;
    });
  }

  // Social — respect selected channels
  if (includeSocial && pack.social) {
    const filterPosts = (arr: any[] | undefined) =>
      (arr || []).filter((p) => !hasSelection || selectedSocial.includes(normaliseCampaignChannel(p?.platform || "")));
    const launch = filterPosts(pack.social.launchPosts);
    const follow = filterPosts(pack.social.followUps);
    if (launch.length || follow.length || pack.social.launchWeek?.length) {
      md += heading(2, "Social Media Pack");
      if (hasSelection) md += `_Selected platforms: ${selectedSocial.join(", ") || "none"}_\n\n`;
      [...launch, ...follow].forEach((p, i) => {
        md += `### ${clean(p.platform) || "Post"} — ${i < launch.length ? "Launch" : "Follow-up"}\n\n`;
        md += line("Platform", p.platform);
        md += line("Hook", p.hook);
        md += line("Short post", p.short);
        md += line("Long post", p.long);
        md += line("CTA", p.cta);
        md += line("Visual prompt", p.visualPrompt);
        md += "\n";
      });
      if (pack.social.launchWeek?.length) {
        md += `**Launch week sequence**\n\n`;
        pack.social.launchWeek.forEach((d) => {
          const day = clean(d.day), theme = clean(d.theme), post = clean(d.post);
          if (day || theme || post) md += `- **${day} — ${theme}:** ${post}\n`;
        });
        md += "\n";
      }
    }

    // Optional additional channels (kept clearly separate)
    const extra: any = (pack.social as any).optionalAdditional;
    const extraLaunch = extra?.launchPosts || [];
    const extraFollow = extra?.followUps || [];
    if (hasSelection && (extraLaunch.length || extraFollow.length)) {
      md += heading(2, "Optional Additional Channels");
      md += `_Not part of your selected pack — included only as extras you can choose to use._\n\n`;
      [...extraLaunch, ...extraFollow].forEach((p: any, i: number) => {
        md += `### ${clean(p.platform) || "Post"} — ${i < extraLaunch.length ? "Launch" : "Follow-up"}\n\n`;
        md += line("Platform", p.platform);
        md += line("Hook", p.hook);
        md += line("Short post", p.short);
        md += line("Long post", p.long);
        md += line("CTA", p.cta);
        md += line("Visual prompt", p.visualPrompt);
        md += "\n";
      });
    }
  }


  // Press
  if (includePress && pack.press) {
    md += heading(2, "Press / PR Pack");
    md += line("Headline", pack.press.headline);
    md += line("Subheadline", pack.press.subheadline);
    const opening = clean(pack.press.opening);
    if (opening) md += `\n**Opening**\n\n${opening}\n\n`;
    if (pack.press.body?.length) {
      md += `**Body**\n\n`;
      pack.press.body.forEach((p) => { const b = clean(p); if (b) md += `${b}\n\n`; });
    }
    const quote = clean(pack.press.quote);
    if (quote) md += `**Quote**\n\n> ${quote}\n\n`;
    md += line("Boilerplate", pack.press.boilerplate);
    md += line("Contact line", pack.press.contactLine);
    md += "\n";
  }

  // Video
  if (includeVideo && pack.video) {
    md += heading(2, "Video Pack");
    if (pack.video.hooks?.length) {
      md += `**Hooks**\n\n${bullets(pack.video.hooks)}`;
    }
    const s30 = clean(pack.video.script30);
    if (s30) md += `**30-second script**\n\n${s30}\n\n`;
    const s60 = clean(pack.video.script60);
    if (s60) md += `**60-second script**\n\n${s60}\n\n`;
    md += line("Talking-head direction", pack.video.talkingHead);
    md += line("B-roll", pack.video.bRoll);
    if (pack.video.shotList?.length) md += `\n**Shot list**\n\n${bullets(pack.video.shotList)}`;
    if (pack.video.storyboard?.length) md += `**Storyboard**\n\n${bullets(pack.video.storyboard)}`;
    if (pack.video.onScreenText?.length) md += `**On-screen text**\n\n${bullets(pack.video.onScreenText)}`;
    md += line("Caption", pack.video.captionText);
    if (pack.video.ctaEndings?.length) md += `\n**CTA endings**\n\n${bullets(pack.video.ctaEndings)}`;
  }

  // Lead capture
  if (pack.leadCapture) {
    md += heading(2, "Lead Capture");
    md += line("Form title", pack.leadCapture.formTitle);
    md += line("CTA label", pack.leadCapture.ctaLabel);
    md += line("Thank-you message", pack.leadCapture.thankYou);
    if (pack.leadCapture.fields?.length) {
      md += `\n**Fields**\n\n`;
      pack.leadCapture.fields.forEach((f) => {
        const l = clean(f.label);
        if (l) md += `- ${l} (${clean(f.type) || "text"}${f.required ? ", required" : ""})\n`;
      });
      md += "\n";
    }
  }

  md += `---\n\n`;
  md += heading(2, "Important Notes");
  md += `- AI-generated draft for review and editing before use.\n`;
  md += `- No guarantee of sales, replies, revenue, inbox placement, deliverability or media coverage.\n`;
  md += `- Sending remains subject to legal acceptance, sender verification, safe contacts and available credits.\n`;

  // Strip triple+ blank lines
  return md.replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
