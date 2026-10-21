import {
  ArrowDownLeft,
  ArrowLeftRight,
  Bell,
  CheckCheck,
  PiggyBank,
  Receipt,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { NOTIFICATION_KIND_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { NotificationKind } from "@/types";

const KIND_ICONS: Record<NotificationKind, typeof Bell> = {
  TRANSFER: ArrowLeftRight,
  DEPOSIT: ArrowDownLeft,
  PAYMENT: Receipt,
  SECURITY: ShieldCheck,
  BUDGET: PiggyBank,
};

/** Header notification centre: unread badge, list, mark-as-read and clear. */
export function NotificationCenter() {
  const { notifications, unreadCount, markRead, markAllRead, clear } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ""}`}
        >
          <Bell className="size-4" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="text-sm font-bold">Notificações</p>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Marcar todas como lidas"
              disabled={unreadCount === 0}
              onClick={markAllRead}
            >
              <CheckCheck className="size-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Limpar notificações"
              disabled={notifications.length === 0}
              onClick={clear}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Bell}
              title="Sem notificações"
              description="Movimentos, alertas de orçamento e ações de segurança aparecem aqui."
            />
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <ul className="divide-y divide-border">
              {notifications.map((notification) => {
                const Icon = KIND_ICONS[notification.kind];
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => markRead(notification.id)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                        !notification.read && "bg-primary/5",
                      )}
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="min-w-0 truncate text-sm font-semibold">
                            {notification.title}
                          </span>
                          {!notification.read && (
                            <Badge variant="secondary" className="shrink-0 text-[9px]">
                              Nova
                            </Badge>
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {notification.message}
                        </span>
                        <span className="mt-1 block text-[10px] tracking-wide text-muted-foreground uppercase">
                          {NOTIFICATION_KIND_LABELS[notification.kind]} ·{" "}
                          {formatDateTime(notification.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
