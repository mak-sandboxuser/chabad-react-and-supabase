import { useNavigate } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import BillingRedirectCard from "./BillingRedirectCard";
import BillingPortalInfo from "./BillingPortalInfo";
import SecureAndPrivateNotice from "./SecureAndPrivateNotice";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useBillingData } from "../../hooks/usePageData";

export default function BillingPortalPage() {
  const navigate = useNavigate();
  const { userName, notificationCount } = useCurrentUser();
  const { loading, error, data } = useBillingData();

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar userName={userName} notificationCount={notificationCount} title="Billing Portal" />
        <div className="bg-white px-6 -mt-px pb-3 border-b border-gray-100">
          <p className="text-[13px] text-gray-400">You are being redirected to our secure billing portal powered by Stripe.</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            <main className="flex-1 p-6 min-w-0">
              {loading && <p className="text-sm text-gray-500">Loading billing portal...</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
              {data && (
                <BillingRedirectCard
                  redirectUrl={data.billingPortalUrl}
                  onCancel={() => navigate("/dashboard")}
                />
              )}
            </main>

            <aside className="w-[300px] shrink-0 p-5 space-y-5 overflow-y-auto">
              <BillingPortalInfo />
              <SecureAndPrivateNotice />
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
