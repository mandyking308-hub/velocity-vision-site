import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="max-w-7xl mx-auto section-padding">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div>
          <h3 className="text-2xl font-display font-bold mb-4">Velocity<span className="text-accent">.</span></h3>
          <p className="text-primary-foreground/70 text-sm leading-relaxed">
            A global marketing and PR agency driving growth through data, creativity, and influence.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/75">Services</h4>
          <div className="flex flex-col gap-2">
            {["Marketing Strategy", "PR & Media", "Social Media", "Paid Advertising", "Brand & Creative", "Marketing Intelligence"].map((s) => (
              <Link key={s} to="/services" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">{s}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/75">Company</h4>
          <div className="flex flex-col gap-2">
            {[{ label: "About", path: "/about" }, { label: "Work", path: "/work" }, { label: "Insights", path: "/insights" }, { label: "Contact", path: "/contact" }].map((l) => (
              <Link key={l.path} to={l.path} className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/75">Legal</h4>
          <div className="flex flex-col gap-2">
            <Link to="/legal" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">Legal Centre</Link>
            <Link to="/legal/terms-of-service" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">Terms of Service</Link>
            <Link to="/legal/privacy-policy" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">Privacy Policy</Link>
            <Link to="/legal/cookie-policy" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">Cookie Policy</Link>
          </div>
          <div className="mt-6">
            <h4 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider text-primary-foreground/75">Get in Touch</h4>
            <p className="text-sm text-primary-foreground/70 mb-2">hello@velocityinfluence.com</p>
            <p className="text-sm text-primary-foreground/70 mb-4">London · New York · Dubai · Singapore</p>
            <Link to="/book-demo" className="text-sm font-semibold text-accent hover:text-accent-warm transition-colors">
              Book a Demo →
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-primary-foreground/70">© 2026 Global Solutions Management LLC, trading as Velocity Influence Agency.</p>
        <div className="flex gap-6">
          <Link to="/legal/privacy-policy" className="text-xs text-primary-foreground/70 hover:text-accent transition-colors">Privacy Policy</Link>
          <Link to="/legal/terms-of-service" className="text-xs text-primary-foreground/70 hover:text-accent transition-colors">Terms of Service</Link>
          <Link to="/legal/cookie-policy" className="text-xs text-primary-foreground/70 hover:text-accent transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
