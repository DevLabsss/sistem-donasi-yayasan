import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Dialog modal aksesibel: role=dialog, fokus terkunci di dalam, Esc menutup,
// scroll halaman dikunci, dan fokus dikembalikan ke pemicu saat ditutup.
export default function Dialog({ title, eyebrow, onClose, children }) {
  const panelRef = useRef(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const pemicu = document.activeElement;
    const overflowAwal = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const pertama = panel?.querySelector("[data-autofocus]") ||
      panel?.querySelector(FOCUSABLE);
    pertama?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const el = [...panel.querySelectorAll(FOCUSABLE)].filter(
        (n) => n.offsetParent !== null,
      );
      if (el.length === 0) return;
      const awal = el[0];
      const akhir = el[el.length - 1];
      if (e.shiftKey && document.activeElement === awal) {
        e.preventDefault();
        akhir.focus();
      } else if (!e.shiftKey && document.activeElement === akhir) {
        e.preventDefault();
        awal.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflowAwal;
      if (pemicu && typeof pemicu.focus === "function") pemicu.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-950/60 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-lg bg-white shadow-xl sm:rounded-lg"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2 id={titleId} className="mt-0.5 text-lg font-bold leading-snug">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-ink-muted hover:bg-brand-50 hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
