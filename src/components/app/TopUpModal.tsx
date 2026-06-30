import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TOPUP_PACKS } from "@/lib/credits";
import { useCredits } from "@/contexts/CreditsContext";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export default function TopUpModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { buyTopup } = useCredits();
  const [busy, setBusy] = useState<string | null>(null);
  const handle = async (id: typeof TOPUP_PACKS[number]["id"]) => {
    setBusy(id);
    await buyTopup(id);
    setBusy(null);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Top up Campaign Credits</DialogTitle>
          <DialogDescription>Pick a pack — credits are added instantly so you can keep launching.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          {TOPUP_PACKS.map((p) => (
            <div key={p.id} className="rounded-lg border border-border p-4 flex flex-col">
              <div className="flex items-center gap-2 text-sm font-medium"><Sparkles className="h-4 w-4 text-accent" />{p.label}</div>
              <div className="text-3xl font-bold mt-2">{p.credits}<span className="text-sm font-normal text-muted-foreground"> credits</span></div>
              <div className="text-sm text-muted-foreground mt-1">£{p.price}</div>
              <p className="text-xs text-muted-foreground mt-2 flex-1">{p.blurb}</p>
              <Button className="mt-3" size="sm" disabled={busy === p.id} onClick={() => handle(p.id)}>
                {busy === p.id ? "Adding…" : "Buy pack"}
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Top-ups never expire while your plan is active. Pricing shown is provisional and will be confirmed at checkout once payments are connected.</p>
      </DialogContent>
    </Dialog>
  );
}
