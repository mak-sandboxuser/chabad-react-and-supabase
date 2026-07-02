import { formatDate } from "../../lib/format";

export default function ProfileSummaryCard({
  initials = "M",
  name = "Member",
  memberSince,
  status = "active",
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-[14px] font-semibold text-gray-800 mb-5">Profile Summary</h3>

      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#eef1f9] flex items-center justify-center mb-3">
          <span className="text-[#1a2a5e] text-[20px] font-bold">{initials}</span>
        </div>
        <p className="text-[16px] font-bold text-[#1a2a5e]">{name}</p>
        <p className="text-[12px] text-gray-400 mt-1">Member since {formatDate(memberSince)}</p>
        <span className="mt-3 bg-[#dcfce7] text-[#16a34a] text-[11px] font-semibold px-3 py-1 rounded-full capitalize">
          {status} Member
        </span>
      </div>
    </div>
  );
}
