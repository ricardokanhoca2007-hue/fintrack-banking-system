import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeftRight, Landmark, LayoutDashboard, LogOut, UserRound } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { initials } from "@/lib/formatters";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/store/auth-store";

const NAV_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Contas", url: "/accounts", icon: Landmark },
  { title: "Transações", url: "/transactions", icon: ArrowLeftRight },
  { title: "Perfil", url: "/profile", icon: UserRound },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, fullName } = useUserProfile();
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    logout();
    await navigate({ to: "/", replace: true });
  }

  const isActive = (url: string) => pathname === url || pathname.startsWith(`${url}/`);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="flex items-center" aria-label="FinTrack, ir para o painel">
          <Logo />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="min-h-11 font-medium data-[active=true]:bg-primary data-[active=true]:font-semibold data-[active=true]:text-primary-foreground data-[active=true]:shadow-[var(--shadow-glow)] data-[active=true]:hover:bg-primary-strong data-[active=true]:hover:text-primary-foreground"
                  >
                    <Link to={item.url} className="flex items-center gap-2.5">
                      <item.icon className="size-4 shrink-0" aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2 p-3">
        <div className="flex min-w-0 items-center gap-3 rounded-xl bg-sidebar-accent p-2.5">
          <Avatar className="size-8 shrink-0">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
              {initials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">{fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Terminar sessão"
              className="min-h-11 text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="size-4 shrink-0" aria-hidden="true" />
              <span>Terminar sessão</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
