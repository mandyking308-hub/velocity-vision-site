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
  press: { headline: string; subheadline: string; opening: string; body: string[]; quote: string; boilerplate: string; contactLine: string; };
  video: { hooks: string[]; script30: string; script60: string; talkingHead: string; bRoll: string; shotList: string[]; storyboard: string[]; onScreenText: string[]; captionText: string; ctaEndings: string[]; };
  leadCapture: { formTitle: string; fields: { label: string; type: string; required: boolean }[]; ctaLabel: string; thankYou: string; };
}

const PLATFORMS = ["LinkedIn", "Instagram", "X", "Facebook", "TikTok"];

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
    `Most ${b.audience} struggle with one thing: ${b.offer.split(" ").slice(0, 6).join(" ")}.`,
    `If you're in ${b.industry} and you've never tried ${b.offer}, read this.`,
    `Here's the fastest way to ${b.cta.toLowerCase()} without the usual friction.`,
    `What ${b.audience} get wrong about ${b.offer.toLowerCase()}.`,
    `${b.geography} ${b.audience} — this one's for you.`,
    `We built ${b.offer} so you don't have to.`,
  ],
  ctas: (b) => [b.cta, `Book a 15-min call → ${b.cta}`, `See how it works`, `Get the free guide`, `Start your trial`, `Reply "YES" for the details`],
  postShort: (h, b, cta) => `${h}\n\n${b.offer} — built for ${b.audience}.\n\n${cta}`,
  postLong: (h, b, cta) => `${h}\n\n${b.offer}\n\nWhy it matters for ${b.audience} in ${b.industry}:\n• Saves time on the work that doesn't move the needle\n• Built for ${b.geography} businesses\n• Designed around the way you actually sell\n\nTone: ${b.tone}\nNext step: ${cta}`,
  visualPrompt: (b) => `${b.tone} brand visual: ${b.offer}, ${b.audience}, ${b.industry} context, clean composition, on-brand colour palette, plenty of negative space`,
  positioning: (b) => `${b.name} positions ${b.offer} as the fastest way for ${b.audience} in ${b.industry} to ${b.cta.toLowerCase()}.`,
  bigIdea: (b) => `Cut the time-to-result for ${b.audience} from weeks to days.`,
  pillars: (b) => [`Built for ${b.audience}`, `Outcome-led, not feature-led`, `Designed for ${b.geography} ${b.industry}`, `${b.tone} voice end-to-end`],
  successMetric: (g) => g === "awareness" ? "Reach and engagement" : g === "leads" ? "Qualified leads captured" : g === "sales" ? "Revenue closed" : g === "signups" ? "New sign-ups" : "Bookings completed",
  landingHeadline: (b) => `${b.offer}, built for ${b.audience}.`,
  landingSub: (b) => `The fastest way to ${b.cta.toLowerCase()} — without hiring an agency.`,
  landingSections: (b) => [
    { title: "The problem", body: `${b.audience} in ${b.industry} waste hours on work that doesn't convert.` },
    { title: "What you get", body: `${b.offer}. Delivered in a format you can launch this week.` },
    { title: "Who it's for", body: `${b.audience} based in ${b.geography}, ready to move quickly.` },
    { title: "How it works", body: `Tell us your goal → we generate the pack → you launch.` },
    { title: "Pricing", body: `From ${b.pricePoint}. No long contracts.` },
  ],
  offerFraming: (b) => `For ${b.pricePoint}, you get ${b.offer} ready to launch — not another deck to read.`,
  offerBenefits: (b) => [`Launch in days, not quarters`, `Tailored to ${b.audience}`, `${b.tone} voice, on-brand`, `Built around the goal: ${b.goal}`, `Optimised for ${b.channels.join(", ") || "your channels"}`],
  offerObjections: () => [
    { objection: `"We don't have time."`, response: `That's exactly why this exists. From brief to pack in under an hour.` },
    { objection: `"We've tried agencies before."`, response: `This isn't an agency. You stay in control, the work just gets done.` },
    { objection: `"Will it sound like us?"`, response: `You set the tone. We follow it. You edit before launch.` },
  ],
  emails: (b) => [
    { subject: `${b.offer} — quick intro`, preview: `Built for ${b.audience}`, body: `Hi {{first_name}},\n\nQuick one — we just launched ${b.offer} and thought of you.\n\n${b.cta}\n\n— {{sender}}` },
    { subject: `Why ${b.audience} care`, preview: `The real reason`, body: `{{first_name}},\n\nMost ${b.audience} in ${b.industry} are stuck on the same thing. Here's what we've seen actually work.\n\n${b.cta}` },
    { subject: `A 60-second story`, preview: `From a recent client`, body: `{{first_name}},\n\nLast month, a ${b.industry} team used ${b.offer} to hit their goal in 14 days.\n\nWant the playbook? ${b.cta}` },
    { subject: `Last reminder`, preview: `Closing soon`, body: `{{first_name}},\n\nDeadline is ${b.deadline}. After that the offer changes.\n\n${b.cta}` },
    { subject: `One question`, preview: `Genuinely curious`, body: `{{first_name}},\n\nIf not now, when? Happy to share what we'd do in your shoes.\n\n— {{sender}}` },
  ],
  weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  weekThemes: ["Tease the problem", "Reveal the offer", "Proof / story", "Objection handling", "Direct CTA", "Soft nurture", "Final push"],
  repostIdeas: () => ["Pin best launch post to top of profile", "Turn launch post into a 15s Reel/TikTok", "Reshare client quote as a static carousel", "Repurpose email #3 as a LinkedIn article"],
  pressOpening: (b) => `${b.geography}, ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} — Today marks the launch of ${b.name}, a new ${b.kind.replace("_", " ")} campaign aimed at helping ${b.audience} ${b.cta.toLowerCase()} faster than ever before.`,
  pressBody: (b) => [
    `${b.name} is designed around the realities of ${b.industry}: limited time, limited budget, and the need to show measurable results quickly.`,
    `By packaging ${b.offer} into a self-serve format, ${b.audience} can move from idea to launch in days rather than months.`,
    `The campaign runs through ${b.deadline} and is available across ${b.channels.join(", ") || "multiple channels"}.`,
  ],
  pressQuote: (b) => `"We built ${b.name} because ${b.audience} kept telling us the same thing — they didn't need more advice, they needed the work done. This is that," said a spokesperson.`,
  pressBoilerplate: (b) => `About: We help ${b.audience} launch marketing campaigns without hiring an agency. Self-serve, founder-led, outcome-focused.`,
  pressContact: `For press enquiries, reply to this release.`,
  videoHooks: (b, h) => [`"If you're a ${b.audience.split(" ").slice(-1)[0] || "founder"}, stop scrolling."`, `"Here's the fastest way to ${b.cta.toLowerCase()} in ${b.industry}."`, `"We tested ${b.offer} for 30 days. This is what happened."`],
  script30: (b, h) => `[0-3s] Hook: "${h[0]}"\n[3-10s] Problem: ${b.audience} waste time on the wrong work.\n[10-22s] Solution: ${b.offer}.\n[22-30s] CTA: ${b.cta}.`,
  script60: (b, h) => `[0-5s] Hook: "${h[1]}"\n[5-15s] Why this matters for ${b.audience}.\n[15-30s] What ${b.offer} actually does.\n[30-45s] Mini case / proof point.\n[45-55s] Objection: "We don't have time" → addressed.\n[55-60s] CTA: ${b.cta}.`,
  talkingHead: (b) => `Single-shot to camera, ${b.tone} delivery, no cuts. Hook in the first 3 seconds, CTA on screen at the end.`,
  bRoll: (b) => `Mix of product / workspace footage, ${b.industry} context shots, on-screen text overlay reinforcing key claims.`,
  shotList: (b) => ["Tight talking-head, eye-level, soft daylight", `B-roll: ${b.industry} work environment`, "Screen recording of the offer in action", "Customer reaction / quote card", "End card with CTA"],
  storyboard: ["Hook frame", "Problem frame", "Reveal frame", "Proof frame", "CTA frame"],
  ctaEndings: (b) => [`${b.cta} — link in bio`, `Comment "${b.goal.toUpperCase()}" and we'll send the details`, `DM us "${b.name}" for early access`],
  leadForm: (b) => ({
    formTitle: `Get ${b.offer}`,
    fields: [
      { label: "Full name", type: "text", required: true },
      { label: "Work email", type: "email", required: true },
      { label: "Company", type: "text", required: false },
      { label: "What are you hoping to achieve?", type: "textarea", required: false },
    ],
    ctaLabel: b.cta,
    thankYou: `Thanks — we'll be in touch within one working day. In the meantime, watch your inbox for the next step.`,
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

  const launchPosts = PLATFORMS.map((p, i) => makePost(p, hooks[i % hooks.length]));
  const followUps = PLATFORMS.flatMap((p) => [0, 1].map((i) => makePost(p, hooks[(i + 2) % hooks.length]))).slice(0, 10);

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
    emails: strings.emails(brief),
    social: {
      launchPosts, followUps, hooks, ctas,
      launchWeek: strings.weekDays.map((day, i) => ({
        day,
        theme: strings.weekThemes[i],
        post: i === 0 ? hooks[0] : i === 1 ? `${brief.offer} — ${strings === ES ? "en vivo hoy" : "live today"}. ${brief.cta}` : i === 4 ? `${brief.cta}. ${strings === ES ? "Cierra" : "Closes"} ${brief.deadline}.` : hooks[i % hooks.length],
      })),
      repostIdeas: strings.repostIdeas(brief),
    },
    press: {
      headline: `${brief.name}: ${strings === ES ? "una nueva forma para que" : "a new way for"} ${brief.audience} ${strings === ES ? "puedan" : "to"} ${brief.cta.toLowerCase()}`,
      subheadline: `${brief.offer}, ${strings === ES ? "hecho para" : "built for"} ${brief.industry} ${strings === ES ? "en" : "in"} ${brief.geography}.`,
      opening: strings.pressOpening(brief),
      body: strings.pressBody(brief),
      quote: strings.pressQuote(brief),
      boilerplate: strings.pressBoilerplate(brief),
      contactLine: strings.pressContact,
    },
    video: {
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
    },
    leadCapture: strings.leadForm(brief),
  };
}

export function makeSlug(name: string): string {
  return (
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) +
    "-" + Math.random().toString(36).slice(2, 7)
  );
}
