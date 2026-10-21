import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { FormField } from "@/components/common/FormField";
import { SectionCard } from "@/components/common/SectionCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useZodForm } from "@/hooks/useZodForm";
import { formatDate, initials } from "@/lib/formatters";

export const Route = createFileRoute("/_shell/profile")({
  head: () => ({
    meta: [
      { title: "Perfil | FinTrack" },
      {
        name: "description",
        content: "Edita os teus dados pessoais, altera a password e atualiza a foto de perfil.",
      },
      { property: "og:title", content: "Perfil FinTrack" },
      {
        property: "og:description",
        content: "Gestão de dados pessoais e segurança da conta no protótipo FinTrack.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const profileSchema = z.object({
  firstName: z.string().trim().min(2, "Indica o primeiro nome."),
  lastName: z.string().trim().min(2, "Indica o último nome."),
  email: z.string().trim().email("Introduz um email válido."),
  phone: z.string().trim().min(9, "Introduz um número de telefone válido."),
  address: z.string().trim().min(5, "Indica a morada completa."),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Introduz a password atual."),
    newPassword: z
      .string()
      .min(8, "A nova password deve ter pelo menos 8 caracteres.")
      .regex(/[A-Z]/, "Inclui pelo menos uma letra maiúscula.")
      .regex(/\d/, "Inclui pelo menos um número."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As passwords não coincidem.",
  });

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function ProfilePage() {
  const { user, fullName, updateProfile, changePassword, setAvatar } = useUserProfile();
  const profileAction = useAsyncAction();
  const passwordAction = useAsyncAction();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const profileForm = useZodForm(profileSchema, {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    address: user.address,
  });

  const passwordForm = useZodForm(passwordSchema, {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const submitProfile = profileForm.handleSubmit(async (values) => {
    await profileAction.run(() => updateProfile(values), {
      successTitle: "Perfil atualizado",
      successDescription: "Os teus dados pessoais foram guardados.",
      errorMessage: "Não foi possível guardar o perfil.",
    });
  });

  const submitPassword = passwordForm.handleSubmit(async (values) => {
    const result = await passwordAction.run(
      () => changePassword(values.currentPassword, values.newPassword),
      {
        successTitle: "Password alterada",
        successDescription: "Usa a nova password no próximo início de sessão.",
        errorMessage: "Não foi possível alterar a password.",
      },
    );
    if (result !== null) passwordForm.reset();
  });

  function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("O ficheiro tem de ser uma imagem.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("A imagem não pode exceder 2 MB.");
      return;
    }

    // Prototype-only: the image is kept as a data URL in memory instead of being uploaded.
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(String(reader.result));
      setAvatarError(null);
      toast.success("Fotografia atualizada", { description: "Pré-visualização local, sem upload." });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil"
        description="Gere os teus dados pessoais e a segurança da conta."
        breadcrumbs={[{ label: "FinTrack", to: "/dashboard" }, { label: "Perfil" }]}
      />

      <SectionCard title="Fotografia" description="Visível na barra lateral e no cabeçalho">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar className="size-20">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={`Fotografia de ${fullName}`} />}
            <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">
              {initials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Camera className="size-4" aria-hidden="true" /> Escolher imagem
              </Button>
              {user.avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setAvatar(null);
                    toast.success("Fotografia removida");
                  }}
                >
                  <Trash2 className="size-4" aria-hidden="true" /> Remover
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              PNG ou JPG até 2 MB · membro desde {formatDate(user.memberSince)}
            </p>
            {avatarError && <p className="text-xs font-medium text-destructive">{avatarError}</p>}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="Carregar fotografia de perfil"
            onChange={(event) => handleAvatarChange(event.target.files?.[0])}
          />
        </div>
      </SectionCard>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">Dados pessoais</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <SectionCard title="Dados pessoais" description="Estes dados aparecem nos teus extratos">
            <form onSubmit={submitProfile} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Primeiro nome" error={profileForm.errors.firstName}>
                  {(field) => (
                    <Input
                      {...field}
                      value={profileForm.values.firstName}
                      onChange={(event) => profileForm.setField("firstName", event.target.value)}
                      onBlur={() => profileForm.touch("firstName")}
                    />
                  )}
                </FormField>
                <FormField label="Último nome" error={profileForm.errors.lastName}>
                  {(field) => (
                    <Input
                      {...field}
                      value={profileForm.values.lastName}
                      onChange={(event) => profileForm.setField("lastName", event.target.value)}
                      onBlur={() => profileForm.touch("lastName")}
                    />
                  )}
                </FormField>
              </div>

              <FormField label="Email" error={profileForm.errors.email}>
                {(field) => (
                  <Input
                    {...field}
                    type="email"
                    value={profileForm.values.email}
                    onChange={(event) => profileForm.setField("email", event.target.value)}
                    onBlur={() => profileForm.touch("email")}
                  />
                )}
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Telefone" error={profileForm.errors.phone}>
                  {(field) => (
                    <Input
                      {...field}
                      value={profileForm.values.phone}
                      onChange={(event) => profileForm.setField("phone", event.target.value)}
                      onBlur={() => profileForm.touch("phone")}
                    />
                  )}
                </FormField>
                <FormField label="Morada" error={profileForm.errors.address}>
                  {(field) => (
                    <Input
                      {...field}
                      value={profileForm.values.address}
                      onChange={(event) => profileForm.setField("address", event.target.value)}
                      onBlur={() => profileForm.touch("address")}
                    />
                  )}
                </FormField>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={profileAction.isPending}>
                  {profileAction.isPending && (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  )}
                  Guardar alterações
                </Button>
              </div>
            </form>
          </SectionCard>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <SectionCard
            title="Alterar password"
            description="Mínimo 8 caracteres, com uma maiúscula e um número"
          >
            <form onSubmit={submitPassword} className="space-y-4" noValidate>
              <FormField label="Password atual" error={passwordForm.errors.currentPassword}>
                {(field) => (
                  <Input
                    {...field}
                    type="password"
                    autoComplete="current-password"
                    value={passwordForm.values.currentPassword}
                    onChange={(event) =>
                      passwordForm.setField("currentPassword", event.target.value)
                    }
                    onBlur={() => passwordForm.touch("currentPassword")}
                  />
                )}
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Nova password" error={passwordForm.errors.newPassword}>
                  {(field) => (
                    <Input
                      {...field}
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.values.newPassword}
                      onChange={(event) => passwordForm.setField("newPassword", event.target.value)}
                      onBlur={() => passwordForm.touch("newPassword")}
                    />
                  )}
                </FormField>
                <FormField label="Confirmar password" error={passwordForm.errors.confirmPassword}>
                  {(field) => (
                    <Input
                      {...field}
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.values.confirmPassword}
                      onChange={(event) =>
                        passwordForm.setField("confirmPassword", event.target.value)
                      }
                      onBlur={() => passwordForm.touch("confirmPassword")}
                    />
                  )}
                </FormField>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                  Protótipo: nenhuma credencial é enviada para servidores.
                </p>
                <Button type="submit" disabled={passwordAction.isPending}>
                  {passwordAction.isPending && (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  )}
                  Alterar password
                </Button>
              </div>
            </form>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
