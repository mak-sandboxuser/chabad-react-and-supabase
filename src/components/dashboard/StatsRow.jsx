const stats = [
  {
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    label: "Membership Tier",
    value: "Premium",
    sub: "Annual Membership",
    color: "text-[#1a2a5e]",
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    label: "Membership Status",
    value: "Active",
    sub: "Member since Jan 15, 2024",
    color: "text-[#1a6bdc]",
    valueClass: "text-[#1a6bdc]",
  },
  {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    label: "Annual Commitment",
    value: "$3,600.00",
    sub: "Billed Annually",
    color: "text-[#1a2a5e]",
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    label: "Household",
    value: "Doe Family",
    sub: "4 Members",
    color: "text-[#1a2a5e]",
  },
];

export default function StatsRow() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-gray-100 px-4 py-4 flex flex-col gap-2 hover:border-gray-200 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
              </svg>
              <span className="text-[11px] text-gray-400 font-medium">{stat.label}</span>
            </div>
            <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div>
            <p className={`text-[17px] font-bold leading-tight ${stat.valueClass || "text-[#1a2a5e]"}`}>{stat.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
