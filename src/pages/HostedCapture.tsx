import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

interface PublicCampaign {
  id: string;
  name: string;
  slug: string;
  headline: string;
  subheadline: string;
  formTitle: string;
  fields: Array<{ id: string; label: string; type: string; required?: boolean }>;
  ctaLabel: string;
  thankYou: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const CaptureNoIndex = () => (
  <Helmet>
    <meta name="robots" content="noindex,nofollow" />
  </Helmet>
);

export default function HostedCapture() {
  const { slug } = useParams();
  const [campaign, setCampaign] = useState<PublicCampaign | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/public-campaign?slug=${encodeURIComponent(slug)}`, {
          headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
        });
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        setCampaign(data);
      } catch {
        setNotFound(true);
      }
    })();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/lead-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
        body: JSON.stringify({
          slug: campaign.slug,
          name: values.name || values.full_name || "",
          email: values.email || "",
          phone: values.phone || "",
          message: values.message || values.notes || values.interest || "",
          extra: values,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
      toast.error("We couldn't submit your details", { description: "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <>
        <CaptureNoIndex />
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">Page not found</h1>
            <p className="text-muted-foreground">This campaign isn't live or the link is incorrect.</p>
          </div>
        </div>
      </>
    );
  }

  if (!campaign) {
    return (
      <>
        <CaptureNoIndex />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title={`${campaign.name} — Velocity Vision`} description={campaign.subheadline || campaign.headline} path={`/c/${campaign.slug}`} />
      <CaptureNoIndex />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <header className="border-b border-border bg-background/80 backdrop-blur">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-bold">Velocity <span className="text-accent">Vision</span></a>
            <span className="text-xs text-muted-foreground">Powered by Velocity Vision</span>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{campaign.headline}</h1>
            {campaign.subheadline && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{campaign.subheadline}</p>}
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{submitted ? "Thank you" : campaign.formTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-accent/15 text-accent mx-auto flex items-center justify-center text-2xl mb-3">✓</div>
                  <p className="text-foreground font-medium mb-1">{campaign.thankYou}</p>
                  <p className="text-sm text-muted-foreground">You can close this page.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {campaign.fields.map((f) => (
                    <div key={f.id} className="space-y-1.5">
                      <Label htmlFor={f.id}>
                        {f.label}{f.required && <span className="text-destructive"> *</span>}
                      </Label>
                      {f.type === "textarea" ? (
                        <Textarea
                          id={f.id}
                          required={f.required}
                          value={values[f.id] || ""}
                          onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
                          maxLength={2000}
                        />
                      ) : (
                        <Input
                          id={f.id}
                          type={f.type === "email" ? "email" : f.type === "phone" ? "tel" : "text"}
                          required={f.required}
                          value={values[f.id] || ""}
                          onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
                          maxLength={255}
                        />
                      )}
                    </div>
                  ))}
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {submitting ? "Submitting…" : campaign.ctaLabel}
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground">
                    By submitting, you agree to be contacted about this campaign. See the{" "}
                    <a href="/legal/privacy-policy" className="underline underline-offset-2 hover:text-foreground">
                      Privacy Policy
                    </a>
                    .
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </main>

        <footer className="text-center text-xs text-muted-foreground py-6">
          © Velocity Vision · <a href="/legal" className="underline">Legal</a>
        </footer>
      </div>
    </>
  );
}
