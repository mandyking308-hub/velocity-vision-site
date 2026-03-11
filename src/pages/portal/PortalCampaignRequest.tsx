import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientCompany } from "@/hooks/useClientCompany";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const PortalCampaignRequest = () => {
  const { companyId } = useClientCompany();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [form, setForm] = useState({
    objective: "",
    target_audience: "",
    budget_range: "",
    timeline: "",
    notes: "",
  });

  const { data: company } = useQuery({
    queryKey: ["req-company", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      const { data } = await supabase.from("companies").select("*").eq("id", companyId).single();
      return data;
    },
    enabled: !!companyId,
  });

  const isAgency = (company as any)?.account_type === "agency";

  const { data: workspaces } = useQuery({
    queryKey: ["req-workspaces", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data } = await supabase.from("client_workspaces").select("*").eq("agency_company_id", companyId);
      return data ?? [];
    },
    enabled: !!companyId && isAgency,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!companyId || !user) throw new Error("Not ready");

      // Create campaign request
      const { error: reqError } = await supabase.from("campaign_requests").insert({
        company_id: companyId,
        ...form,
        created_by: user.id,
      });
      if (reqError) throw reqError;

      // Also create a task in CRM
      const { error: taskError } = await supabase.from("tasks").insert({
        title: `Campaign Request: ${form.objective.slice(0, 50)}`,
        description: `Objective: ${form.objective}\nAudience: ${form.target_audience}\nBudget: ${form.budget_range}\nTimeline: ${form.timeline}\nNotes: ${form.notes}`,
        created_by: user.id,
        entity_type: "campaign_request",
      });
      if (taskError) throw taskError;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Campaign request submitted successfully!");
    },
    onError: () => {
      toast.error("Failed to submit request");
    },
  });

  if (submitted) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <CheckCircle size={48} className="text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Request Submitted!</h2>
          <p className="text-muted-foreground mb-6">Our team will review your campaign request and get back to you shortly.</p>
          <Button variant="cta" onClick={() => { setSubmitted(false); setForm({ objective: "", target_audience: "", budget_range: "", timeline: "", notes: "" }); }}>
            Submit Another Request
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Request a Campaign</h1>
        <p className="text-muted-foreground text-sm mt-1">Tell us about the campaign you'd like to run</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border/50 rounded-xl p-6 shadow-card space-y-5"
      >
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Campaign Objective *</label>
          <Textarea
            value={form.objective}
            onChange={(e) => setForm({ ...form, objective: e.target.value })}
            placeholder="What do you want to achieve with this campaign?"
            rows={3}
          />
        </div>

        {isAgency && (workspaces ?? []).length > 0 && (
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Client Workspace *</label>
            <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
              <SelectTrigger><SelectValue placeholder="Select client workspace" /></SelectTrigger>
              <SelectContent>
                {workspaces!.map((ws) => (
                  <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
          <label className="text-sm font-medium text-foreground mb-1.5 block">Target Audience</label>
          <Input
            value={form.target_audience}
            onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
            placeholder="Who are you trying to reach?"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Budget Range</label>
          <Select value={form.budget_range} onValueChange={(v) => setForm({ ...form, budget_range: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under_5k">Under £5,000</SelectItem>
              <SelectItem value="5k_15k">£5,000 – £15,000</SelectItem>
              <SelectItem value="15k_50k">£15,000 – £50,000</SelectItem>
              <SelectItem value="50k_plus">£50,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Timeline</label>
          <Input
            value={form.timeline}
            onChange={(e) => setForm({ ...form, timeline: e.target.value })}
            placeholder="When do you want to launch?"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Additional Notes</label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any other details or requirements?"
            rows={3}
          />
        </div>

        <Button
          variant="cta"
          className="w-full"
          disabled={!form.objective.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Submitting..." : "Submit Campaign Request"}
        </Button>
      </motion.div>
    </div>
  );
};

export default PortalCampaignRequest;
