// Deterministic campaign pack generator — EMERGENCY FALLBACK ONLY.
// The customer-facing generation path is the AI edge function
// `generate-campaign-pack`. This fallback exists so a gateway outage does not
// leave the user stranded, but its output is intentionally shorter and safer
// (no invented CTAs, no unsupported claims, no time-to-result promises).
// It always honours the user's chosen CTA verbatim.

export type CampaignGoal = "leads" | "sales" | "signups" | "bookings" | "awareness";
export type CampaignKind = "lead_gen" | "launch" | "promo" | "nurture" | "re_engagement" | "pr_push";
export type CampaignLanguage = "en" | "es" | "fr" | "de" | "pt" | "it" | "nl";

export const CAMPAIGN_LANGUAGES: { value: CampaignLanguage; label: string; supported: boolean }[] = [
  { value: "en", label: "English", supported: true },
  { value: "es", label: "Español", supported: true },
  { value: "fr", label: "Français", supported: false },
  { value: "de", label: "Deutsch", supported: false },
  { value: "pt", label: "Português", supported: false },
  { value: "it", label: "Italiano", supported: false },
  { value: "nl", label: "Nederlands", supported: false },
];

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
  outputs: string[];
  /** Output language. Defaults to "en". ES generates natively; unsupported langs fall back. */
  language?: CampaignLanguage;
}

export interface SocialPost { platform: string; hook: string; short: string; long: string; cta: string; visualPrompt: string; }

export interface CampaignPack {
  language: CampaignLanguage;
  generatedAs: CampaignLanguage; // actual rendered language (after fallback)
  strategy: { positioning: string; bigIdea: string; messagingPillars: string[]; successMetric: string };
  landing: { headline: string; subheadline: string; sections: { title: string; body: string }[]; cta: string };
  offer: { framing: string; benefits: string[]; objections: { objection: string; response: string }[]; cta: string };
  emails: { subject: string; preview: string; body: string }[];
  social: { launchPosts: SocialPost[]; followUps: SocialPost[]; hooks: string[]; ctas: string[]; launchWeek: { day: string; theme: string; post: string }[]; repostIdeas: string[]; };
  press: { headline: string; subheadline: string; opening: string; body: string[]; quote: string; boilerplate: string; contactLine: string; } | null;
  video: { hooks: string[]; script30: string; script60: string; talkingHead: string; bRoll: string; shotList: string[]; storyboard: string[]; onScreenText: string[]; captionText: string; ctaEndings: string[]; } | null;
  leadCapture: { formTitle: string; fields: { label: string; type: string; required: boolean }[]; ctaLabel: string; thankYou: string; };
}

const PLATFORMS = ["LinkedIn", "Instagram", "X", "Facebook", "TikTok"];

