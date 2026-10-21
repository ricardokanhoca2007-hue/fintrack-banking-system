import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { z } from "zod";

import { FormField } from "@/components/common/FormField";
import { AuthLayout } from "@/components/features/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useZodForm } from "@/hooks/useZodForm";
import { useAuth } from "@/store/auth-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar na FinTrack | Banca digital simples" },
      {
        name: "description",
        content:
          "Inicia sessão na FinTrack para acompanhar saldos, receitas, despesas e movimentos das tuas contas.",
      },
      { property: "og:title", content: "Entrar na FinTrack" },
      {
        property: "og:description",
        content: "Protótipo de banca digital com dashboard, contas e transações.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Introduz um email válido."),
  password: z.string().min(6, "A password deve ter pelo menos 6 caracteres."),
});

function LoginPage() {
  const navigate = useNavigate();
  const { isPending, run } = useAsyncAction();
  const { login } = useAuth();
  const form = useZodForm(schema, { email: "", password: "" });

  const submit = form.handleSubmit(async (values) => {
    const user = await run(() => login(values.email, values.password), {
      successTitle: "Sessão iniciada",
      errorMessage: "Não foi possível iniciar sessão.",
    });
    if (user) await navigate({ to: "/dashboard" });
  });

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Usa as credenciais da conta que criaste (ou a conta demo ana.moreira@fintrack.app / demo1234)."
      footer={
        <>
          Ainda não tens conta?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormField label="Email" error={form.errors.email}>
          {(field) => (
            <Input
              {...field}
              type="email"
              autoComplete="email"
              value={form.values.email}
              onChange={(event) => form.setField("email", event.target.value)}
              onBlur={() => form.touch("email")}
            />
          )}
        </FormField>

        <FormField label="Password" error={form.errors.password}>
          {(field) => (
            <Input
              {...field}
              type="password"
              autoComplete="current-password"
              value={form.values.password}
              onChange={(event) => form.setField("password", event.target.value)}
              onBlur={() => form.touch("password")}
            />
          )}
        </FormField>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Entrar
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Protótipo sem autenticação real — nenhuma credencial é validada.
        </p>
      </form>
    </AuthLayout>
  );
}
