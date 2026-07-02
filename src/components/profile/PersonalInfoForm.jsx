import { useEffect, useState } from "react";
import FormField from "./FormField";
import PaymentMethodCard from "../payments/PaymentMethodCard";

const states = ["NY", "NJ", "CT", "PA", "MA"];

const contactPrefs = [
  {
    id: "email",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    iconColor: "text-[#1a6bdc]",
    title: "Email",
    description: "Receive communications via email",
  },
  {
    id: "sms",
    icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
    iconColor: "text-gray-400",
    title: "Mobile Phone (SMS)",
    description: "Receive text messages on your phone",
  },
  {
    id: "both",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    iconColor: "text-gray-400",
    title: "Both Email & SMS",
    description: "Receive communications via both",
  },
];

export default function PersonalInfoForm({ initialForm, initialContactPref = "email", onSave, onCancel }) {
  const [form, setForm] = useState(initialForm || {
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [contactPref, setContactPref] = useState(initialContactPref);

  useEffect(() => {
    if (initialForm) setForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    if (initialContactPref) setContactPref(initialContactPref);
  }, [initialContactPref]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-[16px] font-semibold text-gray-800">Personal Information</h3>
          <p className="text-[13px] text-gray-400 mt-0.5">View and update your personal details.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onCancel}
            className="border border-gray-200 hover:border-gray-300 text-[#1a2a5e] text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave?.(form, contactPref)}
            className="bg-[#1a2a5e] hover:bg-[#243672] text-white text-[13px] font-semibold px-5 py-2 rounded-xl transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <FormField label="First Name" required value={form.firstName} onChange={update("firstName")}
          icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        <FormField label="Last Name" required value={form.lastName} onChange={update("lastName")} />
      </div>

      {/* Email + mobile */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <FormField label="Email Address" required value={form.email} onChange={update("email")} disabled
          icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        <FormField label="Mobile Number" required value={form.mobile} onChange={update("mobile")}
          icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </div>

      {/* Address */}
      <div className="mb-5">
        <FormField label="Address" required value={form.address} onChange={update("address")}
          icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </div>

      {/* City / State / Zip */}
      <div className="grid grid-cols-3 gap-5 mb-7">
        <FormField label="City" required value={form.city} onChange={update("city")} />

        {/* State select */}
        <div>
          <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
            State <span className="text-[#e53e3e]">*</span>
          </label>
          <div className="relative">
            <select
              value={form.state}
              onChange={update("state")}
              className="w-full appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-800
                focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/15 focus:border-[#1a2a5e] cursor-pointer"
            >
              {states.map((s) => <option key={s}>{s}</option>)}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <FormField label="ZIP Code" required value={form.zip} onChange={update("zip")} />
      </div>

      {/* Preferred Contact Information */}
      <div>
        <h4 className="text-[14px] font-semibold text-gray-800">Preferred Contact Information</h4>
        <p className="text-[12px] text-gray-400 mt-0.5 mb-4">
          Select how you prefer to receive important updates and notifications.
        </p>

        <div className="grid grid-cols-3 gap-4">
          {contactPrefs.map((p) => (
            <PaymentMethodCard
              key={p.id}
              icon={p.icon}
              iconColor={contactPref === p.id ? "text-[#1a6bdc]" : p.iconColor}
              title={p.title}
              description={p.description}
              selected={contactPref === p.id}
              onSelect={() => setContactPref(p.id)}
            />
          ))}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-5">
        <span className="text-[#e53e3e]">*</span> Required fields
      </p>
    </div>
  );
}
