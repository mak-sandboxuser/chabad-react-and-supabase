import { useParams } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import MemberHero from "./MemberHero";
import MemberInfo from "./MemberInfo";
import MemberContact from "./MemberContact";
import MemberRightPanel from "./MemberRightPanel";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useMemberDetailData } from "../../hooks/usePageData";

export default function MemberDetailsPage() {
  const { id } = useParams();
  const { userName, notificationCount } = useCurrentUser();
  const { loading, error, data } = useMemberDetailData(id);

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          userName={userName}
          notificationCount={notificationCount}
          title="Member Details"
          breadcrumbs={[
            { label: "Household", href: "/household" },
            { label: data?.panel?.householdName || "Household", href: "/household" },
            { label: "Member Details" },
          ]}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            <main className="flex-1 p-6 space-y-5 min-w-0">
              {loading && <p className="text-sm text-gray-500">Loading member details...</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
              {!loading && !data && !error && (
                <p className="text-sm text-gray-500">Member not found.</p>
              )}
              {data && (
                <>
                  <MemberHero hero={data.hero} />
                  <MemberInfo info={data.info} />
                  <MemberContact contact={data.contact} />
                </>
              )}
            </main>

            <aside className="w-[300px] shrink-0 p-5 overflow-y-auto">
              {data && <MemberRightPanel panel={data.panel} />}
            </aside>
          </div>
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
