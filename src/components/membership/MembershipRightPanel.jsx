import { formatCurrency, formatDate } from "../../lib/format";

const SummaryRow = ({ icon, label, value, valueClass = "text-gray-800" }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-2.5">
      <svg className="w-4 h-4 text-gray-350 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <span className="text-[12px] text-gray-500">{label}</span>
    </div>
    <span className={`text-[12px] font-semibold ${valueClass}`}>{value}</span>
  </div>
);

export default function MembershipRightPanel({ panel }) {
  if (!panel) return null;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#16a34a] leading-snug">Your membership is active!</p>
            <p className="text-[12px] text-gray-500 mt-1 leading-snug">
              Thank you for your continued support and commitment.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[14px] font-semibold text-gray-800 mb-1">Membership Summary</h3>

        <SummaryRow
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          label="Member Since"
          value={formatDate(panel.memberSince)}
        />
        <SummaryRow
          icon="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          label="Membership Tier"
          value={panel.planLabel}
          valueClass="text-[#1a6bdc]"
        />
        <SummaryRow
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          label="Annual Commitment"
          value={formatCurrency(panel.annualCommitment)}
        />
        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-gray-350 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[12px] text-gray-500">Current Status</span>
          </div>
          <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize">
            {panel.status}
          </span>
        </div>
        <SummaryRow
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          label="Renewal Date"
          value={formatDate(panel.renewalDate)}
        />
      </div>

      {panel.renewalDate && (
        <div className="bg-[#fff8f0] rounded-2xl border border-[#fed7aa] p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#ffedd5] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#ea580c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#ea580c]">Upcoming Renewal</p>
              <p className="text-[12px] text-gray-600 mt-1 leading-snug">
                Your membership will renew on {formatDate(panel.renewalDate)}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
