const statusStyles = {
  Completed: "bg-[#dcfce7] text-[#16a34a]",
  Pending: "bg-[#fef3c7] text-[#ca8a04]",
  Failed: "bg-[#fee2e2] text-[#e53e3e]",
};

const MethodIcon = ({ type }) =>
  type === "bank" ? (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V9.5L12 4l7 5.5V21M9 21v-6h6v6M4 9.5h16" />
    </svg>
  ) : (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );

export default function TransactionsTable({ transactions = [] }) {
  return (
    <div className="bg-white border-x border-b border-gray-100 rounded-b-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/40">
            <th className="text-left text-[12px] text-gray-600 font-semibold pl-6 pr-4 py-3.5">Transaction Date</th>
            <th className="text-left text-[12px] text-gray-600 font-semibold px-4 py-3.5">Amount</th>
            <th className="text-left text-[12px] text-gray-600 font-semibold px-4 py-3.5">Payment Method</th>
            <th className="text-left text-[12px] text-gray-600 font-semibold px-4 py-3.5">Status</th>
            <th className="text-left text-[12px] text-gray-600 font-semibold px-4 py-3.5">Reference Number</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
              <td className="pl-6 pr-4 py-4 text-[13px] text-gray-700 font-medium">{t.date}</td>
              <td className="px-4 py-4 text-[13px] text-gray-800 font-semibold">{t.amount}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <MethodIcon type={t.method} />
                  <span className="text-[13px] text-gray-600">{t.methodLabel}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[t.status] || statusStyles.Pending}`}>
                  {t.status}
                </span>
              </td>
              <td className="px-4 py-4 text-[13px] text-gray-500 font-mono">{t.ref}</td>
            </tr>
          ))}
          {!transactions.length && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-[13px] text-gray-400">
                No transactions yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
