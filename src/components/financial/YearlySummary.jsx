import { useState } from "react";
import { formatCurrency } from "../../lib/format";
import DonutChart from "./DonutChart";
import BarChart from "./BarChart";

export default function YearlySummary({ summary, monthlyChart = [] }) {
  const [year, setYear] = useState("This Year");
  const currentYear = new Date().getFullYear();

  if (!summary) return null;

  const legendItems = [
    { color: "bg-[#1a6bdc]", label: "Contributions Made", value: formatCurrency(summary.contributed), valueColor: "text-[#16a34a]" },
    { color: "bg-[#dbeafe]", label: "Pledged / Scheduled", value: formatCurrency(summary.pledged), valueColor: "text-gray-700" },
    { color: "bg-[#fb923c]", label: "Outstanding Balance", value: formatCurrency(summary.outstanding), valueColor: "text-gray-700" },
    { color: "bg-transparent border border-gray-200", label: "Annual Commitment", value: formatCurrency(summary.commitment), valueColor: "text-gray-700" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-800">Current Year Summary</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">January 1 – December 31, {currentYear}</p>
        </div>
        <div className="relative">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="appearance-none border border-gray-200 rounded-xl px-3 py-2 pr-8 text-[12px] font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/10 cursor-pointer"
          >
            <option>This Year</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6 mt-5">
        <div className="flex items-center gap-6 w-[320px] shrink-0">
          <DonutChart percentage={summary.percent || 0} />
          <div className="space-y-3 flex-1">
            {legendItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.color}`} />
                  <span className="text-[12px] text-gray-500 truncate">{item.label}</span>
                </div>
                <span className={`text-[12px] font-semibold shrink-0 ${item.valueColor}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-px bg-gray-100 shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[13px] font-semibold text-gray-700">Monthly Contributions</span>
          </div>
          <BarChart values={monthlyChart} />
        </div>
      </div>
    </div>
  );
}
