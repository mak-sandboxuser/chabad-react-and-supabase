export default function EncouragementBanner() {
  return (
    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl px-6 py-4 flex items-center gap-4">
      <div className="w-9 h-9 rounded-full bg-[#16a34a] flex items-center justify-center shrink-0">
        <svg className="w-4.5 h-4.5 text-white" style={{ width: "18px", height: "18px" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <div>
        <p className="text-[14px] font-bold text-[#16a34a]">Your contribution makes a difference</p>
        <p className="text-[13px] text-gray-600 mt-0.5">Thank you for supporting Chabad Bedford and our community.</p>
      </div>
    </div>
  );
}
