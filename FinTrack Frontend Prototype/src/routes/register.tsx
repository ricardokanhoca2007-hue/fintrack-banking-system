import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { FormField } from "@/components/common/FormField";
import { AuthLayout } from "@/components/features/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useZodForm } from "@/hooks/useZodForm";
import { useAuth } from "@/store/auth-store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Criar conta FinTrack | Começa em minutos" },
      {
        name: "description",
        content:
          "Cria a tua conta FinTrack e organiza contas, transações e orçamentos numa interface moderna.",
      },
      { property: "og:title", content: "Criar conta FinTrack" },
      {
        property: "og:description",
        content: "Registo no protótipo FinTrack, com validação inline e feedback imediato.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const schema = z
  .object({
    firstName: z.string().trim().min(2, "Indica o primeiro nome."),
    lastName: z.string().trim().min(2, "Indica o último nome."),
    email: z.string().trim().email("Introduz um email válido."),
    password: z
      .string()
      .min(8, "A password deve ter pelo menos 8 caracteres.")
      .regex(/[A-Z]/, "Inclui pelo menos uma letra maiúscula.")
      .regex(/\d/, "Inclui pelo menos um número."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As passwords não coincidem.",
  });

function RegisterPage() {
  const navigate = useNavigate();
  const { isPending, run } = useAsyncAction();
  const { register } = useAuth();
  const form = useZodForm(schema, {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const submit = form.handleSubmit(async (values) => {
    const user = await run(
      () =>
        register({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
        }),
      {
        successTitle: "Conta criada",
        errorMessage: "Não foi possível criar a conta.",
      },
    );
    if (user) {
      toast.success(`Bem-vindo, ${user.firstName}!`);
      await navigate({ to: "/dashboard" });
    }
  });

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Bastam alguns dados para explorares o protótipo."
      footer={
        <>
          Já tens conta?{" "}
          <Link to="/" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Primeiro nome" error={form.errors.firstName}>
            {(field) => (
              <Input
                {...field}
                autoComplete="given-name"
                value={form.values.firstName}
                onChange={(event) => form.setField("firstName", event.target.value)}
                onBlur={() => form.touch("firstName")}
              />
            )}
          </FormField>
          <FormField label="Último nome" error={form.errors.lastName}>
            {(field) => (
              <Input
                {...field}
                autoComplete="family-name"
                value={form.values.lastName}
                onChange={(event) => form.setField("lastName", event.target.value)}
                onBlur={() => form.touch("lastName")}
              />
            )}
          </FormField>
        </div>

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

        <FormField
          label="Password"
          error={form.errors.password}
          hint="Mínimo 8 caracteres, com uma maiúscula e um número."
        >
          {(field) => (
            <Input
              {...field}
              type="password"
              autoComplete="new-password"
              value={form.values.password}
              onChange={(event) => form.setField("password", event.target.value)}
              onBlur={() => form.touch("password")}
            />
          )}
        </FormField>

        <FormField label="Confirmar password" error={form.errors.confirmPassword}>
          {(field) => (
            <Input
              {...field}
              type="password"
              autoComplete="new-password"
              value={form.values.confirmPassword}
              onChange={(event) => form.setField("confirmPassword", event.target.value)}
              onBlur={() => form.touch("confirmPassword")}
            />
          )}
        </FormField>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  );
}
