const contributions = [
  {
    description: "Monthly Membership Contribution",
    amount: "$150.00",
    frequency: "Monthly",
    nextCharge: "June 15, 2024",
    status: "Active",
  },
];

export default function RecurringContributions() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-[15px] font-semibold text-gray-800 mb-5">Active Recurring Contributions</h3>

      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {["Description", "Amount", "Frequency", "Next Charge Date", "Status", "Actions"].map((h) => (
              <th key={h} className="text-left text-[11px] text-gray-400 font-semibold pb-3 pr-4 last:pr-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contributions.map((c, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
              <td className="py-4 pr-4 text-[13px] text-gray-700 font-medium">{c.description}</td>
              <td className="py-4 pr-4 text-[13px] text-gray-700 font-semibold">{c.amount}</td>
              <td className="py-4 pr-4 text-[13px] text-gray-600">{c.frequency}</td>
              <td className="py-4 pr-4 text-[13px] text-gray-600">{c.nextCharge}</td>
              <td className="py-4 pr-4">
                <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  {c.status}
                </span>
              </td>
              <td className="py-4">
                <button className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 pt-3 border-t border-gray-50 text-center">
        <button className="flex items-center gap-1.5 text-[13px] text-[#1a6bdc] font-medium hover:underline mx-auto">
          View All Recurring Contributions
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
