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
          <h1 className="font-display text-3xl font-bold text-primary-foreground">
            Velocity<span className="text-accent">.</span>
          </h1>
          <p className="text-primary-foreground/60 mt-2 text-sm">
            Demo Environment
          </p>
        </div>

        <div className="bg-card rounded-xl p-8 shadow-elevated border border-border/50 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Eye size={28} className="text-accent" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Explore the Platform</h2>
            <p className="text-sm text-muted-foreground">
              Experience the Velocity Influence platform with preloaded sample campaigns, CRM data, and analytics dashboards.
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Demo includes:</p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                300 sample CRM contacts with full pipeline
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                3 live campaign examples with real metrics
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                Agency workspace with 3 client accounts
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                Analytics dashboards and performance charts
              </li>
            </ul>
          </div>

          <Button variant="cta" className="w-full" onClick={handleEnterDemo}>
            <Play size={16} /> Enter Demo Environment
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            This is a read-only demo. No real data will be affected.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default DemoLogin;
