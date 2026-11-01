import { useEffect, useId, useRef } from "react";
import { ArrowLeft, ArrowRight, HandHeart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { formatRupiah, hitungTerkumpul } from "../utils/format";

export function SectionHeading({ eyebrow, title, children, action }) {
  return <div className="section-heading">
    <div><span className="ds-eyebrow">{eyebrow}</span><h2>{title}</h2>{children && <p>{children}</p>}</div>
    {action}
  </div>;
}

export function EmptyState({ title, children, action }) {
  return <div className="ds-empty" role="status"><HandHeart aria-hidden="true" /><h3>{title}</h3>{children && <p>{children}</p>}{action}</div>;
}

export function LoadingCards({ label = "Memuat data", count = 3 }) {
  return <div role="status" aria-label={label} className="ds-grid ds-loading">
    <span className="sr-only">{label}</span>
    {Array.from({ length: count }, (_, i) => <div key={i} className="ds-card ds-skeleton" aria-hidden="true"><div /><div /><div /></div>)}
  </div>;
}

export function ProgramProgress({ program }) {
  const collected = hitungTerkumpul(program);
  const target = Number(program.targetDana || 0);
  const percent = target > 0 ? Math.min(100, Math.max(0, collected / target * 100)) : 0;
  return <div className="program-progress">
    <div className="ds-between"><span>Dana terkumpul</span><strong>{percent.toFixed(0)}%</strong></div>
    <progress max="100" value={percent} aria-label={`Progres donasi ${program.judul}`} />
    <dl className="ds-between"><div><dt>Terkumpul</dt><dd>{formatRupiah(collected)}</dd></div><div><dt>Target donasi</dt><dd>{formatRupiah(target)}</dd></div></dl>
  </div>;
}

// Native modal dialogs provide focus trapping, Escape and focus restoration.
export function Dialog({ title, onClose, children, className = "", hideHeader = false }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog ref={ref} className={`public-ui ds-dialog ${className}`} aria-labelledby={titleId}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    } }}>
    <div className={hideHeader ? "sr-only" : "ds-dialog-heading"}><h2 id={titleId}>{title}</h2>
      {!hideHeader && <button type="button" className="ds-icon-button" onClick={onClose} aria-label="Tutup dialog"><X /></button>}
    </div>
    {children}
  </dialog>;
}

export function AuthLayout({ title, description, children }) {
  return <main className="public-ui auth-page">
    <div className="ds-container auth-layout">
      <aside className="auth-story">
        <Link to="/" className="ds-text-link"><ArrowLeft size={16} /> Kembali ke beranda</Link>
        <span className="ds-eyebrow">Yayasan Mulia Karya Bersama</span>
        <h2>Kebaikan dimulai<br />dari langkah kecil.</h2>
        <p>Bersama mendukung pendidikan, kepedulian sosial, dan kemandirian umat.</p>
        <a className="ds-text-link" href="/#transparansi">Lihat laporan penyaluran <ArrowRight size={16} /></a>
      </aside>
      <div className="auth-card"><header><span className="ds-eyebrow">Ruang kebaikan Anda</span><h1>{title}</h1><p>{description}</p></header>{children}</div>
    </div>
  </main>;
}
