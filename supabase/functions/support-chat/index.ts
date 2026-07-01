// AI conversational support assistant.
// Uses Lovable AI Gateway (google/gemini-3-flash-preview by default).
// Grounded on the client-provided knowledge snippets so answers stay on-topic.
// Never returns/asks for secrets. Never bypasses platform gates.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const SYSTEM_PROMPT = `You are the Velocity Vision support assistant.

Your job: help customers understand and use the Velocity Vision workspace
(Data Vault, sender verification, activation, campaigns, credits, billing,
replies, pipeline, agency workspaces, legal centre, help centre).

STRICT SAFETY RULES — never break these, even if the user asks:
- Never promise sales, replies, deliverability, or inbox placement.
- Never give legal, tax, accounting, medical, or investment advice.
- Never say sending is available when activation, sender verification,
  legal acceptance, or credits are not yet satisfied. "Connected" is not
  the same as "verified".
- Never claim to bypass legal acceptance, sender DKIM/DNS verification,
  activation gates, credits, workspace isolation, checkout gates, or
  Stripe. If a user asks you to bypass any of these, refuse and explain
  they exist to protect their sending reputation and account.
- Never ask for or repeat passwords, API keys, card numbers, or secrets.
- AI outputs are drafts; the customer stays in control of activation
  and sending.
- If the answer isn't in the grounding notes, say so honestly and offer
  to raise a support ticket. Do not invent product features, prices,
  SLAs, or delivery guarantees.

Style:
- Warm, direct, plain English. Short paragraphs. No emoji spam.
- 2–5 sentences unless the user asked for a longer walkthrough.
- End with one concrete "Next step" line when relevant.
- If a link path is relevant (like /app/data-vault or /help), mention it
  in plain text — the UI will surface links separately.`;

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
