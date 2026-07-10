import { Link } from "react-router-dom";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function ContributionSummary({ summary }) {
  const totalCommitment = Number(summary?.totalCommitment || 0);
  const totalContributed = Number(summary?.totalContributed || 0);
  const outstanding = Number(summary?.outstanding || 0);
  const nextAmount = Number(summary?.nextAmount || 0);
  const autoPayEnabled = Boolean(summary?.autoPayEnabled);
  const nextDueDate = summary?.nextDueDate
    ? new Date(summary.nextDueDate).toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "No schedule";
  const progress = totalCommitment ? Math.min(100, Math.round((totalContributed / totalCommitment) * 100)) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-[15px] font-semibold text-gray-800 mb-5">Contribution Summary</h3>

      <div className="grid grid-cols-3 gap-6">
        {/* Total Contributed */}
        <div>
          <p className="text-[12px] text-gray-400 font-medium mb-2">Total Contributed</p>
          <p className="text-[22px] font-bold text-[#16a34a] leading-none">{currencyFormatter.format(totalContributed)}</p>
          <p className="text-[11px] text-gray-400 mt-1">of {currencyFormatter.format(totalCommitment)} annual commitment</p>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-[#16a34a] h-2 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{progress}%</p>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div>
          <p className="text-[12px] text-gray-400 font-medium mb-2">Outstanding Balance</p>
          <p className="text-[22px] font-bold text-[#e53e3e] leading-none">{currencyFormatter.format(outstanding)}</p>
          <p className="text-[11px] text-gray-400 mt-1">Remaining toward annual commitment</p>
          <Link
            to="/payments"
            className="mt-3 w-full inline-flex justify-center bg-[#1a2a5e] hover:bg-[#243672] text-white text-[12px] font-semibold py-2.5 rounded-xl transition-colors"
          >
            Make Payment
          </Link>
        </div>

        {/* Next Scheduled */}
        <div>
          <p className="text-[12px] text-gray-400 font-medium mb-2">Next Scheduled Contribution</p>
          <p className="text-[22px] font-bold text-[#1a2a5e] leading-none">{currencyFormatter.format(nextAmount)}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-[11px] text-gray-400">
              {autoPayEnabled ? `Auto-pay · ${nextDueDate}` : nextDueDate}
            </p>
            {autoPayEnabled && (
              <span className="bg-[#ede9fe] text-[#7c3aed] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Auto-Pay
              </span>
            )}
          </div>
          <Link
            to="/recurring"
            className="mt-3 w-full inline-flex justify-center border border-gray-200 hover:border-gray-300 text-[#1a2a5e] text-[12px] font-semibold py-2.5 rounded-xl transition-colors"
          >
            Manage Billing
          </Link>
        </div>
      </div>
    </div>
  );
}