export function normaliseCampaignChannel(c: string): string {
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

export function getCampaignChannelConfig(brief: Pick<CampaignBrief, "channels" | "outputs"> | null | undefined) {
  const channels = (brief?.channels || []).map(normaliseCampaignChannel);
  const outputs = (brief?.outputs || []).map((o) => (o || "").toLowerCase().trim());
  const hasSelection = channels.length > 0;
  const selectedSocial = PLATFORMS.filter((p) => channels.includes(p));
  return {
    channels,
    hasSelection,
    selectedSocial,
    includeSocial: !hasSelection || selectedSocial.length > 0 || outputs.includes("social"),
    includeEmail: (!hasSelection && !outputs.length) || channels.includes("Email") || outputs.includes("email"),
    includePress: (!hasSelection && !outputs.length) || channels.includes("PR") || outputs.includes("press"),
    includeVideo: channels.includes("Video") || outputs.includes("video"),
  };
}

const SIGNOFF_LINE_RE = /^(Best regards|Best|Thanks|Thank you|Cheers|Kind regards|Regards|Warmly|Speak soon|Sincerely),?$/i;
const SIGNOFF_INLINE_RE = /^(Best regards|Best|Thanks|Thank you|Cheers|Kind regards|Regards|Warmly|Speak soon|Sincerely),?\s+\S.+$/i;
const SENDER_ONLY_RE = /^[-—]?\s*(\{\{\s*sender\s*\}\}|\[sender\])\s*$/i;

const meaningfulText = (value: unknown, minLength: number) =>
  typeof value === "string" &&
  value
    .replace(/\u00a0/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim().length >= minLength;

function completeObjections(
  fallback: CampaignPack["offer"]["objections"],
  generated: unknown,
): CampaignPack["offer"]["objections"] {
  const raw = Array.isArray(generated) ? generated : [];
  const count = Math.max(3, raw.length, fallback.length);
  return Array.from({ length: count }, (_, i) => {
    const item = raw[i] || {};
    const fallbackItem = fallback[i % fallback.length];
    return {
      objection: meaningfulText((item as any).objection, 4) ? String((item as any).objection).trim() : fallbackItem.objection,
      response: meaningfulText((item as any).response, 8) ? String((item as any).response).trim() : fallbackItem.response,
    };
  });
}

export function ensureEmailCtaBeforeSignoff(body: string, chosenCta: string): string {
  const cta = (chosenCta || "").trim();
  if (!body || !cta) return body || "";

  const lines = body.replace(/\r\n/g, "\n").split("\n").map((line) => line.trim());
  const nonEmpty = lines.filter(Boolean);
  const normCta = cta.toLowerCase();
  const ctaLines = nonEmpty.filter((line) => line.toLowerCase().includes(normCta));
  const ctaLine = ctaLines[0] || cta;
  const withoutCta = nonEmpty.filter((line) => !line.toLowerCase().includes(normCta));

  let signoffIndex = withoutCta.findIndex((line) => SIGNOFF_LINE_RE.test(line) || SIGNOFF_INLINE_RE.test(line) || SENDER_ONLY_RE.test(line));
  let bodyLines: string[];
  let signoffLines: string[];

  if (signoffIndex >= 0) {
    bodyLines = withoutCta.slice(0, signoffIndex);
    signoffLines = withoutCta.slice(signoffIndex);
  } else {
    bodyLines = withoutCta;
    signoffLines = ["Best,", "{{sender}}"];
  }

  if (signoffLines.length === 1 && SIGNOFF_LINE_RE.test(signoffLines[0])) {
    signoffLines.push("{{sender}}");
  }

  return [...bodyLines, "", ctaLine, "", ...signoffLines]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function enforceCampaignChannels(pack: CampaignPack, brief: CampaignBrief): CampaignPack {
  const cfg = getCampaignChannelConfig(brief);
  const filterPosts = (arr: SocialPost[] | undefined) =>
    (arr || []).filter((p) => !cfg.hasSelection || cfg.selectedSocial.includes(normaliseCampaignChannel(p?.platform || "")));

  return {
    ...pack,
    emails: cfg.includeEmail ? (pack.emails || []) : [],
    social: cfg.includeSocial ? {
      ...pack.social,
      launchPosts: filterPosts(pack.social?.launchPosts),
      followUps: filterPosts(pack.social?.followUps),
      hooks: cfg.selectedSocial.length || !cfg.hasSelection ? (pack.social?.hooks || []) : [],
      ctas: cfg.selectedSocial.length || !cfg.hasSelection ? (pack.social?.ctas || []) : [],
      launchWeek: cfg.selectedSocial.length || !cfg.hasSelection ? (pack.social?.launchWeek || []) : [],
      repostIdeas: cfg.selectedSocial.length || !cfg.hasSelection ? (pack.social?.repostIdeas || []) : [],
    } : { launchPosts: [], followUps: [], hooks: [], ctas: [], launchWeek: [], repostIdeas: [] },
    press: cfg.includePress ? pack.press : null,
    video: cfg.includeVideo ? pack.video : null,
  };
}

export function mergeGeneratedPack(brief: CampaignBrief, aiPack: Partial<CampaignPack> | any, generatedAs?: string): CampaignPack {
  const base = generatePack(brief);
  const cfg = getCampaignChannelConfig(brief);
  const rawEmails = cfg.includeEmail
    ? (Array.isArray(aiPack?.emails) && aiPack.emails.length ? aiPack.emails : base.emails)
    : [];
  const merged = {
    language: (brief.language || "en") as CampaignLanguage,
    generatedAs: (generatedAs || brief.language || "en") as CampaignLanguage,
    strategy: { ...base.strategy, ...(aiPack?.strategy || {}) },
    landing: { ...base.landing, ...(aiPack?.landing || {}), cta: brief.cta },
    offer: {
      ...base.offer,
      ...(aiPack?.offer || {}),
      objections: completeObjections(base.offer.objections, aiPack?.offer?.objections),
      cta: brief.cta,
    },
    emails: rawEmails.map((email: any) => ({
      ...email,
      body: ensureEmailCtaBeforeSignoff(String(email?.body || ""), brief.cta),
    })),
    social: { ...base.social, ...(aiPack?.social || {}) },
    press: cfg.includePress
      ? (aiPack?.press === null ? null : { ...(base.press || {}), ...(aiPack?.press || {}) })
      : null,
    video: cfg.includeVideo
      ? (aiPack?.video === null ? null : { ...(base.video || {}), ...(aiPack?.video || {}) })
      : null,
    leadCapture: { ...base.leadCapture, ...(aiPack?.leadCapture || {}), ctaLabel: brief.cta },
  } as CampaignPack;
  return enforceCampaignChannels(merged, brief);
}

// ---------- Per-language string packs ----------
type Strings = {
  hooks: (b: CampaignBrief) => string[];
  ctas: (b: CampaignBrief) => string[];
  postShort: (hook: string, b: CampaignBrief, cta: string) => string;
  postLong: (hook: string, b: CampaignBrief, cta: string) => string;
  visualPrompt: (b: CampaignBrief) => string;
  positioning: (b: CampaignBrief) => string;
  bigIdea: (b: CampaignBrief) => string;
  pillars: (b: CampaignBrief) => string[];
  successMetric: (g: CampaignGoal) => string;
  landingHeadline: (b: CampaignBrief) => string;
  landingSub: (b: CampaignBrief) => string;
  landingSections: (b: CampaignBrief) => { title: string; body: string }[];
  offerFraming: (b: CampaignBrief) => string;
  offerBenefits: (b: CampaignBrief) => string[];
  offerObjections: (b: CampaignBrief) => { objection: string; response: string }[];
  emails: (b: CampaignBrief) => { subject: string; preview: string; body: string }[];
  weekDays: string[];
  weekThemes: string[];
  repostIdeas: (b: CampaignBrief) => string[];
  pressOpening: (b: CampaignBrief) => string;
  pressBody: (b: CampaignBrief) => string[];
  pressQuote: (b: CampaignBrief) => string;
  pressBoilerplate: (b: CampaignBrief) => string;
  pressContact: string;
  videoHooks: (b: CampaignBrief, hooks: string[]) => string[];
  script30: (b: CampaignBrief, hooks: string[]) => string;
  script60: (b: CampaignBrief, hooks: string[]) => string;
  talkingHead: (b: CampaignBrief) => string;
  bRoll: (b: CampaignBrief) => string;
  shotList: (b: CampaignBrief) => string[];
  storyboard: string[];
  ctaEndings: (b: CampaignBrief) => string[];
  leadForm: (b: CampaignBrief) => { formTitle: string; fields: { label: string; type: string; required: boolean }[]; ctaLabel: string; thankYou: string };
  dateLocale: string;
};

const EN: Strings = {
  hooks: (b) => [
    `A short note for ${b.audience}.`,
    `${b.industry} teams — here's a simpler way to ${b.cta.toLowerCase()}.`,
    `What ${b.audience} tell us about ${b.industry} outreach.`,
    `Rethinking how ${b.audience} approach ${b.industry}.`,
    `${b.geography} ${b.audience}: this is for you.`,
    `${b.offer} — a quick overview.`,
  ],
  ctas: (b) => [b.cta],
  postShort: (h, b, cta) => `${h}\n\n${b.offer}\n\n${cta}`,
  postLong: (h, b, cta) => `${h}\n\n${b.offer}\n\nWhy it matters for ${b.audience}:\n• Focused on the work that actually moves your pipeline\n• Designed for ${b.geography} teams\n• Kept in a ${b.tone.toLowerCase()} voice\n\nNext step: ${cta}`,
  visualPrompt: (b) => `${b.tone} brand visual: ${b.offer}, ${b.audience}, ${b.industry} context, clean composition, on-brand palette, plenty of negative space`,
  positioning: (b) => `${b.name} helps ${b.audience} in ${b.industry} take a clearer path to ${b.cta.toLowerCase()}.`,
  bigIdea: (b) => `A simpler operating rhythm for ${b.audience}, built around what actually works.`,
  pillars: (b) => [`Built for ${b.audience}`, `Outcome-led, not feature-led`, `Designed for ${b.geography} ${b.industry}`, `${b.tone} voice end-to-end`],
  successMetric: (g) => g === "awareness" ? "Reach and engagement" : g === "leads" ? "Qualified leads captured" : g === "sales" ? "Revenue closed" : g === "signups" ? "New sign-ups" : "Bookings completed",
  landingHeadline: (b) => `${b.offer}, for ${b.audience}.`,
  landingSub: (b) => `A clearer way to ${b.cta.toLowerCase()}.`,
  landingSections: (b) => [
    { title: "The problem", body: `${b.audience} in ${b.industry} spend too long on work that does not convert.` },
    { title: "What you get", body: `${b.offer}. Delivered in a format you can review and use.` },
    { title: "Who it's for", body: `${b.audience} based in ${b.geography}.` },
    { title: "How it works", body: `Share your goal → we prepare the pack → you review and launch.` },
    { title: "Pricing", body: b.pricePoint ? `From ${b.pricePoint}.` : `Transparent pricing on our website.` },
  ],
  offerFraming: (b) => b.pricePoint
    ? `For ${b.pricePoint}, you get ${b.offer}, ready for you to review.`
    : `You get ${b.offer}, ready for you to review.`,
  offerBenefits: (b) => [`Focused on ${b.audience}`, `${b.tone} voice, on-brand`, `Aligned to your goal: ${b.goal}`, `Ready for ${b.channels.join(", ") || "your channels"}`, `You stay in control of what gets published`],
  offerObjections: () => [
    { objection: `"We don't have time."`, response: `The pack is drafted for you — you edit and approve before anything goes out.` },
    { objection: `"We've tried agencies before."`, response: `This is a workspace, not an agency. You stay in control of the work.` },
    { objection: `"Will it sound like us?"`, response: `You set the tone. We follow it. You edit before launch.` },
  ],
  emails: (b) => [
    { subject: `${b.name} — a quick introduction`, preview: `A short note`, body: `Hi {{first_name}},\n\nA short note about ${b.offer}. I thought it may be relevant for your team.\n\n${b.cta}\n\n— {{sender}}` },
    { subject: `A note for ${b.industry} teams`, preview: `Context for you`, body: `{{first_name}},\n\nMost ${b.audience} we speak to in ${b.industry} share a similar challenge. Here is how we think about it.\n\n${b.cta}` },
    { subject: `How we think about ${b.goal}`, preview: `Our approach`, body: `{{first_name}},\n\nA short summary of how ${b.offer} is set up and who it fits.\n\n${b.cta}` },
    { subject: b.deadline ? `A quick reminder before ${b.deadline}` : `A gentle follow-up`, preview: `Following up`, body: `{{first_name}},\n\n${b.deadline ? `Just a note before ${b.deadline}.` : "Following up on my previous note."} If it is useful, I would welcome a short conversation.\n\n${b.cta}` },
    { subject: `One quick question`, preview: `Genuinely curious`, body: `{{first_name}},\n\nIf this is not the right time, no problem. I would still welcome your view on where the priority sits right now.\n\n— {{sender}}` },
  ],
  weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  weekThemes: ["Introduce the problem", "Introduce the offer", "Context and framing", "Address objections", "Direct CTA", "Soft follow-up", "Closing note"],
  repostIdeas: () => ["Pin the launch post to your profile", "Turn the launch post into a short video", "Reshare a customer quote as a static graphic", "Repurpose email #3 as an article"],
  pressOpening: (b) => `${b.geography}, ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} — ${b.name} is launching as a new ${b.kind.replace("_", " ")} initiative for ${b.audience}.`,
  pressBody: (b) => [
    `${b.name} is designed for the realities of ${b.industry}: limited time, and the need for clear, measurable work.`,
    `${b.offer} is packaged for ${b.audience} to review and launch on their own terms.`,
    b.deadline
      ? `The campaign runs through ${b.deadline}${b.channels.length ? ` and is available across ${b.channels.join(", ")}` : ""}.`
      : `${b.channels.length ? `The campaign is available across ${b.channels.join(", ")}.` : "Full details are available on request."}`,
  ],
  pressQuote: (b) => `"${b.name} was built because ${b.audience} told us they wanted a clearer way to run this kind of work," a company spokesperson said.`,
  pressBoilerplate: (b) => `About: Velocity Vision helps ${b.audience} run marketing and outreach in a self-serve workspace. Customer-controlled, transparent, and clearly priced.`,
  pressContact: `For press enquiries, please reply to this release.`,
  videoHooks: (b) => [`A short note for ${b.audience}.`, `${b.industry} teams — here is a clearer way to ${b.cta.toLowerCase()}.`, `${b.offer} in one minute.`],
  script30: (b, h) => `[0-3s] Hook: "${h[0]}"\n[3-10s] Problem: ${b.audience} spend too much time on work that does not convert.\n[10-22s] What ${b.offer} does.\n[22-30s] CTA: ${b.cta}.`,
  script60: (b, h) => `[0-5s] Hook: "${h[1]}"\n[5-15s] Why this matters for ${b.audience}.\n[15-30s] What ${b.offer} actually does.\n[30-45s] Where it fits in an existing workflow.\n[45-55s] Common question: "will it sound like us?" — you set the tone, you edit before launch.\n[55-60s] CTA: ${b.cta}.`,
  talkingHead: (b) => `Single-shot to camera, ${b.tone.toLowerCase()} delivery, no cuts. Hook in the first 3 seconds, CTA on screen at the end.`,
  bRoll: (b) => `Mix of product / workspace footage, ${b.industry} context shots, on-screen text overlay reinforcing key points.`,
  shotList: (b) => ["Tight talking-head, eye-level, soft daylight", `B-roll: ${b.industry} work environment`, "Screen recording of the offer in the workspace", "Customer quote card", "End card with CTA"],
  storyboard: ["Hook frame", "Problem frame", "Reveal frame", "Context frame", "CTA frame"],
  ctaEndings: (b) => [b.cta, `${b.cta} — link in bio`, `${b.cta} — details on our site`],
  leadForm: (b) => ({
    formTitle: `About ${b.name}`,
    fields: [
      { label: "Full name", type: "text", required: true },
      { label: "Work email", type: "email", required: true },
      { label: "Company", type: "text", required: false },
      { label: "What are you hoping to achieve?", type: "textarea", required: false },
    ],
    ctaLabel: b.cta,
    thankYou: `Thanks — we will be in touch. In the meantime, please look out for our next note.`,
  }),
  dateLocale: "en-GB",
};

const ES: Strings = {
  hooks: (b) => [
    `La mayoría de ${b.audience} luchan con una sola cosa: ${b.offer.split(" ").slice(0, 6).join(" ")}.`,
    `Si trabajas en ${b.industry} y nunca has probado ${b.offer}, lee esto.`,
    `La forma más rápida de ${b.cta.toLowerCase()} sin la fricción habitual.`,
    `Lo que ${b.audience} entiende mal sobre ${b.offer.toLowerCase()}.`,
    `${b.audience} en ${b.geography} — esto es para ti.`,
    `Construimos ${b.offer} para que tú no tengas que hacerlo.`,
  ],
  ctas: (b) => [b.cta, `Reserva una llamada de 15 min → ${b.cta}`, `Mira cómo funciona`, `Descarga la guía gratuita`, `Empieza tu prueba`, `Responde "SÍ" para los detalles`],
  postShort: (h, b, cta) => `${h}\n\n${b.offer} — hecho para ${b.audience}.\n\n${cta}`,
  postLong: (h, b, cta) => `${h}\n\n${b.offer}\n\nPor qué importa para ${b.audience} en ${b.industry}:\n• Ahorra tiempo en el trabajo que no mueve la aguja\n• Diseñado para empresas en ${b.geography}\n• Pensado para tu forma real de vender\n\nTono: ${b.tone}\nSiguiente paso: ${cta}`,
  visualPrompt: (b) => `Visual de marca ${b.tone}: ${b.offer}, ${b.audience}, contexto de ${b.industry}, composición limpia, paleta de marca, mucho espacio en blanco`,
  positioning: (b) => `${b.name} posiciona ${b.offer} como la forma más rápida para ${b.audience} en ${b.industry} de ${b.cta.toLowerCase()}.`,
  bigIdea: (b) => `Reducir el tiempo hasta resultados para ${b.audience} de semanas a días.`,
  pillars: (b) => [`Hecho para ${b.audience}`, `Orientado al resultado, no a la función`, `Diseñado para ${b.industry} en ${b.geography}`, `Voz ${b.tone} de principio a fin`],
  successMetric: (g) => g === "awareness" ? "Alcance e interacción" : g === "leads" ? "Leads cualificados captados" : g === "sales" ? "Ingresos cerrados" : g === "signups" ? "Nuevos registros" : "Reservas completadas",
  landingHeadline: (b) => `${b.offer}, hecho para ${b.audience}.`,
  landingSub: (b) => `La forma más rápida de ${b.cta.toLowerCase()} — sin contratar una agencia.`,
  landingSections: (b) => [
    { title: "El problema", body: `${b.audience} en ${b.industry} pierden horas en trabajo que no convierte.` },
    { title: "Qué obtienes", body: `${b.offer}. En un formato que puedes lanzar esta semana.` },
    { title: "Para quién es", body: `${b.audience} en ${b.geography}, listos para moverse rápido.` },
    { title: "Cómo funciona", body: `Cuéntanos tu objetivo → generamos el pack → tú lanzas.` },
    { title: "Precio", body: `Desde ${b.pricePoint}. Sin contratos largos.` },
  ],
  offerFraming: (b) => `Por ${b.pricePoint}, obtienes ${b.offer} listo para lanzar — no otra presentación para leer.`,
  offerBenefits: (b) => [`Lanza en días, no en trimestres`, `Adaptado a ${b.audience}`, `Voz ${b.tone}, fiel a tu marca`, `Construido en torno al objetivo: ${b.goal}`, `Optimizado para ${b.channels.join(", ") || "tus canales"}`],
  offerObjections: () => [
    { objection: `"No tenemos tiempo."`, response: `Por eso mismo existe. Del brief al pack en menos de una hora.` },
    { objection: `"Ya probamos agencias antes."`, response: `Esto no es una agencia. Mantienes el control y el trabajo se hace.` },
    { objection: `"¿Sonará como nosotros?"`, response: `Tú marcas el tono. Nosotros lo seguimos. Tú editas antes de lanzar.` },
  ],
  emails: (b) => [
    { subject: `${b.offer} — presentación rápida`, preview: `Hecho para ${b.audience}`, body: `Hola {{first_name}},\n\nUn mensaje rápido — acabamos de lanzar ${b.offer} y pensamos en ti.\n\n${b.cta}\n\n— {{sender}}` },
    { subject: `Por qué a ${b.audience} le importa`, preview: `La razón real`, body: `{{first_name}},\n\nLa mayoría de ${b.audience} en ${b.industry} están atascados en lo mismo. Esto es lo que hemos visto que realmente funciona.\n\n${b.cta}` },
    { subject: `Una historia de 60 segundos`, preview: `De un cliente reciente`, body: `{{first_name}},\n\nEl mes pasado, un equipo de ${b.industry} usó ${b.offer} para alcanzar su objetivo en 14 días.\n\n¿Quieres el playbook? ${b.cta}` },
    { subject: `Último recordatorio`, preview: `Cierra pronto`, body: `{{first_name}},\n\nLa fecha límite es ${b.deadline}. Después de eso la oferta cambia.\n\n${b.cta}` },
    { subject: `Una pregunta`, preview: `Con sincera curiosidad`, body: `{{first_name}},\n\nSi no es ahora, ¿cuándo? Encantados de compartir lo que haríamos en tu lugar.\n\n— {{sender}}` },
  ],
  weekDays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  weekThemes: ["Plantear el problema", "Revelar la oferta", "Prueba / historia", "Resolver objeciones", "CTA directo", "Nurture suave", "Empujón final"],
  repostIdeas: () => ["Fija el mejor post de lanzamiento en tu perfil", "Convierte el post de lanzamiento en un Reel/TikTok de 15s", "Reutiliza una cita de cliente como carrusel", "Reaprovecha el email nº 3 como artículo de LinkedIn"],
  pressOpening: (b) => `${b.geography}, ${new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })} — Hoy se lanza ${b.name}, una nueva campaña de ${b.kind.replace("_", " ")} para ayudar a ${b.audience} a ${b.cta.toLowerCase()} más rápido que nunca.`,
  pressBody: (b) => [
    `${b.name} está diseñada en torno a la realidad de ${b.industry}: tiempo limitado, presupuesto limitado y la necesidad de mostrar resultados medibles rápidamente.`,
    `Al empaquetar ${b.offer} en un formato self-serve, ${b.audience} puede pasar de la idea al lanzamiento en días en lugar de meses.`,
    `La campaña estará activa hasta ${b.deadline} y disponible en ${b.channels.join(", ") || "varios canales"}.`,
  ],
  pressQuote: (b) => `"Construimos ${b.name} porque ${b.audience} no paraba de decirnos lo mismo — no necesitaban más consejos, necesitaban que el trabajo estuviera hecho. Esto es eso," dijo un portavoz.`,
  pressBoilerplate: (b) => `Sobre nosotros: Ayudamos a ${b.audience} a lanzar campañas de marketing sin contratar una agencia. Self-serve, dirigido por fundadores, orientado a resultados.`,
  pressContact: `Para consultas de prensa, responde a esta nota.`,
  videoHooks: (b) => [`"Si eres ${b.audience.split(" ").slice(-1)[0] || "fundador"}, deja de hacer scroll."`, `"La forma más rápida de ${b.cta.toLowerCase()} en ${b.industry}."`, `"Probamos ${b.offer} durante 30 días. Esto es lo que pasó."`],
  script30: (b, h) => `[0-3s] Gancho: "${h[0]}"\n[3-10s] Problema: ${b.audience} pierden tiempo en el trabajo equivocado.\n[10-22s] Solución: ${b.offer}.\n[22-30s] CTA: ${b.cta}.`,
  script60: (b, h) => `[0-5s] Gancho: "${h[1]}"\n[5-15s] Por qué importa para ${b.audience}.\n[15-30s] Qué hace realmente ${b.offer}.\n[30-45s] Mini caso / prueba.\n[45-55s] Objeción: "No tenemos tiempo" → resuelta.\n[55-60s] CTA: ${b.cta}.`,
  talkingHead: (b) => `Plano único a cámara, entrega ${b.tone}, sin cortes. Gancho en los primeros 3 segundos, CTA en pantalla al final.`,
  bRoll: (b) => `Mezcla de imágenes de producto / espacio de trabajo, planos de contexto de ${b.industry}, texto superpuesto reforzando los mensajes clave.`,
  shotList: (b) => ["Plano cerrado de cabeza, a la altura de los ojos, luz natural suave", `B-roll: entorno de trabajo de ${b.industry}`, "Grabación de pantalla de la oferta en acción", "Reacción de cliente / tarjeta de cita", "Tarjeta final con CTA"],
  storyboard: ["Cuadro de gancho", "Cuadro de problema", "Cuadro de revelación", "Cuadro de prueba", "Cuadro de CTA"],
  ctaEndings: (b) => [`${b.cta} — enlace en bio`, `Comenta "${b.goal.toUpperCase()}" y te enviamos los detalles`, `Mándanos un DM con "${b.name}" para acceso anticipado`],
  leadForm: (b) => ({
    formTitle: `Consigue ${b.offer}`,
    fields: [
      { label: "Nombre completo", type: "text", required: true },
      { label: "Email de trabajo", type: "email", required: true },
      { label: "Empresa", type: "text", required: false },
      { label: "¿Qué esperas conseguir?", type: "textarea", required: false },
    ],
    ctaLabel: b.cta,
    thankYou: `Gracias — te contactaremos en un día laborable. Mientras tanto, revisa tu bandeja de entrada para el siguiente paso.`,
  }),
  dateLocale: "es-ES",
};

const SUPPORTED_GENERATION: Record<CampaignLanguage, Strings | null> = {
  en: EN, es: ES, fr: null, de: null, pt: null, it: null, nl: null,
};

export function generatePack(brief: CampaignBrief): CampaignPack {
  const requested = (brief.language || "en") as CampaignLanguage;
  const strings = SUPPORTED_GENERATION[requested] || EN;
  const generatedAs: CampaignLanguage = SUPPORTED_GENERATION[requested] ? requested : "en";

  const hooks = strings.hooks(brief);
  const ctas = strings.ctas(brief);

  const makePost = (platform: string, hook: string): SocialPost => {
    const cta = ctas[Math.floor(Math.random() * ctas.length)] || brief.cta;
    return {
      platform, hook, cta,
      short: strings.postShort(hook, brief, cta),
      long: strings.postLong(hook, brief, cta),
      visualPrompt: strings.visualPrompt(brief),
    };
  };

  const channelCfg = getCampaignChannelConfig(brief);
  const selectedSocial = channelCfg.selectedSocial;

  const activePlatforms = selectedSocial.length ? selectedSocial : (channelCfg.hasSelection ? [] : PLATFORMS);
  const launchPosts = activePlatforms.map((p, i) => makePost(p, hooks[i % hooks.length]));
  const followUps = activePlatforms.flatMap((p) => [0, 1].map((i) => makePost(p, hooks[(i + 2) % hooks.length]))).slice(0, 10);


  return {
    language: requested,
    generatedAs,
    strategy: {
      positioning: strings.positioning(brief),
      bigIdea: strings.bigIdea(brief),
      messagingPillars: strings.pillars(brief),
      successMetric: strings.successMetric(brief.goal),
    },
    landing: {
      headline: strings.landingHeadline(brief),
      subheadline: strings.landingSub(brief),
      sections: strings.landingSections(brief),
      cta: brief.cta,
    },
    offer: {
      framing: strings.offerFraming(brief),
      benefits: strings.offerBenefits(brief),
      objections: strings.offerObjections(brief),
      cta: brief.cta,
    },
    emails: channelCfg.includeEmail ? strings.emails(brief) : [],
    social: {
      launchPosts, followUps,
      hooks: channelCfg.includeSocial ? hooks : [],
      ctas: channelCfg.includeSocial ? ctas : [],
      launchWeek: channelCfg.includeSocial ? strings.weekDays.map((day, i) => ({
        day,
        theme: strings.weekThemes[i],
        post: i === 0 ? hooks[0] : i === 1 ? `${brief.offer} — ${strings === ES ? "en vivo hoy" : "live today"}. ${brief.cta}` : i === 4 ? `${brief.cta}. ${strings === ES ? "Cierra" : "Closes"} ${brief.deadline}.` : hooks[i % hooks.length],
      })) : [],
      repostIdeas: channelCfg.includeSocial ? strings.repostIdeas(brief) : [],
    },
    press: channelCfg.includePress ? {
      headline: `${brief.name}: ${strings === ES ? "una nueva forma para que" : "a new way for"} ${brief.audience} ${strings === ES ? "puedan" : "to"} ${brief.cta.toLowerCase()}`,
      subheadline: `${brief.offer}, ${strings === ES ? "hecho para" : "built for"} ${brief.industry} ${strings === ES ? "en" : "in"} ${brief.geography}.`,
      opening: strings.pressOpening(brief),
      body: strings.pressBody(brief),
      quote: strings.pressQuote(brief),
      boilerplate: strings.pressBoilerplate(brief),
      contactLine: strings.pressContact,
    } : null,
    video: channelCfg.includeVideo ? {
      hooks: strings.videoHooks(brief, hooks),
      script30: strings.script30(brief, hooks),
      script60: strings.script60(brief, hooks),
      talkingHead: strings.talkingHead(brief),
      bRoll: strings.bRoll(brief),
      shotList: strings.shotList(brief),
      storyboard: strings.storyboard,
      onScreenText: [brief.offer, `${strings === ES ? "Hecho para" : "Built for"} ${brief.audience}`, `${strings === ES ? "Desde" : "From"} ${brief.pricePoint}`, brief.cta],
      captionText: `${brief.offer} — ${strings === ES ? "hecho para" : "built for"} ${brief.audience}. ${brief.cta}.`,
      ctaEndings: strings.ctaEndings(brief),
    } : null,
    leadCapture: strings.leadForm(brief),
  };
}

export function makeSlug(name: string): string {
  return (
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) +
    "-" + Math.random().toString(36).slice(2, 7)
  );
}
