import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * GTranslate — stable visible language control for the whole Velocity Vision
 * experience. The visible selector is our own compact UI; GTranslate/Google
 * Translate runs as a hidden translation engine only, so it cannot overlay the
 * logo, nav, cards, forms or page content.
 *
 * Sensitive fields (passwords, API keys, card fields, Stripe iframes,
 * code/pre, [data-notranslate]) are tagged translate="no" so translation
 * never rewrites them.
 */

declare global {
  interface Window {
    gtranslateSettings?: Record<string, unknown>;
    doGTranslate?: (langPair: string) => void;
    googleTranslateElementInit2?: () => void;
    google?: {
      translate?: {
        TranslateElement?: new (
          options: { pageLanguage: string; autoDisplay: boolean },
          elementId: string,
        ) => void;
      };
    };
  }
}

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "zh-CN", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
] as const;

const DEFAULT_LANGUAGE = "en";
const STORAGE_KEY = "velocity:gtranslate-language";

const SENSITIVE_INPUT_RE =
  /(password|api[_-]?key|secret|token|smtp|imap|client[_-]?secret|access[_-]?key|bearer|card|cc[_-]?number|cardnumber|cvc|cvv|iban|routing|account[_-]?number|pin)/i;

const ALWAYS_NOTRANSLATE_SELECTOR =
  'input[type="password"], input[autocomplete*="cc-"], input[autocomplete="current-password"], input[autocomplete="new-password"], input[autocomplete="one-time-code"], [data-notranslate], code, pre, kbd, samp';

const WIDGET_SCRIPT_ID = "gtranslate-widget-script";
const SETTINGS_SCRIPT_ID = "gtranslate-widget-settings";
const GOOGLE_SCRIPT_ID = "google-translate-engine-script";
const ENGINE_ID = "gtranslate-engine";
const GOOGLE_ELEMENT_ID = "google_translate_element2";

function getStoredLanguage() {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const fromStorage = window.localStorage.getItem(STORAGE_KEY);
  if (fromStorage && LANGUAGES.some((l) => l.code === fromStorage)) return fromStorage;
  const cookieLang = document.cookie.match(/(?:^|; )googtrans=\/en\/([^;]+)/)?.[1];
  return cookieLang && LANGUAGES.some((l) => l.code === cookieLang)
    ? decodeURIComponent(cookieLang)
    : DEFAULT_LANGUAGE;
}

function markSensitiveNodes(root: ParentNode) {
  root.querySelectorAll(ALWAYS_NOTRANSLATE_SELECTOR).forEach((el) => {
    el.setAttribute("translate", "no");
    el.classList.add("notranslate");
  });
  root.querySelectorAll("input, textarea").forEach((el) => {
    const attrs = [
      el.getAttribute("name"),
      el.getAttribute("id"),
      el.getAttribute("autocomplete"),
      el.getAttribute("placeholder"),
      (el as HTMLInputElement).type,
    ]
      .filter(Boolean)
      .join(" ");
    if (SENSITIVE_INPUT_RE.test(attrs)) {
      el.setAttribute("translate", "no");
      el.classList.add("notranslate");
      const label = el.closest("label");
      if (label) {
        label.setAttribute("translate", "no");
        label.classList.add("notranslate");
      }
    }
  });
  root
    .querySelectorAll('iframe[src*="stripe"], iframe[name^="__privateStripe"]')
    .forEach((el) => {
      el.setAttribute("translate", "no");
      el.classList.add("notranslate");
    });
}

