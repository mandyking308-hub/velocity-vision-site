import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VaultSummaryCards from "@/components/app/datavault/VaultSummaryCards";
import RecentImportsTable from "@/components/app/datavault/RecentImportsTable";
import DataHealthPanel from "@/components/app/datavault/DataHealthPanel";
import PreviewStep from "@/components/app/datavault/PreviewStep";
import ImportReport from "@/components/app/datavault/ImportReport";
import { Users, Building2, FolderUp, CheckCircle2, AlertTriangle, AlertOctagon, Ban, Copy, Upload, ArrowRight } from "lucide-react";

const DEMO_ROWS = [
  { row_number: 1, mapped_fields: { full_name: "Maya Patel", email: "maya@northwave.io", company_name: "Northwave" }, validation_status: "valid" as const, duplicate_status: "none" as const, issues: [] },
  { row_number: 2, mapped_fields: { full_name: "Jonas Lind", email: "jonas@lindco.se", company_name: "LindCo" }, validation_status: "valid" as const, duplicate_status: "none" as const, issues: [] },
  { row_number: 3, mapped_fields: { full_name: "Info Account", email: "info@acme.com", company_name: "Acme" }, validation_status: "risky" as const, duplicate_status: "none" as const, issues: ["Role-based address (info@, admin@, etc.)"] },
  { row_number: 4, mapped_fields: { full_name: "Sarah Lee", email: "sarah@gmail.com" }, validation_status: "needs_review" as const, duplicate_status: "none" as const, issues: ["Free email with no company", "Missing company"] },
  { row_number: 5, mapped_fields: { full_name: "Maya Patel", email: "maya@northwave.io", company_name: "Northwave" }, validation_status: "valid" as const, duplicate_status: "likely" as const, issues: [] },
  { row_number: 6, mapped_fields: { full_name: "", email: "not-an-email" }, validation_status: "blocked" as const, duplicate_status: "none" as const, issues: ["Email format looks invalid", "Missing name", "Missing company"] },
];

export default function DemoDataVault() {
  const stats = [
    { label: "Total contacts", value: 247, icon: Users },
    { label: "Total companies", value: 92, icon: Building2 },
    { label: "Imported lists", value: 3, icon: FolderUp },
    { label: "Clean", value: 208, icon: CheckCircle2, tone: "good" as const },
    { label: "Needs review", value: 23, icon: AlertTriangle, tone: "warn" as const },
    { label: "Risky", value: 18, icon: AlertOctagon, tone: "warn" as const },
    { label: "Blocked", value: 9, icon: Ban, tone: "danger" as const },
    { label: "Duplicates", value: 12, icon: Copy },
  ];

  const imports = [
    { id: "demo-1", file_name: "clients_q4_outreach.csv", created_at: new Date().toISOString(), row_count: 247, status: "imported", summary: { created: 226, duplicates: 12, safe_to_send: 208 } },
    { id: "demo-2", file_name: "linkedin_export_oct.csv", created_at: new Date(Date.now() - 86400000 * 3).toISOString(), row_count: 84, status: "imported", summary: { created: 78, duplicates: 4, safe_to_send: 71 } },
    { id: "demo-3", file_name: "event_signups.csv", created_at: new Date(Date.now() - 86400000 * 10).toISOString(), row_count: 31, status: "imported", summary: { created: 31, duplicates: 0, safe_to_send: 29 } },
  ];

  const totals = { valid: 4, needs_review: 1, risky: 1, blocked: 1, duplicates: 1, total: DEMO_ROWS.length };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-accent text-accent-foreground px-4 py-2.5 text-center text-sm font-semibold sticky top-0 z-50">
        DEMO — not your live customer data
      </div>
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="font-bold">Velocity · Data Vault demo</div>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/demo/crm">Demo dashboard</Link></Button>
            <Button asChild><Link to="/auth">Unlock your workspace</Link></Button>
          </div>
        </div>
      </header>


      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data Vault</h1>
            <p className="text-muted-foreground mt-1">This is what happens when you drop in your spreadsheet — instantly.</p>
          </div>
          <Button asChild size="lg"><Link to="/auth"><Upload className="h-4 w-4 mr-2" />Upload your own data</Link></Button>
        </div>

        <VaultSummaryCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Recent imports</CardTitle></CardHeader>
            <CardContent><RecentImportsTable imports={imports as any} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Data health</CardTitle></CardHeader>
            <CardContent><DataHealthPanel clean={208} needs_review={23} risky={18} blocked={9} /></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Sample preview — clients_q4_outreach.csv</CardTitle></CardHeader>
          <CardContent><PreviewStep rows={DEMO_ROWS as any} totals={totals} /></CardContent>
        </Card>

        <ImportReport
          s={{
            rows: 247,
            created: 226,
            companies_created: 84,
            duplicates: 12,
            risky: 18,
            needs_review: 23,
            blocked: 9,
            safe_to_send: 208,
            recommended: [
              { title: "Review 18 risky contacts", to: "/auth" },
              { title: "Move safe contacts into outreach", to: "/auth" },
            ],
          }}
        />

        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">Try it with your own list</div>
              <div className="text-sm opacity-90">Free to upload. We'll show you what's usable before you spend a credit.</div>
            </div>
            <Button asChild variant="secondary" size="lg"><Link to="/auth">Upload your own data <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
