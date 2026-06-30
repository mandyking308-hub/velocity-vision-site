import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { CURRENT_LEGAL_VERSION } from "@/lib/legalVersions";

const legalLinks = [
  { label: "Platform Terms of Service", path: "/legal/terms-of-service" },
  { label: "Client Services Agreement", path: "/legal/client-services-agreement" },
  { label: "Privacy Policy", path: "/legal/privacy-policy" },
  { label: "Acceptable Use Policy", path: "/legal/acceptable-use-policy" },
  { label: "Marketing Compliance Policy", path: "/legal/marketing-compliance-policy" },
  { label: "Data Processing Agreement", path: "/legal/data-processing-agreement" },
  { label: "Cookie Policy", path: "/legal/cookie-policy" },
  { label: "Platform Security Policy", path: "/legal/platform-security-policy" },
  { label: "Service Level Agreement", path: "/legal/service-level-agreement" },
];

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Role-based redirect after login
  useEffect(() => {
    if (!user) return;
    const checkRoleAndRedirect = async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const roleList = roles?.map((r) => r.role) ?? [];

      if (roleList.includes("client")) {
        navigate("/app", { replace: true });
      } else {
        navigate("/crm", { replace: true });
      }
    };
    checkRoleAndRedirect();
  }, [user, navigate]);

  const logLegalAcceptance = async (userId: string, userEmail: string) => {
    try {
      // Fetch IP address
      let ipAddress = "unknown";
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        ipAddress = data.ip;
      } catch {
        // IP fetch failed, continue with unknown
      }

      const documentVersions: Record<string, string> = {};
      legalLinks.forEach((doc) => {
        const slug = doc.path.split("/").pop() || "";
        documentVersions[slug] = CURRENT_LEGAL_VERSION;
      });

      await supabase.from("legal_acceptances").insert({
        user_id: userId,
        email: userEmail,
        account_type: "business",
        legal_version: CURRENT_LEGAL_VERSION,
        ip_address: ipAddress,
        document_versions: documentVersions,
      });
    } catch (err) {
      console.error("Failed to log legal acceptance:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && !legalAccepted) {
      toast.error("You must accept the legal terms to create an account.");
      return;
    }

    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        toast.error(error.message);
      } else {
        if (data.user) {
          await logLegalAcceptance(data.user.id, email);
        }
        toast.success("Check your email to confirm your account.");
      }
    }
    setLoading(false);
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
            {isLogin ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        <div className="bg-card rounded-xl p-8 shadow-elevated border border-border/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required={!isLogin}
                />
                <Input
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            {/* Legal acceptance checkbox — signup only */}
            {!isLogin && (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="legal-accept"
                    checked={legalAccepted}
                    onCheckedChange={(checked) => setLegalAccepted(checked === true)}
                    className="mt-1"
                  />
                  <label htmlFor="legal-accept" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    I confirm that I have read and agree to the{" "}
                    <Link to="/legal/terms-of-service" target="_blank" className="text-accent hover:underline">Platform Terms of Service</Link>
                    {" "}and{" "}
                    <Link to="/legal/client-services-agreement" target="_blank" className="text-accent hover:underline">Client Services Agreement</Link>
                    , and acknowledge the{" "}
                    <Link to="/legal/privacy-policy" target="_blank" className="text-accent hover:underline">Privacy Policy</Link>
                    {" "}and other applicable{" "}
                    <Link to="/legal" target="_blank" className="text-accent hover:underline">legal policies</Link>.
                  </label>
                </div>
              </div>
            )}

            <Button type="submit" variant="cta" className="w-full" disabled={loading || (!isLogin && !legalAccepted)}>
              {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent font-medium hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
