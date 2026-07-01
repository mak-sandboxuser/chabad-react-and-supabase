const variants = {
  success: {
    bg: "bg-[#f0fdf4]",
    border: "border-[#bbf7d0]",
    titleColor: "text-[#16a34a]",
    iconBg: "bg-[#16a34a]",
    icon: "M5 13l4 4L19 7",
  },
  error: {
    bg: "bg-[#fef2f2]",
    border: "border-[#fecaca]",
    titleColor: "text-[#e53e3e]",
    iconBg: "bg-[#e53e3e]",
    icon: "M6 18L18 6M6 6l12 12",
  },
  warning: {
    bg: "bg-[#fffbeb]",
    border: "border-[#fde68a]",
    titleColor: "text-[#b45309]",
    iconBg: "bg-[#f59e0b]",
    icon: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
  },
};

export default function AlertBanner({ variant = "success", title, description, onDismiss }) {
  const v = variants[variant];

  return (
    <div className={`${v.bg} border ${v.border} rounded-2xl px-5 py-4 flex items-start justify-between gap-4`}>
      <div className="flex items-start gap-3">
        <div className={`w-6 h-6 rounded-full ${v.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={v.icon} />
          </svg>
        </div>
        <div>
          <p className={`text-[14px] font-bold ${v.titleColor}`}>{title}</p>
          <p className="text-[13px] text-gray-600 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <button onClick={onDismiss} className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
