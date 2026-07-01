import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import FiltersBar from "./FiltersBar";
import ResultsSummary from "./ResultsSummary";
import TransactionsTable from "./TransactionsTable";
import Pagination from "./Pagination";

export default function ContributionsPage() {
  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      {/* ✅ Reused — NavLink auto-highlights /contributions */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ✅ Reused TopBar */}
        <TopBar userName="John Doe" notificationCount={3} title="Contribution History" />
        <div className="bg-white px-6 -mt-px pb-3 border-b border-gray-100">
          <p className="text-[13px] text-gray-400">View your historical contributions and payment records.</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <main className="p-6">
            <FiltersBar />
            <ResultsSummary count={18} total="$1,125.00" />
            <TransactionsTable />
            <Pagination totalItems={18} itemsPerPageDefault={10} />
          </main>
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
