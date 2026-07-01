const avatarColors = [
  "bg-[#1a2a5e]",
  "bg-[#2563eb]",
  "bg-[#7c3aed]",
  "bg-[#db2777]",
];

const members = [
  { initials: "JD", name: "John Doe",   isYou: true,  relationship: "Self",   role: "Owner",  roleStyle: "bg-[#dcfce7] text-[#16a34a]",  dob: "May 12, 1980" },
  { initials: "SD", name: "Sarah Doe",  isYou: false, relationship: "Spouse", role: "Member", roleStyle: "bg-[#dbeafe] text-[#1a6bdc]",  dob: "Aug 24, 1982" },
  { initials: "LD", name: "Levi Doe",   isYou: false, relationship: "Child",  role: "Member", roleStyle: "bg-[#dbeafe] text-[#1a6bdc]",  dob: "Mar 3, 2010"  },
  { initials: "MD", name: "Miriam Doe", isYou: false, relationship: "Child",  role: "Member", roleStyle: "bg-[#dbeafe] text-[#1a6bdc]",  dob: "Jun 18, 2013" },
];

export default function HouseholdMembers() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-800">
            Household Members ({members.length})
          </h3>
          <p className="text-[12px] text-gray-400 mt-0.5">These individuals are part of your household.</p>
        </div>
        <button className="flex items-center gap-1.5 border border-gray-200 hover:border-gray-300 text-[#1a2a5e] text-[12px] font-semibold px-3.5 py-2 rounded-xl transition-colors shrink-0">
          View All Members
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>

      {/* Table */}
      <table className="w-full mt-5">
        <thead>
          <tr className="border-b border-gray-100">
            {["Member Name", "Relationship", "Role", "Date of Birth"].map((h) => (
              <th key={h} className="text-left text-[11px] text-gray-400 font-semibold pb-3 pr-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((m, i) => (
            <tr key={m.name} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
              {/* Name + avatar */}
              <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${avatarColors[i]} flex items-center justify-center shrink-0`}>
                    <span className="text-white text-[10px] font-bold">{m.initials}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-gray-800">{m.name}</span>
                    {m.isYou && (
                      <span className="bg-[#dbeafe] text-[#1a6bdc] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </div>
              </td>

              {/* Relationship */}
              <td className="py-4 pr-4 text-[13px] text-gray-600">{m.relationship}</td>

              {/* Role badge */}
              <td className="py-4 pr-4">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${m.roleStyle}`}>
                  {m.role}
                </span>
              </td>

              {/* DOB */}
              <td className="py-4 text-[13px] text-gray-600">{m.dob}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t border-gray-50 text-center">
        <button className="flex items-center gap-1.5 text-[13px] text-[#1a6bdc] font-medium hover:underline mx-auto">
          View All Members
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
