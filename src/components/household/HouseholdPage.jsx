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
import {
  addHouseholdMember,
  deleteHouseholdMember,
  ensureHousehold,
  fetchProfile,
  getAuthUser,
  updateHouseholdMember,
} from "../../services/memberData";

export default function HouseholdPage() {
  const { userName, notificationCount } = useCurrentUser();
  const { loading, error, data, refetch } = useHouseholdData();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingMember, setEditingMember] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const openAddModal = () => {
    setModalMode("add");
    setEditingMember(null);
    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setModalMode("edit");
    setEditingMember({
      id: member.id,
      fullName: member.name,
      relationship: member.relationship,
      dateOfBirth: member.dateOfBirth,
      email: member.email,
      phone: member.phone,
    });
    setModalOpen(true);
  };

  const handleSaveMember = async (form) => {
    setSaving(true);
    setActionError("");
    try {
      const user = await getAuthUser();

      if (modalMode === "edit" && editingMember?.id) {
        await updateHouseholdMember(user.id, editingMember.id, form);
      } else {
        const profile = await fetchProfile(user.id);
        const household = data?.householdId
          ? { id: data.householdId }
          : await ensureHousehold(user.id, profile);
        await addHouseholdMember(user.id, household.id, form);
      }

      refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Remove ${member.name} from your household?`)) return;

    setDeletingId(member.id);
    setActionError("");
    try {
      const user = await getAuthUser();
      await deleteHouseholdMember(user.id, member.id);
      refetch();
    } catch (err) {
      setActionError(err.message || "Failed to delete family member.");
    } finally {
      setDeletingId(null);
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
              {actionError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {actionError}
                </p>
              )}
              {data && (
                <>
                  <HouseholdHero hero={data.hero} />
                  <HouseholdInfo info={data.info} />
                  <HouseholdMembers
                    members={data.members}
                    onAddMember={openAddModal}
                    onEditMember={openEditModal}
                    onDeleteMember={handleDeleteMember}
                    deletingId={deletingId}
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
        onSubmit={handleSaveMember}
        saving={saving}
        mode={modalMode}
        initialData={editingMember}
      />
    </div>
  );
}
