import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import WelcomeBanner from "./WelcomeBanner";
import StatsRow from "./StatsRow";
import ContributionSummary from "./ContributionSummary";
import RecentPayments from "./RecentPayments";
import HouseholdSummary from "./HouseholdSummary";
import NotificationsPanel from "./NotificationsPanel";
import QuickActions from "./QuickActions";
import { useDashboardData } from "../../hooks/useDashboardData";

export default function DashboardPage() {
  const { loading, error, data } = useDashboardData();

  const firstName = data.userName.split(" ")[0] || "Member";

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      {/* Sidebar — active state auto-detected via NavLink */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar userName={data.userName} notificationCount={data.notificationCount} />

        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-0">
            <main className="flex-1 p-6 space-y-5 min-w-0">
              <WelcomeBanner userName={firstName} />
              {loading && (
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
                  Loading dashboard data...
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <StatsRow stats={data.stats} />
              <ContributionSummary summary={data.contributionSummary} />
              <div className="grid grid-cols-2 gap-5">
                <RecentPayments payments={data.recentPayments} />
                <HouseholdSummary members={data.householdMembers} />
              </div>
            </main>

            <aside className="w-[280px] shrink-0 border-l border-gray-100 bg-white p-5 overflow-y-auto space-y-7">
              <NotificationsPanel notifications={data.notifications} />
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