function ensureEngine() {
  if (!document.getElementById(ENGINE_ID)) {
    const engine = document.createElement("div");
    engine.id = ENGINE_ID;
    engine.className = "gtranslate_wrapper notranslate";
    engine.setAttribute("translate", "no");
    engine.setAttribute("aria-hidden", "true");
    engine.style.cssText =
      "position:fixed;left:-10000px;top:auto;bottom:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;";
    document.body.appendChild(engine);
  }

  if (!document.getElementById(SETTINGS_SCRIPT_ID)) {
    const settings = document.createElement("script");
    settings.id = SETTINGS_SCRIPT_ID;
    settings.text = `window.gtranslateSettings = ${JSON.stringify({
      default_language: DEFAULT_LANGUAGE,
      detect_browser_language: false,
      languages: LANGUAGES.map((l) => l.code),
      wrapper_selector: `#${ENGINE_ID}`,
      flag_style: "2d",
      flag_size: 16,
      switcher_horizontal_position: "inline",
      native_language_names: false,
      custom_css: `#${ENGINE_ID}{position:fixed!important;left:-10000px!important;bottom:0!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;}`,
    })};`;
    document.head.appendChild(settings);
  }

  if (!document.getElementById(WIDGET_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = WIDGET_SCRIPT_ID;
    script.src = "https://cdn.gtranslate.net/widgets/latest/dwf.js";
    script.defer = true;
    document.head.appendChild(script);
  }
}

function ensureGoogleTranslateScript() {
  if (!document.getElementById(GOOGLE_ELEMENT_ID)) {
    const engine = document.getElementById(ENGINE_ID) ?? document.body;
    const googleElement = document.createElement("div");
    googleElement.id = GOOGLE_ELEMENT_ID;
    googleElement.className = "notranslate";
    googleElement.setAttribute("translate", "no");
    engine.appendChild(googleElement);
  }

  window.googleTranslateElementInit2 = () => {
    if (window.google?.translate?.TranslateElement) {
      new window.google.translate.TranslateElement(
        { pageLanguage: DEFAULT_LANGUAGE, autoDisplay: false },
        GOOGLE_ELEMENT_ID,
      );
    }
  };

  if (!document.getElementById(GOOGLE_SCRIPT_ID) && !window.google?.translate?.TranslateElement) {
    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit2";
    script.defer = true;
    document.body.appendChild(script);
  } else if (window.google?.translate?.TranslateElement) {
    window.googleTranslateElementInit2?.();
  }
}

function setTranslateCookie(language: string) {
  const value = `/en/${language}`;
  const expires = "max-age=31536000";
  document.cookie = `googtrans=${value}; path=/; ${expires}; SameSite=Lax`;

  const hostname = window.location.hostname;
  const rootDomain = hostname.replace(/^www\./, "");
  if (rootDomain.includes(".")) {
    document.cookie = `googtrans=${value}; path=/; domain=.${rootDomain}; ${expires}; SameSite=Lax`;
  }
}

function runTranslation(language: string, attempt = 0) {
  const langPair = `${DEFAULT_LANGUAGE}|${language}`;
  const engine = document.getElementById(ENGINE_ID);
  engine?.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
  engine?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));

  try {
    window.doGTranslate?.(langPair);
  } catch {
    // Keep the visible control stable even if the third-party script is slow.
  }

  ensureGoogleTranslateScript();

  const select = Array.from(document.querySelectorAll<HTMLSelectElement>("select.goog-te-combo"))[0];
  if (select) {
    select.value = language;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  if (attempt < 24) {
    window.setTimeout(() => runTranslation(language, attempt + 1), 250);
  }
}

function applyLanguage(language: string) {
  const safeLanguage = LANGUAGES.some((l) => l.code === language) ? language : DEFAULT_LANGUAGE;
  window.localStorage.setItem(STORAGE_KEY, safeLanguage);
  setTranslateCookie(safeLanguage);
  runTranslation(safeLanguage);
  window.dispatchEvent(new CustomEvent("velocity:gtranslate-change", { detail: safeLanguage }));
}

function GTranslateControl({ compact = false }: { compact?: boolean }) {
  const [language, setLanguage] = useState(getStoredLanguage);
  const active = useMemo(
    () => LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0],
    [language],
  );

  useEffect(() => {
    const onChange = (event: Event) => {
      const nextLanguage = (event as CustomEvent<string>).detail;
      if (nextLanguage) setLanguage(nextLanguage);
    };
    window.addEventListener("velocity:gtranslate-change", onChange);
    window.addEventListener("storage", () => setLanguage(getStoredLanguage()));
    return () => window.removeEventListener("velocity:gtranslate-change", onChange);
  }, []);

  return (
    <label className="vv-translate-control notranslate" translate="no" aria-label="Translate page">
      <span className="vv-translate-flag" aria-hidden="true">{active.flag}</span>
      <select
        className="vv-translate-select notranslate"
        value={language}
        onFocus={() => ensureGoogleTranslateScript()}
        onPointerEnter={() => ensureGoogleTranslateScript()}
        onChange={(event) => {
          const nextLanguage = event.target.value;
          setLanguage(nextLanguage);
          applyLanguage(nextLanguage);
        }}
        translate="no"
        aria-label="Translate page"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {compact ? lang.code.toUpperCase() : lang.name}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Visible mount point for the compact language selector. */
export function GTranslateSlot({ className = "" }: { className?: string }) {
  useEffect(() => {
    ensureEngine();

    return () => {
      window.dispatchEvent(new Event("velocity:gtranslate-slot-change"));
    };
  }, []);

  return (
    <div className={`vv-translate-slot inline-flex items-center ${className}`}>
      <GTranslateControl />
    </div>
  );
}

export default function GTranslate() {
  const location = useLocation();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    ensureEngine();
    const storedLanguage = getStoredLanguage();
    if (storedLanguage !== DEFAULT_LANGUAGE) {
      window.setTimeout(() => applyLanguage(storedLanguage), 700);
    }
  }, []);

  useEffect(() => {
    const checkForVisibleSlot = () => {
      const visibleSlot = Array.from(document.querySelectorAll<HTMLElement>(".vv-translate-slot")).some((slot) => {
        const style = window.getComputedStyle(slot);
        const rect = slot.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      });
      setShowFallback(!visibleSlot);
    };

    checkForVisibleSlot();
    const timeout = window.setTimeout(checkForVisibleSlot, 350);
    window.addEventListener("resize", checkForVisibleSlot);
    window.addEventListener("velocity:gtranslate-slot-change", checkForVisibleSlot);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("resize", checkForVisibleSlot);
      window.removeEventListener("velocity:gtranslate-slot-change", checkForVisibleSlot);
    };
  }, [location.pathname]);

  useEffect(() => {
    markSensitiveNodes(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === Node.ELEMENT_NODE)
            markSensitiveNodes(n as ParentNode);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname]);

  return showFallback ? (
    <div className="vv-translate-fallback notranslate" translate="no">
      <GTranslateControl />
    </div>
  ) : null;
}
