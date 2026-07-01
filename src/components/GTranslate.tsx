import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

/**
 * GTranslate — single floating language selector for Velocity Vision.
 *
 * Uses GTranslate's `float.js` widget, which mounts a fixed-position pill in
 * the bottom-right of the viewport. This is guaranteed visible on every
 * customer-facing page (public site, legal, demo, /app dashboard) with no
 * layout risk in the header.
 *
 * Excluded surfaces: /crm and /admin — the widget is hidden entirely and the
 * subtree is left untranslated.
 *
 * Sensitive inputs (passwords, API keys, Stripe iframes, etc.) are tagged
 * translate="no" so Google Translate never rewrites them.
 */

const EXCLUDED_PREFIXES = ["/crm", "/admin"];

const SENSITIVE_INPUT_RE =
  /(password|api[_-]?key|secret|token|smtp|imap|client[_-]?secret|access[_-]?key|bearer|card|cc[_-]?number|cardnumber|cvc|cvv|iban|routing|account[_-]?number|pin)/i;

const ALWAYS_NOTRANSLATE_SELECTOR =
  'input[type="password"], input[autocomplete*="cc-"], input[autocomplete="current-password"], input[autocomplete="new-password"], input[autocomplete="one-time-code"], [data-notranslate], code, pre, kbd, samp';

const WIDGET_SCRIPT_ID = "gtranslate-widget-script";
const SETTINGS_SCRIPT_ID = "gtranslate-widget-settings";

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
      if (label) label.classList.add("notranslate");
    }
  });
  root
    .querySelectorAll('iframe[src*="stripe"], iframe[name^="__privateStripe"]')
    .forEach((el) => {
      el.setAttribute("translate", "no");
      el.classList.add("notranslate");
    });
}

function ensureWidgetLoaded() {
  if (document.getElementById(WIDGET_SCRIPT_ID)) return;

  const settings = document.createElement("script");
  settings.id = SETTINGS_SCRIPT_ID;
  settings.text = `window.gtranslateSettings = ${JSON.stringify({
    default_language: "en",
    detect_browser_language: true,
    languages: [
      "en", "es", "fr", "de", "it", "pt", "nl", "pl", "sv",
      "ar", "zh-CN", "ja", "ko", "hi", "tr", "ru",
    ],
    flag_style: "3d",
    switcher_horizontal_position: "right",
    switcher_vertical_position: "bottom",
    switcher_open_direction: "top",
    float_switcher_open_direction: "top",
  })};`;
  document.head.appendChild(settings);

  const script = document.createElement("script");
  script.id = WIDGET_SCRIPT_ID;
  script.src = "https://cdn.gtranslate.net/widgets/latest/float.js";
  script.defer = true;
  document.head.appendChild(script);
}

/** Kept as a no-op export so any lingering `<GTranslateSlot />` references still compile. */
export function GTranslateSlot(_: { className?: string }) {
  return null;
}

export default function GTranslate() {
  const location = useLocation();
  const isExcluded = useMemo(
    () =>
      EXCLUDED_PREFIXES.some(
        (p) => location.pathname === p || location.pathname.startsWith(p + "/"),
      ),
    [location.pathname],
  );

  useEffect(() => {
    if (!isExcluded) ensureWidgetLoaded();
    // Hide/show the floating widget as the user moves between allowed
    // and excluded surfaces without reloading.
    const applyVisibility = () => {
      document
        .querySelectorAll<HTMLElement>(".gtranslate_wrapper, .gt_float_switcher")
        .forEach((el) => {
          el.style.display = isExcluded ? "none" : "";
        });
    };
    applyVisibility();
    const t = window.setInterval(applyVisibility, 500);
    return () => window.clearInterval(t);
  }, [isExcluded]);

  useEffect(() => {
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

  return null;
}
