export default function FinancialRightPanel() {
  return (
    <div className="space-y-5">

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[14px] font-semibold text-gray-800 mb-3">Actions</h3>
        <div className="space-y-2.5">
          {/* Make Payment — primary */}
          <button className="w-full flex items-center justify-between gap-3 bg-[#1a2a5e] hover:bg-[#243672] text-white px-4 py-3 rounded-xl transition-colors">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-[13px] font-semibold">Make Payment</span>
            </div>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>

          {/* Manage Billing — outline */}
          <button className="w-full flex items-center justify-between gap-3 border border-gray-200 hover:border-gray-300 text-[#1a2a5e] px-4 py-3 rounded-xl transition-colors">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[13px] font-semibold">Manage Billing</span>
            </div>
            <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Account Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[14px] font-semibold text-gray-800 mb-3">Account Summary</h3>
        <div className="space-y-0">
          {[
            { label: "Membership",       value: "Chai Society", valueEl: <span className="text-[12px] font-semibold text-[#1a6bdc]">Chai Society</span> },
            { label: "Membership Status", value: null,          valueEl: <span className="bg-[#dcfce7] text-[#16a34a] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">Active</span> },
            { label: "Member Since",     value: "Jan 1, 2024",  valueEl: <span className="text-[12px] font-semibold text-gray-800">Jan 1, 2024</span> },
            { label: "Renewal Date",     value: "Jan 1, 2025",  valueEl: <span className="text-[12px] font-semibold text-gray-800">Jan 1, 2025</span> },
          ].map(({ label, valueEl }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-[12px] text-gray-500">{label}</span>
              {valueEl}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[14px] font-semibold text-gray-800 mb-3">Payment Methods</h3>

        {/* Card row */}
        <div className="flex items-center gap-3 py-2.5 border-b border-gray-50">
          <div className="w-9 h-7 bg-[#f4f6fb] rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <span className="flex-1 text-[13px] text-gray-700 font-medium">Visa ending in 4242</span>
          <span className="bg-[#dcfce7] text-[#16a34a] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">Primary</span>
        </div>

        {/* Add method */}
        <button className="flex items-center gap-2 mt-3 text-[13px] text-[#1a6bdc] font-semibold hover:underline">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Payment Method
        </button>
      </div>

      {/* Billing Contact */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold text-gray-800">Billing Contact</h3>
          <button className="text-[12px] text-[#1a6bdc] font-medium hover:underline">Edit</button>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[13px] text-gray-700 font-medium">John Doe</span>
          </div>
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-[13px] text-gray-600">john.doe@example.com</span>
          </div>
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-[13px] text-gray-600">(914) 555-1234</span>
          </div>
        </div>
      </div>

    </div>
  );
}
