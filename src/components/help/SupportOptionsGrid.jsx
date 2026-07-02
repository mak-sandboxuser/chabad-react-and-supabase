import SupportCard from "./SupportCard";

export default function SupportOptionsGrid({ config }) {
  const orgEmail = config?.org_email || "info@chabadbedford.org";
  const supportEmail = config?.support_email || "support@chabadbedford.org";
  const phone = config?.phone || "+1 (123) 456-7890";
  const hours = config?.hours || "Mon – Fri, 9:00 AM – 5:00 PM EST";
  const faqUrl = config?.faq_url || "#";
  const phoneHref = phone.replace(/[^\d+]/g, "");

  return (
    <div className="grid grid-cols-2 gap-5">
      <SupportCard
        icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        iconBg="bg-[#eef1f9]"
        iconColor="text-[#1a2a5e]"
        title="Contact Organization"
        description="Reach out to our organization directly for assistance."
        primaryLabel="Contact Organization"
        primaryHref={`mailto:${orgEmail}`}
        primaryFilled={true}
      />

      <SupportCard
        icon="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        iconBg="bg-[#f0fdf4]"
        iconColor="text-[#16a34a]"
        title="Frequently Asked Questions"
        description="Browse common questions and find quick answers."
        primaryLabel="View FAQs"
        primaryHref={faqUrl}
        primaryFilled={false}
      />

      <SupportCard
        icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        iconBg="bg-[#f5f3ff]"
        iconColor="text-[#7c3aed]"
        title="Support Email"
        description="Email our support team and we'll get back to you."
        primaryLabel="Email Support"
        primaryHref={`mailto:${supportEmail}`}
        primaryExternal={true}
        primaryFilled={false}
        extraLines={[
          { text: supportEmail, href: `mailto:${supportEmail}`, style: "text-[#1a6bdc] hover:underline" },
        ]}
      />

      <SupportCard
        icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        iconBg="bg-[#fff8f0]"
        iconColor="text-[#ea580c]"
        title="Support Phone Number"
        description="Call us during business hours for immediate assistance."
        primaryLabel="Call Support"
        primaryHref={`tel:${phoneHref}`}
        primaryFilled={false}
        extraLines={[
          { text: phone, href: `tel:${phoneHref}`, style: "text-[#1a6bdc] font-semibold hover:underline" },
          { text: hours, style: "text-gray-400" },
        ]}
      />
    </div>
  );
}
