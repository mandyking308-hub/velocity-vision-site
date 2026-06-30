import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Megaphone, Mail, Tag, RefreshCw, Newspaper, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TEMPLATES = [
  { id: "lead_gen", title: "Lead generation", desc: "Capture qualified leads with a guided funnel.", icon: Rocket },
  { id: "launch", title: "Offer launch", desc: "Launch a new product or service with a 7-day plan.", icon: Megaphone },
  { id: "nurture", title: "Nurture", desc: "Warm up your existing list with a 5-email sequence.", icon: Mail },
  { id: "promo", title: "Promo", desc: "Time-limited offer with strong CTAs across channels.", icon: Tag },
  { id: "re_engagement", title: "Re-engagement", desc: "Win back dormant contacts with a fresh hook.", icon: RefreshCw },
  { id: "pr_push", title: "PR push", desc: "Generate press coverage with a launch release.", icon: Newspaper },
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
        <p className="text-muted-foreground">Start faster from a proven structure or clone a winner.</p>
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
              <CardContent><Button variant="outline" size="sm">Use this template</Button></CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Clone from past campaigns</h2>
        {past.length === 0 ? (
          <p className="text-muted-foreground text-sm">Your previous campaigns will appear here as clone-ready templates.</p>
        ) : (
          <div className="space-y-2">
            {past.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.campaign_kind?.replace("_", " ") || "—"} · {new Date(p.created_at).toLocaleDateString()}</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/app/campaigns/new?goal=${p.goal || ""}&kind=${p.campaign_kind || ""}`)}>
                    <Copy className="h-3 w-3 mr-1" /> Clone
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
