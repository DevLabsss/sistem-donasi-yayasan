export default function ProgressBar({ value, label }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-brand-100"
    >
      <div
        className="h-full rounded-full bg-brand-700 transition-[width] duration-700 ease-out"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
