export default function NotificationItem({ icon, iconBg, iconColor, title, description, date, time, isUnread }) {
  return (
    <div className="flex items-start gap-4 px-6 py-5 hover:bg-gray-50/50 transition-colors cursor-pointer">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
        <svg className={`w-4.5 h-4.5 ${iconColor}`} style={{ width: "18px", height: "18px" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>

      {/* Title + description */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-gray-800 leading-snug">{title}</p>
        <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>

      {/* Date / time / unread dot */}
      <div className="flex items-center gap-2.5 shrink-0 pt-0.5">
        <span className="text-[13px] text-gray-400 whitespace-nowrap">{date}</span>
        <span className="text-gray-300">•</span>
        <span className="text-[13px] text-gray-400 whitespace-nowrap">{time}</span>
        {isUnread && <div className="w-2 h-2 rounded-full bg-[#1a6bdc] shrink-0" />}
      </div>
    </div>
  );
}
