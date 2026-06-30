import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import enMarketing from "./locales/en/marketing.json";
import enApp from "./locales/en/app.json";
import enAuth from "./locales/en/auth.json";
import enBilling from "./locales/en/billing.json";

import esCommon from "./locales/es/common.json";
import esMarketing from "./locales/es/marketing.json";
import esApp from "./locales/es/app.json";
import esAuth from "./locales/es/auth.json";
import esBilling from "./locales/es/billing.json";

export const SUPPORTED_LANGUAGES = ["en", "es"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  es: "Español",
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, marketing: enMarketing, app: enApp, auth: enAuth, billing: enBilling },
      es: { common: esCommon, marketing: esMarketing, app: esApp, auth: esAuth, billing: esBilling },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    nonExplicitSupportedLngs: true, // es-MX -> es
    defaultNS: "common",
    ns: ["common", "marketing", "app", "auth", "billing"],
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "vv_lang",
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  });

export default i18n;
