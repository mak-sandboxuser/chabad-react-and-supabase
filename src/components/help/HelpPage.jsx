import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import HelpHero from "./HelpHero";
import SupportOptionsGrid from "./SupportOptionsGrid";
import HelpInfoBanner from "./HelpInfoBanner";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useSupportData } from "../../hooks/usePageData";

export default function HelpPage() {
  const { userName, notificationCount } = useCurrentUser();
  const { data: supportConfig } = useSupportData();

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar userName={userName} notificationCount={notificationCount} title="Help & Support" />
        <div className="bg-white px-6 -mt-px pb-3 border-b border-gray-100">
          <p className="text-[13px] text-gray-400">We're here to help. Find answers or get in touch with our team.</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <main className="p-6 space-y-5 max-w-[900px]">
            <HelpHero />
            <SupportOptionsGrid config={supportConfig} />
            <HelpInfoBanner />
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
