import { useEffect, useState } from "react";
import { getAuthUser, updateProfile } from "../../services/memberData";
import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import AlertBanner from "./AlertBanner";
import PersonalInfoForm from "./PersonalInfoForm";
import ProfileSummaryCard from "./ProfileSummaryCard";
import AccountSecurityCard from "./AccountSecurityCard";
import NeedHelpNotice from "./NeedHelpNotice";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useProfileData } from "../../hooks/usePageData";

export default function ProfilePage() {
  const { userName, notificationCount } = useCurrentUser();
  const { loading, error, data, refetch } = useProfileData();
  const [alerts, setAlerts] = useState({ success: false, syncFailed: false, validationError: false });

  const dismiss = (key) => setAlerts((a) => ({ ...a, [key]: false }));

  const handleSave = async (form, contactPref) => {
    try {
      const user = await getAuthUser();
      await updateProfile(user.id, {
        first_name: form.firstName,
        last_name: form.lastName,
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        mobile: form.mobile,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        contact_preference: contactPref,
      });
      setAlerts({ success: true, syncFailed: false, validationError: false });
      refetch?.();
    } catch {
      setAlerts({ success: false, syncFailed: true, validationError: false });
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar userName={userName} notificationCount={notificationCount} title="My Profile" />
        <div className="bg-white px-6 -mt-px pb-3 border-b border-gray-100">
          <p className="text-[13px] text-gray-400">View and manage your personal information.</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            <main className="flex-1 p-6 space-y-5 min-w-0">
              {loading && <p className="text-sm text-gray-500">Loading profile...</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
              {alerts.success && (
                <AlertBanner
                  variant="success"
                  title="Profile updated successfully!"
                  description="Your profile has been updated and synchronized with our records."
                  onDismiss={() => dismiss("success")}
                />
              )}
              {data && (
                <PersonalInfoForm
                  initialForm={data.form}
                  initialContactPref={data.contactPref}
                  onSave={handleSave}
                  onCancel={() => {}}
                />
              )}
              {alerts.syncFailed && (
                <AlertBanner
                  variant="error"
                  title="Profile save failed"
                  description="We were unable to save your changes. Please try again."
                  onDismiss={() => dismiss("syncFailed")}
                />
              )}
            </main>

            <aside className="w-[300px] shrink-0 p-5 space-y-5 overflow-y-auto">
              {data && (
                <>
                  <ProfileSummaryCard
                    initials={data.summary.initials}
                    name={data.summary.fullName}
                    memberSince={data.summary.memberSince}
                    status={data.summary.status}
                  />
                  <AccountSecurityCard lastSignIn={data.security.lastSignIn} />
                </>
              )}
              <NeedHelpNotice />
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
