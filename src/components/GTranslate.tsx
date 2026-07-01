import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * GTranslate — single inline language selector, moved into the currently
 * visible <GTranslateSlot /> on every route (public site, /app, /crm, /admin).
 *
 * Sensitive fields (passwords, API keys, card fields, Stripe iframes,
 * code/pre, [data-notranslate]) are tagged translate="no" so translation
 * never rewrites them.
 */

const SENSITIVE_INPUT_RE =
  /(password|api[_-]?key|secret|token|smtp|imap|client[_-]?secret|access[_-]?key|bearer|card|cc[_-]?number|cardnumber|cvc|cvv|iban|routing|account[_-]?number|pin)/i;

const ALWAYS_NOTRANSLATE_SELECTOR =
  'input[type="password"], input[autocomplete*="cc-"], input[autocomplete="current-password"], input[autocomplete="new-password"], input[autocomplete="one-time-code"], [data-notranslate], code, pre, kbd, samp';

const WIDGET_SCRIPT_ID = "gtranslate-widget-script";
const SETTINGS_SCRIPT_ID = "gtranslate-widget-settings";
const HOLDER_ID = "gt-widget-holder";
const WRAPPER_SELECTOR = ".gtranslate_wrapper";

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

function ensureHolderAndScripts() {
  if (!document.getElementById(HOLDER_ID)) {
    const holder = document.createElement("div");
    holder.id = HOLDER_ID;
    // Off-screen holder so the widget always exists in the DOM even
    // if no slot is mounted on the current route yet.
    holder.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;";
    const wrapper = document.createElement("div");
    wrapper.className = "gtranslate_wrapper";
    holder.appendChild(wrapper);
    document.body.appendChild(holder);
  }

  if (!document.getElementById(SETTINGS_SCRIPT_ID)) {
    const settings = document.createElement("script");
    settings.id = SETTINGS_SCRIPT_ID;
    settings.text = `window.gtranslateSettings = ${JSON.stringify({
      default_language: "en",
      detect_browser_language: true,
      languages: [
        "en", "es", "fr", "de", "it", "pt", "nl", "pl", "sv",
        "ar", "zh-CN", "ja", "ko", "hi", "tr", "ru",
      ],
      wrapper_selector: ".gtranslate_wrapper",
      flag_style: "3d",
      horizontal_position: "inline",
      alt_flags: {},
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

/** Mount point for the single GTranslate widget. */
export function GTranslateSlot({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensureHolderAndScripts();

    const move = () => {
      const wrapper = document.querySelector<HTMLElement>(WRAPPER_SELECTOR);
      if (wrapper && ref.current && wrapper.parentElement !== ref.current) {
        ref.current.appendChild(wrapper);
        wrapper.style.display = "";
      }
    };
    move();
    // Retry a few times while the widget script initialises.
    const interval = window.setInterval(move, 300);
    const stop = window.setTimeout(() => window.clearInterval(interval), 5000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(stop);
      const holder = document.getElementById(HOLDER_ID);
      const wrapper = document.querySelector<HTMLElement>(WRAPPER_SELECTOR);
      if (holder && wrapper && wrapper.parentElement === ref.current) {
        holder.appendChild(wrapper);
      }
    };
  }, []);

  return <div ref={ref} className={`inline-flex items-center ${className}`} />;
}

export default function GTranslate() {
  const location = useLocation();

  useEffect(() => {
    ensureHolderAndScripts();
  }, []);

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

  return null;
}
