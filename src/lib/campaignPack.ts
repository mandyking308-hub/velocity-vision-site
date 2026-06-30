// Deterministic campaign pack generator. No network calls.
// TODO: replace with Lovable AI Gateway for richer, brand-aware output.

export type CampaignGoal = "leads" | "sales" | "signups" | "bookings" | "awareness";
export type CampaignKind = "lead_gen" | "launch" | "promo" | "nurture" | "re_engagement" | "pr_push";

export interface CampaignBrief {
  name: string;
  goal: CampaignGoal;
  kind: CampaignKind;
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
  outputs: string[]; // which pack sections to include
}

export interface SocialPost {
  platform: string;
  hook: string;
  short: string;
  long: string;
  cta: string;
  visualPrompt: string;
}

export interface CampaignPack {
  strategy: { positioning: string; bigIdea: string; messagingPillars: string[]; successMetric: string };
  landing: { headline: string; subheadline: string; sections: { title: string; body: string }[]; cta: string };
  offer: { framing: string; benefits: string[]; objections: { objection: string; response: string }[]; cta: string };
  emails: { subject: string; preview: string; body: string }[];
  social: {
    launchPosts: SocialPost[];
    followUps: SocialPost[];
    hooks: string[];
    ctas: string[];
    launchWeek: { day: string; theme: string; post: string }[];
    repostIdeas: string[];
  };
  press: {
    headline: string;
    subheadline: string;
    opening: string;
    body: string[];
    quote: string;
    boilerplate: string;
    contactLine: string;
  };
  video: {
    hooks: string[];
    script30: string;
    script60: string;
    talkingHead: string;
    bRoll: string;
    shotList: string[];
    storyboard: string[];
    onScreenText: string[];
    captionText: string;
    ctaEndings: string[];
  };
  leadCapture: {
    formTitle: string;
    fields: { label: string; type: string; required: boolean }[];
    ctaLabel: string;
    thankYou: string;
  };
}

const PLATFORMS = ["LinkedIn", "Instagram", "X", "Facebook", "TikTok"];

function makeHooks(brief: CampaignBrief): string[] {
  return [
    `Most ${brief.audience} struggle with one thing: ${brief.offer.split(" ").slice(0, 6).join(" ")}.`,
    `If you're in ${brief.industry} and you've never tried ${brief.offer}, read this.`,
    `Here's the fastest way to ${brief.cta.toLowerCase()} without the usual friction.`,
    `What ${brief.audience} get wrong about ${brief.offer.toLowerCase()}.`,
    `${brief.geography} ${brief.audience} — this one's for you.`,
    `We built ${brief.offer} so you don't have to.`,
  ];
}

function makeCtas(brief: CampaignBrief): string[] {
  return [
    brief.cta,
    `Book a 15-min call → ${brief.cta}`,
    `See how it works`,
    `Get the free guide`,
    `Start your trial`,
    `Reply "YES" for the details`,
  ];
}

function makeSocialPost(platform: string, hook: string, brief: CampaignBrief, ctas: string[]): SocialPost {
  const cta = ctas[Math.floor(Math.random() * ctas.length)] || brief.cta;
  const short = `${hook}\n\n${brief.offer} — built for ${brief.audience}.\n\n${cta}`;
  const long = `${hook}\n\n${brief.offer}\n\nWhy it matters for ${brief.audience} in ${brief.industry}:\n• Saves time on the work that doesn't move the needle\n• Built for ${brief.geography} businesses\n• Designed around the way you actually sell\n\nTone: ${brief.tone}\nNext step: ${cta}`;
  return {
    platform,
    hook,
    short,
    long,
    cta,
    visualPrompt: `${brief.tone} brand visual: ${brief.offer}, ${brief.audience}, ${brief.industry} context, clean composition, on-brand colour palette, plenty of negative space`,
  };
}

