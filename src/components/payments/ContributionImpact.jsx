const items = [
  {
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    iconColor: "text-[#1a6bdc]",
    title: "Community Programs",
    description: "Supporting our local community through various programs",
  },
  {
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    iconColor: "text-[#1a6bdc]",
    title: "Educational Initiatives",
    description: "Funding educational programs and resources",
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    iconColor: "text-[#1a6bdc]",
    title: "Outreach & Support",
    description: "Providing support to those in need in our community",
  },
];

export default function ContributionImpact() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-[14px] font-semibold text-gray-800 mb-4">What your contribution supports</h3>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#eef1f9] flex items-center justify-center shrink-0">
              <svg className={`w-4 h-4 ${item.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-800 leading-snug">{item.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
