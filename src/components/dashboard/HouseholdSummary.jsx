const members = [
  { initials: "JD", name: "John Doe", role: "Primary Member", badge: "Owner", badgeColor: "bg-gray-100 text-gray-600" },
  { initials: "SD", name: "Sarah Doe", role: "Spouse", badge: "Member", badgeColor: "bg-[#dbeafe] text-[#1a6bdc]" },
  { initials: "LD", name: "Levi Doe", role: "Child", badge: "Member", badgeColor: "bg-[#dbeafe] text-[#1a6bdc]" },
  { initials: "MD", name: "Miriam Doe", role: "Child", badge: "Member", badgeColor: "bg-[#dbeafe] text-[#1a6bdc]" },
];

const avatarColors = ["bg-[#1a2a5e]", "bg-[#2563eb]", "bg-[#7c3aed]", "bg-[#db2777]"];

export default function HouseholdSummary() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-gray-800">Household Summary</h3>
        <a href="#" className="text-[12px] text-[#1a6bdc] font-medium hover:underline">View household</a>
      </div>

      <div className="space-y-3">
        {members.map((m, i) => (
          <div key={m.name} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${avatarColors[i]} flex items-center justify-center shrink-0`}>
              <span className="text-white text-[11px] font-bold">{m.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-800 leading-none">{m.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{m.role}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${m.badgeColor}`}>
              {m.badge}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-50 text-center">
        <a href="#" className="text-[12px] text-[#1a6bdc] font-medium hover:underline">View all members</a>
      </div>
    </div>
  );
}
