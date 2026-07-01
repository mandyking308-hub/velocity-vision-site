import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

/**
 * GTranslate integration for Velocity Vision.
 *
 * - Enabled on public marketing pages, legal, demo and the signed-in /app dashboard.
 * - Disabled on internal surfaces: /crm, /admin, /portal internal-only areas.
 * - Sensitive inputs (password, API key, secret, token, card number / CVC) are
 *   auto-marked with `translate="no"` and the `notranslate` class so Google
 *   Translate never touches them.
 * - Translation is display-only. Nothing is written back to the database.
 */

// Routes that must NEVER be translated (internal operator surfaces / secret fields).
const EXCLUDED_PREFIXES = ["/crm", "/admin"];

// Regex matching input names / ids / autocomplete tokens that must not be translated.
const SENSITIVE_INPUT_RE =
  /(password|api[_-]?key|secret|token|smtp|imap|client[_-]?secret|access[_-]?key|bearer|card|cc[_-]?number|cardnumber|cvc|cvv|iban|routing|account[_-]?number|pin)/i;

// Selectors for elements whose content should not be translated regardless of route.
const ALWAYS_NOTRANSLATE_SELECTOR =
  'input[type="password"], input[autocomplete*="cc-"], input[autocomplete="current-password"], input[autocomplete="new-password"], input[autocomplete="one-time-code"], [data-notranslate], code, pre, kbd, samp';

const WIDGET_SCRIPT_ID = "gtranslate-widget-script";
const SETTINGS_SCRIPT_ID = "gtranslate-widget-settings";
const WRAPPER_CLASS = "gtranslate_wrapper";

function markSensitiveNodes(root: ParentNode) {
  // Blanket-protect the well-known sensitive elements.
  root.querySelectorAll(ALWAYS_NOTRANSLATE_SELECTOR).forEach((el) => {
    el.setAttribute("translate", "no");
    el.classList.add("notranslate");
  });

  // Inputs / textareas whose name / id / placeholder / autocomplete looks sensitive.
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
      if (label) label.classList.add("notranslate");
    }
  });

  // Payment iframes (Stripe Elements etc.) — content is cross-origin, but flag anyway.
  root.querySelectorAll('iframe[src*="stripe"], iframe[name^="__privateStripe"]').forEach((el) => {
    el.setAttribute("translate", "no");
    el.classList.add("notranslate");
  });
}

function ensureWidgetLoaded() {
  if (document.getElementById(WIDGET_SCRIPT_ID)) return;

  // Settings must be present BEFORE the widget script runs.
  const settings = document.createElement("script");
  settings.id = SETTINGS_SCRIPT_ID;
  settings.text = `window.gtranslateSettings = ${JSON.stringify({
    default_language: "en",
    detect_browser_language: true,
    wrapper_selector: "." + WRAPPER_CLASS,
    flag_style: "3d",
    switcher_horizontal_position: "inline",
    languages: [
      "en",
      "es",
      "fr",
      "de",
      "it",
      "pt",
      "nl",
      "pl",
      "sv",
      "ar",
      "zh-CN",
      "ja",
      "ko",
      "hi",
      "tr",
      "ru",
    ],
  })};`;
  document.head.appendChild(settings);

  const script = document.createElement("script");
  script.id = WIDGET_SCRIPT_ID;
  script.src = "https://cdn.gtranslate.net/widgets/latest/dropdown-with-flags.js";
  script.defer = true;
  document.head.appendChild(script);
}

export default function GTranslate() {
  const location = useLocation();
  const isExcluded = useMemo(
    () => EXCLUDED_PREFIXES.some((p) => location.pathname === p || location.pathname.startsWith(p + "/")),
    [location.pathname],
  );

  useEffect(() => {
    // Load widget once for the whole SPA session (only on customer-facing surfaces).
    if (!isExcluded) ensureWidgetLoaded();
  }, [isExcluded]);

  useEffect(() => {
    // Re-tag sensitive nodes whenever the route changes and observe further mutations
    // so nodes added by React later are also protected.
    markSensitiveNodes(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === Node.ELEMENT_NODE) markSensitiveNodes(n as ParentNode);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname]);

  if (isExcluded) return null;

  // Fixed, mobile-friendly widget mount point. Google Translate injects a dropdown here.
  return (
    <div
      className={`${WRAPPER_CLASS} fixed z-[60] bottom-4 right-4 md:top-4 md:bottom-auto md:right-4 pointer-events-auto`}
      aria-label="Translate this page"
      data-notranslate
      translate="no"
    />
  );
}
