import { useEffect, useState } from "react";

const features = [
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Secure & Encrypted",
    description: "Your payment information is protected with bank-level security.",
  },
  {
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    title: "Manage Easily",
    description: "Update payment methods, view history, and manage subscriptions.",
  },
  {
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    title: "Powered by Stripe",
    description: "We partner with Stripe to provide a reliable and secure billing experience.",
  },
];

export default function BillingRedirectCard({ onCancel, redirectUrl = "#" }) {
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-10 py-12 flex flex-col items-center text-center">
      {/* Animated icon */}
      <div className="relative w-24 h-24 mb-7">
        <div className="absolute inset-0 rounded-full bg-[#eef1f9] flex items-center justify-center">
          <svg className="w-9 h-9 text-[#1a6bdc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        {/* Stripe "S" badge */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#635bff] flex items-center justify-center border-4 border-white">
          <span className="text-white text-[13px] font-bold">S</span>
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-[24px] font-bold text-[#1a2a5e] mb-2">Redirecting to Secure Billing Portal</h2>
      <p className="text-[14px] text-gray-500 max-w-md leading-relaxed mb-10">
        You are being redirected to our secure billing portal powered by Stripe.
      </p>

      {/* 3 feature columns */}
      <div className="grid grid-cols-3 gap-8 w-full max-w-2xl mb-8">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col items-center text-center">
            <svg className="w-6 h-6 text-[#1a6bdc] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
            </svg>
            <p className="text-[13px] font-semibold text-gray-800 mb-1.5">{f.title}</p>
            <p className="text-[12px] text-gray-500 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>

      {/* Redirecting status box */}
      <div className="w-full bg-[#f4f6fb] rounded-2xl px-6 py-5 flex items-start gap-4 text-left mb-7">
        {/* Spinner */}
        <div className="shrink-0 mt-0.5">
          <svg className="w-6 h-6 text-[#1a6bdc] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
          </svg>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-gray-800 mb-1">Redirecting...</p>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            You will be redirected to the Stripe Customer Billing Portal in a few seconds.
          </p>
          <p className="text-[13px] text-gray-500 leading-relaxed mt-1">
            If you are not redirected automatically, click the button below.
          </p>
        </div>
      </div>

      {/* CTA */}
      <a
        href={redirectUrl}
        className="flex items-center gap-2 bg-[#1a6bdc] hover:bg-[#155bc0] text-white text-[14px] font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Go to Billing Portal
      </a>

      <button
        onClick={onCancel}
        className="mt-4 text-[13px] text-[#1a6bdc] font-medium hover:underline"
      >
        Cancel and return to dashboard
      </button>
    </div>
  );
}
