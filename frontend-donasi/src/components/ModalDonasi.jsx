import { useRef, useState } from "react";
import { Dialog } from "./PublicUI";
import API from "../services/api";
import {
  X,
  Heart,
  CheckCircle2,
  QrCode,
  ArrowLeft,
  Copy,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import qrisImage from "../assets/qris-yayasan.jpeg";
import { compressImage } from "../utils/imageCompressor";

const demoMode = import.meta.env.VITE_DEMO_MODE === "true" ||
  (import.meta.env.PROD && import.meta.env.VITE_DEMO_MODE !== "false");

export default function ModalDonasi({
  program,
  onClose,
  onSuccess,
  initialNominal,
  initialAnonim,
}) {
  const [step, setStep] = useState(1);
  const [nominal, setNominal] = useState(
    initialNominal ? String(initialNominal) : ""
  );
  const [namaPengirim, setNamaPengirim] = useState(
    initialAnonim ? "Hamba Allah" : ""
  );
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [buktiPreview, setBuktiPreview] = useState(null);
  const [buktiError, setBuktiError] = useState("");
  const fileInputRef = useRef(null);
  const uploadLock = useRef(false);
  const requestIdRef = useRef(null);
  const proofTokenRef = useRef(null);

  // Transaksi yang sudah tercatat (status PENDING) pada sesi modal ini
  const [donasiTercatat, setDonasiTercatat] = useState(null);
  // Kunci sinkron untuk mencegah double-submit (klik ganda / Enter berulang)
  const submitLock = useRef(false);

  const nominalPilihan = [20000, 50000, 100000, 200000, 500000];
  const MIN_NOMINAL = 10000;
  const MAX_NOMINAL = 1000000000;
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [uploadingBukti, setUploadingBukti] = useState(false);

  const handleFileChange = async (e) => {
    setBuktiError("");
    const file = e.target.files?.[0];
    if (!file || uploadLock.current) return;
    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      setBuktiError("File harus berupa gambar (JPG, PNG, JPEG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setBuktiError("Ukuran gambar maksimal 10MB.");
      return;
    }

    try {
      uploadLock.current = true;
      setUploadingBukti(true);
      const dataUrl = await compressImage(file);
      if (!donasiTercatat?.id || !proofTokenRef.current) {
        throw new Error("Transaksi belum siap. Silakan ulangi dari awal.");
      }
      await API.put(`/donasi/${donasiTercatat.id}/bukti`, {
        buktiPembayaran: dataUrl,
      }, { headers: { "X-Donation-Proof-Token": proofTokenRef.current } });
      setBuktiPreview(dataUrl);
    } catch (err) {
      setBuktiError(
        err.response?.data?.message || err.message ||
          "Gagal memproses gambar. Silakan gunakan format JPG/PNG.",
      );
    } finally {
      uploadLock.current = false;
      setUploadingBukti(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (demoMode) return;
    if (submitLock.current || donasiTercatat) return;
    setError("");

    const raw = String(nominal).trim();
    const jumlah = Number(raw);
    if (!raw || !/^\d+$/.test(raw) || !Number.isFinite(jumlah)) {
      setError("Nominal donasi harus berupa angka bulat tanpa titik/koma.");
      return;
    }
    if (jumlah < MIN_NOMINAL) {
      setError("Minimal nominal donasi adalah Rp 10.000");
      return;
    }
    if (jumlah > MAX_NOMINAL) {
      setError("Maksimal nominal donasi per transaksi adalah Rp 1.000.000.000");
      return;
    }

    submitLock.current = true;
    setLoading(true);

    try {
      // donaturId tidak dikirim dari client: backend mengambilnya dari token JWT
      const payload = {
        programId: program.id,
        jumlah,
        requestId: requestIdRef.current ||= crypto.randomUUID(),
        namaDonatur: namaPengirim || user.nama || "Hamba Allah",
        doa: pesan || "-",
        metodePembayaran: "QRIS",
      };

      const res = await API.post("/donasi", payload);
      proofTokenRef.current = res.data?.proofToken;
      setDonasiTercatat(res.data?.data || { jumlah, status: "PENDING" });
      setStep(2);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal memproses permintaan donasi.",
      );
      submitLock.current = false;
    } finally {
      setLoading(false);
    }
  };

  const copyNmid = () => {
    navigator.clipboard.writeText("ID2025448051701");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog title={program?.judul || "Donasi yayasan"} onClose={onClose} hideHeader className="donation-dialog">
      {/* Container Modal diperlebar ke max-w-md agar gambar QRIS leluasa */}
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 relative text-left">
        {/* HEADER MODAL */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 sticky top-0 z-20 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <Heart className="w-3.5 h-3.5 fill-amber-300" />
              {step === 1 ? "Infaq & Sedekah" : "Pembayaran QRIS"}
            </div>
            <h3 className="text-sm font-extrabold text-white line-clamp-1 pr-2">
              {program?.judul || "Donasi Yayasan"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer shrink-0"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: FORM INPUT NOMINAL */}
        {step === 1 && (
          <form onSubmit={handleSubmitForm} noValidate className="p-5 space-y-4">
            {demoMode && (
              <p role="status" className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs font-semibold text-amber-900">
                Situs ini sedang dalam mode demo. Donasi dan pembayaran belum dibuka.
              </p>
            )}
            {error && (
              <div id="donation-amount-error" role="alert" className="bg-red-50 text-red-600 text-xs p-3 rounded-2xl border border-red-100 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div>
              <label htmlFor="donation-amount" className="block text-xs font-bold text-slate-700 mb-2">
                Pilih Nominal Donasi
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {nominalPilihan.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setNominal(val.toString())}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      nominal === val.toString()
                        ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50"
                    }`}
                  >
                    Rp {val.toLocaleString("id-ID")}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                id="donation-amount"
                  type="number"
                  inputMode="numeric"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "donation-amount-error" : undefined}
                  placeholder="Atau masukkan nominal lainnya"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  min="10000"
                  required
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="donation-name" className="block text-xs font-bold text-slate-700 mb-1">
                Nama Donatur (Opsional)
              </label>
              <input
                id="donation-name"
                type="text"
                placeholder="Kosongkan jika ingin sebagai Hamba Allah"
                value={namaPengirim}
                onChange={(e) => setNamaPengirim(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label htmlFor="donation-message" className="block text-xs font-bold text-slate-700 mb-1">
                Doa / Harapan (Opsional)
              </label>
              <textarea
                placeholder="Tuliskan doa atau niat donasi Anda..."
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                id="donation-message"
                rows="2"
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading || demoMode}
              className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold py-3 rounded-2xl shadow-lg shadow-emerald-800/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider mt-2 cursor-pointer"
            >
              {demoMode ? (
                "Donasi belum dibuka"
              ) : loading ? (
                "Memproses..."
              ) : (
                <>
                  <QrCode className="w-4 h-4" /> Lanjut ke Barcode QRIS
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: TAMPILAN BARCODE QRIS (UKURAN DIPERBESAR & TEMA UNGU) */}
        {step === 2 && (
          <div className="p-5 text-center space-y-3">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-2.5 text-left flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Total Donasi
                </span>
                <span className="text-sm font-black text-emerald-800">
                  Rp{" "}
                  {Number(donasiTercatat?.jumlah ?? nominal).toLocaleString("id-ID")}
                </span>
              </div>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-amber-800" /> Menunggu
                Verifikasi
              </span>
            </div>

            <p className="text-[11px] text-slate-500 text-left bg-amber-50/70 border border-amber-100 rounded-2xl p-2.5 leading-relaxed">
              Donasi
              {donasiTercatat?.id
                ? ` #TRX-${String(donasiTercatat.id).padStart(3, "0")}`
                : ""}{" "}
              tercatat dengan status <b>PENDING</b>. Dana baru dihitung ke
              program setelah pembayaran diverifikasi oleh pengurus yayasan.
            </p>

            {/* BARCODE DIPERBESAR & LATAR UNGU (#3c096c) UNTUK MENUTUPI PINGGIRAN HITAM */}
            <div className="p-2 bg-[#3c096c] rounded-2xl shadow-lg border border-purple-900 max-w-xs mx-auto overflow-hidden">
              <img
                src={qrisImage}
                alt="QRIS Yayasan Mulia Karya Bersama"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
              <div className="text-left">
                <span className="text-[9px] text-slate-400 block font-semibold">
                  NMID QRIS
                </span>
                <span className="font-extrabold text-slate-800 text-[11px]">
                  ID2025448051701
                </span>
              </div>
              <button
                onClick={copyNmid}
                className="text-emerald-800 font-bold bg-white border border-slate-200 hover:bg-emerald-50 px-2.5 py-1 rounded-xl transition flex items-center gap-1 text-[10px] cursor-pointer"
              >
                <Copy className="w-3 h-3" /> {copied ? "Tersalin!" : "Salin"}
              </button>
            </div>

            {/* UPLOAD BUKTI TRANSFER */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                  Upload Bukti Transfer / Struk QRIS
                </span>
                <span className="text-[9px] text-slate-400 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  Opsional
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
                Lampirkan screenshot bukti transfer agar admin dapat langsung memeriksa dan mengonfirmasi pembayaran Anda.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {buktiPreview ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2 flex items-center gap-2.5">
                  <img
                    src={buktiPreview}
                    alt="Bukti Transfer"
                    className="w-12 h-12 object-cover rounded-lg border border-emerald-300 shadow-xs shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-emerald-800 text-[11px] font-extrabold flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />{" "}
                      Bukti tersimpan di server
                    </span>
                    <p className="text-[10px] text-slate-500 truncate">
                      Menunggu pemeriksaan pengurus
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingBukti}
                    className="text-slate-500 hover:text-rose-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 transition cursor-pointer shrink-0"
                  >
                    Ganti
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingBukti}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/50 rounded-xl py-2 px-3 text-center transition cursor-pointer flex items-center justify-center gap-2 text-[11px] font-bold text-slate-600 hover:text-emerald-800"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  {uploadingBukti ? "Mengirim bukti…" : "Pilih Foto / Screenshot Struk"}
                </button>
              )}

              {buktiError && (
                <p role="alert" className="text-[10px] text-rose-600 font-semibold mt-1">
                  {buktiError}
                </p>
              )}
            </div>

            <div className="pt-1 flex items-center gap-2">
              {/* Tombol "Ubah" hanya tersedia jika transaksi belum tercatat,
                  agar tidak terbentuk transaksi ganda */}
              {!donasiTercatat && (
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl transition text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Ubah
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-2.5 rounded-2xl shadow-md transition text-xs uppercase tracking-wider cursor-pointer"
              >
                Selesai Donasi
              </button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
