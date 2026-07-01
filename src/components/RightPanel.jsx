import HowItWorksStep from "./HowItWorksStep";

const steps = [
  {
    number: 1,
    title: "Enter your email address",
    description: "Use the email associated with your Chabad Bedford membership.",
  },
  {
    number: 2,
    title: "Check your inbox",
    description: "We'll send you a secure sign-in link.",
  },
  {
    number: 3,
    title: "Click to sign in",
    description: "Click the link in your email to access your portal.",
  },
];

export default function RightPanel() {
  return (
    <div className="space-y-6 pt-2">
      {/* How it works */}
      <div className="space-y-5">
        <h3 className="font-semibold text-[#1a6bdc] text-sm tracking-wide">
          How it works
        </h3>
        <div className="space-y-5">
          {steps.map((step) => (
            <HowItWorksStep
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>

      {/* Security card */}
      <div className="border border-gray-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#eef1f9] flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-[#1a2a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2
              2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-[#1a2a5e] text-sm">Your security is our priority</p>
          <p className="text-gray-500 text-xs leading-snug mt-0.5">
            We use secure, industry-standard technology to protect your data.
          </p>
        </div>
      </div>
    </div>
  );
}
