import { useState } from "react";

export default function FiltersBar() {
  const [dateRange, setDateRange] = useState("Jan 1, 2024 - Dec 31, 2024");
  const [type, setType] = useState("All Types");

  return (
    <div className="bg-white rounded-t-2xl border border-gray-100 p-6">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-800 mb-4">Filters</h3>

          <div className="flex items-end gap-4 flex-wrap">
            {/* Date Range */}
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Date Range</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="appearance-none border border-gray-200 rounded-xl pl-9 pr-9 py-2.5 text-[13px] font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/10 cursor-pointer min-w-[260px]"
                >
                  <option>Jan 1, 2024 - Dec 31, 2024</option>
                  <option>Jan 1, 2023 - Dec 31, 2023</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Contribution Type */}
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Contribution Type</label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="appearance-none border border-gray-200 rounded-xl pl-4 pr-9 py-2.5 text-[13px] font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/10 cursor-pointer min-w-[200px]"
                >
                  <option>All Types</option>
                  <option>Monthly Membership</option>
                  <option>One-Time Donation</option>
                  <option>Annual Commitment</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-[#1a6bdc] text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 12m4-4v12" />
            </svg>
            Export
          </button>
          <button className="bg-[#1a2a5e] hover:bg-[#243672] text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
