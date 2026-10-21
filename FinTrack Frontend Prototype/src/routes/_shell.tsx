import { useEffect } from "react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/store/auth-store";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

function ShellLayout() {
  const navigate = useNavigate();
  const { currentUser, isReady } = useAuth();

  // Session lives in localStorage, so the guard runs after hydration.
  useEffect(() => {
    if (isReady && !currentUser) void navigate({ to: "/", replace: true });
  }, [isReady, currentUser, navigate]);

  if (!isReady || !currentUser) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <span className="truncate text-sm font-semibold text-muted-foreground">
              Sessão de {currentUser.firstName} {currentUser.lastName} · dados de demonstração
            </span>
          </header>
          <main className="hero-glow flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
