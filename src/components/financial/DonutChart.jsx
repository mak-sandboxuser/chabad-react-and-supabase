export default function DonutChart({ percentage = 62.5 }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 58;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * r;
  const filled = (percentage / 100) * circumference;
  const gap = circumference - filled;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background ring */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc - starts from top (-90deg) */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="#1a6bdc"
            strokeWidth={strokeWidth}
            strokeDasharray={`${filled} ${gap}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[20px] font-bold text-[#1a2a5e] leading-none">{percentage}%</span>
          <span className="text-[10px] text-gray-400 mt-1 text-center leading-tight">Of Commitment<br />Met</span>
        </div>
      </div>
    </div>
  );
}
