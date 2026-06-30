import { useTranslation } from "react-i18next";
import { Coins } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SUPPORTED_CURRENCIES, CURRENCY_LABELS, type Currency } from "@/lib/currency";
import { useCurrency } from "@/hooks/useCurrency";

interface Props {
  variant?: "ghost" | "outline";
  compact?: boolean;
}

export default function CurrencySwitcher({ variant = "ghost", compact = false }: Props) {
  const { t } = useTranslation();
  const { currency, setCurrency } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" aria-label={t("currency.label")} className="gap-2">
          <Coins size={16} />
          {!compact && <span>{currency}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_CURRENCIES.map((c: Currency) => (
          <DropdownMenuItem
            key={c}
            onClick={() => setCurrency(c)}
            className={c === currency ? "font-semibold" : ""}
          >
            {CURRENCY_LABELS[c]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
