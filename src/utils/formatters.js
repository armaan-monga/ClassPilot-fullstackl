export const formatCurrency = (amount = 0, currency = "INR") => {
  const symbol = currency === "INR" ? "₹" : currency;
  return `${symbol}${Number(amount).toLocaleString("en-IN")}`;
};

export const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateShort = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export const toISODate = (date) => new Date(date).toISOString().split("T")[0];
