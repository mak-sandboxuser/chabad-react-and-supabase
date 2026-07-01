export default function ResultsSummary({ count = 18, total = "$1,125.00" }) {
  return (
    <div className="bg-gray-50/70 border-x border-gray-100 px-6 py-3 flex items-center justify-between">
      <p className="text-[13px] text-gray-600">
        Showing <span className="font-semibold text-gray-800">{count}</span> transactions
      </p>
      <p className="text-[13px] text-gray-600">
        Total Contributions: <span className="font-bold text-gray-900">{total}</span>
      </p>
    </div>
  );
}
