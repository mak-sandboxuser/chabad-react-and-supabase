const actions = [
  {
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    iconBg: "bg-[#dcfce7]",
    iconColor: "text-[#16a34a]",
    label: "Make Payment",
  },
  {
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    iconBg: "bg-[#dbeafe]",
    iconColor: "text-[#1a6bdc]",
    label: "Manage Billing",
  },
  {
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    iconBg: "bg-[#ede9fe]",
    iconColor: "text-[#7c3aed]",
    label: "Update Profile",
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    iconBg: "bg-[#fef9c3]",
    iconColor: "text-[#ca8a04]",
    label: "View Household",
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    iconBg: "bg-[#fce7f3]",
    iconColor: "text-[#db2777]",
    label: "View Membership Details",
  },
];

export default function QuickActions() {
  return (
    <div>
      <h3 className="text-[14px] font-semibold text-gray-800 mb-3">Quick Actions</h3>
      <div className="space-y-1.5">
        {actions.map((a) => (
          <button
            key={a.label}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <div className={`w-8 h-8 rounded-lg ${a.iconBg} flex items-center justify-center shrink-0`}>
              <svg className={`w-4 h-4 ${a.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
              </svg>
            </div>
            <span className="flex-1 text-[13px] font-medium text-gray-700 text-left">{a.label}</span>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
