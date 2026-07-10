import { Link } from "react-router-dom";

export default function RecentPayments({ payments = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-gray-800">All Payments</h3>
        <Link to="/contributions" className="text-[12px] text-[#1a6bdc] font-medium hover:underline">
          Full history
        </Link>
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
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
            {!payments.length && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-[12px] text-gray-400">
                  No payments yet. Enable Auto-Pay from the Payments page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
