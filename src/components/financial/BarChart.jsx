const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function BarChart({ values = [] }) {
  const chartValues = values.length === 12 ? values : Array(12).fill(0);
  const maxVal = Math.max(...chartValues, 1);

  const W = 390;
  const H = 180;
  const padL = 36;
  const padR = 8;
  const padT = 10;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const yLines = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal].map(Math.round);
  const barWidth = chartW / months.length;
  const barPad = barWidth * 0.28;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {yLines.map((v) => {
        const y = padT + chartH - (v / maxVal) * chartH;
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
              {v === 0 ? "₹0" : `₹${v}`}
            </text>
          </g>
        );
      })}

      {chartValues.map((v, i) => {
        const x = padL + i * barWidth + barPad;
        const bw = barWidth - barPad * 2;
        const bh = (v / maxVal) * chartH;
        const y = padT + chartH - bh;
        return <rect key={i} x={x} y={y} width={bw} height={bh} rx="3" fill="#93c5fd" />;
      })}

      {months.map((m, i) => {
        const x = padL + i * barWidth + barWidth / 2;
        return (
          <text key={m} x={x} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {m}
          </text>
        );
      })}
    </svg>
  );
}
