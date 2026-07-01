import { useState } from "react";
import DonutChart from "./DonutChart";
import BarChart from "./BarChart";

const legendItems = [
  { color: "bg-[#1a6bdc]",  label: "Contributions Made",  value: "$1,125.00", valueColor: "text-[#16a34a]" },
  { color: "bg-[#dbeafe]",  label: "Pledged / Scheduled", value: "$0.00",     valueColor: "text-gray-700" },
  { color: "bg-[#fb923c]",  label: "Outstanding Balance",  value: "$675.00",   valueColor: "text-gray-700" },
  { color: "bg-transparent border border-gray-200", label: "Annual Commitment", value: "$1,800.00", valueColor: "text-gray-700" },
];

export default function YearlySummary() {
  const [year, setYear] = useState("This Year");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-800">Current Year Summary</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">January 1 – December 31, 2024</p>
        </div>
        {/* Year dropdown */}
        <div className="relative">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="appearance-none border border-gray-200 rounded-xl px-3 py-2 pr-8 text-[12px] font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/10 cursor-pointer"
          >
            <option>This Year</option>
            <option>2023</option>
            <option>2022</option>
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Chart area */}
      <div className="flex gap-6 mt-5">
        {/* Left: donut + legend */}
        <div className="flex items-center gap-6 w-[320px] shrink-0">
          <DonutChart percentage={62.5} />

          {/* Legend */}
          <div className="space-y-3 flex-1">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.color}`} />
                  <span className="text-[12px] text-gray-500 truncate">{item.label}</span>
                </div>
                <span className={`text-[12px] font-semibold shrink-0 ${item.valueColor}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-100 shrink-0" />

        {/* Right: bar chart */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[13px] font-semibold text-gray-700">Monthly Contributions</span>
            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <BarChart />
          {/* Legend */}
          <div className="flex items-center gap-2 mt-2 justify-center">
            <div className="w-3 h-3 rounded-sm bg-[#93c5fd]" />
            <span className="text-[11px] text-gray-500">Contributions</span>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="mt-5 bg-[#f4f6fb] rounded-xl px-4 py-3.5 flex items-start gap-3">
        <svg className="w-4 h-4 text-[#1a6bdc] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-[12px] text-gray-700">Thank you for your continued support of our community.</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Your contributions help us make a positive impact.</p>
        </div>
      </div>
    </div>
  );
}
