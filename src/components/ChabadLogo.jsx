export default function ChabadLogo({ size = "md" }) {
  const sizes = {
    sm: { icon: 28, text: "text-xs" },
    md: { icon: 40, text: "text-sm" },
    lg: { icon: 56, text: "text-base" },
  };
  const s = sizes[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Menorah / crown symbol */}
        <path
          d="M28 8 L28 40"
          stroke="#1a2a5e"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Left branches */}
        <path d="M28 18 Q20 18 18 10" stroke="#1a2a5e" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M28 24 Q16 24 13 14" stroke="#1a2a5e" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Right branches */}
        <path d="M28 18 Q36 18 38 10" stroke="#1a2a5e" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M28 24 Q40 24 43 14" stroke="#1a2a5e" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Base */}
        <path d="M20 40 L36 40" stroke="#1a2a5e" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 44 L34 44" stroke="#1a2a5e" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className={`text-center tracking-widest font-semibold ${s.text} text-[#1a2a5e] leading-tight`}>
        <div>CHABAD</div>
        <div className="tracking-[0.25em] font-normal text-[0.7em]">BEDFORD</div>
      </div>
    </div>
  );
}
