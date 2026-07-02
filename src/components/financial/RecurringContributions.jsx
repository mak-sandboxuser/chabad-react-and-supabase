export default function RecurringContributions({ contributions = [] }) {
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
              <td className="py-4 pr-4 text-[13px] text-gray-600 capitalize">{c.frequency}</td>
              <td className="py-4 pr-4 text-[13px] text-gray-600">{c.nextCharge}</td>
              <td className="py-4 pr-4">
                <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize">
                  {c.status}
                </span>
              </td>
              <td className="py-4" />
            </tr>
          ))}
          {!contributions.length && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-[13px] text-gray-400">
                No recurring contributions yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
