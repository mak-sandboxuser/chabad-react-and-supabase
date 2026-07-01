const payments = [
  { date: "Apr 15, 2025", description: "Monthly Contribution", amount: "$300.00", status: "Paid" },
  { date: "Mar 15, 2025", description: "Monthly Contribution", amount: "$300.00", status: "Paid" },
  { date: "Feb 15, 2025", description: "Monthly Contribution", amount: "$300.00", status: "Paid" },
  { date: "Jan 15, 2025", description: "Annual Membership", amount: "$3,600.00", status: "Paid" },
];

export default function RecentPayments() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-gray-800">Recent Payments</h3>
        <a href="#" className="text-[12px] text-[#1a6bdc] font-medium hover:underline">View all</a>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-50">
            {["Date", "Description", "Amount", "Status"].map((h) => (
              <th key={h} className="text-left text-[11px] text-gray-400 font-medium pb-2.5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.map((p, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
              <td className="py-3 text-[12px] text-gray-500">{p.date}</td>
              <td className="py-3 text-[12px] text-gray-700">{p.description}</td>
              <td className="py-3 text-[12px] font-medium text-gray-700">{p.amount}</td>
              <td className="py-3">
                <span className="bg-[#dcfce7] text-[#16a34a] text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  {p.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 pt-3 border-t border-gray-50 text-center">
        <a href="#" className="text-[12px] text-[#1a6bdc] font-medium hover:underline">View all payments</a>
      </div>
    </div>
  );
}
