import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import enMarketing from "./locales/en/marketing.json";
import enApp from "./locales/en/app.json";
import enAuth from "./locales/en/auth.json";
import enBilling from "./locales/en/billing.json";
import enEmails from "./locales/en/emails.json";

import esCommon from "./locales/es/common.json";
import esMarketing from "./locales/es/marketing.json";
import esApp from "./locales/es/app.json";
import esAuth from "./locales/es/auth.json";
import esBilling from "./locales/es/billing.json";
import esEmails from "./locales/es/emails.json";

import frCommon from "./locales/fr/common.json";
import frMarketing from "./locales/fr/marketing.json";
import frApp from "./locales/fr/app.json";
import frAuth from "./locales/fr/auth.json";
import frBilling from "./locales/fr/billing.json";
import frEmails from "./locales/fr/emails.json";

export const SUPPORTED_LANGUAGES = ["en", "es", "fr"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
};

// Default locale + timezone hints per language. Override per user/workspace.
export const LANGUAGE_DEFAULTS: Record<SupportedLanguage, { locale: string; timezone: string; currency: string }> = {
  en: { locale: "en-GB", timezone: "Europe/London", currency: "GBP" },
  es: { locale: "es-ES", timezone: "Europe/Madrid", currency: "EUR" },
  fr: { locale: "fr-FR", timezone: "Europe/Paris", currency: "EUR" },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, marketing: enMarketing, app: enApp, auth: enAuth, billing: enBilling, emails: enEmails },
      es: { common: esCommon, marketing: esMarketing, app: esApp, auth: esAuth, billing: esBilling, emails: esEmails },
      fr: { common: frCommon, marketing: frMarketing, app: frApp, auth: frAuth, billing: frBilling, emails: frEmails },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    nonExplicitSupportedLngs: true, // es-MX -> es, fr-CA -> fr
    defaultNS: "common",
    ns: ["common", "marketing", "app", "auth", "billing", "emails"],
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "vv_lang",
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  });

// Keep <html lang> in sync so screen-readers, search engines and the browser
// spellchecker pick the right dictionary.
const syncHtmlLang = (lng: string) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = (lng || "en").slice(0, 2);
  }
};
syncHtmlLang(i18n.language);
i18n.on("languageChanged", syncHtmlLang);

export default i18n;
