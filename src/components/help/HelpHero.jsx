export default function HelpHero() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-8 py-7 flex items-center gap-6">
      <div className="w-16 h-16 rounded-full bg-[#eef1f9] flex items-center justify-center shrink-0">
        <svg className="w-7 h-7 text-[#1a2a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <div>
        <h2 className="text-[20px] font-bold text-[#1a2a5e] mb-1">How can we help you?</h2>
        <p className="text-[13px] text-gray-500">Choose an option below to find the support you need.</p>
      </div>
    </div>
  );
}
