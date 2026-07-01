const SummaryRow = ({ icon, label, value, valueClass = "text-gray-800" }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-2.5">
      <svg className="w-4 h-4 text-gray-350 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <span className="text-[12px] text-gray-500">{label}</span>
    </div>
    <span className={`text-[12px] font-semibold ${valueClass}`}>{value}</span>
  </div>
);

export default function MembershipRightPanel() {
  return (
    <div className="space-y-5">
      {/* Active status card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#16a34a] leading-snug">Your membership is active!</p>
            <p className="text-[12px] text-gray-500 mt-1 leading-snug">
              Thank you for your continued support and commitment.
            </p>
          </div>
        </div>
      </div>

      {/* Membership Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[14px] font-semibold text-gray-800 mb-1">Membership Summary</h3>

        <SummaryRow
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          label="Member Since"
          value="Jan 1, 2024"
        />
        <SummaryRow
          icon="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          label="Membership Tier"
          value="Chai Society"
          valueClass="text-[#1a6bdc]"
        />
        <SummaryRow
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          label="Annual Commitment"
          value="$1,800.00"
        />
        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-gray-350 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[12px] text-gray-500">Current Status</span>
          </div>
          <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            Active
          </span>
        </div>
        <SummaryRow
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          label="Renewal Date"
          value="Jan 1, 2025"
        />
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[14px] font-semibold text-gray-800 mb-3">Actions</h3>

        {/* Primary action */}
        <button className="w-full flex items-center justify-between gap-3 border border-[#1a2a5e] rounded-xl px-4 py-3.5 hover:bg-[#f4f6fb] transition-colors group mb-2">
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-[#1a6bdc] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-left">
              <p className="text-[13px] font-semibold text-[#1a2a5e]">View Contribution History</p>
              <p className="text-[11px] text-gray-400 mt-0.5">See your past contributions and payments</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-[#1a2a5e] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>

        {/* Download */}
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group">
          <svg className="w-4 h-4 text-[#1a6bdc] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="text-[13px] font-semibold text-[#1a6bdc]">Download Membership Summary</span>
        </button>
      </div>

      {/* Upcoming Renewal */}
      <div className="bg-[#fff8f0] rounded-2xl border border-[#fed7aa] p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#ffedd5] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-[#ea580c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#ea580c]">Upcoming Renewal</p>
            <p className="text-[12px] text-gray-600 mt-1 leading-snug">
              Your membership will renew automatically on January 1, 2025.
            </p>
          </div>
        </div>
        <button className="w-full border border-[#ea580c] text-[#ea580c] text-[12px] font-semibold py-2.5 rounded-xl hover:bg-[#ffedd5] transition-colors">
          Manage Renewal Preferences
        </button>
      </div>
    </div>
  );
}
