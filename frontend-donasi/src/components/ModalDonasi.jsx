import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Check, Copy } from "lucide-react";
import API from "../services/api";
import qrisImage from "../assets/qris-yayasan.jpeg";
import { yayasan } from "../content/yayasan";
import { kodeReferensi, pesanGalat, rupiah } from "../lib/format";
import Button from "./ui/Button";
import Dialog from "./ui/Dialog";
import Field from "./ui/Field";
import { inputClass } from "../lib/ui";
import StatusBadge from "./ui/StatusBadge";

const NOMINAL_PILIHAN = [20000, 50000, 100000, 200000, 500000];
const MINIMAL = 10000;
const MAKSIMAL = 1000000000;

const METODE = [
  { nilai: "QRIS", label: "QRIS", ket: "Bayar lewat aplikasi bank atau e-wallet" },
  {
    nilai: "TRANSFER_BANK",
    label: "Transfer bank",
    ket: `${yayasan.bank.nama.split(" ")[0]} · ${yayasan.bank.nomor}`,
  },
];

const bacaUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

function SalinTeks({ nilai, label }) {
  const [tersalin, setTersalin] = useState(false);
  const salin = async () => {
    try {
      await navigator.clipboard.writeText(nilai);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch {
      setTersalin(false);
    }
  };
  return (
    <button
      type="button"
      onClick={salin}
      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-sm font-semibold text-brand-900 hover:bg-brand-50"
    >
      {tersalin ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
      <span aria-live="polite">{tersalin ? "Tersalin" : `Salin ${label}`}</span>
    </button>
  );
}

export default function ModalDonasi({ program, onClose, onSuccess }) {
  const user = bacaUser();
  const [nominal, setNominal] = useState("");
  const [metode, setMetode] = useState("QRIS");
  const [nama, setNama] = useState("");
  const [doa, setDoa] = useState("");
  const [galat, setGalat] = useState({});
  const [galatServer, setGalatServer] = useState("");
  const [memproses, setMemproses] = useState(false);
  const [hasil, setHasil] = useState(null);

  const nominalAngka = parseInt(nominal || "0", 10);

  const validasi = () => {
    const g = {};
    if (!nominal) g.nominal = "Nominal donasi wajib diisi.";
    else if (nominalAngka < MINIMAL)
      g.nominal = `Minimal donasi ${rupiah(MINIMAL)}.`;
    else if (nominalAngka > MAKSIMAL)
      g.nominal = `Untuk donasi di atas ${rupiah(MAKSIMAL)}, silakan hubungi yayasan.`;
    if (nama.length > 80) g.nama = "Nama terlalu panjang. Maksimal 80 karakter.";
    return g;
  };

  const kirim = async (e) => {
    e.preventDefault();
    setGalatServer("");
    const g = validasi();
    setGalat(g);
    if (Object.keys(g).length > 0) {
      document.getElementById(
        g.nominal ? "donasi-nominal" : "donasi-nama",
      )?.focus();
      return;
    }

    setMemproses(true);
    try {
      const payload = {
        programId: program.id,
        jumlah: nominalAngka,
        namaDonatur: nama.trim() || user.nama || "Hamba Allah",
        doa: doa.trim() || "-",
        metodePembayaran: metode,
      };
      if (user?.id) payload.donaturId = user.id;

      const res = await API.post("/donasi", payload);
      const data = res.data?.data || {};
      setHasil({
        id: data.id,
        status: data.status || "PENDING",
        jumlah: data.jumlah || nominalAngka,
        metode,
      });
      onSuccess?.();
    } catch (err) {
      setGalatServer(pesanGalat(err, "Donasi belum dapat diproses. Silakan coba lagi."));
    } finally {
      setMemproses(false);
    }
  };

  /* ---------- LANGKAH 2: donasi tercatat, instruksi pembayaran ---------- */
  if (hasil) {
    return (
      <Dialog eyebrow="Donasi tercatat" title={program.judul} onClose={onClose}>
        <div className="space-y-5">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-line bg-paper p-4 text-sm">
            <div>
              <dt className="text-ink-muted">Nomor referensi</dt>
              <dd className="mt-0.5 text-base font-bold tabular-nums">
                {hasil.id ? kodeReferensi(hasil.id) : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Nominal</dt>
              <dd className="mt-0.5 text-base font-bold tabular-nums">
                {rupiah(hasil.jumlah)}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="mb-1 text-ink-muted">Status</dt>
              <dd>
                <StatusBadge status={hasil.status} />
              </dd>
            </div>
          </dl>

          <p className="text-base leading-relaxed text-ink-muted">
            Selesaikan pembayaran di bawah ini. Pengurus akan memverifikasi
            donasi Anda, dan dana baru masuk ke progres program setelah
            diverifikasi.
          </p>

          {hasil.metode === "QRIS" ? (
            <div className="space-y-3">
              <h3 className="text-base font-bold">Bayar dengan QRIS</h3>
              <div className="mx-auto max-w-xs overflow-hidden rounded-lg border border-line bg-white p-2">
                <img
                  src={qrisImage}
                  alt={`Kode QRIS ${yayasan.nama}`}
                  className="h-auto w-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
                <div className="min-w-0">
                  <p className="text-sm text-ink-muted">NMID QRIS</p>
                  <p className="truncate font-bold tabular-nums">{yayasan.qris.nmid}</p>
                </div>
                <SalinTeks nilai={yayasan.qris.nmid} label="NMID" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-base font-bold">Transfer ke rekening resmi</h3>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
                <div className="min-w-0">
                  <p className="text-sm text-ink-muted">{yayasan.bank.nama}</p>
                  <p className="text-lg font-bold tabular-nums">{yayasan.bank.nomor}</p>
                  <p className="text-sm text-ink-muted">a.n. {yayasan.bank.atasNama}</p>
                </div>
                <SalinTeks nilai={yayasan.bank.nomor.replace(/\s/g, "")} label="rekening" />
              </div>
              <p className="text-sm text-ink-muted">
                Transfer sebesar{" "}
                <span className="font-bold text-ink">{rupiah(hasil.jumlah)}</span>.
              </p>
            </div>
          )}

          <p className="text-sm text-ink-muted">
            {user?.id ? (
              <>
                Pantau status donasi Anda di{" "}
                <Link
                  to="/donatur"
                  onClick={onClose}
                  className="font-semibold text-brand-900 underline"
                >
                  Riwayat Donasi
                </Link>
                .
              </>
            ) : (
              "Simpan nomor referensi ini sebagai bukti donasi Anda."
            )}
          </p>

          <Button variant="primary" size="lg" className="w-full" onClick={onClose} data-autofocus>
            Selesai
          </Button>
        </div>
      </Dialog>
    );
  }

  /* ---------- LANGKAH 1: formulir ---------- */
  return (
    <Dialog eyebrow="Infaq & sedekah" title={program.judul} onClose={onClose}>
      <form onSubmit={kirim} noValidate className="space-y-5">
        {galatServer && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-800"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            {galatServer}
          </div>
        )}

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Pilih nominal</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {NOMINAL_PILIHAN.map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={nominal === String(v)}
                onClick={() => {
                  setNominal(String(v));
                  setGalat((g) => ({ ...g, nominal: undefined }));
                }}
                className={`h-11 rounded-md border text-sm font-semibold tabular-nums transition-colors ${
                  nominal === String(v)
                    ? "border-brand-900 bg-brand-900 text-white"
                    : "border-line bg-white text-ink hover:border-brand-900"
                }`}
              >
                {rupiah(v)}
              </button>
            ))}
          </div>
        </fieldset>

        <Field
          label="Nominal lainnya"
          hint={`Minimal ${rupiah(MINIMAL)}`}
          error={galat.nominal}
        >
          {(props) => (
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-semibold text-ink-faint"
              >
                Rp
              </span>
              <input
                {...props}
                id="donasi-nominal"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={nominal ? Number(nominal).toLocaleString("id-ID") : ""}
                onChange={(e) => {
                  setNominal(e.target.value.replace(/\D/g, "").slice(0, 12));
                  setGalat((g) => ({ ...g, nominal: undefined }));
                }}
                placeholder="0"
                className={`${inputClass(props["aria-invalid"])} pl-11 tabular-nums`}
              />
            </div>
          )}
        </Field>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Metode pembayaran</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {METODE.map((m) => (
              <label
                key={m.nilai}
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${
                  metode === m.nilai
                    ? "border-brand-900 bg-brand-50"
                    : "border-line bg-white hover:border-brand-900/50"
                }`}
              >
                <input
                  type="radio"
                  name="metode"
                  value={m.nilai}
                  checked={metode === m.nilai}
                  onChange={() => setMetode(m.nilai)}
                  className="mt-1 h-4 w-4 accent-brand-900"
                />
                <span>
                  <span className="block text-sm font-bold">{m.label}</span>
                  <span className="block text-sm text-ink-muted">{m.ket}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <Field
          label="Nama donatur"
          optional
          hint='Kosongkan jika ingin dicatat sebagai "Hamba Allah".'
          error={galat.nama}
        >
          {(props) => (
            <input
              {...props}
              id="donasi-nama"
              type="text"
              autoComplete="name"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className={inputClass(props["aria-invalid"])}
            />
          )}
        </Field>

        <Field label="Doa atau harapan" optional>
          {(props) => (
            <textarea
              {...props}
              rows={3}
              value={doa}
              onChange={(e) => setDoa(e.target.value)}
              placeholder="Tuliskan doa atau niat donasi Anda"
              className="w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-base placeholder:text-ink-faint focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/25"
            />
          )}
        </Field>

        <Button type="submit" size="lg" className="w-full" loading={memproses}>
          {memproses ? "Memproses…" : "Lanjutkan ke pembayaran"}
        </Button>
        <p className="text-center text-sm text-ink-muted">
          Donasi dicatat dengan status menunggu verifikasi pengurus.
        </p>
      </form>
    </Dialog>
  );
}
