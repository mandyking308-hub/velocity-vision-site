import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, Shield, RefreshCw,
  ChevronDown, ChevronRight, Bug, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TEST_SEED: { category: string; tests: { name: string; description: string }[] }[] = [
  {
    category: "Website",
    tests: [
      { name: "Homepage loads", description: "Homepage renders the current self-serve product story correctly" },
      { name: "Navigation links", description: "All navbar and footer links resolve to active routes" },
      { name: "Pricing truth", description: "Pricing, credits, cadence and send ceilings match enforced plan rules" },
      { name: "Features & workflow", description: "Features and How It Works describe implemented customer-controlled functionality" },
      { name: "Contact form", description: "Contact form persists a valid enquiry without creating duplicate leads on notification delay" },
      { name: "Demo entry", description: "/demo renders the illustrative no-signup demo and /book-demo redirects to it" },
      { name: "Legal Centre", description: "Legal Centre and all current legal-document routes resolve correctly" },
      { name: "Hosted capture", description: "Invalid or non-live /c/:slug links fail safely and capture pages remain noindex" },
    ],
  },
  {
    category: "CRM",
    tests: [
      { name: "CRM access control", description: "Signed-out users and users without internal roles cannot access /crm routes" },
      { name: "Companies", description: "Company records can be reviewed and managed by authorised internal users" },
      { name: "Contacts", description: "Contact records can be reviewed and linked to companies" },
      { name: "Leads", description: "Lead records and current lead states render correctly" },
      { name: "Opportunities", description: "Opportunity records, stages, values and next actions render correctly" },
      { name: "Tasks", description: "Internal tasks render and update for authorised users" },
      { name: "Campaign records", description: "Internal campaign records and campaign detail routes render correctly" },
      { name: "QA and error logs", description: "QA checklist and error-log views remain restricted to internal users" },
    ],
  },
  {
    category: "Customer App",
    tests: [
      { name: "Signed-out guard", description: "Every /app route redirects to /auth without flashing customer data" },
      { name: "Dashboard", description: "Customer command centre renders current workspace state" },
      { name: "Data Vault", description: "Upload, mapping, validation and import-review surfaces render correctly" },
      { name: "Campaigns", description: "Campaign list, creation, Copilot and campaign workspace routes render correctly" },
      { name: "Activation", description: "Activation screen uses real readiness and plan controls" },
      { name: "Replies & follow-up", description: "Reply queues, SLA states and follow-up actions use stored records" },
      { name: "Pipeline", description: "Customer-selected opportunities and stages render from stored records" },
      { name: "Performance", description: "Performance and Outcome Funnel reporting use real stored data" },
      { name: "Billing", description: "Billing page reflects provider readiness, plan and credit state without exposing secrets" },
      { name: "Settings & workspaces", description: "Settings and client-workspace routes remain scoped to the signed-in account" },
    ],
  },
  {
    category: "Campaign Safety",
    tests: [
      { name: "Free Preview send block", description: "Free Preview is hard-blocked from live sending server-side" },
      { name: "Free Preview pack limit", description: "The one-full-pack preview limit is enforced before credits are spent" },
      { name: "Recurring cadence gate", description: "Recurring cadence is available only to Growth and Agency plans" },
      { name: "Plan send ceilings", description: "Daily send ceilings remain 0 / 20 / 50 / 100 for Free / Starter / Growth / Agency" },
      { name: "Preflight", description: "Campaign preflight reports evidence-based readiness before activation" },
      { name: "Unsubscribe precedence", description: "Unsubscribe intent cannot be downgraded into a sales opportunity" },
      { name: "Bounce precedence", description: "Bounce handling prevents unsafe sales treatment while preserving unsubscribe priority" },
      { name: "Referral handling", description: "Referral replies remain reviewable and do not auto-create contacts" },
      { name: "Out-of-office handling", description: "Clear OOO return dates are extracted for manual follow-up without auto-send" },
      { name: "Meeting handoff", description: "Booking-link and manual meeting-booked actions remain customer-controlled" },
      { name: "Outcome Funnel", description: "Contacted-to-won funnel uses stored records and zero-safe rates" },
    ],
  },
  {
    category: "Agency Workspace",
    tests: [
      { name: "Create workspace", description: "Eligible Agency accounts can create isolated client workspaces" },
      { name: "Switch workspace", description: "Agency users can switch among their own client workspaces" },
      { name: "Workspace isolation", description: "Client-workspace records remain isolated to the owning agency account" },
      { name: "Pooled credits", description: "Agency Campaign Credits are pooled across isolated client workspaces" },
      { name: "Account-wide send view", description: "Agency can review account-wide daily send usage against the plan ceiling" },
      { name: "Cross-client outcomes", description: "Cross-client pipeline and Outcome Funnel visibility uses stored workspace records" },
    ],
  },
  {
    category: "Billing & Payments",
    tests: [
      { name: "Dodo readiness fail-closed", description: "Direct-purchase CTAs remain unavailable until the relevant live Dodo product is ready" },
      { name: "Direct checkout intent", description: "A live-ready paid product routes through safe authenticated purchase intent without auto-starting payment" },
      { name: "Webhook fulfilment", description: "Verified provider webhook events remain the authority for paid fulfilment" },
      { name: "Top-up readiness", description: "Top-up copy and checkout availability reflect real runtime product readiness" },
      { name: "Human Review reference", description: "Human Review accepts only a valid owned campaign reference and other products reject refId" },
      { name: "Payment processing", description: "Payment processing works through the configured provider path" },
      { name: "Provider-neutral customer copy", description: "Customer-facing billing language does not falsely promise a specific provider path" },
    ],
  },
  {
    category: "Demo Environment",
    tests: [
      { name: "Demo entry", description: "Public demo entry loads without requiring a paid account" },
      { name: "Illustrative labelling", description: "Sample records and outcomes are clearly identifiable as demo/illustrative data" },
      { name: "Mutation safety", description: "Demo actions do not mutate production customer records" },
      { name: "Real send blocked", description: "Demo cannot trigger real outbound sending" },
      { name: "Real billing blocked", description: "Demo cannot trigger real payment or billing mutations" },
      { name: "New capabilities visible", description: "Demo surfaces Launchpad, Preflight, referral, OOO, waiting reply, meeting and Outcome Funnel examples" },
    ],
  },
  {
    category: "Legal Acceptance",
    tests: [
      { name: "Signup checkbox", description: "Legal acceptance is mandatory during account creation" },
      { name: "Legal document routes", description: "All current legal-document routes resolve from the Legal Centre" },
      { name: "Acceptance logging", description: "Legal acceptance is recorded with the applicable user and document-version context" },
      { name: "Compliance view", description: "Internal legal-compliance surfaces remain restricted to authorised roles" },
      { name: "Version tracking", description: "Current legal document versions are displayed and recorded consistently" },
    ],
  },
  {
    category: "Security",
    tests: [
      { name: "Customer data isolation", description: "Customers only see records allowed by current ownership and RLS rules" },
      { name: "Agency workspace isolation", description: "Agency accounts only see their own client workspaces" },
      { name: "Internal role enforcement", description: "CRM routes require both authentication and an authorised internal role" },
      { name: "Safe return paths", description: "Authentication next-path handling rejects external or malformed redirects" },
      { name: "Dodo secret exposure", description: "API keys, webhook secrets, product IDs and customer IDs are not exposed by public readiness" },
      { name: "Sensitive translation protection", description: "GTranslate marks sensitive inputs and secret-bearing elements as notranslate" },
    ],
  },
  {
    category: "Release Quality",
    tests: [
      { name: "Automated tests", description: "Full automated test suite passes before publication" },
      { name: "Typecheck", description: "TypeScript typecheck completes without errors" },
      { name: "Production build", description: "Production build completes successfully" },
      { name: "Mobile layout", description: "Public pages render without horizontal overflow at 390px" },
      { name: "Route smoke", description: "Public routes render and protected routes redirect safely" },
      { name: "Truth sweep", description: "Public copy, llms.txt, sitemap and internal reference material match current implementation" },
    ],
  },
];

