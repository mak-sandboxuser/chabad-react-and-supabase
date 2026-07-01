export default function PrivacySecurityBanner() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-7 py-5 flex items-center gap-5">
      {/* Shield icon */}
      <div className="w-12 h-12 rounded-full bg-[#eef1f9] flex items-center justify-center shrink-0">
        <svg
          className="w-5 h-5 text-[#1a2a5e]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.7}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-gray-800 mb-1">Your Privacy & Security Matter</p>
        <p className="text-[13px] text-gray-500 leading-relaxed">
          We take your privacy and security seriously. Your information is encrypted and never shared
          without your permission.
        </p>
      </div>

      {/* Privacy Policy button */}
      <button className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-[#1a2a5e] text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0">
        Privacy Policy
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </button>
    </div>
  );
}
