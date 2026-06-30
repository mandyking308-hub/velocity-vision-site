import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";

/**
 * On sign-in, sync the user's preferred_language profile column into i18n.
 * Mount once in AppLayout / portal shell.
 */
export function useLanguageSync() {
  const { i18n } = useTranslation();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("preferred_language")
          .eq("user_id", data.user.id)
          .maybeSingle();
        if (cancelled || !profile?.preferred_language) return;
        const lng = profile.preferred_language as SupportedLanguage;
        if ((SUPPORTED_LANGUAGES as readonly string[]).includes(lng) && lng !== i18n.language) {
          await i18n.changeLanguage(lng);
        }
      } catch {
        /* anonymous */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [i18n]);
}
