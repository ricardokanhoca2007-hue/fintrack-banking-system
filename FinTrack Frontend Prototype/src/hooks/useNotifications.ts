import { useMemo } from "react";

import { useFinanceStore } from "@/store/finance-store";
import type { AppNotification } from "@/types";

interface UseNotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

/** Notification centre read model (newest first) plus its mutations. */
export function useNotifications(): UseNotificationsResult {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } =
    useFinanceStore();

  const sorted = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  return {
    notifications: sorted,
    unreadCount: sorted.filter((notification) => !notification.read).length,
    markRead: markNotificationRead,
    markAllRead: markAllNotificationsRead,
    clear: clearNotifications,
  };
}