const statusIcon = (s: string) => {
  if (s === "passed") return <CheckCircle2 size={16} className="text-green-500" />;
  if (s === "failed") return <XCircle size={16} className="text-destructive" />;
  return <Clock size={16} className="text-muted-foreground" />;
};

const statusColor = (s: string) => {
  if (s === "passed") return "bg-green-100 text-green-700";
  if (s === "failed") return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
};

const QADashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(TEST_SEED.map((c) => c.category)));
  const [tab, setTab] = useState<"tests" | "errors">("tests");
  const [showSeedDialog, setShowSeedDialog] = useState(false);
  const [errorForm, setErrorForm] = useState({ category: "", message: "", details: "", severity: "error" });
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const { data: testResults } = useQuery({
    queryKey: ["qa-tests"],
    queryFn: async () => {
      const { data } = await supabase.from("qa_test_results" as any).select("*").order("category").order("test_name");
      return (data ?? []) as any[];
    },
  });

  const { data: errorLogs } = useQuery({
    queryKey: ["qa-errors"],
    queryFn: async () => {
      const { data } = await supabase.from("error_logs" as any).select("*").order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
  });

  const seedTests = useMutation({
    mutationFn: async () => {
      for (const cat of TEST_SEED) {
        for (const test of cat.tests) {
          const existing = testResults?.find((r: any) => r.category === cat.category && r.test_name === test.name);
          if (!existing) {
            await supabase.from("qa_test_results" as any).insert({
              category: cat.category, test_name: test.name, description: test.description, status: "pending",
            } as any);
          }
        }
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["qa-tests"] }); setShowSeedDialog(false); toast.success("Test checklist populated!"); },
  });

  const updateTestStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await supabase.from("qa_test_results" as any).update({
        status, last_run_at: new Date().toISOString(), run_by: user?.id,
      } as any).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["qa-tests"] }),
  });

  const logError = useMutation({
    mutationFn: async () => {
      await supabase.from("error_logs" as any).insert(errorForm as any);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["qa-errors"] }); setShowErrorDialog(false); setErrorForm({ category: "", message: "", details: "", severity: "error" }); toast.success("Error logged"); },
  });

  const resolveError = useMutation({
    mutationFn: async (id: string) => { await supabase.from("error_logs" as any).update({ resolved: true } as any).eq("id", id); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["qa-errors"] }),
  });

  const total = testResults?.length ?? 0;
  const passed = testResults?.filter((t: any) => t.status === "passed").length ?? 0;
  const failed = testResults?.filter((t: any) => t.status === "failed").length ?? 0;
  const pending = total - passed - failed;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(0) : "0";

  const categories = Array.from(new Set(testResults?.map((t: any) => t.category) ?? []));

  const toggleCat = (cat: string) => {
    const next = new Set(expandedCats);
    next.has(cat) ? next.delete(cat) : next.add(cat);
    setExpandedCats(next);
  };

  const unresolvedErrors = errorLogs?.filter((e: any) => !e.resolved) ?? [];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Shield size={24} className="text-accent" /> QA Testing Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Platform quality assurance and testing framework</p>
        </div>
        <div className="flex gap-2">
          {total === 0 && (
            <Dialog open={showSeedDialog} onOpenChange={setShowSeedDialog}>
              <DialogTrigger asChild><Button size="sm" className="gap-1.5"><RefreshCw size={14} /> Populate Tests</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Populate Test Checklist</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">This will create {TEST_SEED.reduce((s, c) => s + c.tests.length, 0)} test cases across {TEST_SEED.length} categories.</p>
                <Button onClick={() => seedTests.mutate()} disabled={seedTests.isPending} className="w-full">Populate Now</Button>
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
            <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-1.5"><Bug size={14} /> Log Error</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Error</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <Input placeholder="Category (e.g. Billing, CRM)" value={errorForm.category} onChange={(e) => setErrorForm({ ...errorForm, category: e.target.value })} />
                <Input placeholder="Error message" value={errorForm.message} onChange={(e) => setErrorForm({ ...errorForm, message: e.target.value })} />
                <Textarea placeholder="Details / stack trace" rows={3} value={errorForm.details} onChange={(e) => setErrorForm({ ...errorForm, details: e.target.value })} />
                <Select value={errorForm.severity} onValueChange={(v) => setErrorForm({ ...errorForm, severity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => logError.mutate()} disabled={!errorForm.message} className="w-full">Log Error</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Tests", value: total, icon: Shield, color: "text-accent" },
          { label: "Passed", value: passed, icon: CheckCircle2, color: "text-green-500" },
          { label: "Failed", value: failed, icon: XCircle, color: "text-destructive" },
          { label: "Pending", value: pending, icon: Clock, color: "text-muted-foreground" },
          { label: "Pass Rate", value: `${passRate}%`, icon: AlertTriangle, color: passed === total && total > 0 ? "text-green-500" : "text-accent" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border/50 rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2"><kpi.icon size={16} className={kpi.color} /><span className="text-xs text-muted-foreground">{kpi.label}</span></div>
            <p className="text-2xl font-display font-bold text-foreground">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        {[{ key: "tests", label: `Test Cases (${total})` }, { key: "errors", label: `Error Log (${unresolvedErrors.length})` }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as any)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "tests" && (
        <div className="space-y-3">
          {categories.length === 0 && (
            <div className="text-center py-16">
              <Shield size={48} className="text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No test cases yet. Click "Populate Tests" to create the checklist.</p>
            </div>
          )}
          {categories.map((cat) => {
            const catTests = testResults?.filter((t: any) => t.category === cat) ?? [];
            const catPassed = catTests.filter((t: any) => t.status === "passed").length;
            const expanded = expandedCats.has(cat);
            return (
              <div key={cat} className="bg-card border border-border/50 rounded-xl shadow-card overflow-hidden">
                <button onClick={() => toggleCat(cat)} className="w-full flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <h3 className="font-display font-semibold text-foreground">{cat}</h3>
                    <span className="text-xs text-muted-foreground">{catPassed}/{catTests.length} passed</span>
                  </div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${catTests.length ? (catPassed / catTests.length) * 100 : 0}%` }} />
                  </div>
                </button>
                {expanded && (
                  <div className="border-t border-border/30">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-muted/20">
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Test</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Description</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Last Run</th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">Action</th>
                      </tr></thead>
                      <tbody>
                        {catTests.map((test: any) => (
                          <tr key={test.id} className="border-t border-border/20">
                            <td className="px-4 py-2.5 font-medium text-foreground">{test.test_name}</td>
                            <td className="px-4 py-2.5 text-muted-foreground text-xs">{test.description}</td>
                            <td className="px-4 py-2.5">
                              <span className={cn("text-xs px-2 py-1 rounded-full font-medium capitalize inline-flex items-center gap-1", statusColor(test.status))}>
                                {statusIcon(test.status)} {test.status}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground text-xs">{test.last_run_at ? format(new Date(test.last_run_at), "MMM d, h:mm a") : "—"}</td>
                            <td className="px-4 py-2.5 text-right">
                              <div className="flex gap-1 justify-end">
                                <button onClick={() => updateTestStatus.mutate({ id: test.id, status: "passed" })} className="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-700 hover:bg-green-200">Pass</button>
                                <button onClick={() => updateTestStatus.mutate({ id: test.id, status: "failed" })} className="text-[10px] px-2 py-0.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20">Fail</button>
                                <button onClick={() => updateTestStatus.mutate({ id: test.id, status: "pending" })} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground hover:bg-muted/80">Reset</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "errors" && (
        <div className="bg-card border border-border/50 rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border/30 bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Severity</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Message</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Action</th>
            </tr></thead>
            <tbody>
              {(errorLogs ?? []).map((err: any) => (
                <tr key={err.id} className="border-b border-border/20 last:border-0">
                  <td className="px-4 py-2.5">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                      err.severity === "critical" ? "bg-destructive/20 text-destructive" :
                      err.severity === "error" ? "bg-destructive/10 text-destructive" : "bg-yellow-100 text-yellow-700"
                    )}>{err.severity}</span>
                  </td>
                  <td className="px-4 py-2.5 text-foreground">{err.category}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs max-w-[300px] truncate">{err.message}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{format(new Date(err.created_at), "MMM d, h:mm a")}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", err.resolved ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive")}>
                      {err.resolved ? "Resolved" : "Open"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {!err.resolved && <button onClick={() => resolveError.mutate(err.id)} className="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-700 hover:bg-green-200">Resolve</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!errorLogs || errorLogs.length === 0) && <p className="text-muted-foreground text-sm text-center py-12">No errors logged</p>}
        </div>
      )}
    </div>
  );
};

export default QADashboard;
