// Badge status generik. `map` adalah salah satu peta status di utils/format.js
export default function StatusBadge({ status, map, className = "" }) {
  const cfg = map?.[status] || {
    label: status || "-",
    className: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide w-max ${cfg.className} ${className}`}
    >
      {cfg.label}
    </span>
  );
}
