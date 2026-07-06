import { Link } from "react-router-dom";

const avatarColors = [
  "bg-[#1a2a5e]",
  "bg-[#2563eb]",
  "bg-[#7c3aed]",
  "bg-[#db2777]",
];

export default function HouseholdMembers({
  members = [],
  onAddMember,
  onEditMember,
  onDeleteMember,
  deletingId,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-800">
            Household Members ({members.length})
          </h3>
          <p className="text-[12px] text-gray-400 mt-0.5">These individuals are part of your household.</p>
        </div>
        <button
          type="button"
          onClick={onAddMember}
          className="flex items-center gap-1.5 bg-[#1a2a5e] hover:bg-[#243672] text-white text-[12px] font-semibold px-3.5 py-2 rounded-xl transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Family Member
        </button>
      </div>

      <table className="w-full mt-5">
        <thead>
          <tr className="border-b border-gray-100">
            {["Member Name", "Relationship", "Role", "Date of Birth", "Actions"].map((h) => (
              <th key={h} className="text-left text-[11px] text-gray-400 font-semibold pb-3 pr-4 last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((m, i) => (
            <tr key={m.id || m.name} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
              <td className="py-4 pr-4">
                <Link to={`/household/member/${m.id}`} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center shrink-0`}>
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
                </Link>
              </td>
              <td className="py-4 pr-4 text-[13px] text-gray-600">{m.relationship}</td>
              <td className="py-4 pr-4">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${m.roleStyle}`}>
                  {m.role}
                </span>
              </td>
              <td className="py-4 pr-4 text-[13px] text-gray-600">{m.dob}</td>
              <td className="py-4">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditMember?.(m)}
                    className="p-2 rounded-lg text-gray-400 hover:text-[#1a2a5e] hover:bg-gray-100 transition-colors"
                    title="Edit member"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {!m.isPrimary && (
                    <button
                      type="button"
                      onClick={() => onDeleteMember?.(m)}
                      disabled={deletingId === m.id}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Delete member"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {!members.length && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-[13px] text-gray-400">
                No household members yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
