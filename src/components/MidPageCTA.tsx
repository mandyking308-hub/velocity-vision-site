import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const MidPageCTA = () => {
  const { t } = useTranslation("marketing");
  return (
    <section className="section-padding bg-secondary">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Live Demo</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">{t("midCta.title")}</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">{t("midCta.body")}</p>
          <Button variant="cta" size="lg" asChild>
            <Link to="/demo"><Play size={16} /> {t("midCta.button")}</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default MidPageCTA;
