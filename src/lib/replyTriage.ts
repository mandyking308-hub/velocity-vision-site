// Supervised reply triage.
//
// Rules-based, explainable classification of inbound replies. Deliberately NOT
// autonomous: nothing is sent, suppressed or progressed without the user
// pressing a button. The classifier only *suggests*; the human decides.

export type ReplyCategory =
  | "interested"
  | "question"
  | "not_now"
  | "wrong_person"
  | "unsubscribe"
  | "bounce"
  | "auto_reply"
  | "negative"
  | "uncategorised";

export interface ReplyCategoryMeta {
  label: string;
  description: string;
  tone: string;
  /** What a careful operator would do next. Always human-confirmed. */
  suggestedAction: string;
  /** Machine key mapped to an actual UI action. */
  actionKey:
    | "move_to_pipeline"
    | "reply"
    | "snooze"
    | "reassign"
    | "suppress"
    | "ignore"
    | "review";
}


export const REPLY_CATEGORIES: Record<ReplyCategory, ReplyCategoryMeta> = {
  interested: {
    label: "Interested",
    description: "Positive intent — wants to talk, see more or book time.",
    tone: "bg-emerald-100 text-emerald-700",
    suggestedAction: "Move to pipeline and reply personally today.",
    actionKey: "move_to_pipeline",
  },
  question: {
    label: "Question",
    description: "Asked something specific before committing.",
    tone: "bg-blue-100 text-blue-700",
    suggestedAction: "Answer the question directly, then re-offer the next step.",
    actionKey: "reply",
  },
  not_now: {
    label: "Not now",
    description: "Open in principle, wrong timing.",
    tone: "bg-amber-100 text-amber-700",
    suggestedAction: "Snooze and follow up at the date they indicated.",
    actionKey: "snooze",
  },
  wrong_person: {
    label: "Wrong person",
    description: "Not their remit — often names a colleague.",
    tone: "bg-indigo-100 text-indigo-700",
    suggestedAction: "Thank them and ask for a warm redirect to the right contact.",
    actionKey: "reassign",
  },
  unsubscribe: {
    label: "Unsubscribe",
    description: "Explicit request to stop contact.",
    tone: "bg-rose-100 text-rose-700",
    suggestedAction: "Suppress immediately. This is a compliance obligation.",
    actionKey: "suppress",
  },
  bounce: {
    label: "Bounce",
    description: "The message never reached a mailbox — the address failed on delivery.",
    tone: "bg-orange-100 text-orange-700",
    suggestedAction: "Stop further sends to this address, then review and correct it.",
    actionKey: "suppress",
  },

  auto_reply: {
    label: "Auto-reply",
    description: "Out of office or automated bounce-style response.",
    tone: "bg-slate-200 text-slate-700",
    suggestedAction: "No action. Retry after the return date.",
    actionKey: "ignore",
  },
  negative: {
    label: "Not interested",
    description: "Clear no, but no unsubscribe request.",
    tone: "bg-slate-200 text-slate-700",
    suggestedAction: "Close politely and stop the sequence.",
    actionKey: "ignore",
  },
  uncategorised: {
    label: "Needs a human",
    description: "Could not be classified confidently.",
    tone: "bg-muted text-foreground",
    suggestedAction: "Read it yourself and choose the right action.",
    actionKey: "review",
  },
};

export const REPLY_CATEGORY_ORDER: ReplyCategory[] = [
  "interested",
  "question",
  "not_now",
  "wrong_person",
  "uncategorised",
  "auto_reply",
  "negative",
  "bounce",
  "unsubscribe",
];


interface Rule {
  category: ReplyCategory;
  weight: number;
  rx: RegExp;
}

