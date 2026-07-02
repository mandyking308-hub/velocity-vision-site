import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LegalAcceptanceCheckbox from "@/components/LegalAcceptanceCheckbox";
import { recordLegalAcceptance } from "@/lib/recordLegalAcceptance";

const _legalLinks = [
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

  // Role-based redirect after login. Default: customers land in /app.
  // Only internal staff (founder/admin/sales/marketing) land in /crm.
  useEffect(() => {
    if (!user) return;
    const checkRoleAndRedirect = async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const roleList = (roles?.map((r) => r.role) ?? []) as string[];
      const internalRoles = ["founder", "admin", "sales", "marketing"];
      const isInternal = roleList.some((r) => internalRoles.includes(r));
      navigate(isInternal ? "/crm" : "/app", { replace: true });
    };
    checkRoleAndRedirect();
  }, [user, navigate]);

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
          await recordLegalAcceptance({
            userId: data.user.id,
            email,
            source: "signup",
          });
        }
        toast.success("Check your email to confirm your account.");
      }
    }
    setLoading(false);
  };

  return (
    <>
    <Helmet>
      <title>Sign in or start your Velocity Vision workspace</title>
      <meta name="description" content="Sign in to your Velocity Vision workspace or create a new account to start planning, generating and safely activating campaigns." />
      <meta name="robots" content="noindex,nofollow" />
    </Helmet>
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

            {/* Legal acceptance — mandatory on signup, unticked by default */}
            {!isLogin && (
              <LegalAcceptanceCheckbox
                checked={legalAccepted}
                onCheckedChange={setLegalAccepted}
              />
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
    </>
  );
};

export default AuthPage;
