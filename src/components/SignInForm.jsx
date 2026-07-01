import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { use } from "react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const navigate = useNavigate()


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log(data);
console.log(error);
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    console.log("Logged in user:", data.user);

    navigate("/dashboard");
  };

  if (sent) {
    return (
      <div className="text-center py-6 space-y-3">
        <div className="w-14 h-14 rounded-full bg-[#eef1f9] flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-[#1a2a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-bold text-[#1a2a5e] text-lg">Check your inbox</h3>
        <p className="text-gray-500 text-sm">
          We sent a secure sign-in link to<br />
          <span className="font-medium text-[#1a2a5e]">{email}</span>
        </p>
        <button
          onClick={() => { setSent(false); setEmail(""); }}
          className="text-[#1a6bdc] text-sm hover:underline mt-2"
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Email input */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="you@example.com"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/20 focus:border-[#1a2a5e]
              placeholder:text-gray-400 transition-all"
          />
        </div>

        {/* Password input */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter your password"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
      focus:outline-none focus:ring-2 focus:ring-[#1a2a5e]/20 focus:border-[#1a2a5e]
      placeholder:text-gray-400 transition-all"
          />
        </div>

      </div>

      {/* Send button */}
      <button
        onClick={handleSubmit}
        disabled={!email || loading}
        className="w-full flex items-center justify-center gap-2 bg-[#1a2a5e] hover:bg-[#243672]
          disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5
          rounded-xl transition-colors duration-200 text-sm"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Sending…
          </>
        ) : (
          <>
            Login
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Support link */}
      <div className="text-center space-y-1">
        <Link to="/signup" className="text-sm text-[#1a6bdc] font-medium hover:underline">
          SingUp
        </Link>
      </div>
    </div>
  );
}
