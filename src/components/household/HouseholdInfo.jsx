import { formatDate } from "../../lib/format";

const InfoRow = ({ icon, label, children }) => (
  <div className="flex items-start gap-4 py-5 border-b border-gray-50 last:border-0">
    <div className="w-9 h-9 rounded-xl bg-[#f4f6fb] flex items-center justify-center shrink-0 mt-0.5">
      <svg className="w-4.5 h-4.5 text-gray-400" style={{ width: "18px", height: "18px" }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
    </div>
    <div>
      <p className="text-[13px] font-semibold text-gray-800 mb-0.5">{label}</p>
      <div className="text-[13px] text-gray-500 leading-relaxed">{children}</div>
    </div>
  </div>
);

export default function HouseholdInfo({ info }) {
  if (!info) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-[15px] font-semibold text-gray-800 mb-1">Household Information</h3>

      <InfoRow icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" label="Household Name">
        {info.name}
      </InfoRow>

      <InfoRow icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" label="Household Address">
        {info.addressLine1 && <p>{info.addressLine1}</p>}
        {(info.city || info.state || info.zip) && (
          <p>{[info.city, info.state, info.zip].filter(Boolean).join(", ")}</p>
        )}
        {info.country && <p>{info.country}</p>}
        {!info.addressLine1 && !info.city && <p>No address added yet.</p>}
      </InfoRow>

      <InfoRow icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" label="Membership Owner">
        <p className="text-gray-800 font-medium">{info.ownerName}</p>
        <p className="text-gray-400 text-[12px]">Primary Member</p>
      </InfoRow>

      <InfoRow icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" label="Member Since">
        {formatDate(info.memberSince)}
      </InfoRow>
    </div>
  );
}
