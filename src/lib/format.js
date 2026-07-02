export const PLAN_PRICES = {
  basic: 1200,
  standard: 2400,
  premium: 3600,
};

export const PLAN_MONTHLY = {
  basic: 100,
  standard: 200,
  premium: 300,
};

export const PLAN_LABELS = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
};

export function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

export function formatDate(dateValue, options = {}) {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString("en-IN", {
    month: "long",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

export function formatShortDate(dateValue) {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(dateValue) {
  if (!dateValue) return "";
  return new Date(dateValue).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeAgo(dateValue) {
  if (!dateValue) return "";
  const seconds = Math.floor((Date.now() - new Date(dateValue).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function getInitials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function daysUntil(dateValue) {
  if (!dateValue) return null;
  const diff = Math.ceil((new Date(dateValue) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function splitFullName(fullName = "") {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
}
