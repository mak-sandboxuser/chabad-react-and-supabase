import { useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import HouseholdHero from "./HouseholdHero";
import HouseholdInfo from "./HouseholdInfo";
import HouseholdMembers from "./HouseholdMembers";
import HouseholdRightPanel from "./HouseholdRightPanel";
import AddFamilyMemberModal from "./AddFamilyMemberModal";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useHouseholdData } from "../../hooks/usePageData";
import { addHouseholdMember, ensureHousehold, fetchProfile, getAuthUser } from "../../services/memberData";

export default function HouseholdPage() {
  const { userName, notificationCount } = useCurrentUser();
  const { loading, error, data, refetch } = useHouseholdData();
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAddMember = async (form) => {
    setSaving(true);
    try {
      const user = await getAuthUser();
      const profile = await fetchProfile(user.id);
      const household = data?.householdId
        ? { id: data.householdId }
        : await ensureHousehold(user.id, profile);

      await addHouseholdMember(user.id, household.id, form);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          userName={userName}
          notificationCount={notificationCount}
          title="Household Overview"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Household Overview" },
          ]}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            <main className="flex-1 p-6 space-y-5 min-w-0">
              {loading && <p className="text-sm text-gray-500">Loading household data...</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
              {data && (
                <>
                  <HouseholdHero hero={data.hero} />
                  <HouseholdInfo info={data.info} />
                  <HouseholdMembers
                    members={data.members}
                    onAddMember={() => setModalOpen(true)}
                  />
                </>
              )}
            </main>

            <aside className="w-[300px] shrink-0 p-5 overflow-y-auto">
              {data && <HouseholdRightPanel panel={data.panel} />}
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

      <AddFamilyMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddMember}
        saving={saving}
      />
    </div>
  );
}
