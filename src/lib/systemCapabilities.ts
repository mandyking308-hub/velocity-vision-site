// System capability facts.
//
// Preflight must never claim a capability is ready because a call site passed a
// bare `true`. Anything asserted here has to be traceable to code that actually
// exists in this build; anything that cannot be established is reported as
// unknown, and unknown never counts as a pass.

/**
 * What is actually deployed for opt-out handling in this build:
 *
 * - `src/pages/Unsubscribe.tsx` is routed at `/unsubscribe` in `src/App.tsx`.
 * - `supabase/functions/handle-email-unsubscribe` consumes a one-time token
 *   from `email_unsubscribe_tokens` and records the opt-out.
 * - `supabase/functions/email-send` refuses any recipient whose contact
 *   `quality_status` is `blocked` or `suppressed`, so an honoured opt-out
 *   stops future outreach at the send path.
 *
 * What is NOT guaranteed by the platform: the outbound campaign body is stored
 * and sent verbatim (`email-send` does not inject a footer), so the presence of
 * an opt-out instruction in the message must be verified per message.
 */
export const UNSUBSCRIBE_CAPABILITY = {
  publicRoute: "/unsubscribe",
  handlerFunction: "handle-email-unsubscribe",
  tokenTable: "email_unsubscribe_tokens",
  /** email-send blocks suppressed/blocked recipients — verified in that function. */
  suppressionEnforcedAtSend: true,
  /** No footer is injected by the platform; the copy must carry the opt-out. */
  footerInjectedByPlatform: false,
} as const;

/** Opt-out wording we can recognise deterministically in a message body. */
const OPT_OUT_MARKER = /\b(unsubscribe|opt[\s-]?out|stop these emails|no longer wish to (hear|receive))\b/i;

export interface UnsubscribeReadinessInput {
  /** The exact body that will be sent (first email of the sequence). */
  messageBody?: string | null;
  /**
   * Whether the deployed opt-out route + handler are available to this build.
   * Omit when unknown — unknown is treated as not ready.
   */
  handlerAvailable?: boolean;
}

export interface CapabilityVerdict {
  ready: boolean;
  detail: string;
}

/** The route and handler exist in this build (see UNSUBSCRIBE_CAPABILITY). */
export const UNSUBSCRIBE_HANDLER_DEPLOYED = true;

/**
 * Unsubscribe readiness for one specific send. Ready only when the opt-out
 * handler is available AND the message itself carries an opt-out instruction.
 * Anything unknown returns false with an explanation.
 */
export function resolveUnsubscribeReadiness(
  input: UnsubscribeReadinessInput = {},
): CapabilityVerdict {
  if (input.handlerAvailable !== true) {
    return {
      ready: false,
      detail: "Opt-out handling could not be confirmed for this workspace.",
    };
  }
  const body = typeof input.messageBody === "string" ? input.messageBody : "";
  if (!body.trim()) {
    return {
      ready: false,
      detail: "No message content to check for an opt-out instruction yet.",
    };
  }
  if (!OPT_OUT_MARKER.test(body)) {
    return {
      ready: false,
      detail:
        "This email has no opt-out instruction. Add an unsubscribe line to the copy before sending.",
    };
  }
  return {
    ready: true,
    detail:
      "The email carries an opt-out instruction, and suppressed or blocked recipients are refused at send time.",
  };
}
