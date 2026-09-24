import React, { useState } from "react";
import API from "../services/api";
import {
  X,
  Heart,
  CheckCircle2,
  QrCode,
  ArrowLeft,
  Copy,
  AlertCircle,
} from "lucide-react";
import qrisImage from "../assets/qris-yayasan.jpeg";

export default function ModalDonasi({ program, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [nominal, setNominal] = useState("");
  const [namaPengirim, setNamaPengirim] = useState("");
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const nominalPilihan = [20000, 50000, 100000, 200000, 500000];
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError("");

    if (!nominal || parseInt(nominal) < 10000) {
      setError("Minimal nominal donasi adalah Rp 10.000");
      return;
    }

    setLoading(true);

    try {
      await API.post("/donasi", {
        programId: program.id,
        jumlah: parseInt(nominal),
        namaDonatur: namaPengirim || user.nama || "Hamba Allah",
        doa: pesan || "-",
        metodePembayaran: "QRIS",
      });

      setStep(2);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal memproses permintaan donasi.",
      );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
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
          <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-2xl border border-red-100 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
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
                  type="number"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Donatur (Opsional)
              </label>
              <input
                type="text"
                placeholder="Kosongkan jika ingin sebagai Hamba Allah"
                value={namaPengirim}
                onChange={(e) => setNamaPengirim(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Doa / Harapan (Opsional)
              </label>
              <textarea
                placeholder="Tuliskan doa atau niat donasi Anda..."
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                rows="2"
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3 rounded-2xl shadow-lg shadow-emerald-800/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider mt-2 cursor-pointer"
            >
              {loading ? (
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
                  Rp {parseInt(nominal).toLocaleString("id-ID")}
                </span>
              </div>
              <span className="bg-emerald-200/80 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-800" /> Siap Bayar
              </span>
            </div>

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

            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-2xl transition text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Ubah
              </button>
              <button
                onClick={onClose}
                className="w-2/3 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-2.5 rounded-2xl shadow-md transition text-xs uppercase tracking-wider cursor-pointer"
              >
                Selesai Donasi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
