import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useNotificationsBell } from "../../hooks/useNotificationsBell";

const TYPE_STYLES = {
  success: { iconBg: "bg-[#dcfce7]", iconColor: "text-[#16a34a]" },
  payment: { iconBg: "bg-[#dcfce7]", iconColor: "text-[#16a34a]" },
  info: { iconBg: "bg-[#dbeafe]", iconColor: "text-[#1a6bdc]" },
  warning: { iconBg: "bg-[#fef9c3]", iconColor: "text-[#ca8a04]" },
  household: { iconBg: "bg-[#ede9fe]", iconColor: "text-[#7c3aed]" },
  system: { iconBg: "bg-[#e2e8f0]", iconColor: "text-[#475569]" },
};

const INFO_ICON =
  "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";

export default function TopBar({
  userName = "John Doe",
  notificationCount = 0,
  title = "Member Portal",
  breadcrumbs = [],
}) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const bellRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const {
    loading: notificationsLoading,
    notifications,
    unreadCount,
    markAllRead,
    markOneRead,
  } = useNotificationsBell();

  // Prefer live unread count; fall back to parent prop until hook loads.
  const badgeCount = notificationsLoading && unreadCount === 0
    ? notificationCount
    : unreadCount;

  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!menuOpen && !bellOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setBellOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setBellOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, bellOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleBellClick = () => {
    setMenuOpen(false);
    setBellOpen((open) => !open);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (notification.isUnread) {
        await markOneRead(notification.id);
      }
    } catch {
      // ignore
    }
    setBellOpen(false);
    navigate("/notifications");
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 sticky top-0 z-10">
      <div className="h-14 flex items-center justify-between">
        <h1 className="text-[15px] font-semibold text-gray-800">{title}</h1>

        <div className="flex items-center gap-4">
          {/* Bell + notifications dropdown */}
          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={handleBellClick}
              aria-expanded={bellOpen}
              aria-label="Notifications"
              className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {badgeCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 bg-[#e53e3e] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div
                role="dialog"
                aria-label="Notifications"
                className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">Notifications</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {badgeCount > 0 ? `${badgeCount} unread` : "You're all caught up"}
                    </p>
                  </div>
                  {badgeCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-[#1a6bdc] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                  {notificationsLoading && notifications.length === 0 ? (
                    <p className="px-4 py-6 text-[12px] text-gray-400 text-center">Loading...</p>
                  ) : notifications.length === 0 ? (
                    <p className="px-4 py-6 text-[12px] text-gray-400 text-center">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => {
                      const style = TYPE_STYLES[n.type] || TYPE_STYLES.info;
                      return (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => handleNotificationClick(n)}
                          className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                            n.isUnread ? "bg-[#f8fbff]" : "bg-white"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full ${style.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <svg className={`w-4 h-4 ${style.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={INFO_ICON} />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-[12px] leading-snug ${n.isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                                {n.title}
                              </p>
                              <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">{n.body}</p>
                          </div>
                          {n.isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#1a6bdc] shrink-0 mt-1.5" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-gray-100 px-4 py-2.5 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setBellOpen(false)}
                    className="text-[12px] font-semibold text-[#1a6bdc] hover:underline"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setBellOpen(false);
                setMenuOpen((open) => !open);
              }}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2.5 hover:bg-gray-50 px-2 py-1.5 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 bg-[#1a2a5e] rounded-full flex items-center justify-center">
                <span className="text-white text-[11px] font-bold">{initials}</span>
              </div>
              <span className="text-[13px] font-medium text-gray-700">{userName}</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50"
              >
                <div className="px-3.5 py-2.5 border-b border-gray-100">
                  <p className="text-[13px] font-semibold text-gray-800 truncate">{userName}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Member account</p>
                </div>

                <Link
                  to="/profile"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>

                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>

                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-[13px] text-[#e53e3e] hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb row */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1.5 pb-2.5 -mt-1">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
              {crumb.href ? (
                <Link to={crumb.href} className="text-[12px] text-gray-400 hover:text-[#1a6bdc] transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[12px] font-semibold text-[#1a2a5e]">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
