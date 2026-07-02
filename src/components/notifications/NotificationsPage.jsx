import { useMemo, useState } from "react";
import { getAuthUser, markAllNotificationsRead } from "../../services/memberData";
import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import NotificationTabs from "./NotificationTabs";
import NotificationsList from "./NotificationsList";
import NotificationPagination from "./NotificationPagination";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useNotificationsData } from "../../hooks/usePageData";

const PAGE_SIZE = 7;

export default function NotificationsPage() {
  const { userName, notificationCount } = useCurrentUser();
  const { loading, error, data, refetch } = useNotificationsData();
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);

  const items = data || [];
  const unreadCount = items.filter((n) => n.isUnread).length;

  const filtered = useMemo(
    () => (activeTab === "unread" ? items.filter((n) => n.isUnread) : items),
    [activeTab, items]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleMarkAllRead = async () => {
    try {
      const user = await getAuthUser();
      await markAllNotificationsRead(user.id);
      refetch();
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar userName={userName} notificationCount={notificationCount} title="Notification Center" />
        <div className="bg-white px-6 -mt-px pb-3 border-b border-gray-100">
          <p className="text-[13px] text-gray-400">Stay up to date with important alerts and updates.</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <main className="p-6">
            {loading && <p className="text-sm text-gray-500 mb-4">Loading notifications...</p>}
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <NotificationTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                unreadCount={unreadCount}
                onMarkAllRead={handleMarkAllRead}
              />
              <NotificationsList notifications={pageItems} />
              <NotificationPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </main>
        </div>

        <footer className="px-6 py-3 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
          <p className="text-[11px] text-gray-400">© 2025 Chabad Bedford. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[11px] text-gray-400 underline hover:text-gray-600">Privacy Policy</a>
            <span className="text-gray-200 text-[11px]">|</span>
            <a href="#" className="text-[11px] text-gray-400 underline hover:text-gray-600">Terms of Service</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
