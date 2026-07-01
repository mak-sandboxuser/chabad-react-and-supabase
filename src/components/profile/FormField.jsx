export default function FormField({
  label,
  icon,
  required,
  value,
  onChange,
  type = "text",
  disabled,
  error,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-[#e53e3e]">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full ${icon ? "pl-10" : "pl-4"} pr-4 py-2.5 border rounded-xl text-[13px] text-gray-800
            focus:outline-none focus:ring-2 transition-all
            ${disabled
              ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
              : error
                ? "border-[#fca5a5] focus:ring-[#e53e3e]/15 focus:border-[#e53e3e]"
                : "border-gray-200 focus:ring-[#1a2a5e]/15 focus:border-[#1a2a5e]"
            }`}
        />
      </div>
      {error && <p className="text-[11px] text-[#e53e3e] mt-1">{error}</p>}
    </div>
  );
}
