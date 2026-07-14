import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { timeAgo } from "../lib/format";
import {
  fetchNotifications,
  getAuthUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/memberData";

function mapNotification(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type || "info",
    isUnread: !row.is_read,
    time: timeAgo(row.created_at),
    createdAt: row.created_at,
  };
}

/**
 * Live unread count + recent notifications for the TopBar bell.
 * Subscribes to Supabase realtime so the badge increments when a new row arrives.
 */
export function useNotificationsBell(limit = 8) {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const applyRows = useCallback((rows) => {
    const mapped = (rows || []).map(mapNotification);
    setNotifications(mapped.slice(0, limit));
    setUnreadCount(mapped.filter((n) => n.isUnread).length);
  }, [limit]);

  const refresh = useCallback(async (uid) => {
    if (!uid) return;
    try {
      const rows = await fetchNotifications(uid);
      applyRows(rows);
    } catch {
      // Keep previous state on refresh errors.
    } finally {
      setLoading(false);
    }
  }, [applyRows]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const user = await getAuthUser();
        if (cancelled) return;
        setUserId(user.id);
        const rows = await fetchNotifications(user.id);
        if (cancelled) return;
        applyRows(rows);
      } catch {
        // ignore auth/load errors for the bell
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [applyRows]);

  // Realtime: bump count + refresh list when notifications change for this user.
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-bell:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new;
            if (!row) return;
            const mapped = mapNotification(row);
            setNotifications((prev) => {
              if (prev.some((n) => n.id === mapped.id)) return prev;
              return [mapped, ...prev].slice(0, limit);
            });
            if (!row.is_read) {
              setUnreadCount((c) => c + 1);
            }
            return;
          }

          if (payload.eventType === "UPDATE") {
            refresh(userId);
            return;
          }

          if (payload.eventType === "DELETE") {
            const row = payload.old;
            if (!row) return;
            setNotifications((prev) => prev.filter((n) => n.id !== row.id));
            if (!row.is_read) {
              setUnreadCount((c) => Math.max(0, c - 1));
            }
          }
        },
      )
      .subscribe();

    // Fallback poll in case Realtime isn't enabled on the table yet.
    const pollId = window.setInterval(() => {
      refresh(userId);
    }, 20000);

    return () => {
      window.clearInterval(pollId);
      supabase.removeChannel(channel);
    };
  }, [userId, limit, refresh]);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    await markAllNotificationsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    setUnreadCount(0);
  }, [userId]);

  const markOneRead = useCallback(async (notificationId) => {
    const target = notifications.find((n) => n.id === notificationId);
    await markNotificationRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isUnread: false } : n)),
    );
    if (target?.isUnread) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  }, [notifications]);

  return {
    loading,
    notifications,
    unreadCount,
    refresh: () => refresh(userId),
    markAllRead,
    markOneRead,
  };
}
