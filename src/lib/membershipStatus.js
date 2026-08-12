export function getStatusBadgeClass(status) {
  const s = (status || "pending").toLowerCase();
  if (s === "active") return "bg-[#dcfce7] text-[#16a34a]";
  if (s === "overdue") return "bg-[#ffedd5] text-[#ea580c]";
  if (s === "cancelled" || s === "paused") return "bg-gray-100 text-gray-500";
  return "bg-[#fef9c3] text-[#a16207]";
}
