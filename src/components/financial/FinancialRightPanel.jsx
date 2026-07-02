import { formatDate } from "../../lib/format";

export default function FinancialRightPanel({ panel }) {
  if (!panel) return null;

  const primaryMethod = panel.paymentMethods?.find((pm) => pm.isPrimary) || panel.paymentMethods?.[0];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[14px] font-semibold text-gray-800 mb-3">Account Summary</h3>
        <div className="space-y-0">
          {[
            { label: "Membership", value: panel.membershipName },
            { label: "Membership Status", value: panel.status, badge: true },
            { label: "Member Since", value: formatDate(panel.memberSince) },
            { label: "Renewal Date", value: formatDate(panel.renewalDate) },
          ].map(({ label, value, badge }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-[12px] text-gray-500">{label}</span>
              {badge ? (
                <span className="bg-[#dcfce7] text-[#16a34a] text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize">
                  {value}
                </span>
              ) : (
                <span className="text-[12px] font-semibold text-gray-800">{value}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[14px] font-semibold text-gray-800 mb-3">Payment Methods</h3>
        {primaryMethod ? (
          <div className="flex items-center gap-3 py-2.5 border-b border-gray-50">
            <span className="flex-1 text-[13px] text-gray-700 font-medium">{primaryMethod.label}</span>
            {primaryMethod.isPrimary && (
              <span className="bg-[#dcfce7] text-[#16a34a] text-[10px] font-semibold px-2.5 py-0.5 rounded-full">Primary</span>
            )}
          </div>
        ) : (
          <p className="text-[13px] text-gray-400">No payment methods added yet.</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-[14px] font-semibold text-gray-800 mb-3">Billing Contact</h3>
        {panel.billingContact ? (
          <div className="space-y-2.5">
            <p className="text-[13px] text-gray-700 font-medium">{panel.billingContact.full_name}</p>
            <p className="text-[13px] text-gray-600">{panel.billingContact.email}</p>
            <p className="text-[13px] text-gray-600">{panel.billingContact.phone || "-"}</p>
          </div>
        ) : (
          <p className="text-[13px] text-gray-400">No billing contact added yet.</p>
        )}
      </div>
    </div>
  );
}
