import LeftPanel from "./LeftPanel";
import AuthCard from "./AuthCard";
import RightPanel from "./RightPanel";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#f4f6fb] flex flex-col">
      {/* Top-right help link */}
      <div className="flex justify-end p-5 pr-8">
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3
              0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Need help?{" "}
          <a href="#" className="text-[#1a6bdc] font-medium hover:underline">
            Contact Support
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-10 lg:gap-8 items-center">
          {/* Left panel — hidden on mobile */}
          <div className="hidden lg:block">
            <LeftPanel />
          </div>

          {/* Center card */}
          <div className="w-full lg:w-[420px]">
            <AuthCard type="signin"/>
          </div>

          {/* Right panel — hidden on mobile */}
          <div className="hidden lg:block">
            <RightPanel />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 py-4 flex items-center justify-between border-t border-gray-200 bg-transparent">
        <p className="text-xs text-gray-400">© 2025 Chabad Bedford. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="text-xs text-gray-400 underline hover:text-gray-600 transition-colors">
            Privacy Policy
          </a>
          <span className="text-gray-300">|</span>
          <a href="#" className="text-xs text-gray-400 underline hover:text-gray-600 transition-colors">
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
}
