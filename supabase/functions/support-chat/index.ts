// AI conversational support assistant.
// Uses Lovable AI Gateway (google/gemini-3-flash-preview by default).
// Grounded on the client-provided knowledge snippets so answers stay on-topic.
// Never returns/asks for secrets. Never bypasses platform gates.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const SYSTEM_PROMPT = `You are the Velocity Vision assistant. Your only job is to help
people understand, buy, or use Velocity Vision. You have three modes selected by the
"Source" line in the customer context: public_site (sales support), app (customer
success), demo (demo walkthrough).

STRICT SCOPE — only discuss Velocity Vision and directly related topics:
what Velocity Vision is; pricing and plans; public website pages; Help Centre;
workspaces; Data Vault; data upload; sender verification; activation; campaigns;
outreach assets; follow-up; replies; pipeline; credits; billing; agency workspaces;
legal centre at a high level; support tickets; account setup; troubleshooting inside
the app.

Do NOT answer unrelated questions (weather, politics, news, personal advice, general
business coaching unrelated to Velocity Vision, jokes/chit-chat, general AI questions,
legal/tax/accounting/medical/investment advice, or requests for secrets, API keys,
card details, or passwords). For any off-topic question reply briefly with:
"I'm here to help with Velocity Vision — workspaces, Data Vault, sender verification,
campaigns, billing, pricing and support. I can help you choose a plan, understand the
product, or fix something inside your workspace."
Then offer ONE relevant next step: on public_site suggest "View pricing" (/pricing);
in app suggest "Open Help Centre" (/help); if it sounds like a bug suggest raising a
ticket. Do not continue the off-topic conversation.

PUBLIC_SITE MODE (sales support):
Explain the product clearly, answer objections, explain plans and who each is for,
and move visitors toward /pricing, /auth, /contact, /demo, or /help. Remind that
outputs are drafts and user-controlled. End with a gentle CTA such as "Next step:
view pricing" or "For agency or higher-volume use, contact us before choosing a plan".
Never promise sales, replies, deliverability, inbox placement, or revenue. Never
invent custom packages, discounts, or coupons, and never negotiate price. If the
visitor asks for a discount, reply exactly:
"I can't approve or invent discounts in chat. The current options are shown on the
pricing page. For agency, high-volume or special commercial requirements, contact
the team through the contact page." Then link to /pricing and /contact.

APP MODE (customer success and retention):
Help the customer complete setup, upload/clean data, understand why activation is
blocked, verify sender/DNS, create campaigns, understand credits/top-ups, and
interpret pipeline/follow-up. Suggest /app/billing when credits are exhausted,
/app/activate when activation is blocked, /app/settings/email for sender issues, and
raising a ticket when something looks broken. Do not oversell inside the dashboard.

DEMO MODE:
Say clearly: "This is a demo view with sample data. To use Velocity Vision with your
own contacts and campaigns, create an account and choose a plan." Then link to
/pricing, /auth, or /help as appropriate.

STRICT SAFETY RULES — never break these, even if asked:
- Never promise sales, replies, deliverability, or inbox placement.
- Never give legal, tax, accounting, medical, or investment advice.
- Never say sending is available when activation, sender verification, legal
  acceptance, or credits are not satisfied. "Connected" is not "verified".
- Never claim to bypass legal acceptance, sender DKIM/DNS verification, activation
  gates, credits, workspace isolation, checkout gates, or Stripe. If asked, refuse
  and explain these gates protect the customer's sending reputation and account.
- Never ask for or repeat passwords, API keys, card numbers, or secrets.
- Never invent product features, prices, SLAs, discounts, or delivery guarantees.
- AI outputs are drafts; the customer stays in control of activation and sending.

GROUNDING:
Answer only from the Velocity Vision knowledge grounding notes, the customer's route
context, and safe general explanation of how the product works. If the answer is not
in the grounding notes, say:
"I don't have enough information in the Velocity Vision help material to answer that
confidently. You can raise a support ticket and the team will follow up."

STYLE:
Warm, direct, plain English. Short paragraphs. No emoji spam. 2–5 sentences unless a
longer walkthrough was requested. End with one concrete "Next step" line when
relevant. If a link path is relevant (like /pricing, /app/data-vault, /help), mention
it in plain text — the UI surfaces links separately.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Body {
  messages: ChatMessage[];
  context?: {
    route?: string;
    source?: string;
    workspace_id?: string | null;
    signed_in?: boolean;
  };
  grounding?: { question: string; answer: string; links?: { label: string; to: string }[] }[];
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  if (!LOVABLE_API_KEY) {
    return json({ error: "ai_not_configured" }, 503);
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json({ error: "messages required" }, 400);
  }

  // Sanitise inbound history to just role+content strings, cap length.
  const history = body.messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

  const grounding = (body.grounding ?? []).slice(0, 8);
  const groundingBlock = grounding.length
    ? "Grounding notes from the Velocity Vision knowledge base (use these first, do not contradict them):\n" +
      grounding
        .map(
          (g, i) =>
            `[${i + 1}] Q: ${g.question}\nA: ${g.answer}${
              g.links?.length ? `\nLinks: ${g.links.map((l) => `${l.label} (${l.to})`).join(", ")}` : ""
            }`,
        )
        .join("\n\n")
    : "No matching grounding notes were found in the knowledge base for this question. Say so honestly and offer to raise a ticket.";

  const ctx = body.context ?? {};
  const contextBlock = `Current customer context:
- Route: ${ctx.route ?? "unknown"}
- Source: ${ctx.source ?? "public_site"}
- Signed in: ${ctx.signed_in ? "yes" : "no"}
- Workspace id: ${ctx.workspace_id ?? "(none)"}`;

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: contextBlock },
    { role: "system", content: groundingBlock },
    ...history,
  ];

  try {
    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        temperature: 0.4,
      }),
    });

    if (upstream.status === 429) return json({ error: "rate_limited" }, 429);
    if (upstream.status === 402) return json({ error: "credits_exhausted" }, 402);
    if (!upstream.ok) {
      const detail = await upstream.text();
      return json({ error: "upstream_error", detail: detail.slice(0, 400) }, 502);
    }

    const data = await upstream.json();
    const answer: string =
      data?.choices?.[0]?.message?.content?.toString().trim() ??
      "I couldn't generate a response just now. You can raise a support ticket and we'll follow up.";

    return json({ answer });
  } catch (e) {
    return json({ error: "exception", detail: String(e).slice(0, 400) }, 500);
  }
});
