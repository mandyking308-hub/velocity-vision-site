import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientCompany } from "@/hooks/useClientCompany";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2, Circle, Building2, Target, Upload, Rocket, ArrowRight, ArrowLeft, Briefcase, Users
} from "lucide-react";

const businessSteps = [
  { key: "profile", label: "Business Profile", icon: Building2 },
  { key: "goals", label: "Marketing Goals", icon: Target },
  { key: "assets", label: "Upload Assets", icon: Upload },
  { key: "launch", label: "Campaign Kickoff", icon: Rocket },
];

const agencySteps = [
  { key: "profile", label: "Agency Profile", icon: Building2 },
  { key: "services", label: "Agency Details", icon: Briefcase },
  { key: "workspace", label: "First Client", icon: Users },
  { key: "launch", label: "Campaign Kickoff", icon: Rocket },
];

const PortalOnboarding = () => {
  const { companyId } = useClientCompany();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [accountType, setAccountType] = useState<"business" | "agency">("business");

  // Business fields
  const [form, setForm] = useState({
    business_description: "", marketing_goals: "", target_audience: "",
    target_regions: "", competitors: "", existing_channels: "",
  });

  // Agency-specific fields
  const [agencyForm, setAgencyForm] = useState({
    agency_size: "", services_offered: "", industries_served: "",
  });

  // First workspace fields
  const [wsForm, setWsForm] = useState({
    name: "", website: "", industry: "", objective: "",
  });

  const [campaignObjective, setCampaignObjective] = useState("");
  const [uploading, setUploading] = useState(false);

  const steps = accountType === "agency" ? agencySteps : businessSteps;

  const { data: onboarding, isLoading } = useQuery({
    queryKey: ["client-onboarding", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      const { data } = await supabase.from("client_onboarding" as any).select("*").eq("company_id", companyId).maybeSingle();
      return data as any;
    },
    enabled: !!companyId,
  });

  const { data: documents } = useQuery({
    queryKey: ["onboarding-docs", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase.from("client_documents").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!companyId,
  });

  const { data: workspaces } = useQuery({
    queryKey: ["onboarding-workspaces", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase.from("client_workspaces").select("*").eq("agency_company_id", companyId);
      return data ?? [];
    },
    enabled: !!companyId,
  });

  // Save profile (business path)
  const saveBusinessProfile = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error("No company");
      await supabase.from("companies").update({ account_type: "business" } as any).eq("id", companyId);
      const payload = { ...form, completed: true, completed_at: new Date().toISOString() };
      if (onboarding) {
        const { error } = await supabase.from("client_onboarding" as any).update(payload as any).eq("company_id", companyId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("client_onboarding" as any).insert({ company_id: companyId, ...payload } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-onboarding"] });
      toast.success("Business profile saved!");
      setCurrentStep(2);
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Save agency profile
  const saveAgencyProfile = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error("No company");
      await supabase.from("companies").update({ account_type: "agency" } as any).eq("id", companyId);
      const payload = {
        ...form,
        agency_size: agencyForm.agency_size,
        services_offered: agencyForm.services_offered,
        industries_served: agencyForm.industries_served,
        completed: true, completed_at: new Date().toISOString(),
      };
      if (onboarding) {
        const { error } = await supabase.from("client_onboarding" as any).update(payload as any).eq("company_id", companyId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("client_onboarding" as any).insert({ company_id: companyId, ...payload } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-onboarding"] });
      toast.success("Agency profile saved!");
      setCurrentStep(2);
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Create first workspace (agency path)
  const createFirstWorkspace = useMutation({
    mutationFn: async () => {
      if (!companyId || !wsForm.name.trim()) throw new Error("Client name required");
      const { error } = await supabase.from("client_workspaces").insert({
        agency_company_id: companyId,
        name: wsForm.name,
        industry: wsForm.industry || null,
        website: wsForm.website || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-workspaces"] });
      toast.success("Client workspace created!");
      setCurrentStep(3);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !companyId) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const path = `${companyId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("client-documents").upload(path, file);
      if (uploadError) { toast.error(`Failed to upload ${file.name}`); continue; }
      const { data: urlData } = supabase.storage.from("client-documents").getPublicUrl(path);
      await supabase.from("client_documents").insert({
        company_id: companyId, name: file.name, file_url: urlData.publicUrl,
        document_type: "onboarding", file_size: file.size, uploaded_by: user?.id,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["onboarding-docs"] });
    toast.success("Files uploaded!");
    setUploading(false);
  };

  const requestCampaign = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error("No company");
      const { error } = await supabase.from("campaign_requests").insert({
        company_id: companyId,
        objective: campaignObjective || (accountType === "agency" ? wsForm.objective : "") || "First campaign setup",
        created_by: user?.id, status: "pending" as const,
      });
      if (error) throw error;
      const taskTitles = ["Account manager assignment", "Campaign planning", "Creative preparation", "Audience research", "Brand review"];
      for (const title of taskTitles) {
        await supabase.from("tasks").insert({
          title: `${title} — New ${accountType} client`, description: `Auto-created for onboarding`,
          entity_type: "onboarding", entity_id: companyId, created_by: user?.id,
        });
      }
    },
    onSuccess: () => {
      toast.success("Campaign request submitted! Our team is on it.");
      navigate("/portal");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const profileDone = onboarding?.completed === true;
  const hasAssets = (documents?.length ?? 0) > 0;
  const hasWorkspace = (workspaces?.length ?? 0) > 0;
  const stepStatuses = accountType === "agency"
    ? [true, profileDone, hasWorkspace, false]
    : [true, profileDone, hasAssets, false];

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;

  // Pre-fill
  if (onboarding && !form.business_description && onboarding.business_description) {
    setForm({
      business_description: onboarding.business_description || "",
      marketing_goals: onboarding.marketing_goals || "",
      target_audience: onboarding.target_audience || "",
      target_regions: onboarding.target_regions || "",
      competitors: onboarding.competitors || "",
      existing_channels: onboarding.existing_channels || "",
    });
    if (onboarding.agency_size) {
      setAgencyForm({
        agency_size: onboarding.agency_size || "",
        services_offered: onboarding.services_offered || "",
        industries_served: onboarding.industries_served || "",
      });
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Getting Started</h1>
        <p className="text-muted-foreground text-sm mt-1">Complete your onboarding to launch your first campaign</p>
      </div>

      {/* Progress tracker */}
      <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Onboarding Progress</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          {steps.map((step, i) => (
            <button key={step.key} onClick={() => setCurrentStep(i)}
              className={cn(
                "flex items-center gap-3 flex-1 p-3 rounded-lg border transition-colors text-left",
                currentStep === i ? "border-accent bg-accent/5" : "border-border/30 hover:border-accent/30",
              )}>
              {stepStatuses[i]
                ? <CheckCircle2 size={20} className="text-accent shrink-0" />
                : <Circle size={20} className="text-muted-foreground shrink-0" />}
              <p className={cn("text-sm font-medium", stepStatuses[i] ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <motion.div key={`${accountType}-${currentStep}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        {/* STEP 0: Profile + Account Type */}
        {currentStep === 0 && (
          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card space-y-4">
            <h3 className="font-display font-semibold text-foreground">
              {accountType === "agency" ? "Agency Profile" : "Business Profile"}
            </h3>
            <p className="text-sm text-muted-foreground">Help us understand your organisation so we can plan the best campaigns for you.</p>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">Account Type</p>
              <div className="flex gap-3">
                {([
                  { value: "business" as const, label: "Business", desc: "I manage campaigns for my own company" },
                  { value: "agency" as const, label: "Agency / Consultant", desc: "I manage campaigns for multiple clients" },
                ]).map((opt) => (
                  <button key={opt.value} onClick={() => setAccountType(opt.value)}
                    className={cn(
                      "flex-1 p-4 rounded-xl border text-left transition-all",
                      accountType === opt.value ? "border-accent bg-accent/5" : "border-border/50 hover:border-accent/30"
                    )}>
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              placeholder={accountType === "agency" ? "Describe your agency — services, specialties, client types..." : "Describe your business — what you do, who you serve..."}
              rows={3} value={form.business_description}
              onChange={(e) => setForm({ ...form, business_description: e.target.value })}
            />
            <Button variant="cta" onClick={() => setCurrentStep(1)} className="gap-1.5">Continue <ArrowRight size={14} /></Button>
          </div>
        )}

        {/* STEP 1: Goals (business) or Agency Details (agency) */}
        {currentStep === 1 && accountType === "business" && (
          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card space-y-4">
            <h3 className="font-display font-semibold text-foreground">Marketing Goals & Targeting</h3>
            <Textarea placeholder="What are your primary marketing goals?" rows={3} value={form.marketing_goals} onChange={(e) => setForm({ ...form, marketing_goals: e.target.value })} />
            <Textarea placeholder="Describe your target audience" rows={2} value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="Target geographic regions" value={form.target_regions} onChange={(e) => setForm({ ...form, target_regions: e.target.value })} />
              <Input placeholder="Key competitors" value={form.competitors} onChange={(e) => setForm({ ...form, competitors: e.target.value })} />
            </div>
            <Input placeholder="Existing marketing channels (e.g. LinkedIn, Google Ads)" value={form.existing_channels} onChange={(e) => setForm({ ...form, existing_channels: e.target.value })} />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(0)} className="gap-1.5"><ArrowLeft size={14} /> Back</Button>
              <Button variant="cta" onClick={() => saveBusinessProfile.mutate()} disabled={saveBusinessProfile.isPending} className="gap-1.5 flex-1">
                Save & Continue <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 1 && accountType === "agency" && (
          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card space-y-4">
            <h3 className="font-display font-semibold text-foreground">Agency Details</h3>
            <p className="text-sm text-muted-foreground">Tell us about your agency so we can tailor the platform to your needs.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Agency Size</label>
                <Input placeholder="e.g. 5-10 employees" value={agencyForm.agency_size} onChange={(e) => setAgencyForm({ ...agencyForm, agency_size: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Regions Served</label>
                <Input placeholder="e.g. UK, Europe, Global" value={form.target_regions} onChange={(e) => setForm({ ...form, target_regions: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Primary Services Offered</label>
              <Textarea placeholder="e.g. SEO, Social Media Management, PR, Paid Advertising..." rows={2} value={agencyForm.services_offered} onChange={(e) => setAgencyForm({ ...agencyForm, services_offered: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Industries You Serve</label>
              <Input placeholder="e.g. Tech, Healthcare, Finance" value={agencyForm.industries_served} onChange={(e) => setAgencyForm({ ...agencyForm, industries_served: e.target.value })} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(0)} className="gap-1.5"><ArrowLeft size={14} /> Back</Button>
              <Button variant="cta" onClick={() => saveAgencyProfile.mutate()} disabled={saveAgencyProfile.isPending} className="gap-1.5 flex-1">
                Save & Continue <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Assets (business) or First Workspace (agency) */}
        {currentStep === 2 && accountType === "business" && (
          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card space-y-4">
            <h3 className="font-display font-semibold text-foreground">Upload Campaign Assets</h3>
            <p className="text-sm text-muted-foreground">Upload brand materials, contact lists, campaign briefs, or any relevant documents.</p>
            <label className="flex items-center justify-center gap-2 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors">
              <Upload size={20} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Click to upload files"}</span>
              <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            {(documents ?? []).length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Uploaded files:</p>
                {documents!.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                    <span className="text-foreground">{doc.name}</span>
                    <span className="text-xs text-muted-foreground">{doc.file_size ? `${(doc.file_size / 1024).toFixed(0)} KB` : ""}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-1.5"><ArrowLeft size={14} /> Back</Button>
              <Button variant="cta" onClick={() => setCurrentStep(3)} className="gap-1.5 flex-1">Continue <ArrowRight size={14} /></Button>
            </div>
          </div>
        )}

        {currentStep === 2 && accountType === "agency" && (
          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card space-y-4">
            <h3 className="font-display font-semibold text-foreground">Create Your First Client Workspace</h3>
            <p className="text-sm text-muted-foreground">Set up a workspace for your first client. You can add more later from the portal.</p>

            {hasWorkspace ? (
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-accent" />
                  Workspace created: {workspaces?.[0]?.name}
                </p>
              </div>
            ) : (
              <>
                <Input placeholder="Client company name *" value={wsForm.name} onChange={(e) => setWsForm({ ...wsForm, name: e.target.value })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input placeholder="Client website" value={wsForm.website} onChange={(e) => setWsForm({ ...wsForm, website: e.target.value })} />
                  <Input placeholder="Client industry" value={wsForm.industry} onChange={(e) => setWsForm({ ...wsForm, industry: e.target.value })} />
                </div>
                <Textarea placeholder="Primary campaign objective for this client" rows={2} value={wsForm.objective} onChange={(e) => setWsForm({ ...wsForm, objective: e.target.value })} />
              </>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-1.5"><ArrowLeft size={14} /> Back</Button>
              {hasWorkspace ? (
                <Button variant="cta" onClick={() => setCurrentStep(3)} className="gap-1.5 flex-1">Continue <ArrowRight size={14} /></Button>
              ) : (
                <Button variant="cta" onClick={() => createFirstWorkspace.mutate()} disabled={createFirstWorkspace.isPending || !wsForm.name.trim()} className="gap-1.5 flex-1">
                  Create Workspace <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Campaign kickoff */}
        {currentStep === 3 && (
          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card space-y-4">
            <h3 className="font-display font-semibold text-foreground">
              {accountType === "agency" ? "Request Your First Client Campaign" : "Request Your First Campaign"}
            </h3>
            <p className="text-sm text-muted-foreground">Tell us what you'd like to achieve and our team will start planning right away.</p>
            <Textarea placeholder="Campaign objective — what do you want to accomplish?" rows={4} value={campaignObjective} onChange={(e) => setCampaignObjective(e.target.value)} />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-1.5"><ArrowLeft size={14} /> Back</Button>
              <Button variant="cta" onClick={() => requestCampaign.mutate()} disabled={requestCampaign.isPending} className="gap-1.5 flex-1">
                <Rocket size={14} /> Submit Campaign Request
              </Button>
            </div>
            <Button variant="ghost" className="w-full text-sm" onClick={() => navigate("/portal")}>Skip — I'll do this later</Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PortalOnboarding;
