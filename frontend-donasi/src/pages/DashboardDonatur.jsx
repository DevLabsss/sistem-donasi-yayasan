import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Heart, Wallet, Calendar, CheckCircle2, RefreshCw } from "lucide-react";

export default function DashboardDonatur() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = () => {
    setLoading(true);
    API.get("/donasi/saya")
      .then((res) => {
        setRiwayat(res.data.data || []);
      })
      .catch((err) => {
        console.error("Gagal mengambil riwayat donasi:", err);
      })
      .finally(() => setLoading(false));
  };

  const totalNominal = riwayat.reduce(
    (acc, item) => acc + (item.jumlah || 0),
    0,
  );

  return (
    <div className="container mx-auto p-6 max-w-5xl min-h-screen font-sans selection:bg-emerald-500 selection:text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-slate-900 text-left">
          Dashboard Donatur
        </h1>
        <button
          onClick={fetchRiwayat}
          className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />{" "}
          Refresh Data
        </button>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white p-6 rounded-3xl shadow-lg text-left flex items-center justify-between border border-emerald-800/40">
          <div>
            <span className="text-xs text-emerald-200 font-semibold">
              Total Infaq & Donasi Saya
            </span>
            <h3 className="text-2xl font-black text-amber-300 mt-1">
              Rp {totalNominal.toLocaleString("id-ID")}
            </h3>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
            <Wallet className="w-6 h-6 text-amber-300" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm text-left flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">
              Program Dibantu
            </span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">
              {riwayat.length} Transaksi
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-emerald-700 fill-emerald-700" />
          </div>
        </div>
      </div>

      {/* Tabel Riwayat Donasi */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 text-left">
          <h3 className="font-extrabold text-slate-800 text-base">
            Riwayat Kebaikan
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">
            Memuat riwayat donasi...
          </div>
        ) : riwayat.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">
            Belum ada riwayat donasi tersimpan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Program Donasi</th>
                  <th className="p-4">Nominal</th>
                  <th className="p-4">Metode Pembayaran</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riwayat.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 flex items-center gap-1.5 font-semibold text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {item.program?.judul || "Program Yayasan"}
                    </td>
                    <td className="p-4 font-black text-emerald-700">
                      Rp {(item.jumlah || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 font-semibold uppercase">
                      {item.metodePembayaran || "TRANSFER_BANK"}
                    </td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />{" "}
                        {item.status || "BERHASIL"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
