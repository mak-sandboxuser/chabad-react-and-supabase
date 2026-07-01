import { useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import AlertBanner from "./AlertBanner";
import PersonalInfoForm from "./PersonalInfoForm";
import ProfileSummaryCard from "./ProfileSummaryCard";
import AccountSecurityCard from "./AccountSecurityCard";
import NeedHelpNotice from "./NeedHelpNotice";

export default function ProfilePage() {
  const [alerts, setAlerts] = useState({
    success: true,
    syncFailed: true,
    validationError: true,
  });

  const dismiss = (key) => setAlerts((a) => ({ ...a, [key]: false }));

  const handleSave = (form, contactPref) => {
    // Wire to your API here, e.g. PATCH /api/profile
    console.log("Saving profile:", form, contactPref);
    setAlerts({ success: true, syncFailed: false, validationError: false });
  };

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      {/* ✅ Reused — NavLink auto-highlights /profile */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ✅ Reused TopBar */}
        <TopBar userName="John Doe" notificationCount={3} title="My Profile" />
        <div className="bg-white px-6 -mt-px pb-3 border-b border-gray-100">
          <p className="text-[13px] text-gray-400">View and manage your personal information.</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            {/* Main content */}
            <main className="flex-1 p-6 space-y-5 min-w-0">
              {alerts.success && (
                <AlertBanner
                  variant="success"
                  title="Profile updated successfully!"
                  description="Your profile has been updated and synchronized with our records."
                  onDismiss={() => dismiss("success")}
                />
              )}

              <PersonalInfoForm onSave={handleSave} onCancel={() => {}} />

              {alerts.syncFailed && (
                <AlertBanner
                  variant="error"
                  title="Salesforce synchronization failed"
                  description="We were unable to sync your changes at this time. Please try again or contact support if the issue persists."
                  onDismiss={() => dismiss("syncFailed")}
                />
              )}

              {alerts.validationError && (
                <AlertBanner
                  variant="warning"
                  title="Please review the highlighted fields"
                  description="Some fields have errors that need to be corrected before saving."
                  onDismiss={() => dismiss("validationError")}
                />
              )}
            </main>

            {/* Right panel */}
            <aside className="w-[300px] shrink-0 p-5 space-y-5 overflow-y-auto">
              <ProfileSummaryCard />
              <AccountSecurityCard />
              <NeedHelpNotice />
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
