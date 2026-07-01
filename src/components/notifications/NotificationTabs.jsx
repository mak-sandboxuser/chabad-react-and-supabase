export default function NotificationTabs({ activeTab, onTabChange, unreadCount, onMarkAllRead }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-6">
      <div className="flex items-center gap-7">
        <button
          onClick={() => onTabChange("all")}
          className={`relative py-4 text-[14px] font-semibold transition-colors
            ${activeTab === "all" ? "text-[#1a6bdc]" : "text-gray-400 hover:text-gray-600"}`}
        >
          All Notifications
          {activeTab === "all" && (
            <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#1a6bdc] rounded-full" />
          )}
        </button>
        <button
          onClick={() => onTabChange("unread")}
          className={`relative py-4 text-[14px] font-semibold transition-colors
            ${activeTab === "unread" ? "text-[#1a6bdc]" : "text-gray-400 hover:text-gray-600"}`}
        >
          Unread ({unreadCount})
          {activeTab === "unread" && (
            <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#1a6bdc] rounded-full" />
          )}
        </button>
      </div>

      <button
        onClick={onMarkAllRead}
        className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Mark all as read
      </button>
    </div>
  );
}
