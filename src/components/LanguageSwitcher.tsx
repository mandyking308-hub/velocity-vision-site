import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS, type SupportedLanguage } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  variant?: "ghost" | "outline";
  compact?: boolean;
}

export default function LanguageSwitcher({ variant = "ghost", compact = false }: Props) {
  const { i18n, t } = useTranslation();
  const current = (i18n.language?.slice(0, 2) || "en") as SupportedLanguage;

  const change = async (lng: SupportedLanguage) => {
    await i18n.changeLanguage(lng);
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { LANGUAGE_DEFAULTS } = await import("@/i18n");
        const defaults = LANGUAGE_DEFAULTS[lng];
        await supabase
          .from("profiles")
          .update({
            preferred_language: lng,
            preferred_locale: defaults.locale,
          })
          .eq("user_id", data.user.id);
      }
    } catch {
      // not signed in or no profile — preference still persists in localStorage via detector
    }
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" aria-label={t("language.label")} className="gap-2">
          <Globe size={16} />
          {!compact && <span className="uppercase">{current}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((lng) => (
          <DropdownMenuItem
            key={lng}
            onClick={() => change(lng)}
            className={lng === current ? "font-semibold" : ""}
          >
            {LANGUAGE_LABELS[lng]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
