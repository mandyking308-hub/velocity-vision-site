// Minimal i18n helper for Supabase edge functions. The web app uses i18next;
// edge functions are small and rarely run, so we embed the three supported
// languages directly to keep cold-start cost near zero.
//
// Usage:
//   import { t } from "../_shared/i18n.ts";
//   const subject = t(lang, "welcome.subject");
//   const body    = t(lang, "welcome.body", { name: "Mandy" });

export type Lang = "en" | "es" | "fr";

const dict: Record<Lang, Record<string, string>> = {
  en: {
    "welcome.subject": "Welcome to Velocity Influence",
    "welcome.body": "Hi {{name}}, your workspace is live. Upload your first audience to launch a campaign in minutes.",
    "receipt.subject": "Your Velocity Influence receipt",
    "receipt.body": "Thanks for your purchase. Amount charged: {{amount}}.",
    "reminder.subject": "You have replies waiting",
    "reminder.body": "{{count}} replies need your follow-up today.",
    "activation.subject": "Your campaign is ready to activate",
    "activation.body": "{{count}} contacts are cleaned, verified and ready to go.",
    "notice.subject": "Velocity Influence account update",
  },
  es: {
    "welcome.subject": "Bienvenido a Velocity Influence",
    "welcome.body": "Hola {{name}}, tu espacio está activo. Sube tu primera audiencia para lanzar una campaña en minutos.",
    "receipt.subject": "Tu recibo de Velocity Influence",
    "receipt.body": "Gracias por tu compra. Importe cobrado: {{amount}}.",
    "reminder.subject": "Tienes respuestas esperando",
    "reminder.body": "{{count}} respuestas necesitan tu seguimiento hoy.",
    "activation.subject": "Tu campaña está lista para activarse",
    "activation.body": "{{count}} contactos verificados, listos para enviar.",
    "notice.subject": "Actualización de tu cuenta Velocity Influence",
  },
  fr: {
    "welcome.subject": "Bienvenue sur Velocity Influence",
    "welcome.body": "Bonjour {{name}}, votre espace est en ligne. Importez votre première audience pour lancer une campagne en quelques minutes.",
    "receipt.subject": "Votre reçu Velocity Influence",
    "receipt.body": "Merci pour votre achat. Montant débité : {{amount}}.",
    "reminder.subject": "Des réponses vous attendent",
    "reminder.body": "{{count}} réponses nécessitent une relance aujourd'hui.",
    "activation.subject": "Votre campagne est prête à être activée",
    "activation.body": "{{count}} contacts vérifiés sont prêts à être contactés.",
    "notice.subject": "Mise à jour de votre compte Velocity Influence",
  },
};

export function normaliseLang(input?: string | null): Lang {
  const v = (input || "en").slice(0, 2).toLowerCase();
  return (["en", "es", "fr"].includes(v) ? v : "en") as Lang;
}

export function t(lang: string | null | undefined, key: string, vars: Record<string, string | number> = {}): string {
  const l = normaliseLang(lang);
  const raw = dict[l][key] ?? dict.en[key] ?? key;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ""));
}
