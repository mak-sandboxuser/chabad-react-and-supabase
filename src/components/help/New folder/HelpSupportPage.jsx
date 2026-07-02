import { useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import HelpIntroCard from "./HelpIntroCard";
import HelpOptionCard from "./HelpOptionCard";
import HelpFooterNote from "./HelpFooterNote";

const options = [
  {
    id: "contact",
    title: "Contact Organization",
    desc: "Reach out to our organization directly for assistance.",
    iconBg: "bg-[#dbeafe]",
    iconColor: "text-[#1a6bdc]",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    button: { label: "Contact Organization", variant: "filled", arrow: "right" },
  },
  {
    id: "faq",
    title: "Frequently Asked Questions",
    desc: "Browse common questions and find quick answers.",
    iconBg: "bg-[#dcfce7]",
    iconColor: "text-[#16a34a]",
    icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    button: { label: "View FAQs", variant: "outline", arrow: "right" },
  },
  {
    id: "email",
    title: "Support Email",
    desc: "Email our support team and we'll get back to you.",
    iconBg: "bg-[#ede9fe]",
    iconColor: "text-[#7c3aed]",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    button: { label: "Email Support", variant: "outline", arrow: "external" },
    detail: "support@chabadbedford.org",
  },
  {
    id: "phone",
    title: "Support Phone Number",
    desc: "Call us during business hours for immediate assistance.",
    iconBg: "bg-[#fef3c7]",
    iconColor: "text-[#ca8a04]",
    icon: "M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    button: { label: "Call Support", variant: "outline", arrow: "phone" },
    detail: "(123) 456-7890",
    detailSub: "Mon – Fri, 9:00 AM – 5:00 PM EST",
  },
];

export default function HelpSupportPage({ onNav }) {
  const [activeNav] = useState("help");

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      <Sidebar active={activeNav} onNav={onNav} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar userName="John Doe" notificationCount={7} />

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5">
            <h1 className="text-[20px] font-bold text-gray-900 leading-none">Help &amp; Support</h1>
            <p className="text-[13px] text-gray-400 mt-1.5">
              We're here to help. Find answers or get in touch with our team.
            </p>
          </div>

          <div className="px-6 pb-6 max-w-4xl space-y-5">
            <HelpIntroCard />

            <div className="grid grid-cols-2 gap-5">
              {options.map((o) => (
                <HelpOptionCard key={o.id} {...o} />
              ))}
            </div>

            <HelpFooterNote />
          </div>
        </div>

        <footer className="px-6 py-3 border-t border-gray-100 bg-white flex items-center justify-between">
          <p className="text-[11px] text-gray-400">© 2025 Chabad Bedford. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[11px] text-gray-400 underline hover:text-gray-600">Privacy Policy</a>
            <span className="text-gray-200 text-[11px]">|</span>
            <a href="#" className="text-[11px] text-gray-400 underline hover:text-gray-600">Terms of Service</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