export function generatePack(brief: CampaignBrief): CampaignPack {
  const hooks = makeHooks(brief);
  const ctas = makeCtas(brief);

  const launchPosts: SocialPost[] = PLATFORMS.map((p, i) =>
    makeSocialPost(p, hooks[i % hooks.length], brief, ctas)
  );
  const followUps: SocialPost[] = PLATFORMS.flatMap((p) =>
    [0, 1].map((i) => makeSocialPost(p, hooks[(i + 2) % hooks.length], brief, ctas))
  ).slice(0, 10);

  return {
    strategy: {
      positioning: `${brief.name} positions ${brief.offer} as the fastest way for ${brief.audience} in ${brief.industry} to ${brief.cta.toLowerCase()}.`,
      bigIdea: `Cut the time-to-result for ${brief.audience} from weeks to days.`,
      messagingPillars: [
        `Built for ${brief.audience}`,
        `Outcome-led, not feature-led`,
        `Designed for ${brief.geography} ${brief.industry}`,
        `${brief.tone} voice end-to-end`,
      ],
      successMetric: brief.goal === "awareness" ? "Reach and engagement" : brief.goal === "leads" ? "Qualified leads captured" : brief.goal === "sales" ? "Revenue closed" : brief.goal === "signups" ? "New sign-ups" : "Bookings completed",
    },
    landing: {
      headline: `${brief.offer}, built for ${brief.audience}.`,
      subheadline: `The fastest way to ${brief.cta.toLowerCase()} — without hiring an agency.`,
      sections: [
        { title: "The problem", body: `${brief.audience} in ${brief.industry} waste hours on work that doesn't convert.` },
        { title: "What you get", body: `${brief.offer}. Delivered in a format you can launch this week.` },
        { title: "Who it's for", body: `${brief.audience} based in ${brief.geography}, ready to move quickly.` },
        { title: "How it works", body: `Tell us your goal → we generate the pack → you launch.` },
        { title: "Pricing", body: `From ${brief.pricePoint}. No long contracts.` },
      ],
      cta: brief.cta,
    },
    offer: {
      framing: `For ${brief.pricePoint}, you get ${brief.offer} ready to launch — not another deck to read.`,
      benefits: [
        `Launch in days, not quarters`,
        `Tailored to ${brief.audience}`,
        `${brief.tone} voice, on-brand`,
        `Built around the goal: ${brief.goal}`,
        `Optimised for ${brief.channels.join(", ") || "your channels"}`,
      ],
      objections: [
        { objection: `"We don't have time."`, response: `That's exactly why this exists. From brief to pack in under an hour.` },
        { objection: `"We've tried agencies before."`, response: `This isn't an agency. You stay in control, the work just gets done.` },
        { objection: `"Will it sound like us?"`, response: `You set the tone (${brief.tone}). We follow it. You edit before launch.` },
      ],
      cta: brief.cta,
    },
    emails: [
      { subject: `${brief.offer} — quick intro`, preview: `Built for ${brief.audience}`, body: `Hi {{first_name}},\n\nQuick one — we just launched ${brief.offer} and thought of you.\n\n${brief.cta}\n\n— {{sender}}` },
      { subject: `Why ${brief.audience} care`, preview: `The real reason`, body: `{{first_name}},\n\nMost ${brief.audience} in ${brief.industry} are stuck on the same thing. Here's what we've seen actually work.\n\n${brief.cta}` },
      { subject: `A 60-second story`, preview: `From a recent client`, body: `{{first_name}},\n\nLast month, a ${brief.industry} team used ${brief.offer} to ${brief.goal === "leads" ? "fill their pipeline" : "hit their goal"} in 14 days.\n\nWant the playbook? ${brief.cta}` },
      { subject: `Last reminder`, preview: `Closing soon`, body: `{{first_name}},\n\nDeadline is ${brief.deadline}. After that the offer changes.\n\n${brief.cta}` },
      { subject: `One question`, preview: `Genuinely curious`, body: `{{first_name}},\n\nIf not now, when? Happy to share what we'd do in your shoes.\n\n— {{sender}}` },
    ],
    social: {
      launchPosts,
      followUps,
      hooks,
      ctas,
      launchWeek: [
        { day: "Mon", theme: "Tease the problem", post: hooks[0] },
        { day: "Tue", theme: "Reveal the offer", post: `${brief.offer} — live today. ${brief.cta}` },
        { day: "Wed", theme: "Proof / story", post: `Here's what a ${brief.industry} team did with this last month.` },
        { day: "Thu", theme: "Objection handling", post: `"We don't have time." Here's why that's exactly the point.` },
        { day: "Fri", theme: "Direct CTA", post: `${brief.cta}. Closes ${brief.deadline}.` },
        { day: "Sat", theme: "Soft nurture", post: `Behind the scenes of how we built ${brief.offer}.` },
        { day: "Sun", theme: "Final push", post: `Last 24h. ${brief.cta}.` },
      ],
      repostIdeas: [
        "Pin best launch post to top of profile",
        "Turn launch post into a 15s Reel/TikTok",
        "Reshare client quote as a static carousel",
        "Repurpose email #3 as a LinkedIn article",
      ],
    },
    press: {
      headline: `${brief.name}: a new way for ${brief.audience} to ${brief.cta.toLowerCase()}`,
      subheadline: `${brief.offer}, built for ${brief.industry} in ${brief.geography}.`,
      opening: `${brief.geography}, ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} — Today marks the launch of ${brief.name}, a new ${brief.kind.replace("_", " ")} campaign aimed at helping ${brief.audience} ${brief.cta.toLowerCase()} faster than ever before.`,
      body: [
        `${brief.name} is designed around the realities of ${brief.industry}: limited time, limited budget, and the need to show measurable results quickly.`,
        `By packaging ${brief.offer} into a self-serve format, ${brief.audience} can move from idea to launch in days rather than months.`,
        `The campaign runs through ${brief.deadline} and is available across ${brief.channels.join(", ") || "multiple channels"}.`,
      ],
      quote: `"We built ${brief.name} because ${brief.audience} kept telling us the same thing — they didn't need more advice, they needed the work done. This is that," said a spokesperson.`,
      boilerplate: `About: We help ${brief.audience} launch marketing campaigns without hiring an agency. Self-serve, founder-led, outcome-focused.`,
      contactLine: `For press enquiries, reply to this release.`,
    },
    video: {
      hooks: [
        `"If you're a ${brief.audience.split(" ").slice(-1)[0] || "founder"}, stop scrolling."`,
        `"Here's the fastest way to ${brief.cta.toLowerCase()} in ${brief.industry}."`,
        `"We tested ${brief.offer} for 30 days. This is what happened."`,
      ],
      script30: `[0-3s] Hook: "${hooks[0]}"\n[3-10s] Problem: ${brief.audience} waste time on the wrong work.\n[10-22s] Solution: ${brief.offer}.\n[22-30s] CTA: ${brief.cta}.`,
      script60: `[0-5s] Hook: "${hooks[1]}"\n[5-15s] Why this matters for ${brief.audience}.\n[15-30s] What ${brief.offer} actually does.\n[30-45s] Mini case / proof point.\n[45-55s] Objection: "We don't have time" → addressed.\n[55-60s] CTA: ${brief.cta}.`,
      talkingHead: `Single-shot to camera, ${brief.tone} delivery, no cuts. Hook in the first 3 seconds, CTA on screen at the end.`,
      bRoll: `Mix of product / workspace footage, ${brief.industry} context shots, on-screen text overlay reinforcing key claims.`,
      shotList: [
        "Tight talking-head, eye-level, soft daylight",
        `B-roll: ${brief.industry} work environment`,
        "Screen recording of the offer in action",
        "Customer reaction / quote card",
        "End card with CTA",
      ],
      storyboard: ["Hook frame", "Problem frame", "Reveal frame", "Proof frame", "CTA frame"],
      onScreenText: [
        brief.offer,
        `Built for ${brief.audience}`,
        `From ${brief.pricePoint}`,
        brief.cta,
      ],
      captionText: `${brief.offer} — built for ${brief.audience}. ${brief.cta}.`,
      ctaEndings: [
        `${brief.cta} — link in bio`,
        `Comment "${brief.goal.toUpperCase()}" and we'll send the details`,
        `DM us "${brief.name}" for early access`,
      ],
    },
    leadCapture: {
      formTitle: `Get ${brief.offer}`,
      fields: [
        { label: "Full name", type: "text", required: true },
        { label: "Work email", type: "email", required: true },
        { label: "Company", type: "text", required: false },
        { label: "What are you hoping to achieve?", type: "textarea", required: false },
      ],
      ctaLabel: brief.cta,
      thankYou: `Thanks — we'll be in touch within one working day. In the meantime, watch your inbox for the next step.`,
    },
  };
}

export function makeSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}
