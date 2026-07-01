import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { GTranslateSlot } from "@/components/GTranslate";


const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation("marketing");

  const navLinks = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.howItWorks"), path: "/how-it-works" },
    { label: t("nav.pricing"), path: "/pricing" },
    { label: t("nav.forBusinesses"), path: "/for-businesses" },
    { label: t("nav.forAgencies"), path: "/for-agencies" },
    { label: t("nav.features"), path: "/features" },
    { label: t("nav.templates"), path: "/templates" },
    { label: t("nav.about"), path: "/about" },
    { label: t("nav.help"), path: "/help" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-glass border-b border-border/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-foreground">
          Velocity<span className="text-accent">.</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden xl:flex items-center gap-3 flex-1 ml-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                location.pathname === link.path ? "text-accent" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Shared right-side actions: one visible translation selector only */}
        <div className="flex items-center gap-2 xl:gap-3">
          <GTranslateSlot />
          <div className="hidden xl:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/pricing">{t("nav.seePricing")}</Link>
            </Button>
            <Button variant="cta" size="sm" asChild>
              <Link to="/auth">{t("nav.startWorkspace")}</Link>
            </Button>
          </div>
          <button
            type="button"
            className="text-foreground xl:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="xl:hidden bg-card border-b border-border px-6 pb-6 animate-fade-in">
          <div className="flex flex-col gap-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  location.pathname === link.path ? "text-accent" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/pricing" onClick={() => setOpen(false)}>{t("nav.seePricing")}</Link>
            </Button>
            <Button variant="cta" size="sm" asChild>
              <Link to="/auth" onClick={() => setOpen(false)}>{t("nav.startWorkspace")}</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
