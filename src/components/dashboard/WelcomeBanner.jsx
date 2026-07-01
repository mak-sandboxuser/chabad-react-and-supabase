export default function WelcomeBanner({ userName = "John" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-8 py-6 flex items-center justify-between overflow-hidden relative">
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-[#1a2a5e] mb-1.5">
          Welcome back, {userName}! 👋
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Here's an overview of your membership and<br />financial activity.
        </p>
      </div>

      {/* Illustration: stylized synagogue */}
      <div className="shrink-0 opacity-90">
        <svg width="180" height="110" viewBox="0 0 180 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Sky tones */}
          <ellipse cx="140" cy="55" rx="50" ry="50" fill="#dce6f5" opacity="0.4"/>
          <ellipse cx="40" cy="65" rx="35" ry="35" fill="#dce6f5" opacity="0.3"/>

          {/* Main building */}
          <rect x="55" y="45" width="70" height="55" rx="2" fill="#b8c8e8"/>
          {/* Roof */}
          <path d="M50 45 L90 15 L130 45Z" fill="#8aaad4"/>
          {/* Star of David on roof */}
          <g transform="translate(90,32)" stroke="#fff" strokeWidth="1.2" fill="none">
            <polygon points="0,-8 6.9,4 -6.9,4" />
            <polygon points="0,8 6.9,-4 -6.9,-4" />
          </g>
          {/* Door */}
          <rect x="79" y="72" width="22" height="28" rx="11" fill="#6b8fc4"/>
          {/* Windows */}
          <rect x="60" y="55" width="14" height="14" rx="7" fill="#6b8fc4"/>
          <rect x="106" y="55" width="14" height="14" rx="7" fill="#6b8fc4"/>

          {/* Small side building left */}
          <rect x="28" y="62" width="28" height="38" rx="2" fill="#c9d8ee"/>
          <path d="M24 62 L42 46 L60 62Z" fill="#adc2e0"/>
          <rect x="34" y="76" width="16" height="24" rx="8" fill="#8aaad4"/>

          {/* Small side building right */}
          <rect x="124" y="65" width="28" height="35" rx="2" fill="#c9d8ee"/>
          <path d="M120 65 L138 50 L156 65Z" fill="#adc2e0"/>
          <rect x="130" y="78" width="16" height="22" rx="8" fill="#8aaad4"/>

          {/* Trees */}
          <ellipse cx="18" cy="85" rx="10" ry="14" fill="#adc2e0" opacity="0.6"/>
          <rect x="16" y="95" width="4" height="10" fill="#8aaad4" opacity="0.5"/>
          <ellipse cx="162" cy="88" rx="9" ry="12" fill="#adc2e0" opacity="0.6"/>
          <rect x="160" y="97" width="4" height="8" fill="#8aaad4" opacity="0.5"/>

          {/* Ground */}
          <rect x="0" y="100" width="180" height="10" rx="2" fill="#dce6f5" opacity="0.5"/>
        </svg>
      </div>
    </div>
  );
}
