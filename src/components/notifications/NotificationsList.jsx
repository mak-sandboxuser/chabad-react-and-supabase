import NotificationItem from "./NotificationItem";

export const notificationsData = [
  {
    icon: "M5 13l4 4L19 7",
    iconBg: "bg-[#dcfce7]",
    iconColor: "text-[#16a34a]",
    title: "Payment Successful",
    description: "Your payment of $150.00 was processed successfully.",
    date: "May 15, 2024",
    time: "10:24 AM",
    isUnread: true,
  },
  {
    icon: "M6 18L18 6M6 6l12 12",
    iconBg: "bg-[#fee2e2]",
    iconColor: "text-[#e53e3e]",
    title: "Payment Failed",
    description: "We were unable to process your payment of $75.00.",
    date: "May 12, 2024",
    time: "3:15 PM",
    isUnread: true,
  },
  {
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    iconBg: "bg-[#dbeafe]",
    iconColor: "text-[#1a6bdc]",
    title: "Recurring Contribution Created",
    description: "Your recurring contribution of $150.00 (Monthly) has been created.",
    date: "May 10, 2024",
    time: "9:08 AM",
    isUnread: true,
  },
  {
    icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    iconBg: "bg-[#dbeafe]",
    iconColor: "text-[#1a6bdc]",
    title: "Recurring Contribution Updated",
    description: "Your recurring contribution has been updated.",
    date: "May 8, 2024",
    time: "11:42 AM",
    isUnread: true,
  },
  {
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    iconBg: "bg-[#ffedd5]",
    iconColor: "text-[#ea580c]",
    title: "Payment Method Expiring",
    description: "Your Visa ending in 4242 will expire on 12/26. Please update your payment method.",
    date: "May 5, 2024",
    time: "8:30 AM",
    isUnread: true,
  },
  {
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    iconBg: "bg-[#ede9fe]",
    iconColor: "text-[#7c3aed]",
    title: "Membership Updates",
    description: "Your membership status has been updated. View your membership details.",
    date: "May 1, 2024",
    time: "2:20 PM",
    isUnread: true,
  },
  {
    icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
    iconBg: "bg-[#f1f5f9]",
    iconColor: "text-gray-500",
    title: "System Announcements",
    description: "Scheduled maintenance: Our system will be updated on May 20, 2024 from 12:00 AM to 2:00 AM EST.",
    date: "Apr 28, 2024",
    time: "6:00 PM",
    isUnread: false,
  },
];

export default function NotificationsList({ notifications }) {
  return (
    <div className="divide-y divide-gray-50">
      {notifications.map((n, i) => (
        <NotificationItem key={i} {...n} />
      ))}
    </div>
  );
}
