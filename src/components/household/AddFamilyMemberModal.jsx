import { useEffect, useState } from "react";
import FormField from "../profile/FormField";

const BASE_RELATIONSHIPS = ["Spouse", "Child", "Parent", "Sibling", "Other"];

const emptyForm = {
  fullName: "",
  relationship: "Spouse",
  dateOfBirth: "",
  email: "",
  phone: "",
};

export default function AddFamilyMemberModal({
  open,
  onClose,
  onSubmit,
  saving,
  mode = "add",
  initialData = null,
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;
    if (isEdit && initialData) {
      setForm({ ...emptyForm, ...initialData });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [open, isEdit, initialData]);

  if (!open) return null;

  const relationships =
    isEdit && form.relationship === "Self"
      ? ["Self", ...BASE_RELATIONSHIPS]
      : BASE_RELATIONSHIPS;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleClose = () => {
    setForm(emptyForm);
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim()) {
      setError("Please enter the family member's full name.");
      return;
    }

    try {
      await onSubmit(form);
      setForm(emptyForm);
      onClose();
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? "update" : "add"} family member.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
        aria-label="Close"
      />

      <div className="relative bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-lg p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-[18px] font-bold text-[#1a2a5e]">
              {isEdit ? "Edit Family Member" : "Add Family Member"}
            </h2>
            <p className="text-[13px] text-gray-400 mt-0.5">
              {isEdit ? "Update this household member's details." : "Add a person to your household."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Full Name"
            required
            value={form.fullName}
            onChange={update("fullName")}
            placeholder="Enter full name"
          />

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Relationship <span className="text-[#e53e3e]">*</span>
            </label>
            <select
              value={form.relationship}
              onChange={update("relationship")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/15"
            >
              {relationships.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <FormField
            label="Date of Birth"
            type="date"
            value={form.dateOfBirth}
            onChange={update("dateOfBirth")}
          />

          <FormField
            label="Email"
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="email@example.com"
          />

          <FormField
            label="Phone"
            value={form.phone}
            onChange={update("phone")}
            placeholder="Phone number"
          />

          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="border border-gray-200 hover:border-gray-300 text-[#1a2a5e] text-[13px] font-semibold px-4 py-2.5 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#1a2a5e] hover:bg-[#243672] disabled:opacity-50 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl"
            >
              {saving ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save Changes" : "Add Member")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
