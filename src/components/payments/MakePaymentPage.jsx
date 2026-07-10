import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import TopBar from "../dashboard/TopBar";
import PaymentStepper from "./PaymentStepper";
import EncouragementBanner from "./EncouragementBanner";
import PaymentDetailsForm from "./PaymentDetailsForm";
import PaymentSummary from "./PaymentSummary";
import ContributionImpact from "./ContributionImpact";
import SecurePaymentNotice from "./SecurePaymentNotice";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { formatCurrency, getPlanMonthlyAmount, PLAN_LABELS } from "../../lib/format";
import { fetchMembership, getAuthUser } from "../../services/memberData";
import {
  createStripeCheckoutSession,
  verifyStripeCheckoutSession,
} from "../../services/stripePayments";

const TEST_MINUTES = Number(import.meta.env.VITE_AUTO_PAY_TEST_MINUTES || 10);
const TEST_MODE = String(import.meta.env.VITE_AUTO_PAY_TEST_MODE || "true").toLowerCase() !== "false";

export default function MakePaymentPage() {
  const { userName, notificationCount } = useCurrentUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paying, setPaying] = useState(false);
  const [defaultAmount, setDefaultAmount] = useState("100");
  const [planLabel, setPlanLabel] = useState("Membership");
  const [planKey, setPlanKey] = useState("");
  const [paymentData, setPaymentData] = useState({
    amount: "100",
    contributionType: "Monthly Membership Auto-Pay",
  });
  const [verifyState, setVerifyState] = useState({
    loading: false,
    verified: false,
    amount: null,
    autoPay: false,
    nextChargeDate: null,
    testMode: false,
    paymentRecorded: false,
    error: "",
  });

  const subscriptionSuccess = searchParams.get("subscription") === "success";
  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";
  const sessionId = searchParams.get("session_id");
  const paidSuccess = success || subscriptionSuccess;

  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const user = await getAuthUser();
        const membership = await fetchMembership(user.id);
        const key = membership?.plan_key?.toLowerCase() || "";
        const monthly = getPlanMonthlyAmount(key, membership?.monthly_amount);
        const label = key ? PLAN_LABELS[key] : "Membership";

        setPlanLabel(label);
        setPlanKey(key);
        setDefaultAmount(String(monthly));
        setPaymentData({
          amount: String(monthly),
          contributionType: `Monthly — ${label} Membership Auto-Pay`,
        });
      } catch {
        setDefaultAmount("100");
      }
    };

    loadDefaults();
  }, []);

  const verifiedSessionRef = useRef(null);

  const runVerification = async (id) => {
    setVerifyState({
      loading: true,
      verified: false,
      amount: null,
      autoPay: false,
      nextChargeDate: null,
      testMode: false,
      paymentRecorded: false,
      error: "",
    });
    try {
      const result = await verifyStripeCheckoutSession(id);
      setVerifyState({
        loading: false,
        verified: true,
        amount: result.amount,
        autoPay: Boolean(result.autoPay),
        nextChargeDate: result.nextChargeDate || null,
        testMode: Boolean(result.testMode),
        paymentRecorded: Boolean(result.paymentRecorded),
        error: "",
      });
      setPaymentData((prev) => ({
        ...prev,
        amount: String(result.amount),
        contributionType: result.testMode
          ? `Auto-Pay active (every ${TEST_MINUTES} min — test)`
          : "Auto-Pay active (same date each month)",
      }));
    } catch (err) {
      setVerifyState({
        loading: false,
        verified: false,
        amount: null,
        autoPay: false,
        nextChargeDate: null,
        testMode: false,
        paymentRecorded: false,
        error: err.message || "Payment verification failed.",
      });
    }
  };

  useEffect(() => {
    if (!paidSuccess || !sessionId) return;
    if (verifiedSessionRef.current === sessionId) return;
    verifiedSessionRef.current = sessionId;
    runVerification(sessionId);
  }, [paidSuccess, sessionId]);

  const handlePayWithStripe = async ({ amount, description, notes }) => {
    setPaying(true);
    try {
      setPaymentData({
        amount: String(amount),
        contributionType: `${planLabel} Membership — Monthly Auto-Pay`,
      });

      const { url } = await createStripeCheckoutSession({
        amount,
        description,
        notes,
        contributionType: "monthly",
        autoPay: true,
        planKey,
      });

      window.location.href = url;
    } finally {
      setPaying(false);
    }
  };

  const dismissStatus = () => {
    setSearchParams({});
    setVerifyState({
      loading: false,
      verified: false,
      amount: null,
      autoPay: false,
      nextChargeDate: null,
      testMode: false,
      paymentRecorded: false,
      error: "",
    });
  };

  const summaryAmount =
    verifyState.verified && verifyState.amount != null
      ? String(verifyState.amount)
      : paymentData.amount;

  const nextChargeLabel = verifyState.nextChargeDate
    ? new Date(verifyState.nextChargeDate).toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar userName={userName} notificationCount={notificationCount} title="Make a Payment" />
        <div className="bg-white px-6 -mt-px pb-3 border-b border-gray-100">
          <p className="text-[13px] text-gray-400">
            Pay your membership monthly amount and enable Auto-Pay with Stripe.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            <main className="flex-1 p-6 space-y-5 min-w-0">
              {paidSuccess && verifyState.loading && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[13px] text-blue-800">
                  Confirming your payment with Stripe...
                </div>
              )}

              {paidSuccess && verifyState.verified && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4">
                  <p className="text-[14px] font-semibold text-green-800">
                    Membership payment & Auto-Pay active
                  </p>
                  <p className="text-[13px] text-green-700 mt-1">
                    {verifyState.paymentRecorded
                      ? `${formatCurrency(verifyState.amount)} was charged and added to your dashboard.`
                      : `${formatCurrency(verifyState.amount)} Auto-Pay is active.`}
                    {verifyState.testMode
                      ? ` Next test charge in about ${TEST_MINUTES} minutes${nextChargeLabel ? ` (${nextChargeLabel})` : ""}.`
                      : nextChargeLabel
                        ? ` Next charge: ${nextChargeLabel}.`
                        : " Future charges will run on this date each month."}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <Link
                      to="/dashboard"
                      className="inline-flex bg-[#1a2a5e] hover:bg-[#243672] text-white text-[12px] font-semibold px-4 py-2 rounded-xl"
                    >
                      View Dashboard
                    </Link>
                    <button type="button" onClick={dismissStatus} className="text-green-700 text-[12px] font-semibold">
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {paidSuccess && verifyState.error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                  {verifyState.error}
                  <button
                    type="button"
                    onClick={() => sessionId && runVerification(sessionId)}
                    className="mt-2 block text-[12px] font-semibold text-red-700 underline"
                  >
                    Retry verification
                  </button>
                </div>
              )}

              {canceled && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-semibold text-amber-800">Payment canceled</p>
                    <p className="text-[13px] text-amber-700 mt-0.5">
                      No charge was made. You can try again when ready.
                    </p>
                  </div>
                  <button type="button" onClick={dismissStatus} className="text-amber-700 text-[12px] font-semibold">
                    Dismiss
                  </button>
                </div>
              )}

              {!paidSuccess && (
                <>
                  <PaymentStepper currentStep={1} />
                  <EncouragementBanner />
                  <PaymentDetailsForm
                    defaultAmount={defaultAmount}
                    planLabel={planLabel}
                    planKey={planKey}
                    testMode={TEST_MODE}
                    testMinutes={TEST_MINUTES}
                    onPayWithStripe={handlePayWithStripe}
                    paying={paying}
                  />
                </>
              )}

              <div className="flex items-center gap-2 text-[12px] text-gray-400 px-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Payments are processed securely by Stripe.
              </div>
            </main>

            <aside className="w-[300px] shrink-0 p-5 space-y-5 overflow-y-auto">
              <PaymentSummary
                amount={summaryAmount}
                contributionType={paymentData.contributionType}
                processingFee="0"
                paid={verifyState.verified}
              />
              <ContributionImpact />
              <SecurePaymentNotice />
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
    </div>
  );
}
