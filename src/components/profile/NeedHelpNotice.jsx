export default function NeedHelpNotice() {
  return (
    <div className="bg-[#f4f6fb] rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-800">Need to update something else?</p>
          <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
            Some information is managed by our team.
          </p>
          <button className="flex items-center gap-1.5 text-[13px] text-[#1a6bdc] font-semibold hover:underline mt-2">
            Contact Support
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
