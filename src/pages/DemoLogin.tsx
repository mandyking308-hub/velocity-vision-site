import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { Play, Eye } from "lucide-react";

const DemoLogin = () => {
  const navigate = useNavigate();
  const { enterDemoMode } = useDemo();

  const handleEnterDemo = () => {
    enterDemoMode();
    navigate("/demo/crm", { replace: true });
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1
            className="font-display text-3xl font-bold text-primary-foreground notranslate"
            translate="no"
          >
            Velocity<span className="text-accent"> Vision</span>
          </h1>
          <p className="text-primary-foreground/60 mt-2 text-sm">
            Illustrative Demo Environment
          </p>
        </div>

        <div className="bg-card rounded-xl p-8 shadow-elevated border border-border/50 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Eye size={28} className="text-accent" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Review an illustrative product workflow
            </h2>
            <p className="text-sm text-muted-foreground">
              The demo shows example screens for Data Vault review, editable drafts, activation controls, follow-up records and early opportunity administration.
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              The demonstration includes:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                Illustrative Data Vault and record-review screens
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                Illustrative sender and activation-control screens
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                Example editable draft and cadence screens
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                Example follow-up and early opportunity records
              </li>
            </ul>
          </div>

          <Button variant="cta" className="w-full" onClick={handleEnterDemo}>
            <Play size={16} /> Enter Demo Environment
          </Button>

          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            This is a read-only demonstration using illustrative data. It does not send messages, activate campaigns, modify customer data or represent customer results.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default DemoLogin;
