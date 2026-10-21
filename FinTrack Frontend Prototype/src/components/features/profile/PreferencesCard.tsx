import { Globe, Moon, Sun, Wallet } from "lucide-react";

import { SectionCard } from "@/components/common/SectionCard";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUserProfile } from "@/hooks/useUserProfile";
import { CURRENCIES, CURRENCY_SYMBOLS, LANGUAGE_LABELS } from "@/lib/constants";
import type { Currency, Language } from "@/types";

/** Language, theme and base-currency preferences (persisted with the session). */
export function PreferencesCard() {
  const { preferences, updatePreferences } = useUserProfile();
  const dark = preferences.theme === "dark";

  return (
    <SectionCard
      title="Preferências"
      description="Idioma, tema e moeda base usada nos totais agregados"
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pref-language" className="flex items-center gap-2">
              <Globe className="size-4 text-muted-foreground" aria-hidden="true" /> Idioma
            </Label>
            <Select
              value={preferences.language}
              onValueChange={(value) => updatePreferences({ language: value as Language })}
            >
              <SelectTrigger id="pref-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(LANGUAGE_LABELS) as Language[]).map((language) => (
                  <SelectItem key={language} value={language}>
                    {LANGUAGE_LABELS[language]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pref-currency" className="flex items-center gap-2">
              <Wallet className="size-4 text-muted-foreground" aria-hidden="true" /> Moeda base
            </Label>
            <Select
              value={preferences.currency}
              onValueChange={(value) => updatePreferences({ currency: value as Currency })}
            >
              <SelectTrigger id="pref-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency} · {CURRENCY_SYMBOLS[currency]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              {dark ? (
                <Moon className="size-4" aria-hidden="true" />
              ) : (
                <Sun className="size-4" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Tema {dark ? "escuro" : "claro"}</p>
              <p className="text-xs text-muted-foreground">
                Aplica-se imediatamente a toda a aplicação.
              </p>
            </div>
          </div>
          <Switch
            checked={dark}
            onCheckedChange={(checked) =>
              updatePreferences({ theme: checked ? "dark" : "light" })
            }
            aria-label="Ativar tema escuro"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Nota: o idioma e a moeda base ficam guardados na sessão. A tradução completa da interface
          será feita quando a API estiver ligada.
        </p>
      </div>
    </SectionCard>
  );
}
