import { useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import MembershipHero from "./MembershipHero";
import MembershipInfo from "./MembershipInfo";
import AboutMembership from "./AboutMembership";
import MembershipRightPanel from "./MembershipRightPanel";

export default function MembershipPage() {
  const [activeNav, setActiveNav] = useState("membership");

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      {/* ✅ Reusing existing Sidebar */}
      <Sidebar active={activeNav} onNav={setActiveNav} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ✅ Reusing extended TopBar with breadcrumb */}
        <TopBar
          userName="John Doe"
          notificationCount={3}
          title="Membership Details"
          breadcrumbs={[
            { label: "Dashboard", href: "#" },
            { label: "Membership", href: "#" },
            { label: "Membership Details" },
          ]}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            {/* Center content */}
            <main className="flex-1 p-6 space-y-5 min-w-0">
              <MembershipHero />
              <MembershipInfo />
              <AboutMembership />
            </main>

            {/* Right sidebar */}
            <aside className="w-[300px] shrink-0 p-5 overflow-y-auto">
              <MembershipRightPanel />
            </aside>
          </div>
        </div>

        {/* Footer */}
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
