import { useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import PaymentStepper from "./PaymentStepper";
import EncouragementBanner from "./EncouragementBanner";
import PaymentDetailsForm from "./PaymentDetailsForm";
import PaymentSummary from "./PaymentSummary";
import ContributionImpact from "./ContributionImpact";
import SecurePaymentNotice from "./SecurePaymentNotice";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export default function MakePaymentPage() {
  const { userName, notificationCount } = useCurrentUser();
  const [step, setStep] = useState(1);
  const [paymentData, setPaymentData] = useState({ amount: "150.00", method: "credit", notes: "" });

  const handleContinue = (data) => {
    setPaymentData(data);
    setStep(2);
    // Step 2 (Review) and Step 3 (Confirmation) screens can be added
    // as ReviewPayment.jsx / PaymentConfirmation.jsx components later.
  };

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      {/* ✅ Reused — NavLink auto-highlights /payments */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ✅ Reused TopBar */}
        <TopBar userName={userName} notificationCount={notificationCount} title="Make a Payment" />
        <div className="bg-white px-6 -mt-px pb-3 border-b border-gray-100">
          <p className="text-[13px] text-gray-400">Submit a one-time contribution to support our community.</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            {/* Main content */}
            <main className="flex-1 p-6 space-y-5 min-w-0">
              <PaymentStepper currentStep={step} />
              <EncouragementBanner />
              <PaymentDetailsForm onContinue={handleContinue} />

              <div className="flex items-center gap-2 text-[12px] text-gray-400 px-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Your payment information is secure and encrypted.
              </div>
            </main>

            {/* Right panel */}
            <aside className="w-[300px] shrink-0 p-5 space-y-5 overflow-y-auto">
              <PaymentSummary
                amount={paymentData.amount}
                contributionType="One-time Contribution"
                processingFee="0.00"
              />
              <ContributionImpact />
              <SecurePaymentNotice />
            </aside>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
          <p className="text-[11px] text-gray-400">© 2025 Chabad Bedford. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[11px] text-gray-400 underline hover:text-gray-600">Privacy Policy</a>
            <span className="text-gray-200 text-[11px]">|</span>
            <a href="#" className="text-[11px] text-gray-400 underline hover:text-gray-600">Terms of Service</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
