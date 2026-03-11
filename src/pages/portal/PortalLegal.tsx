import { Link } from "react-router-dom";
import { FileText, Shield, ExternalLink, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LEGAL_VERSIONS } from "@/lib/legalVersions";
import { format } from "date-fns";

const legalDocs = [
  { title: "Platform Terms of Service", slug: "terms-of-service", path: "/legal/terms-of-service", description: "Defines the core rules governing use of the platform." },
  { title: "Client Services Agreement", slug: "client-services-agreement", path: "/legal/client-services-agreement", description: "Defines the contractual relationship with paying customers." },
  { title: "Data Processing Agreement", slug: "data-processing-agreement", path: "/legal/data-processing-agreement", description: "How personal data is processed and protected." },
  { title: "Privacy Policy", slug: "privacy-policy", path: "/legal/privacy-policy", description: "How personal information is collected, used, and stored." },
  { title: "Acceptable Use Policy", slug: "acceptable-use-policy", path: "/legal/acceptable-use-policy", description: "Permitted and prohibited uses of the platform." },
  { title: "Marketing Compliance Policy", slug: "marketing-compliance-policy", path: "/legal/marketing-compliance-policy", description: "Responsibilities for lawful marketing campaigns." },
  { title: "Cookie Policy", slug: "cookie-policy", path: "/legal/cookie-policy", description: "How cookies and tracking technologies are used." },
  { title: "Platform Security Policy", slug: "platform-security-policy", path: "/legal/platform-security-policy", description: "Measures to protect customer data and platform integrity." },
  { title: "Service Level Agreement", slug: "service-level-agreement", path: "/legal/service-level-agreement", description: "Platform availability and support response standards." },
];

const PortalLegal = () => {
  const { user } = useAuth();

  const { data: acceptance } = useQuery({
    queryKey: ["legal-acceptance", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("legal_acceptances")
        .select("*")
        .eq("user_id", user.id)
        .order("accepted_at", { ascending: false })
        .limit(1);
      return data?.[0] ?? null;
    },
    enabled: !!user,
  });

  const acceptedVersions = (acceptance?.document_versions as Record<string, string> | null) ?? {};

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Shield size={24} className="text-accent" /> Legal Documents
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Access all legal policies and agreements that govern platform use.
        </p>
      </div>

      {/* Acceptance summary */}
      {acceptance && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/5 border border-accent/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Legal Terms Accepted</h3>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              Accepted: {format(new Date(acceptance.accepted_at), "d MMM yyyy, HH:mm")}
            </span>
            <span>Version: {acceptance.legal_version ?? "1.0"}</span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {legalDocs.map((doc, i) => {
          const currentVersion = LEGAL_VERSIONS[doc.slug]?.version ?? "1.0";
          const acceptedVersion = acceptedVersions[doc.slug];
          const isAccepted = acceptedVersion === currentVersion;

          return (
            <motion.div key={doc.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link
                to={doc.path}
                target="_blank"
                className="group flex items-start gap-3 p-4 bg-card border border-border/50 rounded-xl shadow-card hover:border-accent/30 hover:shadow-elevated transition-all"
              >
                <FileText size={18} className="text-accent shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">{doc.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-muted-foreground/60">v{currentVersion}</span>
                    {isAccepted && (
                      <span className="text-[10px] text-accent flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> Accepted
                      </span>
                    )}
                  </div>
                </div>
                <ExternalLink size={14} className="text-muted-foreground/40 shrink-0 mt-0.5" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PortalLegal;
