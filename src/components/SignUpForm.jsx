import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

import { PLAN_MONTHLY, PLAN_PRICES, formatCurrency } from "../lib/format";

const MEMBERSHIP_PLANS = [
  {
    id: "basic",
    name: "Basic",
    priceLabel: `${formatCurrency(PLAN_PRICES.basic)}/year`,
    monthlyLabel: `${formatCurrency(PLAN_MONTHLY.basic)}/month`,
  },
  {
    id: "standard",
    name: "Standard",
    priceLabel: `${formatCurrency(PLAN_PRICES.standard)}/year`,
    monthlyLabel: `${formatCurrency(PLAN_MONTHLY.standard)}/month`,
  },
  {
    id: "premium",
    name: "Premium",
    priceLabel: `${formatCurrency(PLAN_PRICES.premium)}/year`,
    monthlyLabel: `${formatCurrency(PLAN_MONTHLY.premium)}/month`,
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpForm() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const next = {};
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      next.fullName = "Full name is required.";
    } else if (trimmedName.length <= 3) {
      next.fullName = "Full name must be more than 3 characters.";
    }

    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      next.email = "Please enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required.";
    }

    if (!selectedPlan) {
      next.selectedPlan = "Please choose a membership plan.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          membership_plan: selectedPlan,
          monthly_contribution: PLAN_MONTHLY[selectedPlan],
        },
      },
    });

    setLoading(false);

    if (error) {
      return alert(error.message);
    }

    setSuccess(true);
    navigate("/dashboard");
  };

  if (success) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <svg
            className="w-7 h-7 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-[#1a2a5e]">
          Account Created
        </h2>

        <p className="text-gray-500 text-sm">
          We've sent a verification email to
          <br />
          <span className="font-semibold text-[#1a2a5e]">{email}</span>
        </p>

        <button
          onClick={() => navigate("/signin")}
          className="bg-[#1a2a5e] text-white px-6 py-3 rounded-xl hover:bg-[#243672]"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          Full Name``
        </label>

        <input
          type="text"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
          }}
          className={`w-full px-4 py-3 border rounded-xl text-sm
            focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/20
            ${errors.fullName ? "border-red-400" : "border-gray-200"}`}
        />
        {errors.fullName && (
          <p className="text-xs text-red-500">{errors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          Email Address
        </label>

        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
          }}
          className={`w-full px-4 py-3 border rounded-xl text-sm
            focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/20
            ${errors.email ? "border-red-400" : "border-gray-200"}`}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          Password
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
            }}
            className={`w-full pl-4 pr-11 py-3 border rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/20
              ${errors.password ? "border-red-400" : "border-gray-200"}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password}</p>
        )}
      </div>

      {/* Membership Plan */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Membership Plan
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {MEMBERSHIP_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => {
                  setSelectedPlan(plan.id);
                  if (errors.selectedPlan) setErrors((prev) => ({ ...prev, selectedPlan: "" }));
                }}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  isSelected
                    ? "border-[#1a2a5e] bg-[#eef1f9]"
                    : errors.selectedPlan
                      ? "border-red-400"
                      : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="text-[13px] font-semibold text-gray-800">{plan.name}</p>
                <p className="text-xs text-gray-500 mt-1">{plan.priceLabel}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{plan.monthlyLabel} contribution</p>
              </button>
            );
          })}
        </div>
        {errors.selectedPlan && (
          <p className="text-xs text-red-500">{errors.selectedPlan}</p>
        )}
      </div>

      {/* Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#1a2a5e]
        hover:bg-[#243672] disabled:opacity-50 text-white font-semibold
        py-3.5 rounded-xl transition"
      >
        {loading ? (
          <>
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0A12 12 0 000 12h4z"
              />
            </svg>
            Creating Account...
          </>
        ) : (
          <>
            Sign Up
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <button
          onClick={() => navigate("/signin")}
          className="text-sm text-[#1a6bdc] hover:underline"
        >
          Already have an account? Login
        </button>

      </div>
    </div>
  );
}