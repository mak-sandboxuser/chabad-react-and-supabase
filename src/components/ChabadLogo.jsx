const LOGO_SRC = "/company-logo.png";

export default function ChabadLogo({ size = "md", showText = false }) {
  const sizes = {
    sm: { width: 120, className: "h-10" },
    md: { width: 150, className: "h-12" },
    lg: { width: 200, className: "h-16" },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center gap-1">
      <img
        src={LOGO_SRC}
        alt="Company logo"
        width={s.width}
        className={`${s.className} w-auto object-contain`}
      />
      {showText && (
        <div className="text-center tracking-widest font-semibold text-sm text-[#1a2a5e] leading-tight">
          <div>CHABAD</div>
          <div className="tracking-[0.25em] font-normal text-[0.7em]">BEDFORD</div>
        </div>
      )}
    </div>
  );
}
