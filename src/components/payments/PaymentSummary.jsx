import { formatCurrency } from "../../lib/format";

export default function PaymentSummary({
  contributionType = "Monthly Membership",
  amount = "200",
  processingFee = "0",
  paid = false,
}) {
  const amountNum = Number(amount) || 0;
  const feeNum = Number(processingFee) || 0;
  const total = amountNum + feeNum;

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
          <span className="text-[12px] font-semibold text-gray-800">{formatCurrency(amountNum)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-gray-500">Processing Fee</span>
          </div>
          <span className="text-[12px] font-semibold text-gray-800">{formatCurrency(feeNum)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500">Payment Provider</span>
          <span className="text-[12px] font-semibold text-[#635bff]">Stripe</span>
        </div>
      </div>

      <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
        <span className="text-[14px] font-bold text-gray-800">{paid ? "Paid" : "Total"}</span>
        <span className={`text-[18px] font-bold ${paid ? "text-[#16a34a]" : "text-[#16a34a]"}`}>
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
