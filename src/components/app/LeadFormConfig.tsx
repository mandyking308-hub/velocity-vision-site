import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Copy, ExternalLink, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Field { id: string; label: string; type: string; required?: boolean }
interface Config {
  headline: string; subheadline: string; formTitle: string;
  fields: Field[]; ctaLabel: string; thankYou: string;
}

interface Props {
  campaignId: string;
  slug: string | null;
  initial: Partial<Config>;
  packDefaults: Partial<Config>;
  published: boolean;
}

export default function LeadFormConfig({ campaignId, slug, initial, packDefaults, published }: Props) {
  const [cfg, setCfg] = useState<Config>({
    headline: initial.headline || packDefaults.headline || "",
    subheadline: initial.subheadline || packDefaults.subheadline || "",
    formTitle: initial.formTitle || packDefaults.formTitle || "Get started",
    fields: initial.fields || packDefaults.fields || [
      { id: "name", label: "Full name", type: "text", required: true },
      { id: "email", label: "Email", type: "email", required: true },
    ],
    ctaLabel: initial.ctaLabel || packDefaults.ctaLabel || "Submit",
    thankYou: initial.thankYou || packDefaults.thankYou || "Thanks — we'll be in touch shortly.",
  });
  const [isPublished, setIsPublished] = useState(published);
  const [saving, setSaving] = useState(false);

  const url = slug ? `${window.location.origin}/c/${slug}` : null;

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("campaigns").update({
      lead_form_config: cfg as any,
      lead_form_published: isPublished,
    }).eq("id", campaignId);
    setSaving(false);
    if (error) toast.error("Couldn't save lead form"); else toast.success("Lead form saved");
  };

  const updateField = (i: number, patch: Partial<Field>) => {
    setCfg({ ...cfg, fields: cfg.fields.map((f, idx) => idx === i ? { ...f, ...patch } : f) });
  };
  const addField = () => setCfg({ ...cfg, fields: [...cfg.fields, { id: `field_${cfg.fields.length + 1}`, label: "New field", type: "text" }] });
  const removeField = (i: number) => setCfg({ ...cfg, fields: cfg.fields.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Public URL</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {url ? (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-sm bg-muted px-2 py-1 rounded flex-1 min-w-[200px] truncate">{url}</code>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copied"); }}><Copy className="h-3 w-3 mr-1" />Copy</Button>
                <Button size="sm" variant="outline" asChild><a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 mr-1" />Open</a></Button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Switch checked={isPublished} onCheckedChange={setIsPublished} id="pub" />
                <Label htmlFor="pub">Page is live — accepting submissions</Label>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">This campaign has no slug yet — save the campaign once to generate one.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Page content</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Page headline</Label>
            <Input value={cfg.headline} onChange={(e) => setCfg({ ...cfg, headline: e.target.value })} maxLength={120} />
          </div>
          <div>
            <Label>Subheadline</Label>
            <Textarea value={cfg.subheadline} onChange={(e) => setCfg({ ...cfg, subheadline: e.target.value })} maxLength={300} />
          </div>
          <div>
            <Label>Form title</Label>
            <Input value={cfg.formTitle} onChange={(e) => setCfg({ ...cfg, formTitle: e.target.value })} maxLength={80} />
          </div>
          <div>
            <Label>CTA button label</Label>
            <Input value={cfg.ctaLabel} onChange={(e) => setCfg({ ...cfg, ctaLabel: e.target.value })} maxLength={40} />
          </div>
          <div>
            <Label>Thank-you message</Label>
            <Textarea value={cfg.thankYou} onChange={(e) => setCfg({ ...cfg, thankYou: e.target.value })} maxLength={300} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Form fields</CardTitle>
          <Button size="sm" variant="outline" onClick={addField}><Plus className="h-3 w-3 mr-1" />Add field</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {cfg.fields.map((f, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end border border-border rounded-md p-2">
              <div className="col-span-3">
                <Label className="text-xs">ID</Label>
                <Input value={f.id} onChange={(e) => updateField(i, { id: e.target.value })} />
              </div>
              <div className="col-span-4">
                <Label className="text-xs">Label</Label>
                <Input value={f.label} onChange={(e) => updateField(i, { label: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Type</Label>
                <select className="w-full h-9 border border-border rounded-md bg-background px-2 text-sm" value={f.type} onChange={(e) => updateField(i, { type: e.target.value })}>
                  <option value="text">text</option>
                  <option value="email">email</option>
                  <option value="phone">phone</option>
                  <option value="textarea">textarea</option>
                </select>
              </div>
              <div className="col-span-2 flex items-center gap-2 pt-4">
                <Switch checked={!!f.required} onCheckedChange={(v) => updateField(i, { required: v })} />
                <span className="text-xs">Required</span>
              </div>
              <div className="col-span-1 pt-4">
                <Button size="sm" variant="ghost" onClick={() => removeField(i)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save lead form"}</Button>
    </div>
  );
}
