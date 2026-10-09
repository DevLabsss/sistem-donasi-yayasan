import { CheckCircle2, Clock, XCircle } from "lucide-react";

// Status donasi dari backend: PENDING, BERHASIL, GAGAL.
// Status selalu disampaikan lewat ikon dan teks, bukan warna saja.
const PETA = {
  PENDING: {
    label: "Menunggu verifikasi",
    icon: Clock,
    className: "bg-gold-100 text-gold-900",
  },
  BERHASIL: {
    label: "Berhasil",
    icon: CheckCircle2,
    className: "bg-brand-100 text-brand-900",
  },
  GAGAL: {
    label: "Gagal",
    icon: XCircle,
    className: "bg-red-100 text-red-800",
  },
};

export default function StatusBadge({ status }) {
  const item = PETA[status] || PETA.PENDING;
  const Icon = item.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold ${item.className}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {item.label}
    </span>
  );
}
