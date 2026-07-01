export default function ContributionSummary() {
  const totalCommitment = 3600;
  const totalContributed = 1950;
  const outstanding = 1650;
  const nextAmount = 300;
  const progress = Math.round((totalContributed / totalCommitment) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-[15px] font-semibold text-gray-800 mb-5">Contribution Summary</h3>

      <div className="grid grid-cols-3 gap-6">
        {/* Total Contributed */}
        <div>
          <p className="text-[12px] text-gray-400 font-medium mb-2">Total Contributed (YTD)</p>
          <p className="text-[22px] font-bold text-[#16a34a] leading-none">${totalContributed.toLocaleString()}.00</p>
          <p className="text-[11px] text-gray-400 mt-1">of ${totalCommitment.toLocaleString()}.00 commitment</p>
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
          <p className="text-[22px] font-bold text-[#e53e3e] leading-none">${outstanding.toLocaleString()}.00</p>
          <p className="text-[11px] text-gray-400 mt-1">Due by Dec 31, 2025</p>
          <button className="mt-3 w-full bg-[#1a2a5e] hover:bg-[#243672] text-white text-[12px] font-semibold py-2.5 rounded-xl transition-colors">
            Make Payment
          </button>
        </div>

        {/* Next Scheduled */}
        <div>
          <p className="text-[12px] text-gray-400 font-medium mb-2">Next Scheduled Contribution</p>
          <p className="text-[22px] font-bold text-[#1a2a5e] leading-none">${nextAmount.toLocaleString()}.00</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[11px] text-gray-400">May 15, 2025</p>
            <span className="bg-[#dcfce7] text-[#16a34a] text-[10px] font-semibold px-2 py-0.5 rounded-full">
              In 12 days
            </span>
          </div>
          <button className="mt-3 w-full border border-gray-200 hover:border-gray-300 text-[#1a2a5e] text-[12px] font-semibold py-2.5 rounded-xl transition-colors">
            Manage Billing
          </button>
        </div>
      </div>
    </div>
  );
}
