import { Link } from "react-router-dom";

export default function TopBar({
  userName = "John Doe",
  notificationCount = 3,
  title = "Member Portal",
  breadcrumbs = [],
}) {
  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="bg-white border-b border-gray-100 px-6 sticky top-0 z-10">
      <div className="h-14 flex items-center justify-between">
        <h1 className="text-[15px] font-semibold text-gray-800">{title}</h1>

        <div className="flex items-center gap-4">
          {/* Bell */}
          <button className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#e53e3e] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {/* User */}
          <button className="flex items-center gap-2.5 hover:bg-gray-50 px-2 py-1.5 rounded-xl transition-colors">
            <div className="w-8 h-8 bg-[#1a2a5e] rounded-full flex items-center justify-center">
              <span className="text-white text-[11px] font-bold">{initials}</span>
            </div>
            <span className="text-[13px] font-medium text-gray-700">{userName}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
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
