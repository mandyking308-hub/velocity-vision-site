import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowLeft, Building2 } from "lucide-react";

export default function PlatformTermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Platform Terms of Service — Velocity Vision"
        description="Platform Terms of Service for Velocity Vision, operated by Global Solutions Management LLC."
        path="/legal/terms-of-service"
      />
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link to="/legal" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors mb-6">
            <ArrowLeft size={14} /> Back to Legal Centre
          </Link>
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Legal document</p>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground">Platform Terms of Service</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3">
            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/70">Effective Date:</span> 30 June 2026</p>
            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/70">Last Updated:</span> 1 July 2026</p>
            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/70">Version:</span> 5.0</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Global Solutions Management LLC, a company incorporated in the State of Delaware, United States.</p>
          <p className="text-xs text-muted-foreground mt-2 max-w-3xl italic">
            This document may be displayed in your browser&apos;s preferred language using an automated machine-translation layer. Translations are provided for convenience only. The English version controls if there is any conflict between translations.
          </p>

          <section className="mt-10 space-y-4 text-sm text-foreground/75 leading-relaxed">
            <p>
              These Platform Terms of Service govern access to and use of the Velocity Vision website, platform, software, workspaces, Data Vault, AI-assisted tools, generated outputs, templates, activation controls, billing features, integrations, dashboards, support resources and related services.
            </p>
            <p>
              The full live Platform Terms text is being loaded into this page as the version 5.0 public legal document.
            </p>
          </section>

          <div className="mt-16 pt-8 border-t border-border/50">
            <div className="flex items-start gap-3 mb-4">
              <Building2 size={18} className="text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Velocity Vision</p>
                <p className="text-xs text-muted-foreground">Operated by Global Solutions Management LLC</p>
                <p className="text-xs text-muted-foreground">Delaware, United States</p>
              </div>
            </div>
            <Link to="/contact" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-colors">
              Use the Contact page →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
