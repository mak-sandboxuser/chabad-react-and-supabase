export default function MemberRightPanel() {
  return (
    <div className="space-y-5">

      {/* Household Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[14px] font-semibold text-gray-800 mb-4">Household Summary</h3>

        {/* Family avatar + name */}
        <div className="flex flex-col items-center py-2 mb-5">
          <div className="w-14 h-14 rounded-full bg-[#eef1f9] flex items-center justify-center mb-2.5">
            <svg className="w-7 h-7 text-[#1a2a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-[14px] font-bold text-[#1a2a5e]">Doe Family</p>
          <span className="mt-1 bg-[#dcfce7] text-[#16a34a] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
            Active
          </span>
        </div>

        {/* 2×2 stats grid */}
        <div className="grid grid-cols-2 gap-0 border border-gray-100 rounded-xl overflow-hidden">
          <div className="p-3.5 border-r border-b border-gray-100">
            <p className="text-[18px] font-bold text-[#1a2a5e] leading-none">4</p>
            <p className="text-[11px] text-gray-400 mt-1">Total Members</p>
          </div>
          <div className="p-3.5 border-b border-gray-100">
            <p className="text-[13px] font-semibold text-[#1a2a5e] leading-snug">John Doe</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Household Owner</p>
          </div>
          <div className="p-3.5 border-r border-gray-100">
            <p className="text-[13px] font-semibold text-[#1a2a5e] leading-snug">Jan 15, 2024</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Member Since</p>
          </div>
          <div className="p-3.5">
            <p className="text-[13px] font-semibold text-[#1a2a5e] leading-snug">Active</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Household Status</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[14px] font-semibold text-gray-800 mb-2">Actions</h3>

        {/* Edit Information */}
        <button className="w-full flex items-center gap-3 py-3.5 border-b border-gray-50 hover:bg-gray-50 -mx-1 px-1 rounded-xl transition-colors group text-left">
          <div className="w-9 h-9 rounded-xl bg-[#eef1f9] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-[#1a6bdc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-800 leading-snug">Edit Information</p>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
              Update member details, contact information, and role.
            </p>
          </div>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Remove from Household — destructive */}
        <button className="w-full flex items-center gap-3 py-3.5 hover:bg-[#fff5f5] -mx-1 px-1 rounded-xl transition-colors group text-left mt-1">
          <div className="w-9 h-9 rounded-xl bg-[#fee2e2] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-[#e53e3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#e53e3e] leading-snug">Remove from Household</p>
            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
              Remove this member from the household.
            </p>
          </div>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-[#fca5a5] shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Need Help */}
      <div className="bg-[#f4f6fb] rounded-2xl border border-gray-100 p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-[#1a2a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-800">Need Help?</p>
            <p className="text-[12px] text-gray-500 mt-1 leading-snug">
              If you need assistance managing your household members, our support team is here to help.
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 text-[13px] text-[#1a6bdc] font-semibold hover:underline">
          Contact Support
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>

    </div>
  );
}
