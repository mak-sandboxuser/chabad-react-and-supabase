import SettingsCategoryRow from "./SettingsCategoryRow";

const categories = [
  {
    id: "notifications",
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    iconBg: "bg-[#eef1f9]",
    iconColor: "text-[#1a2a5e]",
    title: "Notification Preferences",
    description: "Manage how and when you receive notifications.",
    subtitle: "Email, SMS, and in-app notification settings",
  },
  {
    id: "communication",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    iconBg: "bg-[#f0fdf4]",
    iconColor: "text-[#16a34a]",
    title: "Communication Preferences",
    description: "Manage how we communicate with you.",
    subtitle: "Emails, updates, and marketing preferences",
  },
  {
    id: "security",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    iconBg: "bg-[#f5f3ff]",
    iconColor: "text-[#7c3aed]",
    title: "Security Preferences",
    description: "Manage your password and account security.",
    subtitle: "Password, two-factor authentication, and login activity",
  },
];

export default function SettingsCategoriesList({ onSelect }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-7 pt-6 pb-3 border-b border-gray-50">
        <h3 className="text-[16px] font-bold text-gray-800">Settings Categories</h3>
        <p className="text-[13px] text-gray-400 mt-0.5">Choose a category to manage your preferences.</p>
      </div>

      <div className="divide-y divide-gray-50">
        {categories.map((cat) => (
          <SettingsCategoryRow
            key={cat.id}
            icon={cat.icon}
            iconBg={cat.iconBg}
            iconColor={cat.iconColor}
            title={cat.title}
            description={cat.description}
            subtitle={cat.subtitle}
            onClick={() => onSelect?.(cat.id)}
          />
        ))}
      </div>
    </div>
  );
}
