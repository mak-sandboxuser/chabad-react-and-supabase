import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import FinancialStatsRow from "./FinancialStatsRow";
import YearlySummary from "./YearlySummary";
import RecurringContributions from "./RecurringContributions";
import FinancialRightPanel from "./FinancialRightPanel";

export default function FinancialPage() {
  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      {/* ✅ Reused — NavLink auto-highlights /financial */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ✅ Reused TopBar with subtitle-style title */}
        <TopBar
          userName="John Doe"
          notificationCount={3}
          title="Financial Overview"
        />
        {/* Subtitle line under title (page-specific, not part of TopBar) */}
        <div className="bg-white px-6 -mt-px pb-3 border-b border-gray-100">
          <p className="text-[13px] text-gray-400">View your financial commitments and contribution activity.</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            {/* Main content */}
            <main className="flex-1 p-6 space-y-5 min-w-0">
              <FinancialStatsRow />
              <YearlySummary />
              <RecurringContributions />
            </main>

            {/* Right panel */}
            <aside className="w-[300px] shrink-0 p-5 overflow-y-auto">
              <FinancialRightPanel />
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
