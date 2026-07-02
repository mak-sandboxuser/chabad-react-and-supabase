import { formatDate } from "../../lib/format";
import InfoRow from "./InfoRow";

export default function MemberHero({ hero }) {
  if (!hero) return null;

  const status = hero.status ? `${hero.status[0].toUpperCase()}${hero.status.slice(1)} Member` : "Member";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-8 py-6 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[#2563eb] flex items-center justify-center shrink-0">
          <span className="text-white text-[20px] font-bold tracking-wide">{hero.initials}</span>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-[22px] font-bold text-[#1a2a5e]">{hero.name}</h2>
            <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-semibold px-3 py-1 rounded-full">
              {status}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[13px] text-gray-500">
            <span>{hero.relationship}</span>
            <span className="text-gray-200">|</span>
            <span>Member Since {formatDate(hero.memberSince)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
