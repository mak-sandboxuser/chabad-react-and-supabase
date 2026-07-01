export default function SecurePaymentNotice() {
  return (
    <div className="bg-[#eef1f9] rounded-2xl border border-[#dbe3f5] p-5">
      <div className="flex items-center gap-2.5 mb-2">
        <svg className="w-4 h-4 text-[#1a2a5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-[13px] font-semibold text-[#1a2a5e]">Secure Payment</p>
      </div>
      <p className="text-[12px] text-gray-600 leading-relaxed">
        Your payment information is encrypted and secure. We never store your full card details.
      </p>
    </div>
  );
}
