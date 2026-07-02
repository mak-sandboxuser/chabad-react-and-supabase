const defaultNotifications = [
  {
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    iconBg: "bg-[#dcfce7]",
    iconColor: "text-[#16a34a]",
    title: "Payment Successful",
    body: "Your payment of $300.00 was processed successfully.",
    time: "2h ago",
  },
  {
    icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    iconBg: "bg-[#dbeafe]",
    iconColor: "text-[#1a6bdc]",
    title: "Upcoming Contribution",
    body: "Your next contribution of $300.00 is scheduled for May 15, 2025.",
    time: "1d ago",
  },
  {
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    iconBg: "bg-[#fef9c3]",
    iconColor: "text-[#ca8a04]",
    title: "Payment Method Expiring",
    body: "Visa ending in 4242 expires on 06/30/2025.",
    time: "2d ago",
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    iconBg: "bg-[#ede9fe]",
    iconColor: "text-[#7c3aed]",
    title: "Membership Update",
    body: "Your membership is set to renew on Jan 15, 2026.",
    time: "5d ago",
  },
];

const notificationTypeStyles = {
  success: { iconBg: "bg-[#dcfce7]", iconColor: "text-[#16a34a]" },
  info: { iconBg: "bg-[#dbeafe]", iconColor: "text-[#1a6bdc]" },
  warning: { iconBg: "bg-[#fef9c3]", iconColor: "text-[#ca8a04]" },
  household: { iconBg: "bg-[#ede9fe]", iconColor: "text-[#7c3aed]" },
};

const defaultInfoIcon =
  "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";

export default function NotificationsPanel({ notifications = defaultNotifications }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-gray-800">Notifications</h3>
        <a href="#" className="text-[12px] text-[#1a6bdc] font-medium hover:underline">View all</a>
      </div>

      <div className="space-y-4">
        {notifications.map((n, i) => {
          const style = notificationTypeStyles[n.type] || notificationTypeStyles.info;
          return (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full ${n.iconBg || style.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
              <svg className={`w-4 h-4 ${n.iconColor || style.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={n.icon || defaultInfoIcon} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] font-semibold text-gray-800 leading-snug">{n.title}</p>
                <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{n.time}</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{n.body}</p>
            </div>
          </div>
        )})}
        {!notifications.length && (
          <p className="text-[12px] text-gray-400">No notifications yet.</p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 text-center">
        <a href="#" className="text-[12px] text-[#1a6bdc] font-medium hover:underline">View all notifications</a>
      </div>
    </div>
  );
}
