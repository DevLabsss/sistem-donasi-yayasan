import { useEffect, useState, useRef } from "react";
import { Dialog } from "../components/PublicUI";
import API from "../services/api";
import {
  Heart,
  Wallet,
  Calendar,
  RefreshCw,
  Clock,
  Receipt,
  User,
  Eye,
  Upload,
  X,
  CheckCircle2,
} from "lucide-react";
import ProfilSaya from "../components/ProfilSaya";
import Notice from "../components/Notice";
import StatusBadge from "../components/StatusBadge";
import PrivateProofImage from "../components/PrivateProofImage";
import {
  STATUS_DONASI,
  formatRupiah,
  getErrorMessage,
  sumDonasiBerhasil,
  getStoredUser,
} from "../utils/format";
import {
  compressImage,
  getAvatarUrl,
} from "../utils/imageCompressor";

export default function DashboardDonatur() {
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  useEffect(() => {
    const handleUserUpdate = () => setCurrentUser(getStoredUser());
    window.addEventListener("user-updated", handleUserUpdate);
    return () => window.removeEventListener("user-updated", handleUserUpdate);
  }, []);

  const [tab, setTab] = useState("riwayat");
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [detailItem, setDetailItem] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const getBuktiDonasi = (d) => {
    if (!d) return null;
    if (d._buktiLocal) return d._buktiLocal;
    if (d.buktiPembayaran) return d.buktiPembayaran;
    return null;
  };

  const handleUploadBukti = async (e) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file || !detailItem) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("File harus berupa gambar (JPG, PNG, JPEG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Ukuran gambar maksimal 10MB.");
      return;
    }
    try {
      const dataUrl = await compressImage(file);
      const res = await API.put(`/donasi/${detailItem.id}/bukti`, {
        buktiPembayaran: dataUrl,
      });
      const serverPath = res.data?.data?.buktiPembayaran || dataUrl;
      setDetailItem((prev) =>
        prev
          ? { ...prev, _buktiLocal: dataUrl, buktiPembayaran: serverPath }
          : prev,
      );
      fetchRiwayat();
    } catch (err) {
      setUploadError(
        err.response?.data?.message ||
          "Gagal memproses gambar. Silakan gunakan format JPG/PNG.",
      );
    }
  };

  useEffect(() => {
    let ignore = false;
    API.get("/donasi/saya")
      .then((res) => {
        if (!ignore) setRiwayat(res.data.data || []);
      })
      .catch((err) => {
        console.error("Gagal mengambil riwayat donasi:", err);
        if (!ignore) setLoadError(getErrorMessage(err, "Gagal mengambil riwayat donasi."));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const fetchRiwayat = () => {
    setLoading(true);
    setLoadError("");
    API.get("/donasi/saya")
      .then((res) => {
        setRiwayat(res.data.data || []);
      })
      .catch((err) => {
        console.error("Gagal mengambil riwayat donasi:", err);
        setLoadError(getErrorMessage(err, "Gagal mengambil riwayat donasi."));
      })
      .finally(() => setLoading(false));
  };

  // Hanya donasi yang sudah diverifikasi BERHASIL yang dihitung sebagai donasi
  const totalNominal = sumDonasiBerhasil(riwayat);
  const pendingList = riwayat.filter((d) => d.status === "PENDING");
  const totalPending = pendingList.reduce((acc, d) => acc + Number(d.jumlah || 0), 0);
  const jumlahBerhasil = riwayat.filter((d) => d.status === "BERHASIL").length;

  return (
    <div className="public-ui member-page dashboard-member dashboard-donor min-h-screen">
      <div className="dashboard-heading flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="dashboard-eyebrow">Ruang Donatur</span>
          <h1 className="text-2xl font-black text-slate-900 text-left">
            Dashboard Donatur
          </h1>
          <p className="text-xs text-slate-500 text-left mt-0.5">
            Pantau setiap donasi dan status verifikasinya dengan mudah.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="dashboard-user-chip flex items-center gap-2.5 bg-white border border-slate-200/80 p-1.5 pr-3 rounded-2xl shadow-xs">
            {currentUser.fotoProfil ? (
              <img
                src={getAvatarUrl(currentUser.fotoProfil)}
                alt={currentUser.nama}
                className="w-7 h-7 rounded-full object-cover border border-emerald-400"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-[11px] flex items-center justify-center">
                {currentUser.nama
                  ? currentUser.nama.slice(0, 2).toUpperCase()
                  : "D"}
              </div>
            )}
            <span className="text-xs font-extrabold text-slate-800">
              {currentUser.nama || "Donatur"}
            </span>
          </div>

          {tab === "riwayat" && (
            <button
              onClick={fetchRiwayat}
              className="dashboard-button dashboard-button-secondary dashboard-button-compact dashboard-refresh"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />{" "}
              Refresh Data
            </button>
          )}
        </div>
      </div>

      <div className="member-tabs dashboard-tabs flex gap-2 mb-6" role="tablist" aria-label="Menu dashboard donatur">
        {[
          ["riwayat", "Riwayat Donasi", Receipt],
          ["profil", "Profil Saya", User],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            role="tab"
            aria-selected={tab === key}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              tab === key
                ? "bg-emerald-800 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50"
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === "profil" && <ProfilSaya />}

      {tab === "riwayat" && (
        <>
          {/* Ringkasan Statistik */}
          <div className="dashboard-stat-grid grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="dashboard-stat dashboard-stat-primary bg-gradient-to-br from-emerald-900 to-teal-900 text-white p-6 rounded-3xl shadow-lg text-left flex items-center justify-between border border-emerald-800/40">
              <div>
                <span className="text-xs text-emerald-200 font-semibold">
                  Total Donasi Berhasil
                </span>
                <h3 className="text-2xl font-black text-amber-300 mt-1">
                  {formatRupiah(totalNominal)}
                </h3>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <Wallet className="w-6 h-6 text-amber-300" />
              </div>
            </div>

            <div className="dashboard-stat bg-white border border-slate-100 p-6 rounded-3xl shadow-sm text-left flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold">
                  Menunggu Verifikasi
                </span>
                <h3 className="text-2xl font-black text-amber-600 mt-1">
                  {formatRupiah(totalPending)}
                </h3>
                <span className="text-[10px] text-slate-400">
                  {pendingList.length} transaksi · belum dihitung
                </span>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>

            <div className="dashboard-stat bg-white border border-slate-100 p-6 rounded-3xl shadow-sm text-left flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold">
                  Donasi Berhasil
                </span>
                <h3 className="text-2xl font-black text-slate-800 mt-1">
                  {jumlahBerhasil} Transaksi
                </h3>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-emerald-700 fill-emerald-700" />
              </div>
            </div>
          </div>

          {/* Tabel Riwayat Donasi */}
          <div className="dashboard-panel bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 text-left">
              <h3 className="font-extrabold text-slate-800 text-base">
                Riwayat Kebaikan
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Donasi berstatus PENDING akan dihitung setelah pembayaran
                diverifikasi pengurus. Donasi GAGAL tidak dihitung.
              </p>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                Memuat riwayat donasi...
              </div>
            ) : loadError ? (
              <div className="p-6">
                <Notice type="error" message={loadError} />
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
                      <th className="p-4 text-center">Bukti / Detail</th>
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
                        <td
                          className={`p-4 font-black ${
                            item.status === "BERHASIL"
                              ? "text-emerald-700"
                              : item.status === "GAGAL"
                                ? "text-slate-400 line-through"
                                : "text-amber-700"
                          }`}
                        >
                          {formatRupiah(item.jumlah)}
                        </td>
                        <td className="p-4 font-semibold uppercase">
                          {item.metodePembayaran || "TRANSFER_BANK"}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={item.status} map={STATUS_DONASI} />
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setDetailItem(item);
                              setUploadError("");
                            }}
                            className="dashboard-button dashboard-button-secondary dashboard-button-compact"
                          >
                            <Eye className="w-3.5 h-3.5" /> Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL DETAIL DONASI & BUKTI TRANSFER DONATUR */}
      {detailItem && (() => {
        const d = detailItem;
        const bukti = getBuktiDonasi(d);
        const isPending = d.status === "PENDING";

        return (
          <Dialog title="Detail donasi" hideHeader className="member-modal" onClose={() => setDetailItem(null)}>
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col text-left">
              <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-5 relative shrink-0">
                <button
                  aria-label="Tutup detail donasi"
                  onClick={() => setDetailItem(null)}
                  className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300 bg-white/10 px-2 py-0.5 rounded-md">
                  #TRX-{String(d.id).padStart(3, "0")}
                </span>
                <h3 className="text-base font-extrabold text-white mt-1">
                  Detail Transaksi Donasi
                </h3>
                <p className="text-[11px] text-emerald-200/80">
                  {d.program?.judul || "Program Yayasan"}
                </p>
              </div>

              <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Nominal Donasi
                    </span>
                    <span className="text-lg font-black text-emerald-800">
                      {formatRupiah(d.jumlah)}
                    </span>
                  </div>
                  <StatusBadge status={d.status} map={STATUS_DONASI} />
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                      <Receipt className="w-4 h-4 text-emerald-700" />
                      Bukti Transfer / Struk Pembayaran
                    </h4>
                    {bukti && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Ada
                      </span>
                    )}
                  </div>

                  {bukti ? (
                    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 max-h-60 flex items-center justify-center">
                      <PrivateProofImage
                        donationId={d.id}
                        proof={bukti}
                        alt="Bukti Transfer"
                        className="w-full h-auto max-h-60 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-500">
                        {isPending
                          ? "Anda belum mengunggah struk pembayaran. Mengunggah struk membantu pengurus memverifikasi donasi lebih cepat."
                          : "Tidak ada struk terlampir pada transaksi ini."}
                      </p>

                      {isPending && (
                        <>
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleUploadBukti}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="dashboard-upload-button w-full"
                          >
                            <Upload className="w-3.5 h-3.5 text-slate-400" />
                            Unggah Struk Pembayaran
                          </button>
                        </>
                      )}

                      {uploadError && (
                        <p className="text-[10px] text-rose-600 font-semibold">
                          {uploadError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Metode Pembayaran</span>
                    <span className="font-bold text-slate-700 uppercase">
                      {d.metodePembayaran || "QRIS"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Waktu Dibuat</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(d.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WIB
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  type="button"
                  aria-label="Tutup detail donasi"
                  onClick={() => setDetailItem(null)}
                  className="dashboard-button dashboard-button-secondary dashboard-button-block"
                >
                  Tutup
                </button>
              </div>
            </div>
          </Dialog>
        );
      })()}
    </div>
  );
}
