const arrowIcons = {
  right: "M17 8l4 4m0 0l-4 4m4-4H3",
  external: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14",
  phone: "M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
};

const buttonStyles = {
  filled: "bg-[#1a6bdc] hover:bg-[#1558ba] text-white",
  outline: "border border-[#1a6bdc] text-[#1a6bdc] hover:bg-[#eef4fd]",
};

export default function HelpOptionCard({
  title,
  desc,
  icon,
  iconBg,
  iconColor,
  button,
  detail,
  detailSub,
  onAction,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
          <svg className={`w-5 h-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-gray-900">{title}</p>
          <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>

      <div className="mt-4 ml-16">
        <button
          onClick={onAction}
          className={`inline-flex items-center gap-2 text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-colors ${buttonStyles[button.variant]}`}
        >
          {button.label}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={arrowIcons[button.arrow]} />
          </svg>
        </button>

        {detail && (
          <p className="text-[13px] text-[#1a6bdc] font-medium mt-2.5">{detail}</p>
        )}
        {detailSub && (
          <p className="text-[12px] text-gray-400 mt-0.5">{detailSub}</p>
        )}
      </div>
    </div>
  );
}
