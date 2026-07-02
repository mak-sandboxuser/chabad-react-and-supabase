import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const PLAN_PRICES = {
  basic: 999,
  standard: 2499,
  premium: 4999,
};

function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getInitials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Unable to load current user.");
        setLoading(false);
        return;
      }

      const [
        profileResult,
        membershipResult,
        paymentsResult,
        contributionsResult,
        householdMembersResult,
        notificationsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("memberships")
          .select("plan_key, status, annual_commitment, started_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("payments")
          .select("paid_at, description, amount, status")
          .eq("user_id", user.id)
          .order("paid_at", { ascending: false })
          .limit(5),
        supabase
          .from("contributions")
          .select("amount, status, due_date")
          .eq("user_id", user.id),
        supabase
          .from("household_members")
          .select("full_name, role, status, is_primary")
          .eq("user_id", user.id)
          .order("is_primary", { ascending: false })
          .order("created_at", { ascending: true })
          .limit(4),
        supabase
          .from("notifications")
          .select("title, body, type, created_at, is_read")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(4),
      ]);

      const queryError =
        profileResult.error ||
        membershipResult.error ||
        paymentsResult.error ||
        contributionsResult.error ||
        householdMembersResult.error ||
        notificationsResult.error;

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      const profile = profileResult.data;
      const membership = membershipResult.data;
      const payments = paymentsResult.data || [];
      const contributions = contributionsResult.data || [];
      const householdMembers = householdMembersResult.data || [];
      const notifications = notificationsResult.data || [];

      const paidTotal = contributions
        .filter((item) => item.status === "paid")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

      const commitment =
        Number(membership?.annual_commitment || 0) ||
        PLAN_PRICES[membership?.plan_key] ||
        0;

      const nextContribution = contributions
        .filter((item) => item.status !== "paid" && item.due_date)
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

      const unreadCount = notifications.filter((item) => !item.is_read).length;
      const displayName =
        profile?.full_name || user.user_metadata?.full_name || user.email || "Member";

      setDashboardData({
        userName: displayName,
        notificationCount: unreadCount,
        stats: [
          {
            label: "Membership Tier",
            value: membership?.plan_key
              ? `${membership.plan_key[0].toUpperCase()}${membership.plan_key.slice(1)}`
              : "Not selected",
            sub: "Annual Membership",
          },
          {
            label: "Membership Status",
            value: membership?.status || "pending",
            sub: membership?.started_at
              ? `Member since ${formatDate(membership.started_at)}`
              : "Complete membership setup",
          },
          {
            label: "Annual Commitment",
            value: formatCurrency(commitment),
            sub: "Billed Annually",
          },
          {
            label: "Household",
            value: householdMembers.length
              ? `${displayName.split(" ")[0]}'s Household`
              : "No household yet",
            sub: `${householdMembers.length} Members`,
          },
        ],
        contributionSummary: {
          totalCommitment: commitment,
          totalContributed: paidTotal,
          outstanding: Math.max(commitment - paidTotal, 0),
          nextAmount: Number(nextContribution?.amount || 0),
          nextDueDate: nextContribution?.due_date || null,
        },
        recentPayments: payments.map((item) => ({
          date: formatDate(item.paid_at),
          description: item.description || "Contribution",
          amount: formatCurrency(item.amount),
          status: item.status || "paid",
        })),
        householdMembers: householdMembers.map((member) => ({
          initials: getInitials(member.full_name),
          name: member.full_name,
          role: member.role || "Member",
          badge: member.status || "member",
        })),
        notifications: notifications.map((item) => ({
          title: item.title,
          body: item.body,
          time: timeAgo(item.created_at),
          type: item.type || "info",
          isRead: item.is_read,
        })),
      });

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const safeData = useMemo(
    () =>
      dashboardData || {
        userName: "Member",
        notificationCount: 0,
        stats: [],
        contributionSummary: {
          totalCommitment: 0,
          totalContributed: 0,
          outstanding: 0,
          nextAmount: 0,
          nextDueDate: null,
        },
        recentPayments: [],
        householdMembers: [],
        notifications: [],
      },
    [dashboardData]
  );

  return { loading, error, data: safeData };
}
