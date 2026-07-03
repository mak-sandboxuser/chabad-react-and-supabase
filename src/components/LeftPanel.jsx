import ChabadLogo from "./ChabadLogo";
import FeatureItem from "./FeatureItem";

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0
          01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622
          5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Secure & Private",
    description: "Your information is protected with enterprise-grade security.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0
          00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Passwordless Access",
    description: "We'll send you a secure sign-in link to your email. No password needed.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7
          20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002
          5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0
          014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Membership Focused",
    description: "Manage your household, view history, make payments and stay up to date.",
  },
];

export default function LeftPanel() {
  return (
    <div className="flex flex-col justify-between h-full py-2">
      <div className="space-y-10">
        {/* Logo */}
        <ChabadLogo size="md" />

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-[#1a2a5e] leading-tight">
            Your Membership.<br />All in One Place.
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            Access your membership details, household information, contribution
            history, and billing all in one secure place.
          </p>
        </div>

        {/* Feature list */}
        <div className="space-y-5">
          {features.map((f) => (
            <FeatureItem key={f.title} icon={f.icon} title={f.title} description={f.description} />
          ))}
        </div>
      </div>

      {/* Trust badge */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mt-8">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2
            2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Trusted by Chabad Bedford Members
      </div>
    </div>
  );
}
