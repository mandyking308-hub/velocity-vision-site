import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchLegalStatus, type MissingDoc } from "@/lib/legalCompliance";
import { recordLegalAcceptance, type LegalAcceptanceSource } from "@/lib/recordLegalAcceptance";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Called after the user is proven compliant (either already, or after acceptance recorded). */
  onConfirm: () => void | Promise<void>;
  source: LegalAcceptanceSource;
  workspaceId?: string | null;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

/**
 * Smart legal gate: on open, checks the user's latest acceptance row.
 * - If already compliant with current versions → calls onConfirm immediately and closes.
 * - Otherwise → shows the missing/outdated documents, requires an explicit
 *   (unticked-by-default) checkbox, records a NEW append-only acceptance
 *   row, then calls onConfirm.
 */
export default function LegalComplianceGate({
  open, onOpenChange, onConfirm, source, workspaceId,
  title = "Confirm current legal terms",
  description = "The following documents have been updated since your last acceptance. Please review and accept the current versions to continue.",
  confirmLabel = "Accept and continue",
}: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState<MissingDoc[]>([]);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [proceeded, setProceeded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    setAccepted(false);
    setProceeded(false);
    setErrorMsg(null);
    fetchLegalStatus(user.id).then(async (s) => {
      if (s.isCompliant) {
        // Already compliant → skip UI and proceed.
        setProceeded(true);
        try { await onConfirm(); } finally { onOpenChange(false); }
        return;
      }
      setMissing(s.missing);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id]);

  const handle = async () => {
    if (!accepted || !user) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      await recordLegalAcceptance({
        userId: user.id,
        email: user.email ?? null,
        source,
        workspaceId: workspaceId ?? null,
      });
      // Only proceed if the acceptance row was written.
      await onConfirm();
      onOpenChange(false);
      setAccepted(false);
    } catch (err: any) {
      // Fail-closed: keep gate open, untick, surface error, do not proceed.
      setAccepted(false);
      setErrorMsg(
        err?.message ??
          "We could not record your legal acceptance. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const linkCls = "text-accent underline hover:no-underline";
  const showBody = open && !proceeded && !loading;

  return (
    <Dialog open={open && !proceeded} onOpenChange={(v) => { if (!v) setAccepted(false); onOpenChange(v); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Checking your acceptance record…</p>
        ) : showBody ? (
          <>
            <div className="rounded-md border border-border max-h-64 overflow-auto divide-y divide-border">
              {missing.map((d) => (
                <div key={d.slug} className="p-3 flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <Link
                      to={`/legal/${d.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      {d.title}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Current v{d.currentVersion}
                      {d.acceptedVersion
                        ? <> · you accepted v{d.acceptedVersion}</>
                        : <> · not yet accepted</>}
                    </div>
                  </div>
                  <span className="text-xs text-amber-600 whitespace-nowrap">
                    {d.acceptedVersion ? "Update required" : "Missing"}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="legal-compliance-accept"
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v === true)}
                className="mt-1"
              />
              <label htmlFor="legal-compliance-accept" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                I have reviewed and agree to the current versions of the documents listed above, including all
                incorporated policies. I confirm I have authority to bind the organisation or workspace
                I am creating or acting for.
              </label>
            </div>

            <p className="text-[11px] text-muted-foreground/80">
              Your acceptance is recorded with a timestamp against your account. Previous acceptance records are kept
              (they are never overwritten).
            </p>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
              <Button onClick={handle} disabled={!accepted || busy}>
                {busy ? "Recording…" : (
                  <><CheckCircle2 className="h-4 w-4 mr-1" /> {confirmLabel}</>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
