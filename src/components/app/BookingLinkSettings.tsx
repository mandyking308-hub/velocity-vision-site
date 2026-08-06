import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useDemo } from "@/contexts/DemoContext";
import { validateBookingUrl, BOOKING_URL_MAX } from "@/lib/bookingUrl";

/**
 * Workspace booking link. Used when replying to an interested contact so the
 * operator can offer a time — it is never inserted into an email automatically.
 */
export default function BookingLinkSettings() {
  const { currentId } = useWorkspace();
  const { guardAction } = useDemo();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!currentId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("client_workspaces")
        .select("booking_url")
        .eq("id", currentId)
        .maybeSingle();
      if (!cancelled) {
        setValue(((data as any)?.booking_url as string) || "");
        setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [currentId]);

  const save = async () => {
    if (!guardAction("Save booking link")) return;
    if (!currentId) {
      toast.error("Open a workspace first");
      return;
    }
    const trimmed = value.trim();
    let next: string | null = null;
    if (trimmed) {
      const res = validateBookingUrl(trimmed);
      if (!res.valid) {
        setError(res.error);
        return;
      }
      next = res.url;
    }
    setError(null);
    setBusy(true);
    try {
      const { error: err } = await supabase
        .from("client_workspaces")
        .update({ booking_url: next } as any)
        .eq("id", currentId);
      if (err) throw err;
      setValue(next || "");
      toast.success(next ? "Booking link saved" : "Booking link removed");
    } catch (e: any) {
      toast.error(e?.message || "Could not save the booking link");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card id="booking-link" className="scroll-mt-24">
      <CardHeader>
        <CalendarCheck className="h-6 w-6 text-primary mb-2" />
        <CardTitle className="text-lg">Booking link</CardTitle>
        <CardDescription>
          Your calendar or booking page for this workspace. Offered when you reply to an interested
          contact — never added to an email without you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="booking-url" className="text-xs">Booking URL (https only)</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="booking-url"
            placeholder="https://cal.com/your-name/30min"
            value={value}
            maxLength={BOOKING_URL_MAX}
            disabled={loading}
            onChange={(e) => { setValue(e.target.value); setError(null); }}
          />
          <Button onClick={save} disabled={busy || loading} className="sm:w-auto">
            {busy && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Save
          </Button>
        </div>
        {error && <p className="text-xs text-destructive" data-testid="booking-url-error">{error}</p>}
        {!currentId && <p className="text-xs text-muted-foreground">Open a workspace to set a booking link.</p>}
      </CardContent>
    </Card>
  );
}
