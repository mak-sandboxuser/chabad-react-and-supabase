export default function HelpFooterNote() {
  return (
    <div className="bg-[#eef4fd] border border-[#dbeafe] rounded-2xl px-6 py-5 flex items-start gap-3">
      <svg className="w-5 h-5 text-[#1a6bdc] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
      <div>
        <p className="text-[14px] font-bold text-gray-900">We're here to help!</p>
        <p className="text-[13px] text-gray-600 mt-0.5">
          Our support team is dedicated to providing you with the best possible experience.
        </p>
      </div>
    </div>
  );
}
