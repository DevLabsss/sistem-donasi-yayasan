import { Check, Clock3, X } from "lucide-react";
import { formatTanggal } from "../utils/format";
import { parseJudulPengajuan } from "../utils/pengajuan";
import { findRelatedDisbursement } from "../utils/assistanceFlow";
import "../styles/assistance-flow.css";

export default function AssistanceFlow({ application, disbursements = [], onDetail, onCancel, compact = false }) {
  if (!application) return null;
  const { judul } = parseJudulPengajuan(application.judul);
  const pending = application.status === "MENUNGGU";
  const approved = application.status === "DISETUJUI";
  const rejected = application.status === "DITOLAK";
  const canceled = application.status === "DIBATALKAN";
  const related = approved ? findRelatedDisbursement(application, disbursements) : null;
  const steps = [
    { label: "Dikirim", detail: formatTanggal(application.createdAt), state: "done" },
    { label: "Verifikasi", detail: pending ? "Menunggu pengurus" : canceled ? "Dihentikan pemohon" : "Selesai ditinjau", state: pending ? "current" : canceled ? "canceled" : "done" },
    ...(!canceled ? [{ label: "Keputusan", detail: pending ? "Belum diputuskan" : approved ? "Disetujui" : "Ditolak", state: pending ? "upcoming" : rejected ? "rejected" : "done" }] : []),
    ...(!rejected && !canceled ? [{ label: "Penyaluran", detail: related ? formatTanggal(related.tanggalSalur) : approved ? "Belum tercatat" : "Setelah disetujui", state: related ? "done" : approved ? "current" : "upcoming" }] : []),
  ];
  const summary = pending
    ? "Pengajuan tercatat dan menunggu pemeriksaan pengurus."
    : canceled
      ? "Pengajuan dibatalkan oleh pemohon sebelum keputusan pengurus."
      : rejected
      ? "Pengajuan ditolak. Baca catatan pengurus pada detail pengajuan."
      : related
        ? "Bantuan untuk pengajuan ini tercatat telah disalurkan."
        : "Pengajuan disetujui. Penyaluran bantuan belum tercatat untuk pengajuan ini.";

  return <section className={`recipient-flow${compact ? " recipient-flow--compact" : ""}`} aria-label={`Alur pengajuan ${judul}`}>
    <div className="recipient-flow-heading">
      <div>
        <span className="recipient-flow-eyebrow">Alur pengajuan #{application.id}</span>
        <h2>{judul}</h2>
        <p role="status">{summary}</p>
      </div>
      {(onDetail || onCancel) && <div className="recipient-flow-actions">
        {onDetail && <button type="button" className="recipient-flow-detail" onClick={onDetail}>Lihat detail pengajuan</button>}
        {onCancel && pending && <button type="button" className="recipient-flow-cancel" onClick={onCancel}>Batalkan pengajuan</button>}
      </div>}
    </div>
    <ol className={`recipient-flow-steps${steps.length === 3 ? " is-three" : steps.length === 2 ? " is-two" : ""}`}>
      {steps.map((step, index) => <li key={step.label} className={`recipient-flow-step is-${step.state}`}>
        <span className="recipient-flow-marker" aria-hidden="true">{step.state === "done" ? <Check size={17} /> : step.state === "rejected" ? <X size={17} /> : step.state === "current" ? <Clock3 size={17} /> : String(index + 1).padStart(2, "0")}</span>
        <div><strong>{step.label}</strong><span>{step.detail}</span></div>
      </li>)}
    </ol>
  </section>;
}
