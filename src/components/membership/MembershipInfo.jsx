const InfoRow = ({ icon, label, children }) => (
  <div className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-[#f4f6fb] flex items-center justify-center shrink-0 mt-0.5">
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
    </div>
    <div className="flex items-start justify-between w-full gap-6">
      <span className="text-[13px] text-gray-500 font-medium min-w-[160px] pt-0.5">{label}</span>
      <div className="flex-1 text-[13px] text-gray-800 font-medium text-right sm:text-left">{children}</div>
    </div>
  </div>
);

export default function MembershipInfo() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-[15px] font-semibold text-gray-800 mb-2">Membership Information</h3>

      <InfoRow
        icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        label="Membership Name"
      >
        Chai Society Membership
      </InfoRow>

      <InfoRow
        icon="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        label="Membership Tier"
      >
        <span className="inline-flex items-center gap-1.5 bg-[#eef1f9] text-[#1a2a5e] text-[12px] font-semibold px-3 py-1 rounded-full">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Chai Society
        </span>
      </InfoRow>

      <InfoRow
        icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        label="Membership Status"
      >
        <div className="flex items-center gap-2.5">
          <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            Active
          </span>
          <span className="text-[13px] text-gray-500">In good standing</span>
        </div>
      </InfoRow>

      <InfoRow
        icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        label="Start Date"
      >
        January 1, 2024
      </InfoRow>

      <InfoRow
        icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        label="Renewal Date"
      >
        <div className="flex items-center gap-2.5">
          January 1, 2025
          <span className="bg-[#dbeafe] text-[#1a6bdc] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            Next renewal in 152 days
          </span>
        </div>
      </InfoRow>

      <InfoRow
        icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        label="Annual Commitment"
      >
        $1,800.00
      </InfoRow>

      <InfoRow
        icon="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
        label="Membership Notes"
      >
        <span className="text-gray-500 leading-relaxed">
          Thank you for being a valued member of our community.
          Your membership supports our programs and initiatives.
        </span>
      </InfoRow>
    </div>
  );
}
