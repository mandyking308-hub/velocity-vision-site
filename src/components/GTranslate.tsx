import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Single-selector GTranslate integration for Velocity Vision.
 *
 * There is ONE persistent widget DOM node that is created once and then moved
 * (via appendChild) into whichever <GTranslateSlot /> is currently mounted —
 * the site Navbar on public/legal/demo pages and the AppLayout header on the
 * signed-in /app dashboard. This guarantees:
 *   • exactly one selector on screen at any time,
 *   • it lives inline in the header (no floating overlay on CTAs/forms),
 *   • the Google Translate script keeps running against the same element as
 *     the user navigates between routes.
 *
 * Excluded surfaces (/crm, /admin) never render a slot; the widget stays
 * parked in an off-screen holder and the whole subtree is marked
 * translate="no" so Google Translate skips it entirely.
 */

const EXCLUDED_PREFIXES = ["/crm", "/admin"];

const SENSITIVE_INPUT_RE =
  /(password|api[_-]?key|secret|token|smtp|imap|client[_-]?secret|access[_-]?key|bearer|card|cc[_-]?number|cardnumber|cvc|cvv|iban|routing|account[_-]?number|pin)/i;

const ALWAYS_NOTRANSLATE_SELECTOR =
  'input[type="password"], input[autocomplete*="cc-"], input[autocomplete="current-password"], input[autocomplete="new-password"], input[autocomplete="one-time-code"], [data-notranslate], code, pre, kbd, samp';

const WIDGET_SCRIPT_ID = "gtranslate-widget-script";
const SETTINGS_SCRIPT_ID = "gtranslate-widget-settings";
const WRAPPER_CLASS = "gtranslate_wrapper";
const HOLDER_ID = "gtranslate-holder";

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

/** Create / retrieve the singleton widget wrapper and its off-screen holder. */
function getWidgetElement(): HTMLDivElement {
  let widget = document.querySelector<HTMLDivElement>("." + WRAPPER_CLASS);
  if (!widget) {
    let holder = document.getElementById(HOLDER_ID) as HTMLDivElement | null;
    if (!holder) {
      holder = document.createElement("div");
      holder.id = HOLDER_ID;
      // parked off-screen when no slot is mounted
      holder.style.position = "absolute";
      holder.style.left = "-9999px";
      holder.style.top = "0";
      document.body.appendChild(holder);
    }
    widget = document.createElement("div");
    widget.className = WRAPPER_CLASS;
    widget.setAttribute("translate", "no");
    widget.setAttribute("data-notranslate", "true");
    holder.appendChild(widget);
  }
  return widget;
}

function ensureWidgetLoaded() {
  if (document.getElementById(WIDGET_SCRIPT_ID)) return;

  const settings = document.createElement("script");
  settings.id = SETTINGS_SCRIPT_ID;
  settings.text = `window.gtranslateSettings = ${JSON.stringify({
    default_language: "en",
    detect_browser_language: true,
    wrapper_selector: "." + WRAPPER_CLASS,
    flag_style: "3d",
    switcher_horizontal_position: "inline",
    languages: [
      "en", "es", "fr", "de", "it", "pt", "nl", "pl", "sv",
      "ar", "zh-CN", "ja", "ko", "hi", "tr", "ru",
    ],
  })};`;
  document.head.appendChild(settings);

  // Make sure the wrapper exists before the widget script runs.
  getWidgetElement();

  const script = document.createElement("script");
  script.id = WIDGET_SCRIPT_ID;
  script.src = "https://cdn.gtranslate.net/widgets/latest/dropdown-with-flags.js";
  script.defer = true;
  document.head.appendChild(script);
}

/**
 * Inline mount point. Place inside the navbar / app header where the selector
 * should visually appear. On mount, it captures the singleton widget; on
 * unmount, it returns the widget to the off-screen holder.
 */
export function GTranslateSlot({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureWidgetLoaded();

    const isVisible = (el: HTMLElement) =>
      el.offsetParent !== null || getComputedStyle(el).position === "fixed";

    const claim = () => {
      const host = hostRef.current;
      if (!host || !isVisible(host)) return;
      const widget = getWidgetElement();
      if (widget.parentElement !== host) host.appendChild(widget);
    };

    claim();
    window.addEventListener("resize", claim);
    return () => {
      window.removeEventListener("resize", claim);
      const widget = document.querySelector<HTMLDivElement>("." + WRAPPER_CLASS);
      const host = hostRef.current;
      const holder = document.getElementById(HOLDER_ID);
      if (widget && host && widget.parentElement === host && holder) {
        holder.appendChild(widget);
      }
    };
  }, []);

  return <div ref={hostRef} className={className} aria-label="Translate this page" />;
}

/**
 * Root-level controller. Ensures the widget script loads, tags sensitive
 * inputs so they are never translated, and hides the selector entirely on
 * excluded routes (/crm, /admin).
 */
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
    const widget = document.querySelector<HTMLDivElement>("." + WRAPPER_CLASS);
    if (widget) widget.style.display = isExcluded ? "none" : "";
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
