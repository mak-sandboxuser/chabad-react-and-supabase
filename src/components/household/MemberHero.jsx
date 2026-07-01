export default function MemberHero({
  name = "Sarah Doe",
  initials = "SR",
  status = "Active Member",
  relationship = "Spouse",
  memberSince = "Jan 15, 2024",
  avatarColor = "bg-[#2563eb]",
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-8 py-6 flex items-center justify-between">
      {/* Left: avatar + info */}
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div className={`w-16 h-16 rounded-full ${avatarColor} flex items-center justify-center shrink-0`}>
          <span className="text-white text-[20px] font-bold tracking-wide">{initials}</span>
        </div>

        <div>
          {/* Name + badge */}
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-[22px] font-bold text-[#1a2a5e]">{name}</h2>
            <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-semibold px-3 py-1 rounded-full">
              {status}
            </span>
          </div>

          {/* Meta pills */}
          <div className="flex items-center gap-4 text-[13px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {relationship}
            </div>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Member Since {memberSince}
            </div>
          </div>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-3 shrink-0">
        <button className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-[#1a2a5e] text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Information
        </button>
        <button className="flex items-center gap-2 border border-[#fca5a5] hover:border-[#f87171] hover:bg-[#fff5f5] text-[#e53e3e] text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Remove from Household
        </button>
      </div>
    </div>
  );
}
