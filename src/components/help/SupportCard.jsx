export default function SupportCard({
  icon,
  iconBg,
  iconColor,
  title,
  description,
  primaryLabel,
  primaryHref,
  primaryExternal = false,
  primaryFilled = false,
  extraLines = [],   // [{text, href, style}]
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-7 flex flex-col gap-4">
      <div className="flex items-start gap-5">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
          <svg className={`w-6 h-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-gray-800 mb-1.5">{title}</p>
          <p className="text-[13px] text-gray-500 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Primary CTA */}
      <a
        href={primaryHref}
        target={primaryExternal ? "_blank" : undefined}
        rel={primaryExternal ? "noopener noreferrer" : undefined}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors w-fit
          ${primaryFilled
            ? "bg-[#1a2a5e] hover:bg-[#243672] text-white"
            : "border border-gray-200 hover:border-gray-300 text-[#1a2a5e]"
          }`}
      >
        {primaryLabel}
        {primaryExternal ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        )}
      </a>

      {/* Extra lines (phone, hours, email display, etc.) */}
      {extraLines.length > 0 && (
        <div className="space-y-0.5">
          {extraLines.map((line, i) =>
            line.href ? (
              <a key={i} href={line.href} className={`block text-[13px] font-semibold ${line.style || "text-[#1a6bdc] hover:underline"}`}>
                {line.text}
              </a>
            ) : (
              <p key={i} className={`text-[12px] ${line.style || "text-gray-400"}`}>{line.text}</p>
            )
          )}
        </div>
      )}
    </div>
  );
}
