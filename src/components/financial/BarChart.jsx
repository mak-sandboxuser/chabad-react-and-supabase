const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const values  = [150, 260, 75, 75, 280, 300, 130, 95, 280, 230, 280, 310];

export default function BarChart() {
  const W = 390;
  const H = 180;
  const padL = 36;
  const padR = 8;
  const padT = 10;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxVal = 400;
  const yLines = [0, 100, 200, 300, 400];
  const barWidth = chartW / months.length;
  const barPad = barWidth * 0.28;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Y-axis gridlines + labels */}
      {yLines.map((v) => {
        const y = padT + chartH - (v / maxVal) * chartH;
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - padR} y2={y}
              stroke="#f1f5f9" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end"
              fontSize="9" fill="#9ca3af">
              {v === 0 ? "$0" : `$${v}`}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {values.map((v, i) => {
        const x = padL + i * barWidth + barPad;
        const bw = barWidth - barPad * 2;
        const bh = (v / maxVal) * chartH;
        const y = padT + chartH - bh;
        return (
          <rect key={i} x={x} y={y} width={bw} height={bh}
            rx="3" fill="#93c5fd" />
        );
      })}

      {/* X-axis labels */}
      {months.map((m, i) => {
        const x = padL + i * barWidth + barWidth / 2;
        return (
          <text key={m} x={x} y={H - 6} textAnchor="middle"
            fontSize="9" fill="#9ca3af">
            {m}
          </text>
        );
      })}
    </svg>
  );
}
