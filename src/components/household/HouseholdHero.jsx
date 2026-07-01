export default function HouseholdHero({
  familyName = "Doe Family",
  status = "Active Household",
  subtitle = "Your household information and members.",
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-8 py-6 flex items-center justify-between">
      {/* Left: icon + text */}
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-[#eef1f9] flex items-center justify-center shrink-0">
          <svg className="w-7 h-7 text-[#1a2a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-[22px] font-bold text-[#1a2a5e]">{familyName}</h2>
            <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-semibold px-3 py-1 rounded-full">
              {status}
            </span>
          </div>
          <p className="text-[13px] text-gray-400">{subtitle}</p>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-3 shrink-0">
        <button className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-[#1a2a5e] text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Household Information
        </button>
        <button className="flex items-center gap-2 bg-[#1a2a5e] hover:bg-[#243672] text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          View Members
        </button>
      </div>
    </div>
  );
}
