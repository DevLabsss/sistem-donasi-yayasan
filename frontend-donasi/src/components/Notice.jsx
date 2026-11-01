import { AlertCircle, CheckCircle2, X } from "lucide-react";

// Notifikasi inline untuk keberhasilan / kegagalan
export default function Notice({ type = "success", message, onClose }) {
  if (!message) return null;
  const isError = type === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`text-xs p-3 rounded-xl border font-medium flex items-start gap-2 text-left ${
        isError
          ? "bg-red-50 text-red-700 border-red-100"
          : "bg-emerald-50 text-emerald-700 border-emerald-100"
      }`}
    >
      {isError ? (
        <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
      ) : (
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-px" />
      )}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full opacity-70 hover:bg-black/5 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          aria-label="Tutup notifikasi"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
