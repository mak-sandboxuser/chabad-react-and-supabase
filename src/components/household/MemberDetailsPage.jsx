import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import MemberHero from "./MemberHero";
import MemberInfo from "./MemberInfo";
import MemberContact from "./MemberContact";
import MemberRightPanel from "./MemberRightPanel";
import AddFamilyMemberModal from "./AddFamilyMemberModal";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useMemberDetailData } from "../../hooks/usePageData";
import { deleteHouseholdMember, getAuthUser, updateHouseholdMember } from "../../services/memberData";

export default function MemberDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userName, notificationCount } = useCurrentUser();
  const { loading, error, data, refetch } = useMemberDetailData(id);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleUpdate = async (form) => {
    setSaving(true);
    setActionError("");
    try {
      const user = await getAuthUser();
      await updateHouseholdMember(user.id, data.memberId, form);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!data?.hero?.name) return;
    if (!window.confirm(`Remove ${data.hero.name} from your household?`)) return;

    setActionError("");
    try {
      const user = await getAuthUser();
      await deleteHouseholdMember(user.id, data.memberId);
      navigate("/household");
    } catch (err) {
      setActionError(err.message || "Failed to delete family member.");
    }
  };

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
              {actionError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {actionError}
                </p>
              )}
              {!loading && !data && !error && (
                <p className="text-sm text-gray-500">Member not found.</p>
              )}
              {data && (
                <>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="border border-gray-200 hover:border-gray-300 text-[#1a2a5e] text-[13px] font-semibold px-4 py-2 rounded-xl"
                    >
                      Edit Member
                    </button>
                    {!data.isPrimary && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="border border-red-200 hover:border-red-300 text-red-600 text-[13px] font-semibold px-4 py-2 rounded-xl"
                      >
                        Delete Member
                      </button>
                    )}
                  </div>
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

      {data && (
        <AddFamilyMemberModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleUpdate}
          saving={saving}
          mode="edit"
          initialData={data.formData}
        />
      )}
    </div>
  );
}
