import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Database, Globe, Send, MessageSquare, TrendingUp, AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { PLANS, PlanId } from "@/lib/credits";

/**
 * COST COEFFICIENTS — PROXY VALUES (NOT REAL COST ACCOUNTING)
 * ------------------------------------------------------------
 * These are placeholders used by the founder intelligence layer to estimate
 * relative customer intensity. They are NOT plumbed into billing, NOT GAAP
 * cost data, and NOT exposed to customers. Replace with real per-unit cost
 * data (Stripe MRR + Supabase usage + AI gateway spend) when cost telemetry
 * is wired in. See `marginScore` below for the formula.
 */
const COST_COEFFICIENTS = {
  perSendProxy: 0.03,     // proxy: estimated infra + deliverability blended cost per send
  perUploadProxy: 0.10,   // proxy: estimated parse + storage + validation cost per upload batch
  marginWarningBelow: 0,  // marginScore threshold for "negative margin" alert
} as const;

type Row = Record<string, any>;

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

function topN(rows: Row[], key: string, n = 6) {
  const counts: Record<string, number> = {};
  rows.forEach((r) => {
    const k = (r[key] ?? "—").toString().trim() || "—";
    counts[k] = (counts[k] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n);
}

export default function FounderIntelligence() {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Row[]>([]);
  const [companies, setCompanies] = useState<Row[]>([]);
  const [uploads, setUploads] = useState<Row[]>([]);
  const [uploadRows, setUploadRows] = useState<Row[]>([]);
  const [sends, setSends] = useState<Row[]>([]);
  const [leads, setLeads] = useState<Row[]>([]);
  const [opps, setOpps] = useState<Row[]>([]);
  const [plans, setPlans] = useState<Row[]>([]);
  const [topups, setTopups] = useState<Row[]>([]);
  const [ledger, setLedger] = useState<Row[]>([]);
  const [audit, setAudit] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      // Best-effort access log — governance signal that this internal
      // dashboard was viewed, by whom, and when. Reuses send_audit_log
      // so no extra surface area / migration.
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await (supabase as any).from("send_audit_log").insert({
            user_id: user.id,
            action: "intelligence_view",
            details: { path: "/crm/intelligence", at: new Date().toISOString() },
          });
        }
      } catch { /* non-blocking */ }

      const results = await Promise.all([
        supabase.from("contacts").select("id, country, language, company_id, quality_status, suppressed, blocked, created_at"),
        supabase.from("companies").select("id, country, industry, created_at"),
        supabase.from("data_uploads").select("id, user_id, status, row_count, created_at"),
        supabase.from("data_upload_rows").select("id, validation_status, duplicate_status, import_status, upload_id"),
        supabase.from("email_sends").select("id, status, sent_at, workspace_id, user_id, error"),
        supabase.from("leads").select("id, status, owner_id, follow_up_state, created_at"),
        supabase.from("opportunities").select("id, stage, estimated_value, owner_id, created_at"),
        supabase.from("user_plans").select("user_id, plan, status, currency"),
        supabase.from("credit_topups").select("user_id, credits, amount, created_at"),
        supabase.from("credit_ledger").select("user_id, delta, reason, created_at"),
        supabase.from("send_audit_log").select("user_id, action, created_at").order("created_at", { ascending: false }).limit(50),
      ]);
      setContacts((results[0].data as Row[]) || []);
      setCompanies((results[1].data as Row[]) || []);
      setUploads((results[2].data as Row[]) || []);
      setUploadRows((results[3].data as Row[]) || []);
      setSends((results[4].data as Row[]) || []);
      setLeads((results[5].data as Row[]) || []);
      setOpps((results[6].data as Row[]) || []);
      setPlans((results[7].data as Row[]) || []);
      setTopups((results[8].data as Row[]) || []);
      setLedger((results[9].data as Row[]) || []);
      setAudit((results[10].data as Row[]) || []);
      setLoading(false);
    })();
  }, []);

  // Quality mix (from contacts)
  const qualityMix = useMemo(() => {
    const c: Record<string, number> = {};
    contacts.forEach((r) => {
      const k = r.quality_status || "unknown";
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, [contacts]);

  const safeRecords = (qualityMix["safe"] || 0) + (qualityMix["clean"] || 0) + (qualityMix["verified"] || 0);
  const riskyRecords = (qualityMix["risky"] || 0) + (qualityMix["review"] || 0) + (qualityMix["unverified"] || 0);
  const blockedRecords = contacts.filter((c) => c.blocked || c.suppressed).length;

  // Send intelligence
  const totalSends = sends.length;
  const sentOk = sends.filter((s) => s.status === "sent" || s.sent_at).length;
  const bounces = sends.filter((s) => s.status === "bounced" || (s.error && /bounce/i.test(s.error))).length;
  const failures = sends.filter((s) => s.status === "failed").length;

  // Pipeline
  const pipelineValue = opps.reduce((s, o) => s + (Number(o.estimated_value) || 0), 0);
  const wins = opps.filter((o) => o.stage === "won" || o.stage === "closed_won").length;
  const losses = opps.filter((o) => o.stage === "lost" || o.stage === "closed_lost").length;
  const replies = leads.filter((l) => l.status === "replied" || l.follow_up_state === "replied").length;
  const warm = leads.filter((l) => l.follow_up_state === "warm" || l.status === "warm").length;

  // Per-user usage
  const userUsage = useMemo(() => {
    const m: Record<string, { used: number; granted: number; topup: number; sends: number; uploads: number }> = {};
    const k = (uid: string) => (m[uid] = m[uid] || { used: 0, granted: 0, topup: 0, sends: 0, uploads: 0 });
    ledger.forEach((l) => {
      const u = k(l.user_id);
      if (l.delta < 0) u.used += -l.delta;
      else if (l.reason === "topup") u.topup += l.delta;
      else if (l.reason === "plan_grant") u.granted += l.delta;
    });
    sends.forEach((s) => s.user_id && (k(s.user_id).sends += 1));
    uploads.forEach((u) => u.user_id && (k(u.user_id).uploads += 1));
    return m;
  }, [ledger, sends, uploads]);

  // Customer profitability
  const customers = useMemo(() => {
    return plans.map((p) => {
      const usage = userUsage[p.user_id] || { used: 0, granted: 0, topup: 0, sends: 0, uploads: 0 };
      const cfg = PLANS[p.plan as PlanId];
      const planRevenue = cfg ? parseFloat(cfg.price.replace(/[^\d.]/g, "")) || 0 : 0;
      const topupRev = topups.filter((t) => t.user_id === p.user_id).reduce((s, t) => s + Number(t.amount || 0), 0);
      const totalRev = planRevenue + topupRev;
      const allowance = usage.granted + usage.topup;
      const burnPct = allowance > 0 ? usage.used / allowance : 0;
      const intensity =
        usage.sends * COST_COEFFICIENTS.perSendProxy +
        usage.uploads * COST_COEFFICIENTS.perUploadProxy;
      const marginScore = totalRev - intensity; // PROXY — see COST_COEFFICIENTS
      return {
        user_id: p.user_id,
        plan: p.plan,
        currency: p.currency || "GBP",
        revenue: totalRev,
        sends: usage.sends,
        uploads: usage.uploads,
        used: usage.used,
        allowance,
        burnPct,
        marginScore,
      };
    });
  }, [plans, userUsage, topups]);

  // Alerts
  const alerts = useMemo(() => {
    const out: { tone: "warn" | "info" | "danger"; text: string }[] = [];
    customers.forEach((c) => {
      if (c.burnPct >= 0.9) out.push({ tone: "warn", text: `${c.plan} customer ${c.user_id.slice(0, 8)} at ${Math.round(c.burnPct * 100)}% allowance — upsell candidate.` });
      if (c.uploads > 5 && c.sends === 0) out.push({ tone: "info", text: `Customer ${c.user_id.slice(0, 8)} uploaded ${c.uploads} times but hasn't activated.` });
      if (c.marginScore < COST_COEFFICIENTS.marginWarningBelow) out.push({ tone: "danger", text: `Customer ${c.user_id.slice(0, 8)} shows negative margin proxy — high usage vs revenue.` });
    });
    if (bounces > totalSends * 0.05 && totalSends > 0) out.push({ tone: "warn", text: `Platform bounce rate ${Math.round((bounces / totalSends) * 100)}% — investigate sender health.` });
    return out.slice(0, 8);
  }, [customers, bounces, totalSends]);

  if (loading) return <div className="p-6 text-muted-foreground">Loading intelligence…</div>;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center gap-3">
        <Brain className="text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Velocity Intelligence</h1>
          <p className="text-sm text-muted-foreground">Internal operating brain — aggregate platform health, intelligence, and profitability. Tenant-safe.</p>
        </div>
      </div>

      {/* Platform Data Health */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Database size={18} /> Platform Data Health</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Contacts" value={contacts.length} />
          <Stat label="Companies" value={companies.length} />
          <Stat label="Imports" value={uploads.length} />
          <Stat label="Staged rows" value={uploadRows.length} />
          <Stat label="Safe to activate" value={safeRecords} />
          <Stat label="Risky / review" value={riskyRecords} />
          <Stat label="Blocked / suppressed" value={blockedRecords} />
          <Stat label="Quality mix" value={`${Object.keys(qualityMix).length} buckets`} hint={Object.entries(qualityMix).map(([k, v]) => `${k}:${v}`).join("  ")} />
        </CardContent>
      </Card>

      {/* Geo / language / sector */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Globe size={18} /> Geo · Language · Sector</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-semibold mb-2">Top contact countries</div>
            {topN(contacts, "country").map(([k, v]) => <div key={k} className="flex justify-between text-sm py-1 border-b last:border-0"><span>{k}</span><span className="text-muted-foreground">{v}</span></div>)}
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Top languages</div>
            {topN(contacts, "language").map(([k, v]) => <div key={k} className="flex justify-between text-sm py-1 border-b last:border-0"><span>{k}</span><span className="text-muted-foreground">{v}</span></div>)}
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Top company sectors</div>
            {topN(companies, "industry").map(([k, v]) => <div key={k} className="flex justify-between text-sm py-1 border-b last:border-0"><span>{k}</span><span className="text-muted-foreground">{v}</span></div>)}
          </div>
        </CardContent>
      </Card>

      {/* Send intelligence */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Send size={18} /> Activation & Send Intelligence</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Total sends" value={totalSends} />
          <Stat label="Delivered" value={sentOk} />
          <Stat label="Bounces" value={bounces} hint={totalSends ? `${Math.round((bounces / totalSends) * 100)}% rate` : "—"} />
          <Stat label="Failures" value={failures} />
          <Stat label="Credits used" value={ledger.filter(l => l.delta < 0).reduce((s, l) => s + -l.delta, 0)} />
          <Stat label="Top-ups purchased" value={topups.length} />
          <Stat label="Audit events" value={audit.length} hint="risky overrides, safety changes" />
          <Stat label="Active plans" value={plans.filter(p => p.status === "active").length} />
        </CardContent>
      </Card>

      {/* Reply / pipeline */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare size={18} /> Reply · Pipeline · Conversion</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Replies" value={replies} />
          <Stat label="Warm contacts" value={warm} />
          <Stat label="Opportunities" value={opps.length} />
          <Stat label="Pipeline value" value={`£${pipelineValue.toLocaleString()}`} />
          <Stat label="Wins" value={wins} />
          <Stat label="Losses" value={losses} />
          <Stat label="Reply rate" value={totalSends ? `${Math.round((replies / totalSends) * 100)}%` : "—"} />
          <Stat label="Warm → pipeline" value={warm ? `${Math.round((opps.length / warm) * 100)}%` : "—"} />
        </CardContent>
      </Card>

      {/* Customer Profitability */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp size={18} /> Customer Profitability</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2">Customer</th><th>Plan</th><th>Revenue</th><th>Sends</th><th>Uploads</th><th>Credits used</th><th>Burn</th><th>Margin proxy</th>
                </tr>
              </thead>
              <tbody>
                {customers.sort((a, b) => b.revenue - a.revenue).slice(0, 25).map((c) => (
                  <tr key={c.user_id} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{c.user_id.slice(0, 10)}…</td>
                    <td><Badge variant="outline">{c.plan}</Badge></td>
                    <td>{c.currency} {c.revenue.toFixed(0)}</td>
                    <td>{c.sends}</td>
                    <td>{c.uploads}</td>
                    <td>{c.used}</td>
                    <td>{c.allowance ? `${Math.round(c.burnPct * 100)}%` : "—"}</td>
                    <td className={c.marginScore < 0 ? "text-destructive" : "text-emerald-600"}>{c.marginScore.toFixed(1)}</td>
                  </tr>
                ))}
                {customers.length === 0 && <tr><td colSpan={8} className="text-muted-foreground py-4">No active customers yet.</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Margin proxy = plan + top-up revenue minus weighted usage intensity. Directional indicator, not accounting truth.</p>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle size={18} /> Internal Next Best Actions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {alerts.length === 0 && <div className="text-sm text-muted-foreground">No alerts. Platform looks healthy.</div>}
          {alerts.map((a, i) => (
            <div key={i} className={`text-sm p-3 rounded-md border ${a.tone === "danger" ? "border-destructive/40 bg-destructive/5" : a.tone === "warn" ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-muted/40"}`}>
              {a.text}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck size={18} /> Governance & Internal Access</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-3">
          <div className="text-muted-foreground space-y-1">
            <p>This dashboard shows aggregate platform intelligence and customer-level commercial proxies. Raw cross-tenant contact data is not surfaced here.</p>
            <p>Access is restricted to founder / admin roles via the CRM route guard. Drill-down into customer-specific data is performed via the standard CRM screens, which carry their own audit trails.</p>
          </div>
          <div>
            <div className="text-xs font-semibold mb-2 uppercase text-muted-foreground">Recent internal access</div>
            <div className="rounded-md border divide-y">
              {audit.filter((a) => ["intelligence_view", "risky_override", "safety_change"].includes(a.action)).slice(0, 8).map((a, i) => (
                <div key={i} className="flex justify-between px-3 py-2 text-xs">
                  <span><Badge variant="outline" className="mr-2">{a.action}</Badge><span className="font-mono">{(a.user_id || "—").toString().slice(0, 10)}…</span></span>
                  <span className="text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                </div>
              ))}
              {audit.filter((a) => ["intelligence_view", "risky_override", "safety_change"].includes(a.action)).length === 0 && (
                <div className="px-3 py-3 text-xs text-muted-foreground">No internal access events recorded yet.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
