import { X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";

const DemoBanner = () => {
  const { isDemoMode, exitDemoMode } = useDemo();

  if (!isDemoMode) return null;

  return (
    <div className="bg-accent text-accent-foreground px-4 py-2.5 flex items-center justify-between gap-4 text-sm z-50 sticky top-0">
      <p className="flex-1 text-center font-semibold">
        DEMO — not your live customer data. This mirrors the real Velocity workspace at <span className="font-bold">/app</span>.
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="outline" className="h-7 text-xs bg-white/20 border-white/30 text-accent-foreground hover:bg-white/30" asChild>
          <Link to="/auth">
            Open the real app <ArrowRight size={12} />
          </Link>
        </Button>
        <button
          onClick={exitDemoMode}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          title="Exit demo"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default DemoBanner;
