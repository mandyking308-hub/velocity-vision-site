import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * The visible language selector is the official GTranslate Float widget,
 * loaded from `index.html`. This component only handles two things:
 *
 * 1. Tagging sensitive DOM nodes (passwords, API keys, card fields, Stripe
 *    iframes, code blocks, [data-notranslate]) with translate="no" so the
 *    Google Translate engine never rewrites their values.
 * 2. Nothing is written back to Supabase — translation stays display-only.
 */

const SENSITIVE_INPUT_RE =
  /(password|api[_-]?key|secret|token|smtp|imap|client[_-]?secret|access[_-]?key|bearer|card|cc[_-]?number|cardnumber|cvc|cvv|iban|routing|account[_-]?number|pin)/i;

const ALWAYS_NOTRANSLATE_SELECTOR =
  'input[type="password"], input[autocomplete*="cc-"], input[autocomplete="current-password"], input[autocomplete="new-password"], input[autocomplete="one-time-code"], [data-notranslate], code, pre, kbd, samp';

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

/**
 * Kept as a no-op export so existing imports keep compiling. The visible
 * selector now lives in the official GTranslate Float widget (bottom-right).
 */
export function GTranslateSlot(_: { className?: string }) {
  return null;
}

export default function GTranslate() {
  const location = useLocation();

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
