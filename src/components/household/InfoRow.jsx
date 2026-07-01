export default function InfoRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0">
      {/* Icon */}
      <div className="w-9 h-9 rounded-xl bg-[#f4f6fb] flex items-center justify-center shrink-0 mt-0.5">
        <svg className="text-gray-400" style={{ width: "17px", height: "17px" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>

      {/* Label + value */}
      <div className="flex items-start justify-between w-full gap-8 min-w-0">
        <span className="text-[13px] text-gray-500 font-medium shrink-0 w-[180px]">{label}</span>
        <div className="flex-1 text-[13px] text-gray-800 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
