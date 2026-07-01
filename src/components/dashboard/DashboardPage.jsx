import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import WelcomeBanner from "./WelcomeBanner";
import StatsRow from "./StatsRow";
import ContributionSummary from "./ContributionSummary";
import RecentPayments from "./RecentPayments";
import HouseholdSummary from "./HouseholdSummary";
import NotificationsPanel from "./NotificationsPanel";
import QuickActions from "./QuickActions";

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      {/* Sidebar — active state auto-detected via NavLink */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar userName="John Doe" notificationCount={3} />

        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-0">
            <main className="flex-1 p-6 space-y-5 min-w-0">
              <WelcomeBanner userName="John" />
              <StatsRow />
              <ContributionSummary />
              <div className="grid grid-cols-2 gap-5">
                <RecentPayments />
                <HouseholdSummary />
              </div>
            </main>

            <aside className="w-[280px] shrink-0 border-l border-gray-100 bg-white p-5 overflow-y-auto space-y-7">
              <NotificationsPanel />
              <div className="border-t border-gray-100 pt-6">
                <QuickActions />
              </div>
            </aside>
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
