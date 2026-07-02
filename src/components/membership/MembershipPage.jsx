import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import MembershipHero from "./MembershipHero";
import MembershipInfo from "./MembershipInfo";
import AboutMembership from "./AboutMembership";
import MembershipRightPanel from "./MembershipRightPanel";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useMembershipData } from "../../hooks/usePageData";

export default function MembershipPage() {
  const { userName, notificationCount } = useCurrentUser();
  const { loading, error, data } = useMembershipData();

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          userName={userName}
          notificationCount={notificationCount}
          title="Membership Details"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Membership", href: "/membership" },
            { label: "Membership Details" },
          ]}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            <main className="flex-1 p-6 space-y-5 min-w-0">
              {loading && <p className="text-sm text-gray-500">Loading membership data...</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
              {data && (
                <>
                  <MembershipHero hero={data.hero} />
                  <MembershipInfo info={data.info} />
                  <AboutMembership />
                </>
              )}
            </main>

            <aside className="w-[300px] shrink-0 p-5 overflow-y-auto">
              {data && <MembershipRightPanel panel={data.panel} />}
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
