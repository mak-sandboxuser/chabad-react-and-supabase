import { useState } from "react";
import PaymentMethodCard from "./PaymentMethodCard";

const methods = [
  {
    id: "credit",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    iconColor: "text-[#1a6bdc]",
    title: "Credit Card",
    description: "Pay securely using your credit card",
  },
  {
    id: "debit",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    iconColor: "text-[#16a34a]",
    title: "Debit Card",
    description: "Pay securely using your debit card",
  },
  {
    id: "ach",
    icon: "M3 21h18M5 21V9.5L12 4l7 5.5V21M9 21v-6h6v6M4 9.5h16",
    iconColor: "text-[#7c3aed]",
    title: "ACH Bank Transfer",
    description: "Transfer directly from your bank account",
  },
];

export default function PaymentDetailsForm({ onContinue }) {
  const [amount, setAmount] = useState("150.00");
  const [method, setMethod] = useState("credit");
  const [notes, setNotes] = useState("");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-[16px] font-semibold text-gray-800 mb-6">Payment Details</h3>

      {/* Amount */}
      <div className="mb-6">
        <label className="block text-[13px] font-semibold text-gray-700 mb-2">
          Amount <span className="text-[#e53e3e]">*</span>
        </label>
        <div className="relative max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-400 text-[15px] font-medium">$</span>
          </div>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-[15px] font-medium text-gray-800
              focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/15 focus:border-[#1a2a5e] transition-all"
          />
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <label className="block text-[13px] font-semibold text-gray-700 mb-3">
          Payment Method <span className="text-[#e53e3e]">*</span>
        </label>
        <div className="grid grid-cols-3 gap-4">
          {methods.map((m) => (
            <PaymentMethodCard
              key={m.id}
              icon={m.icon}
              iconColor={m.iconColor}
              title={m.title}
              description={m.description}
              selected={method === m.id}
              onSelect={() => setMethod(m.id)}
            />
          ))}
        </div>
      </div>

      {/* Optional Notes */}
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

      {/* Continue button */}
      <button
        onClick={() => onContinue?.({ amount, method, notes })}
        className="flex items-center gap-2 bg-[#1a2a5e] hover:bg-[#243672] text-white text-[13px] font-semibold px-5 py-3 rounded-xl transition-colors"
      >
        Continue to Review
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    </div>
  );
}
