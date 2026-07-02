import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import FiltersBar from "./FiltersBar";
import ResultsSummary from "./ResultsSummary";
import TransactionsTable from "./TransactionsTable";
import Pagination from "./Pagination";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useContributionsData } from "../../hooks/usePageData";

export default function ContributionsPage() {
  const { userName, notificationCount } = useCurrentUser();
  const { loading, error, data } = useContributionsData();

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar userName={userName} notificationCount={notificationCount} title="Contribution History" />
        <div className="bg-white px-6 -mt-px pb-3 border-b border-gray-100">
          <p className="text-[13px] text-gray-400">View your historical contributions and payment records.</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <main className="p-6">
            {loading && <p className="text-sm text-gray-500 mb-4">Loading contributions...</p>}
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <FiltersBar />
            {data && (
              <>
                <ResultsSummary count={data.count} total={data.total} />
                <TransactionsTable transactions={data.transactions} />
                <Pagination totalItems={data.count} itemsPerPageDefault={10} />
              </>
            )}
          </main>
        </div>

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
