import type { ReactNode } from "react";
import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

import { Logo } from "@/components/brand/Logo";

const HIGHLIGHTS = [
  {
    icon: TrendingUp,
    title: "Visão clara do teu dinheiro",
    description: "Saldo agregado, receitas e despesas com gráficos legíveis.",
  },
  {
    icon: Sparkles,
    title: "Movimentos em segundos",
    description: "Depósitos, levantamentos e transferências entre contas.",
  },
  {
    icon: ShieldCheck,
    title: "Pensado para escalar",
    description: "Interface preparada para ligar a uma API Java/Spring Boot.",
  },
];

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

/** Split screen used by login and registo: marketing panel + form card. */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="hero-glow hidden flex-col justify-between border-r border-border p-10 lg:flex">
        <Logo />
        <div className="space-y-8">
          <div>
            <p className="text-sm font-semibold text-primary">Protótipo de portefólio</p>
            <h2 className="mt-2 max-w-md text-3xl font-extrabold tracking-tight">
              Banca digital com a clareza que os teus números merecem.
            </h2>
          </div>
          <ul className="space-y-5">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          Dados de demonstração · sem ligação a sistemas bancários reais.
        </p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="surface-card mt-6 rounded-xl p-6">{children}</div>
          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </main>
    </div>
  );
}
