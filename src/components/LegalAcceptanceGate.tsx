import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LegalAcceptanceCheckbox from "@/components/LegalAcceptanceCheckbox";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}

/**
 * Modal that forces the user to actively accept the legal stack
 * before continuing to checkout / activation. Checkbox unticked by
 * default; the confirm button is disabled until ticked.
 */
const LegalAcceptanceGate = ({
  open,
  onOpenChange,
  title = "Confirm before continuing",
  description = "Please confirm you accept the platform's legal terms before we send you to checkout.",
  confirmLabel = "Continue to checkout",
  onConfirm,
}: Props) => {
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    if (!accepted) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setAccepted(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setAccepted(false);
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <LegalAcceptanceCheckbox checked={accepted} onCheckedChange={setAccepted} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={handle} disabled={!accepted || busy}>
            {busy ? "Please wait…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LegalAcceptanceGate;
