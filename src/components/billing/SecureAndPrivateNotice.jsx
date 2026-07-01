export default function SecureAndPrivateNotice() {
  return (
    <div className="bg-[#f0fdf4] rounded-2xl border border-[#bbf7d0] p-5">
      <div className="flex items-center gap-2.5 mb-2">
        <svg className="w-4 h-4 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-[13px] font-semibold text-[#16a34a]">Secure & Private</p>
      </div>
      <p className="text-[12px] text-gray-600 leading-relaxed">
        You are leaving our site and will be accessing a secure Stripe-hosted portal. Your data is safe and encrypted.
      </p>
    </div>
  );
}
