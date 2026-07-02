import { formatDate } from "../../lib/format";

export default function MemberRightPanel({ panel }) {
  if (!panel) return null;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[14px] font-semibold text-gray-800 mb-4">Household Summary</h3>

        <div className="flex flex-col items-center py-2 mb-5">
          <p className="text-[14px] font-bold text-[#1a2a5e]">{panel.householdName}</p>
          <span className="mt-1 bg-[#dcfce7] text-[#16a34a] text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize">
            {panel.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-0 border border-gray-100 rounded-xl overflow-hidden">
          <div className="p-3.5 border-r border-b border-gray-100">
            <p className="text-[18px] font-bold text-[#1a2a5e] leading-none">{panel.totalMembers}</p>
            <p className="text-[11px] text-gray-400 mt-1">Total Members</p>
          </div>
          <div className="p-3.5 border-b border-gray-100">
            <p className="text-[13px] font-semibold text-[#1a2a5e] leading-snug">{panel.ownerName}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Household Owner</p>
          </div>
          <div className="p-3.5 border-r border-gray-100">
            <p className="text-[13px] font-semibold text-[#1a2a5e] leading-snug">{formatDate(panel.memberSince)}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Member Since</p>
          </div>
          <div className="p-3.5">
            <p className="text-[13px] font-semibold text-[#1a2a5e] leading-snug capitalize">{panel.status}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Household Status</p>
          </div>
        </div>
      </div>
    </div>
  );
}
