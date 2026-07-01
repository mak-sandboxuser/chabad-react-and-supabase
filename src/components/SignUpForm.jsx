import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function SignUpForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      return alert("Please fill all fields.");
    }

    if (password !== confirmPassword) {
      return alert("Passwords do not match.");
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });


console.log(data);
console.log(error);

    setLoading(false);

    if (error) {
      return alert(error.message);
    }

    console.log(data);

    
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
      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          Email Address
        </label>

        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border rounded-xl border-gray-200 text-sm
          focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/20"
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          Password
        </label>

        <input
          type="password"
          placeholder="Create password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border rounded-xl border-gray-200 text-sm
          focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/20"
        />
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          Confirm Password
        </label>

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 border rounded-xl border-gray-200 text-sm
          focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/20"
        />
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