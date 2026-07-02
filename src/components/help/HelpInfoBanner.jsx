export default function HelpInfoBanner() {
  return (
    <div className="bg-[#f4f6fb] rounded-2xl border border-gray-100 px-7 py-5 flex items-center gap-5">
      <div className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-[#1a6bdc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p className="text-[14px] font-bold text-gray-800">We're here to help!</p>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Our support team is dedicated to providing you with the best possible experience.
        </p>
      </div>
    </div>
  );
}
