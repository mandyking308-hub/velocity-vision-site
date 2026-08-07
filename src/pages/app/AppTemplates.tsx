import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Megaphone, Mail, Tag, RefreshCw, Newspaper, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TEMPLATES = [
  { id: "lead_gen", title: "Lead generation", desc: "A structured starting point for B2B lead-generation outreach.", icon: Rocket },
  { id: "launch", title: "Offer launch", desc: "Organise a product or service launch around a clear brief and reviewable assets.", icon: Megaphone },
  { id: "nurture", title: "Nurture", desc: "Prepare a multi-email sequence for an existing authorised audience.", icon: Mail },
  { id: "promo", title: "Promotion", desc: "Prepare time-limited offer drafts with clear customer-controlled calls to action.", icon: Tag },
  { id: "re_engagement", title: "Re-engagement", desc: "Prepare a fresh angle for dormant business contacts you are authorised to contact.", icon: RefreshCw },
  { id: "pr_push", title: "PR announcement", desc: "Prepare a clear announcement or PR angle and editable release draft.", icon: Newspaper },
];

export default function AppTemplates() {
  const navigate = useNavigate();
  const [past, setPast] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("campaigns").select("id, name, campaign_kind, goal, created_at").order("created_at", { ascending: false }).limit(20);
      setPast(data || []);
    })();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">Templates</h1>
        <p className="text-muted-foreground">Start from a structured template or use a past campaign's type and goal as a starting point. Content is never copied or sent automatically.</p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-3">Starter templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((t) => (
            <Card key={t.id} className="cursor-pointer hover:shadow-md transition" onClick={() => navigate(`/app/campaigns/new?kind=${t.id}`)}>
              <CardHeader>
                <t.icon className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">{t.title}</CardTitle>
                <CardDescription>{t.desc}</CardDescription>
              </CardHeader>
              <CardContent><Button variant="outline" size="sm">Use as a starting point</Button></CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Start from a past campaign</h2>
        {past.length === 0 ? (
          <p className="text-muted-foreground text-sm">Past campaigns will appear here as optional starting points once you have created them.</p>
        ) : (
          <div className="space-y-2">
            {past.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-3 flex justify-between items-center gap-3">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.campaign_kind?.replace("_", " ") || "—"} · {new Date(p.created_at).toLocaleDateString()}</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/app/campaigns/new?goal=${encodeURIComponent(p.goal || "")}&kind=${encodeURIComponent(p.campaign_kind || "")}`)}>
                    <Copy className="h-3 w-3 mr-1" /> Start similar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-3">“Start similar” prefills the campaign type and goal only. Review every field and generated draft before use.</p>
      </section>
    </div>
  );
}