// Order matters only via weight — highest total score wins, except for the
// hard-precedence categories below, which are decided before scoring.
const RULES: Rule[] = [
  // Compliance first — these must never be misread as anything else.
  { category: "unsubscribe", weight: 10, rx: /\b(unsubscribe|opt.?out|remove me|take me off|stop (emailing|contacting)|do not (contact|email))\b/i },
  { category: "unsubscribe", weight: 8, rx: /\b(gdpr|erasure request|delete my data)\b/i },

  // Delivery failures. These are machine-generated and read nothing like a
  // human reply, so they must not be scored against negative/question rules.
  { category: "bounce", weight: 10, rx: /\b(undeliverable|delivery (has )?failed|delivery failure|delivery status notification \(failure\)|failed delivery|returned to sender|mail delivery (subsystem|failed)|could not be delivered|unable to deliver)\b/i },
  { category: "bounce", weight: 10, rx: /\b(mailbox (unavailable|not found|does not exist|is full)|recipient address rejected|user unknown|unknown user|no such user|address not found|recipient not found|account (has been )?(disabled|deactivated))\b/i },
  { category: "bounce", weight: 8, rx: /\b(55[0-4][ -]5\.\d\.\d|smtp error 5\d\d|status: 5\.\d\.\d)/i },



  { category: "auto_reply", weight: 9, rx: /\b(out of (the )?office|automatic reply|auto[- ]?reply|on annual leave|on holiday|maternity leave|currently away)\b/i },
  { category: "auto_reply", weight: 6, rx: /\bi (will|'ll) be back on\b/i },

  { category: "wrong_person", weight: 8, rx: /\b(wrong person|not my (area|remit|department)|i don'?t handle|you (should|need to) (speak|talk) to|please contact my colleague|no longer (with|at) )\b/i },
  { category: "wrong_person", weight: 5, rx: /\bcopying in\b|\blooping in\b/i },

  { category: "interested", weight: 8, rx: /\b((?<!not )(?<!n't )interested|sounds (good|great|interesting)|happy to (chat|talk|meet)|let'?s (chat|talk|set up|book)|send (me )?(more|over) (info|details)|book a time|keen to)\b/i },
  { category: "interested", weight: 6, rx: /\b(what does it cost|pricing please|send a proposal|can we (meet|speak))\b/i },

  { category: "not_now", weight: 8, rx: /\b(not (right )?now|bad timing|circle back|revisit (in|next)|check back|too busy|next (quarter|month|year)|after (christmas|the summer|q[1-4]))\b/i },

  { category: "negative", weight: 12, rx: /\b(not interested|no thanks|we'?re (all )?(set|sorted|covered)|already (have|use) (a|one)|not a (fit|priority)|pass on this)\b/i },

  { category: "question", weight: 6, rx: /\b(how (does|do|would)|what (is|are|would)|can you (explain|clarify|confirm)|do you (support|offer|integrate))\b/i },
  { category: "question", weight: 3, rx: /\?\s*$/ },
];

export interface TriageSuggestion {
  category: ReplyCategory;
  confidence: "high" | "medium" | "low";
  /** The rule fragments that drove the decision, shown to the user. */
  reasons: string[];
}

/**
 * Classify reply text. Never throws; unknown or empty input returns
 * "uncategorised" so a human always sees it rather than it being silently
 * dropped.
 */
export function classifyReply(text: string | null | undefined): TriageSuggestion {
  const body = String(text ?? "").trim();
  if (body.length < 2) {
    return { category: "uncategorised", confidence: "low", reasons: ["No reply text captured."] };
  }

  const scores = new Map<ReplyCategory, number>();
  const reasons: string[] = [];

  for (const rule of RULES) {
    const m = body.match(rule.rx);
    if (!m) continue;
    scores.set(rule.category, (scores.get(rule.category) ?? 0) + rule.weight);
    if (m[0] && reasons.length < 4) reasons.push(`Matched "${m[0].trim().slice(0, 48)}"`);
  }

  if (scores.size === 0) {
    return {
      category: "uncategorised",
      confidence: "low",
      reasons: ["No clear intent signals found — read it yourself."],
    };
  }

  // Hard precedence, applied before weights.
  //
  // 1. An explicit opt-out always wins: it is a compliance instruction, and it
  //    outranks a bounce notice quoting the original message.
  // 2. A delivery failure outranks the general negative/question rules, which
  //    would otherwise fire on boilerplate inside the bounce report.
  for (const cat of ["unsubscribe", "bounce"] as const) {
    if (scores.has(cat)) {
      const score = scores.get(cat)!;
      return {
        category: cat,
        confidence: score >= 8 ? "high" : "medium",
        reasons,
      };
    }
  }

  let best: ReplyCategory = "uncategorised";
  let bestScore = 0;
  let runnerUp = 0;
  for (const [cat, score] of scores) {
    if (score > bestScore) {
      runnerUp = bestScore;
      bestScore = score;
      best = cat;
    } else if (score > runnerUp) {
      runnerUp = score;
    }
  }


  const margin = bestScore - runnerUp;
  const confidence: TriageSuggestion["confidence"] =
    bestScore >= 8 && margin >= 3 ? "high" : bestScore >= 5 ? "medium" : "low";

  return { category: best, confidence, reasons };
}

/**
 * Deterministic, editable reply drafts. These are starting points a human
 * edits and sends — never auto-sent, and they make no claims or promises.
 */
export function draftReply(
  category: ReplyCategory,
  opts: { firstName?: string | null; senderName?: string | null; cta?: string | null } = {},
): string {
  const name = (opts.firstName || "").trim().split(/\s+/)[0] || "there";
  const signoff = `\n\nBest regards,\n${(opts.senderName || "").trim() || "[Your name]"}`;
  const cta = (opts.cta || "").trim();

  switch (category) {
    case "interested":
      return `Hi ${name},\n\nThanks for coming back to me — glad it's useful.\n\n${cta ? `Happy to ${cta.toLowerCase()} whenever suits you.` : "Happy to set up a short call whenever suits you."} What does your week look like?${signoff}`;
    case "question":
      return `Hi ${name},\n\nGood question — here's the short answer:\n\n[Answer their question plainly here.]\n\nIf that helps, ${cta ? cta.toLowerCase() : "let me know and we can take the next step"}.${signoff}`;
    case "not_now":
      return `Hi ${name},\n\nCompletely understood — timing matters more than anything.\n\nI'll come back to you at a better point. If a specific month works better, tell me and I'll make a note.${signoff}`;
    case "wrong_person":
      return `Hi ${name},\n\nApologies for the misdirect, and thanks for letting me know.\n\nWould you be able to point me to the right person? I'll take it from there and won't chase you again.${signoff}`;
    case "negative":
      return `Hi ${name},\n\nThanks for the straight answer — I appreciate it.\n\nI'll close this off and won't keep chasing. If anything changes, you know where I am.${signoff}`;
    case "unsubscribe":
      return `Hi ${name},\n\nDone — you've been removed and won't hear from me again.\n\nApologies for the intrusion.${signoff}`;
    case "auto_reply":
      return "";
    // A bounce has no human on the other end — there is nothing to reply to.
    case "bounce":
      return "";

    default:
      return `Hi ${name},\n\nThanks for getting back to me.\n\n[Write your reply here.]${signoff}`;
  }
}
