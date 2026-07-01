export default function MembershipHero({ name = "Chai Society Membership", status = "Active Member" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-8 py-7 flex items-center justify-between overflow-hidden relative">
      <div className="flex items-center gap-6 relative z-10">
        {/* Icon circle */}
        <div className="w-16 h-16 rounded-full bg-[#eef1f9] flex items-center justify-center shrink-0">
          <svg className="w-8 h-8 text-[#1a2a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h2 className="text-[22px] font-bold text-[#1a2a5e]">{name}</h2>
            <span className="bg-[#dcfce7] text-[#16a34a] text-[11px] font-semibold px-3 py-1 rounded-full">
              {status}
            </span>
          </div>
          <p className="text-[13px] text-gray-400">Thank you for your ongoing commitment to our community.</p>
        </div>
      </div>

      {/* Illustration */}
      <div className="shrink-0 opacity-85">
        <svg width="170" height="100" viewBox="0 0 170 100" fill="none">
          {/* Background blob */}
          <ellipse cx="110" cy="50" rx="65" ry="55" fill="#eef1f9" opacity="0.6"/>
          {/* Folder / document base */}
          <rect x="65" y="28" width="75" height="55" rx="5" fill="#c9d8ee"/>
          <rect x="65" y="20" width="35" height="12" rx="4" fill="#adc2e0"/>
          <rect x="70" y="40" width="55" height="5" rx="2.5" fill="#8aaad4" opacity="0.5"/>
          <rect x="70" y="50" width="45" height="5" rx="2.5" fill="#8aaad4" opacity="0.4"/>
          <rect x="70" y="60" width="50" height="5" rx="2.5" fill="#8aaad4" opacity="0.3"/>
          {/* Person silhouette */}
          <circle cx="108" cy="48" r="13" fill="#8aaad4" opacity="0.6"/>
          <circle cx="108" cy="43" r="5" fill="#6b8fc4" opacity="0.8"/>
          <path d="M96 62 Q108 55 120 62" stroke="#6b8fc4" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          {/* Checkmark badge */}
          <circle cx="125" cy="68" r="14" fill="#1a2a5e"/>
          <path d="M119 68 L123 72 L131 63" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* Leaf accents */}
          <ellipse cx="68" cy="78" rx="8" ry="14" fill="#adc2e0" opacity="0.35" transform="rotate(-30 68 78)"/>
          <ellipse cx="150" cy="75" rx="7" ry="12" fill="#adc2e0" opacity="0.35" transform="rotate(25 150 75)"/>
        </svg>
      </div>
    </div>
  );
}
