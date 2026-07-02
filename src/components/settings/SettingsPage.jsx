import { useNavigate } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import SettingsCategoriesList from "./SettingsCategoriesList";
import PrivacySecurityBanner from "./PrivacySecurityBanner";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { userName, notificationCount } = useCurrentUser();

  const handleSelect = (categoryId) => {
    // Route to sub-pages as you build them
    // e.g. navigate(`/settings/${categoryId}`)
    console.log("Selected category:", categoryId);
  };

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      {/* ✅ Reused — NavLink auto-highlights /settings */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ✅ Reused TopBar */}
        <TopBar userName={userName} notificationCount={notificationCount} title="Account Settings" />
        <div className="bg-white px-6 -mt-px pb-3 border-b border-gray-100">
          <p className="text-[13px] text-gray-400">Manage your account preferences and security.</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <main className="p-6 space-y-5 max-w-[860px]">
            <SettingsCategoriesList onSelect={handleSelect} />
            <PrivacySecurityBanner />
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
