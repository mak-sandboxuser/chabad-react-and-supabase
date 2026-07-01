const steps = [
  { num: 1, title: "Payment Details",  desc: "Enter amount and payment method" },
  { num: 2, title: "Review Payment",   desc: "Review your payment details" },
  { num: 3, title: "Confirmation",     desc: "Payment confirmation" },
];

export default function PaymentStepper({ currentStep = 1 }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-8 py-6">
      <div className="flex items-center">
        {steps.map((step, i) => {
          const isActive = step.num === currentStep;
          const isDone = step.num < currentStep;
          return (
            <div key={step.num} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + text */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold
                    ${isActive
                      ? "bg-[#1a6bdc] text-white"
                      : isDone
                        ? "bg-[#16a34a] text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                >
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.num
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-[13px] font-semibold ${isActive || isDone ? "text-gray-800" : "text-gray-400"}`}>
                    {step.title}
                  </p>
                  <p className="text-[11px] text-gray-400">{step.desc}</p>
                </div>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-200 mx-5 min-w-[24px]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
