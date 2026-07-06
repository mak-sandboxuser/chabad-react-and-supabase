 
 import { supabase } from "../lib/supabase";
import {
  PLAN_LABELS,
  PLAN_MONTHLY,
  PLAN_PRICES,
  getPlanMonthlyAmount,
  formatCurrency,
  formatDate,
  formatShortDate,
  formatTime,
  getInitials,
  daysUntil,
  splitFullName,
  timeAgo,
} from "../lib/format";

export async function getAuthUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unable to load current user.");
  return user;
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchMembership(userId) {
  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchHousehold(userId) {
  const { data, error } = await supabase
    .from("households")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchHouseholdMembers(userId) {
  const { data, error } = await supabase
    .from("family_members")
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchHouseholdMemberById(memberId, userId) {
  const { data, error } = await supabase
    .from("family_members")
    .select("*")
    .eq("id", memberId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchPayments(userId, limit) {
  let query = supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("paid_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchContributions(userId) {
  const { data, error } = await supabase
    .from("contributions")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchRecurringContributions(userId) {
  const { data, error } = await supabase
    .from("recurring_contributions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchPaymentMethods(userId) {
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchBillingContact(userId) {
  const { data, error } = await supabase
    .from("billing_contacts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchNotifications(userId) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchUserSettings(userId) {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchSupportConfig() {
  const { data, error } = await supabase
    .from("support_config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, profileData) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...profileData, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function ensureHousehold(userId, profile) {
  const existing = await fetchHousehold(userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("households")
    .insert({
      user_id: userId,
      name: `${profile?.full_name || "My"}'s Household`,
      status: "active",
      member_since: new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addHouseholdMember(userId, householdId, memberData) {
  const { data, error } = await supabase
    .from("family_members")
    .insert({
      user_id: userId,
      household_id: householdId,
      full_name: memberData.fullName,
      relationship: memberData.relationship,
      role: memberData.role || "Member",
      status: "member",
      date_of_birth: memberData.dateOfBirth || null,
      email: memberData.email || null,
      phone: memberData.phone || null,
      is_primary: false,
      member_since: new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateHouseholdMember(userId, memberId, memberData) {
  const { data, error } = await supabase
    .from("family_members")
    .update({
      full_name: memberData.fullName,
      relationship: memberData.relationship,
      date_of_birth: memberData.dateOfBirth || null,
      email: memberData.email || null,
      phone: memberData.phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteHouseholdMember(userId, memberId) {
  const member = await fetchHouseholdMemberById(memberId, userId);
  if (!member) throw new Error("Family member not found.");
  if (member.is_primary) {
    throw new Error("You cannot delete the primary household member (your account).");
  }

  const { error } = await supabase
    .from("family_members")
    .delete()
    .eq("id", memberId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) throw error;
}

function getDisplayName(profile, user) {
  const metadata = user?.user_metadata || {};
  return (
    profile?.full_name ||
    metadata.full_name ||
    metadata.name ||
    user?.email?.split("@")[0] ||
    "Member"
  );
}

function getCommitment(membership) {
  const planKey = membership?.plan_key?.toLowerCase();
  if (planKey && PLAN_PRICES[planKey]) {
    return PLAN_PRICES[planKey];
  }
  return Number(membership?.annual_commitment || 0);
}

function getMonthlyAmount(membership) {
  return getPlanMonthlyAmount(membership?.plan_key, membership?.monthly_amount);
}

function getPaidTotal(_contributions, payments = []) {
  return payments
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

export function buildCurrentUserData(profile, user, notifications) {
  const displayName = getDisplayName(profile, user);
  const unreadCount = (notifications || []).filter((n) => !n.is_read).length;
  return { userName: displayName, notificationCount: unreadCount, profile, user };
}

export function buildDashboardData({ profile, user, membership, payments, contributions, householdMembers, notifications, recurring = [] }) {
  const displayName = getDisplayName(profile, user);
  const commitment = getCommitment(membership);
  const paidTotal = getPaidTotal(contributions, payments);
  const activeAutoPay = recurring.find(
    (item) => item.status === "active" && item.stripe_subscription_id,
  );
  const nextContribution = contributions
    .filter((item) => item.status !== "paid" && item.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const nextAmount = activeAutoPay
    ? Number(activeAutoPay.amount)
    : Number(nextContribution?.amount || getMonthlyAmount(membership));
  const nextDueDate = activeAutoPay?.next_charge_date || nextContribution?.due_date || null;

  return {
    userName: displayName,
    notificationCount: unreadCount,
    stats: [
      {
        label: "Membership Tier",
        value: membership?.plan_key ? PLAN_LABELS[membership.plan_key] || membership.plan_key : "Not selected",
        sub: "Annual Membership",
      },
      {
        label: "Membership Status",
        value: membership?.status || "pending",
        sub: membership?.started_at ? `Member since ${formatShortDate(membership.started_at)}` : "Complete membership setup",
      },
      {
        label: "Annual Commitment",
        value: formatCurrency(commitment),
        sub: "Billed Annually",
      },
      {
        label: "Household",
        value: householdMembers.length ? `${displayName.split(" ")[0]}'s Household` : "No household yet",
        sub: `${householdMembers.length} Members`,
      },
    ],
    contributionSummary: {
      totalCommitment: commitment,
      totalContributed: paidTotal,
      outstanding: Math.max(commitment - paidTotal, 0),
      nextAmount,
      nextDueDate,
      autoPayEnabled: Boolean(activeAutoPay),
      autoPayDay: activeAutoPay?.charge_day_of_month || 5,
    },
    recentPayments: payments.slice(0, 5).map((item) => ({
      date: formatShortDate(item.paid_at),
      description: item.description || "Contribution",
      amount: formatCurrency(item.amount),
      status: item.status || "paid",
    })),
    householdMembers: householdMembers.slice(0, 4).map((member) => ({
      initials: getInitials(member.full_name),
      name: member.full_name,
      role: member.role || "Member",
      badge: member.status || "member",
    })),
    notifications: notifications.slice(0, 4).map((item) => ({
      title: item.title,
      body: item.body,
      time: timeAgo(item.created_at),
      type: item.type || "info",
      isRead: item.is_read,
    })),
  };
}

export function buildMembershipData({ membership }) {
  const planLabel = membership?.plan_key ? PLAN_LABELS[membership.plan_key] : "Not selected";
  const renewalDays = daysUntil(membership?.renewal_date);
  return {
    hero: {
      membershipName: membership?.membership_name || `${planLabel} Membership`,
      status: membership?.status || "pending",
    },
    info: {
      membershipName: membership?.membership_name || `${planLabel} Membership`,
      planKey: membership?.plan_key,
      planLabel,
      status: membership?.status || "pending",
      startedAt: membership?.started_at,
      renewalDate: membership?.renewal_date,
      renewalDays,
      annualCommitment: getCommitment(membership),
      notes: membership?.notes || "Thank you for being a valued member of our community.",
    },
    panel: {
      memberSince: membership?.started_at,
      planLabel,
      annualCommitment: getCommitment(membership),
      status: membership?.status || "pending",
      renewalDate: membership?.renewal_date,
    },
  };
}

export function buildHouseholdData({ profile, household, members }) {
  const primary = members.find((m) => m.is_primary) || members[0];
  return {
    householdId: household?.id || null,
    hero: {
      name: household?.name || "My Household",
      status: household?.status || "active",
    },
    info: {
      name: household?.name || "My Household",
      addressLine1: household?.address_line1 || profile?.address,
      city: household?.city || profile?.city,
      state: household?.state || profile?.state,
      zip: household?.zip || profile?.zip,
      country: household?.country || profile?.country || "India",
      ownerName: primary?.full_name || profile?.full_name,
      memberSince: household?.member_since || primary?.member_since,
    },
    members: members.map((m) => ({
      id: m.id,
      initials: getInitials(m.full_name),
      name: m.full_name,
      isYou: m.is_primary,
      isPrimary: m.is_primary,
      relationship: m.relationship || "Member",
      role: m.role || "Member",
      roleStyle: m.status === "owner" ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#dbeafe] text-[#1a6bdc]",
      dob: m.date_of_birth ? formatDate(m.date_of_birth) : "-",
      dateOfBirth: m.date_of_birth || "",
      email: m.email || "",
      phone: m.phone || "",
    })),
    panel: {
      totalMembers: members.length,
      status: household?.status || "active",
      memberSince: household?.member_since,
    },
  };
}

export function buildMemberDetailData({ member, household, members, profile }) {
  const primary = members.find((m) => m.is_primary);
  return {
    memberId: member?.id,
    isPrimary: member?.is_primary,
    formData: {
      fullName: member?.full_name || "",
      relationship: member?.relationship || "Other",
      dateOfBirth: member?.date_of_birth || "",
      email: member?.email || "",
      phone: member?.phone || "",
    },
    hero: {
      name: member?.full_name,
      initials: getInitials(member?.full_name),
      status: member?.status || "member",
      relationship: member?.relationship,
      memberSince: member?.member_since,
    },
    info: {
      fullName: member?.full_name,
      relationship: member?.relationship,
      role: member?.role,
      dateOfBirth: member?.date_of_birth,
      memberSince: member?.member_since,
    },
    contact: {
      email: member?.email || profile?.email,
      phone: member?.phone || profile?.mobile,
      preferredContact: member?.preferred_contact || profile?.contact_preference || "email",
      mailingAddress: member?.mailing_address || [profile?.address, profile?.city, profile?.state, profile?.zip].filter(Boolean).join(", "),
    },
    panel: {
      householdName: household?.name,
      totalMembers: members.length,
      ownerName: primary?.full_name,
      memberSince: household?.member_since,
      status: household?.status,
    },
  };
}

export function buildFinancialData({ membership, contributions, payments, recurring, paymentMethods, billingContact }) {
  const commitment = getCommitment(membership);
  const paidTotal = getPaidTotal(contributions, payments);
  const outstanding = Math.max(commitment - paidTotal, 0);
  const paidPercent = commitment ? Math.round((paidTotal / commitment) * 100) : 0;
  const activeRecurring = recurring.filter((r) => r.status === "active");
  const recurringTotal = activeRecurring.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const monthlyTotals = Array(12).fill(0);
  payments.forEach((p) => {
    const month = new Date(p.paid_at).getMonth();
    monthlyTotals[month] += Number(p.amount || 0);
  });

  return {
    stats: [
      { label: "Annual Commitment", value: formatCurrency(commitment), sub: `Commitment for ${new Date().getFullYear()}`, subColor: "text-[#1a6bdc]" },
      { label: "Contributions Made", value: formatCurrency(paidTotal), sub: `${paidPercent}% of commitment`, subColor: "text-[#16a34a]" },
      { label: "Outstanding Balance", value: formatCurrency(outstanding), sub: `${100 - paidPercent}% remaining`, subColor: "text-[#ea580c]" },
      { label: "Active Recurring", value: formatCurrency(recurringTotal), sub: activeRecurring[0]?.frequency || "Monthly", subColor: "text-[#7c3aed]" },
    ],
    yearlySummary: {
      contributed: paidTotal,
      pledged: 0,
      outstanding,
      commitment,
      percent: paidPercent,
    },
    monthlyChart: monthlyTotals,
    recurring: activeRecurring.map((r) => ({
      description: r.description,
      amount: formatCurrency(r.amount),
      frequency: r.frequency,
      nextCharge: formatDate(r.next_charge_date),
      status: r.status,
    })),
    panel: {
      membershipName: membership?.membership_name || PLAN_LABELS[membership?.plan_key],
      status: membership?.status,
      memberSince: membership?.started_at,
      renewalDate: membership?.renewal_date,
      paymentMethods: paymentMethods.map((pm) => ({
        label: pm.brand ? `${pm.brand} ending in ${pm.last_four}` : `•••• ${pm.last_four}`,
        isPrimary: pm.is_primary,
        type: pm.type,
      })),
      billingContact: billingContact || null,
    },
  };
}

export function buildContributionsData({ payments }) {
  const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  return {
    count: payments.length,
    total: formatCurrency(total),
    transactions: payments.map((p) => ({
      date: formatShortDate(p.paid_at),
      amount: formatCurrency(p.amount),
      method: p.payment_method || "card",
      methodLabel: p.payment_method_label || "Payment method",
      status: p.status === "paid" ? "Completed" : p.status === "pending" ? "Pending" : "Failed",
      ref: p.reference_number || `TXN-${p.id}`,
    })),
  };
}

export function buildProfileData({ profile, membership, user }) {
  const names = profile?.first_name
    ? { firstName: profile.first_name, lastName: profile.last_name || "" }
    : splitFullName(profile?.full_name || "");

  return {
    form: {
      firstName: names.firstName,
      lastName: names.lastName,
      email: profile?.email || user?.email || "",
      mobile: profile?.mobile || "",
      address: profile?.address || "",
      city: profile?.city || "",
      state: profile?.state || "",
      zip: profile?.zip || "",
    },
    contactPref: profile?.contact_preference || "email",
    summary: {
      initials: getInitials(profile?.full_name),
      fullName: profile?.full_name || user?.email,
      memberSince: membership?.started_at,
      status: membership?.status || "active",
    },
    security: {
      lastSignIn: profile?.last_sign_in_at || user?.last_sign_in_at,
    },
  };
}

export function buildNotificationsPageData(notifications) {
  return notifications.map((n) => ({
    id: n.id,
    title: n.title,
    description: n.body,
    date: formatShortDate(n.created_at),
    time: formatTime(n.created_at),
    isUnread: !n.is_read,
    type: n.type,
  }));
}

export async function fetchAllMemberData() {
  const user = await getAuthUser();
  const userId = user.id;

  const [
    profile,
    membership,
    household,
    householdMembers,
    payments,
    contributions,
    recurring,
    paymentMethods,
    billingContact,
    notifications,
    userSettings,
    supportConfig,
  ] = await Promise.all([
    fetchProfile(userId),
    fetchMembership(userId),
    fetchHousehold(userId),
    fetchHouseholdMembers(userId),
    fetchPayments(userId),
    fetchContributions(userId),
    fetchRecurringContributions(userId),
    fetchPaymentMethods(userId),
    fetchBillingContact(userId),
    fetchNotifications(userId),
    fetchUserSettings(userId),
    fetchSupportConfig(),
  ]);

  return {
    user,
    profile,
    membership,
    household,
    householdMembers,
    payments,
    contributions,
    recurring,
    paymentMethods,
    billingContact,
    notifications,
    userSettings,
    supportConfig,
    currentUser: buildCurrentUserData(profile, user, notifications),
    dashboard: buildDashboardData({ profile, user, membership, payments, contributions, householdMembers, notifications, recurring }),
    membershipPage: buildMembershipData({ membership }),
    householdPage: buildHouseholdData({ profile, household, members: householdMembers }),
    financial: buildFinancialData({ membership, contributions, payments, recurring, paymentMethods, billingContact }),
    contributionsPage: buildContributionsData({ payments }),
    profilePage: buildProfileData({ profile, membership, user }),
    notificationsPage: buildNotificationsPageData(notifications),
    billingPortalUrl: profile?.billing_portal_url || "https://billing.stripe.com/p/login/your-portal-link",
  };
}
