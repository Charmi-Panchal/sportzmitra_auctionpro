const STATUS_STYLES = {
  LIVE: "border-pink-300 bg-pink-100 text-pink-800",
  READY: "border-lime-300 bg-lime-100 text-lime-800",
  DRAFT: "border-amber-300 bg-amber-100 text-amber-800",
  SOLD: "border-emerald-300 bg-emerald-100 text-emerald-800",
  UNSOLD: "border-red-300 bg-red-100 text-red-800",
  FINAL_UNSOLD: "border-slate-300 bg-slate-100 text-slate-700",
  BIDDING: "border-amber-300 bg-amber-100 text-amber-800",
  PLAYER_ACTIVE: "border-sky-300 bg-sky-100 text-sky-800",
  AVAILABLE: "border-lime-300 bg-lime-100 text-lime-800",
  WITHDRAWN: "border-slate-300 bg-slate-200 text-slate-600",
};

export default function StatusBadge({ status }) {
  const activeStatus = status || "READY";
  const badgeStyle =
    STATUS_STYLES[activeStatus] || "border-slate-200 bg-slate-100 text-slate-800";

  return (
    <span
      className={`inline-block whitespace-nowrap rounded-lg border px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider ${badgeStyle}`}
    >
      {activeStatus.replaceAll("_", " ")}
    </span>
  );
}