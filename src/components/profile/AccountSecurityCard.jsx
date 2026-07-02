import { formatDate, formatTime } from "../../lib/format";

export default function AccountSecurityCard({ lastSignIn }) {
  const display = lastSignIn
    ? `${formatDate(lastSignIn)} at ${formatTime(lastSignIn)}`
    : "Not available";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <svg className="w-4 h-4 text-[#1a2a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="text-[14px] font-semibold text-gray-800">Account Security</h3>
      </div>

      <p className="text-[13px] font-semibold text-gray-700 mb-1">Your account is secure</p>
      <p className="text-[12px] text-gray-500 leading-relaxed">
        You last signed in on<br />{display}
      </p>

      <button className="flex items-center gap-1.5 text-[13px] text-[#1a6bdc] font-semibold hover:underline mt-3">
        View Login History
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    </div>
  );
}
