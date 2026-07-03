// Dashboard status card for Free Preview users only.
// Non-intrusive: shows days left, credits, contacts (of 25), packs (of 1), CTAs.
// Also raises expiry nudges: subtle banner at 7d, stronger at 3d, modal at 1d.
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCredits } from "@/contexts/CreditsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { FREE_LIMITS } from "@/lib/credits";
import UpgradeNudge from "./UpgradeNudge";

export default function FreePreviewStatusCard() {
  const { isFreePreview, freePreviewExpired, freePreviewDaysLeft, remaining, topupBalance } = useCredits();
  const { user } = useAuth();
  const { currentId } = useWorkspace();
  const [contactCount, setContactCount] = useState(0);
  const [packCount, setPackCount] = useState(0);
  const [oneDayModalOpen, setOneDayModalOpen] = useState(true);

  useEffect(() => {
    if (!isFreePreview || !user) return;
    let alive = true;
    (async () => {
      const wsFilter = currentId ? `.eq("workspace_id", currentId)` : "";
      // Contacts owned by this user's workspace (or created_by if no workspace scoping)
      const cq = supabase.from("contacts").select("id", { count: "exact", head: true }).eq("created_by", user.id);
      const pq = supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("created_by", user.id).not("pack", "is", null);
      if (currentId) { cq.eq("workspace_id", currentId); pq.eq("workspace_id", currentId); }
      const [{ count: cCount }, { count: pCount }] = await Promise.all([cq, pq]);
      if (!alive) return;
      setContactCount(cCount ?? 0);
      setPackCount(pCount ?? 0);
      void wsFilter;
    })();
    return () => { alive = false; };
  }, [isFreePreview, user, currentId]);

  if (!isFreePreview) return null;

  if (freePreviewExpired) {
    return <UpgradeNudge reason="free_preview_expired" variant="card" />;
  }

  const days = freePreviewDaysLeft ?? 0;
  const contactPct = Math.min(100, (contactCount / FREE_LIMITS.maxContacts) * 100);
  const packPct = Math.min(100, (packCount / FREE_LIMITS.maxCampaignPacks) * 100);

  return (
    <>
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-semibold">Free Preview</div>
                <div className="text-xs text-muted-foreground">
                  {days} day{days === 1 ? "" : "s"} left · {remaining} credits{topupBalance > 0 ? ` (${topupBalance} paid)` : ""}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex justify-between mb-1"><span className="text-muted-foreground">Contacts</span><span>{contactCount} / {FREE_LIMITS.maxContacts}</span></div>
              <Progress value={contactPct} />
            </div>
            <div>
              <div className="flex justify-between mb-1"><span className="text-muted-foreground">Campaign packs</span><span>{packCount} / {FREE_LIMITS.maxCampaignPacks}</span></div>
              <Progress value={packPct} />
            </div>
          </div>
          <UpgradeNudge reason="upgrade_for_growth" variant="inline" className="mt-1" />
        </CardContent>
      </Card>

      {/* Expiry escalation — subtle at 7d, stronger at 3d, modal at 1d */}
      {days > 3 && days <= 7 && <UpgradeNudge reason="free_preview_expiring" variant="inline" />}
      {days > 1 && days <= 3 && <UpgradeNudge reason="free_preview_expiring" variant="banner" />}
      {days <= 1 && (
        <UpgradeNudge reason="free_preview_expiring" variant="modal" open={oneDayModalOpen} onOpenChange={setOneDayModalOpen} />
      )}
    </>
  );
}
