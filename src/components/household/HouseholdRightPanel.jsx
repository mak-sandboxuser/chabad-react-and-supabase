import { formatDate } from "../../lib/format";

const ActionRow = ({ icon, title, description }) => (
  <button className="w-full flex items-center gap-3 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-1 px-1 rounded-xl transition-colors group text-left">
    <div className="w-9 h-9 rounded-xl bg-[#eef1f9] flex items-center justify-center shrink-0">
      <svg className="w-4 h-4 text-[#1a2a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-semibold text-gray-800 leading-snug">{title}</p>
      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{description}</p>
    </div>
    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </button>
);

export default function HouseholdRightPanel({ panel }) {
  if (!panel) return null;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[14px] font-semibold text-gray-800 mb-4">Household Summary</h3>

        <div className="flex flex-col items-center py-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-[#eef1f9] flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-[#1a2a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-[32px] font-bold text-[#1a2a5e] leading-none">{panel.totalMembers}</p>
          <p className="text-[12px] text-gray-400 mt-1">Total Members</p>
        </div>

        <div className="space-y-0">
          <div className="flex items-center justify-between py-3 border-t border-gray-50">
            <span className="text-[12px] text-gray-500">Household Status</span>
            <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize">
              {panel.status}
            </span>
          </div>
          <div className="flex items-start justify-between py-3 border-t border-gray-50">
            <span className="text-[12px] text-gray-500">Member Since</span>
            <span className="text-[12px] font-semibold text-gray-800">{formatDate(panel.memberSince)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
