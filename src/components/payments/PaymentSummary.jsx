export default function PaymentSummary({
  contributionType = "One-time Contribution",
  amount = "150.00",
  processingFee = "0.00",
}) {
  const total = (parseFloat(amount) + parseFloat(processingFee)).toFixed(2);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-[14px] font-semibold text-gray-800 mb-4">Payment Summary</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500">Contribution Type</span>
          <span className="text-[12px] font-semibold text-gray-800">{contributionType}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500">Amount</span>
          <span className="text-[12px] font-semibold text-gray-800">${amount}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-gray-500">Processing Fee</span>
            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-[12px] font-semibold text-gray-800">${processingFee}</span>
        </div>
      </div>

      <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
        <span className="text-[14px] font-bold text-gray-800">Total</span>
        <span className="text-[18px] font-bold text-[#16a34a]">${total}</span>
      </div>
    </div>
  );
}
