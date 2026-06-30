import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="max-w-7xl mx-auto section-padding">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
        <div className="lg:col-span-2">
          <h3 className="text-2xl font-display font-bold mb-4">Velocity<span className="text-accent">.</span></h3>
          <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
            A commercial workspace for safe outreach and pipeline — for founders, lean teams, and agencies. Self-serve, governed, and built for international use.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/75">Product</h4>
          <div className="flex flex-col gap-2">
            {[
              { label: "How it works", path: "/how-it-works" },
              { label: "Features", path: "/features" },
              { label: "Use cases", path: "/work" },
              { label: "For businesses", path: "/for-businesses" },
              { label: "For agencies", path: "/for-agencies" },
              { label: "Pricing", path: "/pricing" },
            ].map((l) => (
              <Link key={l.path} to={l.path} className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/75">Company</h4>
          <div className="flex flex-col gap-2">
            {[
              { label: "About", path: "/about" },
              { label: "Playbooks", path: "/insights" },
              { label: "Templates", path: "/templates" },
              { label: "Help", path: "/help" },
              { label: "Contact", path: "/contact" },
            ].map((l) => (
              <Link key={l.path} to={l.path} className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/75">Legal & Support</h4>
          <div className="flex flex-col gap-2">
            <Link to="/legal" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">Legal Centre</Link>
            <Link to="/legal/terms-of-service" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">Terms of Service</Link>
            <Link to="/legal/privacy-policy" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">Privacy Policy</Link>
            <Link to="/legal/platform-security-policy" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">Security</Link>
            <Link to="/legal/cookie-policy" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">Cookie Policy</Link>
          </div>
          <div className="mt-6">
            <p className="text-sm text-primary-foreground/70 mb-2">support@velocity-outreach.com</p>
            <Link to="/auth" className="text-sm font-semibold text-accent hover:text-accent-warm transition-colors">
              Open your workspace →
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-primary-foreground/70">© 2026 Global Solutions Management LLC — operator of the Velocity Vision platform. Delaware, United States.</p>
        <div className="flex gap-6">
          <Link to="/legal/privacy-policy" className="text-xs text-primary-foreground/70 hover:text-accent transition-colors">Privacy</Link>
          <Link to="/legal/terms-of-service" className="text-xs text-primary-foreground/70 hover:text-accent transition-colors">Terms</Link>
          <Link to="/legal/cookie-policy" className="text-xs text-primary-foreground/70 hover:text-accent transition-colors">Cookies</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
