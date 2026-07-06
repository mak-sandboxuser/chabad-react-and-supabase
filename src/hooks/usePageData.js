import { useEffect, useState } from "react";
import {
  buildContributionsData,
  buildDashboardData,
  buildFinancialData,
  buildHouseholdData,
  buildMemberDetailData,
  buildMembershipData,
  buildNotificationsPageData,
  buildProfileData,
  fetchAllMemberData,
  fetchBillingContact,
  fetchContributions,
  fetchHousehold,
  fetchHouseholdMemberById,
  fetchHouseholdMembers,
  fetchMembership,
  fetchPaymentMethods,
  fetchPayments,
  fetchProfile,
  fetchNotifications,
  fetchRecurringContributions,
  getAuthUser,
} from "../services/memberData";
import { createBillingPortalSession } from "../services/stripePayments";

function useAsyncData(loadFn, deps = []) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await loadFn();
        if (active) setData(result);
      } catch (err) {
        if (active) setError(err.message || "Failed to load data.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [...deps, reloadKey]);

  const refetch = () => setReloadKey((k) => k + 1);

  return { loading, error, data, refetch };
}

export function useDashboardData() {
  const { loading, error, data, refetch } = useAsyncData(async () => {
    const user = await getAuthUser();
    const userId = user.id;
    const [profile, membership, allPayments, contributions, householdMembers, notifications, recurring] = await Promise.all([
      fetchProfile(userId),
      fetchMembership(userId),
      fetchPayments(userId),
      fetchContributions(userId),
      fetchHouseholdMembers(userId),
      fetchNotifications(userId).catch(() => []),
      fetchRecurringContributions(userId).catch(() => []),
    ]);
    return buildDashboardData({
      profile,
      user,
      membership,
      payments: allPayments,
      contributions,
      householdMembers,
      notifications,
      recurring,
    });
  });

  const safeData = data || {
    userName: "Member",
    notificationCount: 0,
    stats: [],
    contributionSummary: { totalCommitment: 0, totalContributed: 0, outstanding: 0, nextAmount: 0, nextDueDate: null, autoPayEnabled: false, autoPayDay: 5 },
    recentPayments: [],
    householdMembers: [],
    notifications: [],
  };

  return { loading, error, data: safeData, refetch };
}

export function useMembershipData() {
  return useAsyncData(async () => {
    const user = await getAuthUser();
    const membership = await fetchMembership(user.id);
    return buildMembershipData({ membership });
  });
}

export function useHouseholdData() {
  return useAsyncData(async () => {
    const user = await getAuthUser();
    const [profile, household, members] = await Promise.all([
      fetchProfile(user.id),
      fetchHousehold(user.id),
      fetchHouseholdMembers(user.id),
    ]);
    return buildHouseholdData({ profile, household, members });
  });
}

export function useMemberDetailData(memberId) {
  return useAsyncData(async () => {
    const user = await getAuthUser();
    const [profile, household, members, member] = await Promise.all([
      fetchProfile(user.id),
      fetchHousehold(user.id),
      fetchHouseholdMembers(user.id),
      fetchHouseholdMemberById(memberId, user.id),
    ]);
    return buildMemberDetailData({ member, household, members, profile });
  }, [memberId]);
}

export function useFinancialData() {
  return useAsyncData(async () => {
    const user = await getAuthUser();
    const userId = user.id;
    const [membership, contributions, payments, recurring, paymentMethods, billingContact] = await Promise.all([
      fetchMembership(userId),
      fetchContributions(userId),
      fetchPayments(userId),
      fetchRecurringContributions(userId),
      fetchPaymentMethods(userId),
      fetchBillingContact(userId),
    ]);
    return buildFinancialData({ membership, contributions, payments, recurring, paymentMethods, billingContact });
  });
}

export function useContributionsData() {
  return useAsyncData(async () => {
    const user = await getAuthUser();
    const payments = await fetchPayments(user.id);
    return buildContributionsData({ payments });
  });
}

export function useProfileData() {
  return useAsyncData(async () => {
    const user = await getAuthUser();
    const [profile, membership] = await Promise.all([
      fetchProfile(user.id),
      fetchMembership(user.id),
    ]);
    return buildProfileData({ profile, membership, user });
  });
}

export function useNotificationsData() {
  return useAsyncData(async () => {
    const all = await fetchAllMemberData();
    return all.notificationsPage;
  });
}

export function useBillingData() {
  return useAsyncData(async () => {
    const { url } = await createBillingPortalSession();
    return { billingPortalUrl: url };
  });
}

export function useSupportData() {
  return useAsyncData(async () => {
    const all = await fetchAllMemberData();
    return all.supportConfig;
  });
}

export { buildNotificationsPageData };
