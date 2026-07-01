export default function PaymentMethodCard({ icon, iconColor, title, description, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left border-2 rounded-2xl p-5 transition-all relative
        ${selected
          ? "border-[#1a6bdc] bg-[#f0f6ff]"
          : "border-gray-200 hover:border-gray-300 bg-white"
        }`}
    >
      {/* Radio indicator */}
      <div className="absolute top-4 right-4">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
          ${selected ? "border-[#1a6bdc]" : "border-gray-300"}`}
        >
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#1a6bdc]" />}
        </div>
      </div>

      {/* Icon */}
      <div className="mb-4">
        <svg className={`w-7 h-7 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>

      <p className="text-[14px] font-semibold text-gray-800 mb-1">{title}</p>
      <p className="text-[12px] text-gray-500 leading-snug pr-4">{description}</p>
    </button>
  );
}
