import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientCompany } from "@/hooks/useClientCompany";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, Circle, Building2, Target, Upload, Rocket, ArrowRight, ArrowLeft
} from "lucide-react";

const steps = [
  { key: "profile", label: "Business Profile", icon: Building2 },
  { key: "goals", label: "Marketing Goals", icon: Target },
  { key: "assets", label: "Upload Assets", icon: Upload },
  { key: "launch", label: "Campaign Kickoff", icon: Rocket },
];

const PortalOnboarding = () => {
  const { companyId } = useClientCompany();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    business_description: "", marketing_goals: "", target_audience: "",
    target_regions: "", competitors: "", existing_channels: "",
  });
  const [campaignObjective, setCampaignObjective] = useState("");
  const [uploading, setUploading] = useState(false);

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

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error("No company");
      if (onboarding) {
        const { error } = await supabase.from("client_onboarding" as any).update({
          ...form, completed: true, completed_at: new Date().toISOString(),
        } as any).eq("company_id", companyId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("client_onboarding" as any).insert({
          company_id: companyId, ...form, completed: true, completed_at: new Date().toISOString(),
        } as any);
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
        company_id: companyId, objective: campaignObjective || "First campaign setup",
        created_by: user?.id, status: "pending" as const,
      });
      if (error) throw error;
      // Create internal tasks
      const taskTitles = [
        "Account manager assignment", "Campaign planning", "Creative preparation",
        "Audience research", "Brand review",
      ];
      for (const title of taskTitles) {
        await supabase.from("tasks").insert({
          title: `${title} — New client`, description: `Auto-created for onboarding`,
          entity_type: "onboarding", entity_id: companyId, created_by: user?.id,
        });
      }
    },
    onSuccess: () => {
      toast.success("Campaign request submitted! Our team is on it.");
      setCurrentStep(3);
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Determine progress
  const profileDone = onboarding?.completed === true;
  const hasAssets = (documents?.length ?? 0) > 0;
  const stepStatuses = [
    true, // account created
    profileDone,
    hasAssets,
    false, // campaign launch (manual)
  ];

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading...</div>;

  // Pre-fill form from existing data
  if (onboarding && !form.business_description && onboarding.business_description) {
    setForm({
      business_description: onboarding.business_description || "",
      marketing_goals: onboarding.marketing_goals || "",
      target_audience: onboarding.target_audience || "",
      target_regions: onboarding.target_regions || "",
      competitors: onboarding.competitors || "",
      existing_channels: onboarding.existing_channels || "",
    });
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
                ? <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                : <Circle size={20} className="text-muted-foreground shrink-0" />}
              <div>
                <p className={cn("text-sm font-medium", stepStatuses[i] ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        {currentStep === 0 && (
          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card space-y-4">
            <h3 className="font-display font-semibold text-foreground">Business Profile</h3>
            <p className="text-sm text-muted-foreground">Help us understand your business so we can plan the best campaigns for you.</p>
            <Textarea placeholder="Describe your business — what you do, who you serve..." rows={3} value={form.business_description} onChange={(e) => setForm({ ...form, business_description: e.target.value })} />
            <Button variant="cta" onClick={() => setCurrentStep(1)} className="gap-1.5">Continue <ArrowRight size={14} /></Button>
          </div>
        )}

        {currentStep === 1 && (
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
              <Button variant="cta" onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending} className="gap-1.5 flex-1">
                Save & Continue <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
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

        {currentStep === 3 && (
          <div className="bg-card border border-border/50 rounded-xl p-6 shadow-card space-y-4">
            <h3 className="font-display font-semibold text-foreground">Request Your First Campaign</h3>
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
