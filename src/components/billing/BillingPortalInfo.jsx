const items = [
  {
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    title: "Update Card",
    description: "Update the card associated with your account.",
  },
  {
    icon: "M12 4v16m8-8H4",
    title: "Add New Card",
    description: "Add a new credit or debit card.",
  },
  {
    icon: "M3 21h18M5 21V9.5L12 4l7 5.5V21M9 21v-6h6v6M4 9.5h16",
    title: "Add ACH Account",
    description: "Add a bank account for ACH payments.",
  },
  {
    icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
    title: "Remove Payment Method",
    description: "Remove a payment method from your account.",
  },
  {
    icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    title: "Change Default Payment Method",
    description: "Set a different payment method as your default.",
  },
  {
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    title: "Manage Recurring Contribution",
    description: "Update amount, frequency, or cancel recurring contributions.",
  },
];

export default function BillingPortalInfo() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-[#1a6bdc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-[14px] font-semibold text-gray-800">What you can do in the Billing Portal</h3>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#eef1f9] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#1a6bdc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-800 leading-snug">{item.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
