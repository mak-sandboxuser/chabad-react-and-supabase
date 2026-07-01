export default function SettingsCategoryRow({
  icon,
  iconBg,
  iconColor,
  title,
  description,
  subtitle,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-6 px-7 py-6 hover:bg-gray-50/60 transition-colors text-left group"
    >
      {/* Icon circle */}
      <div className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
        <svg
          className={`w-6 h-6 ${iconColor}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.7}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-gray-800 leading-snug mb-1">{title}</p>
        <p className="text-[13px] text-gray-500 leading-snug">{description}</p>
        <p className="text-[12px] text-gray-400 mt-1">{subtitle}</p>
      </div>

      {/* Chevron */}
      <svg
        className="w-5 h-5 text-gray-300 group-hover:text-gray-400 shrink-0 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
