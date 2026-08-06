import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "vv_cookie_consent_v1";

type Prefs = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  decidedAt: string;
};

const readPrefs = (): Prefs | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Prefs) : null;
  } catch {
    return null;
  }
};

const writePrefs = (prefs: Prefs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent("vv:cookie-consent", { detail: prefs }));
  } catch {
    /* ignore */
  }
};

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [manage, setManage] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [preferences, setPreferences] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = readPrefs();
    if (!existing) {
      setVisible(true);
    } else {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
      setPreferences(existing.preferences);
    }
    const openHandler = () => {
      const p = readPrefs();
      if (p) {
        setAnalytics(p.analytics);
        setMarketing(p.marketing);
        setPreferences(p.preferences);
      }
      setManage(true);
      setVisible(true);
    };
    window.addEventListener("vv:open-cookie-preferences", openHandler);
    return () => window.removeEventListener("vv:open-cookie-preferences", openHandler);
  }, []);

  const save = (prefs: Omit<Prefs, "decidedAt" | "essential">) => {
    writePrefs({
      essential: true,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      preferences: prefs.preferences,
      decidedAt: new Date().toISOString(),
    });
    setVisible(false);
    setManage(false);
  };

  // Publish banner visibility so page content can reserve safe bottom space
  // instead of being covered. Purely presentational — consent state unchanged.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (visible) root.setAttribute("data-cookie-banner", "visible");
    else root.removeAttribute("data-cookie-banner");
    return () => root.removeAttribute("data-cookie-banner");
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4"
    >
      <div className="mx-auto max-w-3xl rounded-xl border border-border/60 bg-card/95 backdrop-blur shadow-elevated p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0 w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            <Cookie size={18} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-foreground">Cookies on Velocity Vision</p>
            <p className="text-sm text-muted-foreground mt-1">
              We use essential cookies to run the site. With your consent we may also use analytics, preference and marketing cookies. See our{" "}
              <Link to="/legal/cookie-policy" className="text-accent underline">Cookie Policy</Link>. You can update your choices at any time.
            </p>

            {manage && (
              <div className="mt-4 space-y-2 text-sm">
                <label className="flex items-start gap-3 p-2 rounded-md bg-muted/40 border border-border/40">
                  <input type="checkbox" checked disabled className="mt-1" />
                  <div>
                    <span className="font-medium text-foreground">Essential</span>
                    <span className="block text-muted-foreground">Required for the site to function. Always on.</span>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-2 rounded-md border border-border/40">
                  <input type="checkbox" className="mt-1" checked={preferences} onChange={(e) => setPreferences(e.target.checked)} />
                  <div>
                    <span className="font-medium text-foreground">Preferences</span>
                    <span className="block text-muted-foreground">Remember choices like language and workspace preferences.</span>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-2 rounded-md border border-border/40">
                  <input type="checkbox" className="mt-1" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
                  <div>
                    <span className="font-medium text-foreground">Analytics</span>
                    <span className="block text-muted-foreground">Aggregate product usage and performance measurement.</span>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-2 rounded-md border border-border/40">
                  <input type="checkbox" className="mt-1" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
                  <div>
                    <span className="font-medium text-foreground">Marketing</span>
                    <span className="block text-muted-foreground">Measure the effectiveness of our own marketing. Off by default.</span>
                  </div>
                </label>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="cta"
                onClick={() =>
                  manage
                    ? save({ analytics, marketing, preferences })
                    : save({ analytics: true, marketing: true, preferences: true })
                }
              >
                {manage ? "Save preferences" : "Accept all"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => save({ analytics: false, marketing: false, preferences: false })}
              >
                Reject non-essential
              </Button>
              {!manage && (
                <Button size="sm" variant="ghost" onClick={() => setManage(true)}>
                  Manage preferences
                </Button>
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => save({ analytics: false, marketing: false, preferences: false })}
            className="text-muted-foreground/70 hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const openCookiePreferences = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("vv:open-cookie-preferences"));
  }
};

export default CookieBanner;
