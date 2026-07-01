const pillars = [
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    title: "Community Support",
    desc: "Strengthening Jewish life in our community",
  },
  {
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    title: "Meaningful Programs",
    desc: "Supporting educational and spiritual programs",
  },
  {
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    title: "Lasting Impact",
    desc: "Building a brighter future together",
  },
];

export default function AboutMembership() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-[15px] font-semibold text-gray-800 mb-1.5">About Your Membership</h3>
      <p className="text-[13px] text-gray-400 mb-6 leading-relaxed">
        Your membership helps us continue our mission and serve the community. We appreciate your commitment!
      </p>

      <div className="grid grid-cols-3 gap-6">
        {pillars.map((p) => (
          <div key={p.title} className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#eef1f9] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#1a2a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d={p.icon} />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-800 leading-snug">{p.title}</p>
              <p className="text-[12px] text-gray-400 mt-1 leading-snug">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
