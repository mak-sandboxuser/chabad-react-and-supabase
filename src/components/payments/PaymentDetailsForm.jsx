import { useEffect, useState } from "react";
import { formatCurrency } from "../../lib/format";

const CONTRIBUTION_TYPES = [
  { id: "monthly", label: "Monthly Membership" },
  { id: "one-time", label: "One-time Contribution" },
];

const AUTO_PAY_DAY = 5;

export default function PaymentDetailsForm({
  defaultAmount = "200",
  planLabel = "Membership",
  onPayWithStripe,
  paying = false,
}) {
  const [amount, setAmount] = useState(defaultAmount);
  const [contributionType, setContributionType] = useState("monthly");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const isMonthly = contributionType === "monthly";

  useEffect(() => {
    setAmount(defaultAmount);
  }, [defaultAmount]);

  const handlePay = async () => {
    setError("");
    const parsed = Number(isMonthly ? defaultAmount : amount);

    if (!parsed || parsed < 1) {
      setError("Please enter a valid amount (minimum ₹1).");
      return;
    }

    try {
      await onPayWithStripe?.({
        amount: parsed,
        contributionType,
        notes,
        autoPay: isMonthly,
        description: isMonthly
          ? `${planLabel} Membership — Monthly`
          : "One-time Contribution",
      });
    } catch (err) {
      setError(err.message || "Payment could not be started.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-[16px] font-semibold text-gray-800 mb-6">Payment Details</h3>

      <div className="mb-6">
        <label className="block text-[13px] font-semibold text-gray-700 mb-2">
          Contribution Type
        </label>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          {CONTRIBUTION_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setContributionType(type.id)}
              className={`rounded-xl border px-4 py-3 text-left text-[13px] font-medium transition-colors ${
                contributionType === type.id
                  ? "border-[#1a2a5e] bg-[#f4f6fb] text-[#1a2a5e]"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-[13px] font-semibold text-gray-700 mb-2">
          Amount <span className="text-[#e53e3e]">*</span>
        </label>
        <div className="relative max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-400 text-[15px] font-medium">₹</span>
          </div>
          <input
            type="number"
            min="1"
            step="1"
            value={isMonthly ? defaultAmount : amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isMonthly}
            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-[15px] font-medium text-gray-800
              focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/15 focus:border-[#1a2a5e] transition-all disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
        <p className="text-[12px] text-gray-400 mt-2">
          {isMonthly
            ? `${planLabel} plan monthly rate: ${formatCurrency(defaultAmount)}`
            : `Suggested amount: ${formatCurrency(defaultAmount)}`}
        </p>
      </div>

      {isMonthly && (
        <div className="mb-6 rounded-xl border-2 border-[#c7d2fe] bg-[#eef2ff] px-4 py-4">
          <p className="text-[14px] font-semibold text-[#1a2a5e]">Auto-Pay included</p>
          <p className="text-[12px] text-gray-600 mt-1">
            You pay {formatCurrency(defaultAmount)} today for your first month. After that, Stripe
            automatically charges {formatCurrency(defaultAmount)} on the {AUTO_PAY_DAY}th of each
            month from your saved card. Cancel anytime from Manage Billing.
          </p>
        </div>
      )}

      <div className="mb-6 rounded-xl border border-[#dbeafe] bg-[#f8fbff] px-4 py-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#635bff] flex items-center justify-center shrink-0">
          <span className="text-white text-[13px] font-bold">S</span>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-800">Pay securely with Stripe</p>
          <p className="text-[12px] text-gray-500 mt-0.5">
            You will be redirected to Stripe to complete payment with card. We never store your card details.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-[13px] font-semibold text-gray-700 mb-2">Optional Notes</label>
        <div className="relative">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 250))}
            placeholder="Add a note (optional)"
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[13px] text-gray-700 resize-none
              focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/15 focus:border-[#1a2a5e] transition-all placeholder:text-gray-400"
          />
          <span className="absolute bottom-2.5 right-3 text-[11px] text-gray-400">{notes.length}/250</span>
        </div>
      </div>

      {error && (
        <p className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={paying}
        className="flex items-center gap-2 bg-[#635bff] hover:bg-[#5851e5] disabled:opacity-60 text-white text-[13px] font-semibold px-5 py-3 rounded-xl transition-colors"
      >
        {paying
          ? "Redirecting to Stripe..."
          : isMonthly
            ? `Pay ${formatCurrency(defaultAmount)} & Enable Auto-Pay`
            : "Pay with Stripe"}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    </div>
  );
}
