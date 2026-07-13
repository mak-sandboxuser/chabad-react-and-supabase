import { useState } from "react";
import { formatCurrency, PLAN_PRICES } from "../../lib/format";
import PaymentMethodCard from "./PaymentMethodCard";

const CARD_ICON = "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z";
const BANK_ICON = "M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m4-11v11m4-11v11m4-11v11";

export default function PaymentDetailsForm({
  defaultAmount = "100",
  planLabel = "Membership",
  planKey = "",
  testMode = false,
  testMinutes = 10,
  onPayWithStripe,
  paying = false,
}) {
  const [autoPay, setAutoPay] = useState(true);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [error, setError] = useState("");

  const monthly = Number(defaultAmount) || 100;
  const annual = planKey && PLAN_PRICES[planKey] ? PLAN_PRICES[planKey] : monthly * 12;
  const isBank = paymentMethod === "bank";

  const handlePay = async () => {
    setError("");

    if (!autoPay) {
      setError("Turn on Auto-Pay to continue. Membership is billed monthly with Auto-Pay.");
      return;
    }

    if (!monthly || monthly < 1) {
      setError("Membership monthly amount is missing. Choose a plan at signup first.");
      return;
    }

    try {
      await onPayWithStripe?.({
        amount: monthly,
        contributionType: "monthly",
        notes,
        autoPay: true,
        paymentMethod,
        description: `${planLabel} Membership — Monthly Auto-Pay`,
      });
    } catch (err) {
      setError(err.message || "Payment could not be started.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-[16px] font-semibold text-gray-800 mb-6">Membership Auto-Pay</h3>

      <div className="mb-6 rounded-xl border border-gray-100 bg-[#f8fafc] px-4 py-4">
        <p className="text-[12px] text-gray-400 font-medium mb-1">Selected plan</p>
        <p className="text-[15px] font-semibold text-[#1a2a5e]">{planLabel} Membership</p>
        <p className="text-[13px] text-gray-600 mt-1">
          {formatCurrency(annual)} / year · {formatCurrency(monthly)} / month
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-[13px] font-semibold text-gray-700 mb-2">
          Monthly amount
        </label>
        <div className="relative max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-400 text-[15px] font-medium">₹</span>
          </div>
          <input
            type="text"
            value={monthly}
            disabled
            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-[15px] font-medium text-gray-800 bg-gray-50"
          />
        </div>
        <p className="text-[12px] text-gray-400 mt-2">
          Fixed by your membership plan. You pay this amount today, then on Auto-Pay.
        </p>
      </div>

      <label className="mb-6 flex items-start gap-3 rounded-xl border-2 border-[#c7d2fe] bg-[#eef2ff] px-4 py-4 cursor-pointer">
        <input
          type="checkbox"
          checked={autoPay}
          onChange={(e) => setAutoPay(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-gray-300 text-[#1a2a5e] focus:ring-[#1a2a5e]"
        />
        <span>
          <span className="block text-[14px] font-semibold text-[#1a2a5e]">Enable Auto-Pay</span>
          <span className="block text-[12px] text-gray-600 mt-1">
            {testMode
              ? `Pay ${formatCurrency(monthly)} now. For testing, Stripe will charge again every ${testMinutes} minutes.`
              : `Pay ${formatCurrency(monthly)} now. Stripe will charge the same amount automatically on this date each month.`}
          </span>
        </span>
      </label>

      <div className="mb-6">
        <label className="block text-[13px] font-semibold text-gray-700 mb-2">Payment method</label>
        <div className="grid grid-cols-2 gap-3">
          <PaymentMethodCard
            icon={CARD_ICON}
            iconColor="text-[#635bff]"
            title="Card"
            description="Debit or credit card. Billed in ₹ (INR)."
            selected={!isBank}
            onSelect={() => setPaymentMethod("card")}
          />
          <PaymentMethodCard
            icon={BANK_ICON}
            iconColor="text-[#0f766e]"
            title="Bank account"
            description="Direct debit (ACH). Billed in $ (USD)."
            selected={isBank}
            onSelect={() => setPaymentMethod("bank")}
          />
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-[#dbeafe] bg-[#f8fbff] px-4 py-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#635bff] flex items-center justify-center shrink-0">
          <span className="text-white text-[13px] font-bold">S</span>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-800">Pay securely with Stripe</p>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {isBank
              ? "You will be redirected to Stripe to link and verify your bank account. Bank debits are billed in USD and may take a few days to settle. We never store your bank details."
              : "You will be redirected to Stripe to complete payment with card. We never store your card details."}
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
        disabled={paying || !autoPay}
        className="flex items-center gap-2 bg-[#635bff] hover:bg-[#5851e5] disabled:opacity-60 text-white text-[13px] font-semibold px-5 py-3 rounded-xl transition-colors"
      >
        {paying
          ? "Redirecting to Stripe..."
          : `Pay ${isBank ? `$${monthly}` : formatCurrency(monthly)} by ${isBank ? "bank" : "card"} & Enable Auto-Pay`}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    </div>
  );
}
