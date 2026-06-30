import { Globe } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SUPPORTED_CURRENCIES, CURRENCY_LABELS, type Currency } from "@/lib/currency";

export function CurrencySwitcher({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency, country } = useCurrency();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={compact ? "icon" : "sm"} className="gap-1.5" aria-label="Change currency">
          <Globe className="h-4 w-4" />
          {!compact && <span className="font-medium text-xs">{currency}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>
          Currency
          {country && <span className="block text-xs text-muted-foreground font-normal">Detected: {country}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUPPORTED_CURRENCIES.map((c) => (
          <DropdownMenuItem
            key={c}
            onClick={() => setCurrency(c as Currency)}
            className={c === currency ? "bg-muted font-medium" : ""}
          >
            {CURRENCY_LABELS[c]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
