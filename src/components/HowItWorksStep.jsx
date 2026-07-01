export default function HowItWorksStep({ number, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-[#1a2a5e] flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-white text-xs font-bold">{number}</span>
      </div>
      <div>
        <p className="font-semibold text-[#1a2a5e] text-sm leading-snug">{title}</p>
        <p className="text-gray-500 text-sm leading-snug mt-0.5">{description}</p>
      </div>
    </div>
  );
}
