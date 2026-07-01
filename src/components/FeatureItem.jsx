export default function FeatureItem({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl bg-[#eef1f9] flex items-center justify-center shrink-0">
        <span className="text-[#1a2a5e] text-lg">{icon}</span>
      </div>
      <div>
        <p className="font-semibold text-[#1a2a5e] text-sm leading-snug mb-0.5">{title}</p>
        <p className="text-gray-500 text-sm leading-snug">{description}</p>
      </div>
    </div>
  );
}
