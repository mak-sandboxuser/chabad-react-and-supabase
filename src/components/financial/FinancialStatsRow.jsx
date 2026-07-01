const cards = [
  {
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    iconBg: "bg-[#eef1f9]",
    iconColor: "text-[#1a2a5e]",
    label: "Annual Commitment",
    value: "$1,800.00",
    valueColor: "text-[#1a2a5e]",
    sub: "Commitment for 2024",
    subColor: "text-[#1a6bdc]",
  },
  {
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    iconBg: "bg-[#dcfce7]",
    iconColor: "text-[#16a34a]",
    label: "Contributions Made",
    value: "$1,125.00",
    valueColor: "text-[#1a2a5e]",
    sub: "62.5% of commitment",
    subColor: "text-[#16a34a]",
  },
  {
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    iconBg: "bg-[#fff7ed]",
    iconColor: "text-[#ea580c]",
    label: "Outstanding Balance",
    value: "$675.00",
    valueColor: "text-[#ea580c]",
    sub: "37.5% remaining",
    subColor: "text-[#ea580c]",
  },
  {
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    iconBg: "bg-[#ede9fe]",
    iconColor: "text-[#7c3aed]",
    label: "Active Recurring",
    value: "$150.00",
    valueColor: "text-[#1a2a5e]",
    sub: "Monthly",
    subColor: "text-[#7c3aed]",
  },
];

export default function FinancialStatsRow() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
          {/* Icon + info icon */}
          <div className="flex items-center justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center`}>
              <svg className={`w-5 h-5 ${c.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
              </svg>
            </div>
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <p className="text-[12px] text-gray-500 font-medium mb-1.5">{c.label}</p>
          <p className={`text-[22px] font-bold leading-none ${c.valueColor}`}>{c.value}</p>
          <p className={`text-[11px] font-medium mt-2 ${c.subColor}`}>{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
