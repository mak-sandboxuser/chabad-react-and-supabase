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
  fetchPendingBillingRecord,
  verifyStripeCheckoutSession,
} from "../../services/stripePayments";

export default function MakePaymentPage() {
  const { userName, notificationCount } = useCurrentUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paying, setPaying] = useState(false);
  const [defaultAmount, setDefaultAmount] = useState("200");
  const [billingRecordId, setBillingRecordId] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: "200",
    contributionType: "Monthly Membership",
  });
  const [verifyState, setVerifyState] = useState({
    loading: false,
    verified: false,
    amount: null,
    autoPay: false,
    error: "",
  });

  const success = searchParams.get("success") === "true";
  const subscriptionSuccess = searchParams.get("subscription") === "success";
  const canceled = searchParams.get("canceled") === "true";
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const user = await getAuthUser();
        const [membership, pendingBill] = await Promise.all([
          fetchMembership(user.id),
          fetchPendingBillingRecord(user.id).catch(() => null),
        ]);

        const planKey = membership?.plan_key?.toLowerCase();
        const catalogMonthly = getPlanMonthlyAmount(planKey, membership?.monthly_amount);
        const billAmount = Number(pendingBill?.amount || 0);
        const monthly =
          billAmount > 0 && billAmount <= 1000 ? billAmount : catalogMonthly;

        const planLabel = planKey ? PLAN_LABELS[planKey] : "Membership";

        setDefaultAmount(String(monthly));
        setPaymentData({
          amount: String(monthly),
          contributionType: pendingBill?.plan_name
            ? `Monthly — ${pendingBill.plan_name}`
            : `Monthly — ${planLabel} Membership`,
        });

        if (pendingBill?.id && billAmount > 0 && billAmount <= 1000) {
          setBillingRecordId(pendingBill.id);
        } else {
          setBillingRecordId(null);
        }
      } catch {
        setDefaultAmount("200");
      }
    };

    loadDefaults();
  }, []);

  const verifiedSessionRef = useRef(null);

  const runVerification = async (id) => {
    setVerifyState({ loading: true, verified: false, amount: null, autoPay: false, error: "" });
    try {
      const result = await verifyStripeCheckoutSession(id);
      setVerifyState({
        loading: false,
        verified: true,
        amount: result.amount,
        autoPay: Boolean(result.autoPay),
        error: "",
      });
      setPaymentData((prev) => ({
        ...prev,
        amount: String(result.amount),
        contributionType: result.autoPay
          ? "Auto-Pay Enabled (5th of each month)"
          : "Membership Contribution (Paid)",
      }));
    } catch (err) {
      setVerifyState({
        loading: false,
        verified: false,
        amount: null,
        autoPay: false,
        error: err.message || "Payment verification failed.",
      });
    }
  };

  useEffect(() => {
    if ((!success && !subscriptionSuccess) || !sessionId) return;
    if (verifiedSessionRef.current === sessionId) return;
    verifiedSessionRef.current = sessionId;
    runVerification(sessionId);
  }, [success, subscriptionSuccess, sessionId]);

  const handlePayWithStripe = async ({ amount, description, notes, contributionType, autoPay }) => {
    setPaying(true);
    try {
      setPaymentData({
        amount: String(amount),
        contributionType: autoPay
          ? "Auto-Pay (5th of each month)"
          : contributionType === "monthly"
            ? "Monthly Membership"
            : "One-time Contribution",
      });

      const { url } = await createStripeCheckoutSession({
        amount,
        description,
        notes,
        contributionType,
        billingRecordId: autoPay ? null : billingRecordId,
        autoPay,
      });

      window.location.href = url;
    } finally {
      setPaying(false);
    }
  };

  const dismissStatus = () => {
    setSearchParams({});
    setVerifyState({ loading: false, verified: false, amount: null, autoPay: false, error: "" });
  };

  const summaryAmount =
    verifyState.verified && verifyState.amount != null
      ? String(verifyState.amount)
      : paymentData.amount;

  const summaryType = paymentData.contributionType;

  return (
    <div className="flex h-screen bg-[#f4f6fb] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar userName={userName} notificationCount={notificationCount} title="Make a Payment" />
        <div className="bg-white px-6 -mt-px pb-3 border-b border-gray-100">
          <p className="text-[13px] text-gray-400">Pay your membership contribution securely with Stripe.</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            <main className="flex-1 p-6 space-y-5 min-w-0">
              {(success || subscriptionSuccess) && verifyState.loading && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[13px] text-blue-800">
                  Confirming your payment with Stripe...
                </div>
              )}

              {(success || subscriptionSuccess) && verifyState.verified && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4">
                  <p className="text-[14px] font-semibold text-green-800">
                    {verifyState.autoPay ? "Auto-pay enabled" : "Payment complete"}
                  </p>
                  <p className="text-[13px] text-green-700 mt-1">
                    {verifyState.autoPay
                      ? `${formatCurrency(verifyState.amount)} will be charged automatically on the 5th of each month.`
                      : `${formatCurrency(verifyState.amount)} was recorded successfully. Your dashboard is updated.`}
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

              {(success || subscriptionSuccess) && verifyState.error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                  {verifyState.error}
                  <p className="mt-2 text-[12px]">
                    Redeploy the Edge Function: <code>supabase functions deploy create-checkout-session</code>
                    {" "}and set secret <code>SUPABASE_SERVICE_ROLE_KEY</code>.
                  </p>
                  <button
                    type="button"
                    onClick={() => sessionId && runVerification(sessionId)}
                    className="mt-2 text-[12px] font-semibold text-red-700 underline"
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

              {!success && !subscriptionSuccess && (
                <>
                  <PaymentStepper currentStep={1} />
                  <EncouragementBanner />
                  <PaymentDetailsForm
                    defaultAmount={defaultAmount}
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
                contributionType={summaryType}
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
