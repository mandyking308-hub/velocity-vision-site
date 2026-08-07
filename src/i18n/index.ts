import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import enMarketing from "./locales/en/marketing.json";
import enApp from "./locales/en/app.json";
import enAuth from "./locales/en/auth.json";
import enBilling from "./locales/en/billing.json";
import enEmails from "./locales/en/emails.json";

/**
 * English-only UI text registry.
 *
 * Multilingual display is handled globally by the official GTranslate widget.
 * There is deliberately no browser language detection, locale switching,
 * profile-language sync, or alternate UI translation catalogue here.
 *
 * Existing components still use react-i18next as a stable English text lookup
 * so this cleanup does not require a risky application-wide UI rewrite.
 */
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        marketing: enMarketing,
        app: enApp,
        auth: enAuth,
        billing: enBilling,
        emails: enEmails,
      },
    },
    lng: "en",
    fallbackLng: "en",
    supportedLngs: ["en"],
    defaultNS: "common",
    ns: ["common", "marketing", "app", "auth", "billing", "emails"],
    interpolation: { escapeValue: false },
    returnNull: false,
  });

if (typeof document !== "undefined") {
  document.documentElement.lang = "en";
}

export default i18n;
