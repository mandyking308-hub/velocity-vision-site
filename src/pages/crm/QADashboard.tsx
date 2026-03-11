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
      { name: "Homepage loads", description: "Homepage renders all sections correctly" },
      { name: "Navigation links", description: "All navbar links navigate to correct pages" },
      { name: "Services page", description: "Services page loads with all content" },
      { name: "Industries page", description: "Industries page loads correctly" },
      { name: "For Agencies page", description: "For Agencies page loads with all sections" },
      { name: "Contact form", description: "Contact form submits and creates CRM records" },
      { name: "Demo booking", description: "Demo booking form creates lead in CRM" },
      { name: "Demo → CRM sync", description: "Confirm demo requests automatically create CRM lead records" },
    ],
  },
  {
    category: "CRM",
    tests: [
      { name: "Lead creation (website)", description: "Website forms create lead records" },
      { name: "Manual lead entry", description: "Manual lead creation via CRM works" },
      { name: "Company record creation", description: "New companies can be created with all fields" },
      { name: "Contact creation", description: "New contacts can be created and linked to companies" },
      { name: "Opportunity creation", description: "Opportunities can be created with values" },
      { name: "Pipeline: New", description: "Leads start in New stage" },
      { name: "Pipeline: Contacted", description: "Leads move to Contacted stage" },
      { name: "Pipeline: Demo Scheduled", description: "Leads move to Demo Scheduled stage" },
      { name: "Pipeline: Proposal", description: "Leads move to Proposal Sent stage" },
      { name: "Pipeline: Negotiation", description: "Leads move to Negotiation stage" },
      { name: "Pipeline: Won/Lost", description: "Leads move to Won or Lost stage" },
      { name: "Dashboard metrics", description: "CRM dashboard KPIs update accurately" },
      { name: "Contact timelines", description: "Contact timelines record activity correctly" },
      { name: "Search & filters", description: "Search and filter functionality works" },
    ],
  },
  {
    category: "Client Portal",
    tests: [
      { name: "Client login", description: "Client can log in securely and see portal" },
      { name: "Password reset", description: "Password reset flow works correctly" },
      { name: "Campaign overview", description: "Client sees campaign overview display" },
      { name: "Campaign metrics", description: "Campaign performance metrics display correctly" },
      { name: "Upload assets", description: "Client can upload campaign assets" },
      { name: "Download reports", description: "Client can download campaign reports" },
      { name: "Messaging system", description: "Client messaging system works correctly" },
      { name: "View invoices", description: "Client can view invoices in billing section" },
      { name: "Data isolation", description: "Each client only sees their own data" },
    ],
  },
  {
    category: "Campaign Engine",
    tests: [
      { name: "Create campaign", description: "Internal user can create campaigns" },
      { name: "Schedule campaign", description: "Campaign scheduling with dates works" },
      { name: "Upload assets", description: "Campaign asset upload to storage works" },
      { name: "Audience upload", description: "Audience list upload and management works" },
      { name: "Status updates", description: "Campaign status transitions work correctly" },
      { name: "Performance metrics", description: "Campaign metrics record and display correctly" },
      { name: "Report generation", description: "Campaign reports generate correctly" },
    ],
  },
  {
    category: "Agency Accounts",
    tests: [
      { name: "Agency onboarding", description: "Agency account onboarding flow completes correctly" },
      { name: "Create workspace", description: "Agency can create client workspaces" },
      { name: "Switch workspaces", description: "Agency can switch between client workspaces" },
      { name: "Workspace campaigns", description: "Campaigns can be created for different workspaces" },
      { name: "Workspace reports", description: "Reports are viewable per client workspace" },
      { name: "CRM linking", description: "CRM records link Agency → Workspace → Campaign correctly" },
      { name: "Agency data isolation", description: "Agency accounts only see their own workspaces" },
    ],
  },
  {
    category: "Founder Dashboard",
    tests: [
      { name: "Access control", description: "Only founder/admin roles can access" },
      { name: "Total clients KPI", description: "Active client count is accurate" },
      { name: "Agency vs Business", description: "Agency clients vs business clients breakdown is correct" },
      { name: "Active campaigns KPI", description: "Campaign count matches database" },
      { name: "Revenue metrics", description: "Revenue figures calculate correctly" },
      { name: "Lead stats", description: "Lead generation numbers are accurate" },
      { name: "Pipeline value", description: "Pipeline value aggregation is correct" },
      { name: "Dynamic updates", description: "KPIs update when data changes" },
    ],
  },
  {
    category: "Billing",
    tests: [
      { name: "Create subscription", description: "Subscription creation works" },
      { name: "Agency subscription", description: "Agency plan subscription works correctly" },
      { name: "Generate invoice", description: "Invoice creation with auto-number works" },
      { name: "Payment processing", description: "Payment processing via Stripe works" },
      { name: "Invoice download", description: "Invoice PDF download works" },
      { name: "Payment status updates", description: "Payment status transitions update correctly" },
      { name: "CRM revenue sync", description: "Billing events update CRM records" },
      { name: "Dashboard revenue sync", description: "Billing updates founder dashboard analytics" },
    ],
  },
  {
    category: "Onboarding Journey",
    tests: [
      { name: "Demo → CRM lead", description: "Demo booking creates CRM lead record" },
      { name: "Lead conversion", description: "Qualified lead converts to client account" },
      { name: "Portal account", description: "Client portal access created on conversion" },
      { name: "Business onboarding", description: "Business onboarding path works correctly" },
      { name: "Agency onboarding", description: "Agency onboarding path works correctly" },
      { name: "Workspace creation", description: "Agency client workspace creation works" },
      { name: "Onboarding form", description: "Onboarding data saves to database" },
      { name: "Progress tracker", description: "Onboarding progress indicators display correctly" },
    ],
  },
  {
    category: "Demo Environment",
    tests: [
      { name: "Demo login", description: "Demo login page loads and demo credentials work" },
      { name: "Demo banner", description: "Demo banner appears at top of screen with CTA" },
      { name: "Sample data loads", description: "Sample contacts, campaigns and analytics load correctly" },
      { name: "Upload blocked", description: "Uploading marketing lists shows disabled message" },
      { name: "Send blocked", description: "Sending campaigns shows disabled message" },
      { name: "Billing blocked", description: "Modifying billing settings shows disabled message" },
      { name: "Account creation blocked", description: "Creating new accounts shows disabled message" },
      { name: "Create Account CTA", description: "Create My Account button redirects to signup page" },
    ],
  },
  {
    category: "Legal Acceptance",
    tests: [
      { name: "Signup checkbox", description: "Legal acceptance checkbox required during account creation" },
      { name: "Document links", description: "All 9 legal document links open in new tabs" },
      { name: "Acceptance logging", description: "Acceptance record created with user ID, email, IP, version" },
      { name: "Admin compliance view", description: "Legal compliance dashboard shows acceptance records" },
      { name: "Portal legal section", description: "Client portal shows accepted versions and dates" },
      { name: "Version tracking", description: "Legal documents display version numbers correctly" },
    ],
  },
  {
    category: "Security",
    tests: [
      { name: "Client data isolation", description: "Clients only see own company data" },
      { name: "Agency workspace isolation", description: "Agency accounts only see own workspaces" },
      { name: "Founder restriction", description: "Founder dashboard blocked for non-founder/admin" },
      { name: "Role enforcement", description: "Internal staff roles restrict access correctly" },
      { name: "Auth required", description: "Protected routes redirect unauthenticated users" },
    ],
  },
  {
    category: "Performance",
    tests: [
      { name: "Page load speed", description: "Pages load within acceptable time limits" },
      { name: "Dashboard performance", description: "Dashboards perform well with large datasets" },
      { name: "Campaign reporting speed", description: "Campaign reports generate quickly" },
      { name: "CRM search performance", description: "CRM search returns results within 2 seconds" },
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
          // Check if already exists
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

  // Summary stats
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

      {/* KPIs */}
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

      {/* Tabs */}
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
