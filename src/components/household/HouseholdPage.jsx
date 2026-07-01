import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import HouseholdHero from "./HouseholdHero";
import HouseholdInfo from "./HouseholdInfo";
import HouseholdMembers from "./HouseholdMembers";
import HouseholdRightPanel from "./HouseholdRightPanel";

export default function HouseholdPage() {
  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      {/* ✅ Reused — NavLink auto-highlights /household */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ✅ Reused — breadcrumb support added previously */}
        <TopBar
          userName="John Doe"
          notificationCount={3}
          title="Household Overview"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Household Overview" },
          ]}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            {/* Main content */}
            <main className="flex-1 p-6 space-y-5 min-w-0">
              <HouseholdHero />
              <HouseholdInfo />
              <HouseholdMembers />
            </main>

            {/* Right sidebar */}
            <aside className="w-[300px] shrink-0 p-5 overflow-y-auto">
              <HouseholdRightPanel />
            </aside>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
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
