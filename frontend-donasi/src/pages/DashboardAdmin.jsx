import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import logoYayasan from "../assets/logo-yayasan.jpeg";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  PlusCircle,
  FileSpreadsheet,
  FileText,
  Download,
  KeyRound,
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  Trash2,
  HeartHandshake,
  Heart,
  Edit,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Search,
  Filter,
} from "lucide-react";

export default function DashboardAdmin() {
  const navigate = useNavigate();
  // Active Menu: "verifikasi" | "program" | "donasi" | "penerima" | "donatur" | "pengurus" | "laporan"
  const [activeMenu, setActiveMenu] = useState("verifikasi");

  const [pengurusList, setPengurusList] = useState([]);
  const [donaturList, setDonaturList] = useState([]);
  const [penerimaList, setPenerimaList] = useState([]);
  const [penerimaPending, setPenerimaPending] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [donasiList, setDonasiList] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingDonasi, setLoadingDonasi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchDonasi, setSearchDonasi] = useState("");
  const [filterDonasiType, setFilterDonasiType] = useState("all"); // "all" | "terdaftar" | "anonim"

  // State Ringkasan Keuangan
  const [summaryKeuangan, setSummaryKeuangan] = useState({
    totalMasuk: 0,
    totalKeluar: 0,
    sisaSaldo: 0,
  });

  // State Modal Tambah Program Donasi
  const [modalProgramOpen, setModalProgramOpen] = useState(false);
  const [programForm, setProgramForm] = useState({
    judul: "",
    deskripsi: "",
    targetDana: "",
  });

  // State Modal Tambah Pengurus
  const [modalOpen, setModalOpen] = useState(false);

  // State Modal Catat Penyaluran Bantuan
  const [modalPenyaluranOpen, setModalPenyaluranOpen] = useState(false);
  const [penyaluranForm, setPenyaluranForm] = useState({
    programId: "",
    penerimaId: "",
    jumlah: "",
    keterangan: "",
  });

  // State Modal Reset Password
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordBaru, setPasswordBaru] = useState("");

  // State Modal Edit User
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: "",
    nama: "",
    email: "",
    alamat: "",
    noHp: "",
    alasan: "",
    role: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchAllData();
    fetchProgram();
    fetchSummaryKeuangan();
    fetchDaftarDonasi();
  }, []);

  const fetchAllData = () => {
    fetchDaftarPengurus();
    fetchDaftarPenerima();
    fetchDaftarDonatur();
    fetchPenerimaPending();
    fetchDaftarDonasi();
  };

  const fetchDaftarDonasi = () => {
    setLoadingDonasi(true);
    API.get("/admin/donasi")
      .then((res) => {
        setDonasiList(res.data.data || []);
      })
      .catch((err) => {
        console.error("Gagal mengambil daftar transaksi donasi:", err);
      })
      .finally(() => setLoadingDonasi(false));
  };

  const fetchSummaryKeuangan = () => {
    API.get("/admin/summary-keuangan")
      .then((res) => {
        if (res.data.data) {
          setSummaryKeuangan({
            totalMasuk: res.data.data.totalMasuk || 0,
            totalKeluar: res.data.data.totalKeluar || 0,
            sisaSaldo: res.data.data.sisaSaldo || 0,
          });
        }
      })
      .catch((err) =>
        console.error("Gagal mengambil ringkasan keuangan:", err),
      );
  };

  const fetchProgram = () => {
    API.get("/program")
      .then((res) => setProgramList(res.data.data || []))
      .catch((err) => console.error("Gagal mengambil daftar program:", err));
  };

  const fetchDaftarPengurus = () => {
    API.get("/admin/pengurus")
      .then((res) => setPengurusList(res.data.data || []))
      .catch((err) => console.error("Gagal mengambil daftar pengurus:", err));
  };

  const fetchDaftarPenerima = () => {
    API.get("/admin/penerima")
      .then((res) => setPenerimaList(res.data.data || []))
      .catch((err) => console.error("Gagal mengambil daftar penerima:", err));
  };

  const fetchDaftarDonatur = () => {
    API.get("/admin/donatur")
      .then((res) => setDonaturList(res.data.data || []))
      .catch((err) => console.error("Gagal mengambil daftar donatur:", err));
  };

  const fetchPenerimaPending = () => {
    setLoadingPending(true);
    API.get("/admin/penerima-pending")
      .then((res) => setPenerimaPending(res.data.data || []))
      .catch((err) =>
        console.error("Gagal mengambil pendaftar penerima bantuan:", err),
      )
      .finally(() => setLoadingPending(false));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerifikasiPenerima = async (id, status) => {
    try {
      const res = await API.put(`/admin/verifikasi-penerima/${id}`, { status });
      alert(res.data.message || `Status berhasil diubah menjadi ${status}`);
      fetchAllData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Gagal memperbarui status penerima bantuan.",
      );
    }
  };

  const handleHapusUser = async (id, nama) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus akun ${nama}?`)) {
      try {
        const res = await API.delete(`/admin/user/${id}`);
        alert(res.data.message || "Pengguna berhasil dihapus.");
        fetchAllData();
      } catch (err) {
        alert(err.response?.data?.message || "Gagal menghapus pengguna.");
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.put(`/admin/user/${editFormData.id}`, editFormData);
      alert(res.data.message || "Data pengguna berhasil diperbarui!");
      setEditModalOpen(false);
      fetchAllData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal memperbarui data pengguna.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSimpanPenyaluran = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/penyaluran", penyaluranForm);
      alert(res.data.message || "Penyaluran bantuan berhasil dicatat!");
      setModalPenyaluranOpen(false);
      setPenyaluranForm({
        programId: "",
        penerimaId: "",
        jumlah: "",
        keterangan: "",
      });
      fetchAllData();
      fetchSummaryKeuangan();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mencatat penyaluran.");
    } finally {
      setLoading(false);
    }
  };

  const handleTambahPengurus = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await API.post("/admin/pengurus", formData);
      setSuccess("Akun pengurus baru berhasil ditambahkan!");
      setFormData({ nama: "", email: "", password: "" });
      fetchDaftarPengurus();
      setTimeout(() => {
        setModalOpen(false);
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal menambahkan pengurus baru.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTambahProgram = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await API.post("/program", {
        judul: programForm.judul,
        deskripsi: programForm.deskripsi,
        targetDana: parseFloat(programForm.targetDana),
      });
      setSuccess("Program donasi baru berhasil dibuat!");
      setModalProgramOpen(false);
      setProgramForm({ judul: "", deskripsi: "", targetDana: "" });
      fetchProgram();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal membuat program donasi.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHapusProgram = async (id, judul) => {
    if (!window.confirm(`Hapus program donasi "${judul}"?`)) return;
    try {
      await API.delete(`/program/${id}`);
      setSuccess(`Program donasi "${judul}" berhasil dihapus.`);
      fetchProgram();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Gagal menghapus program.",
      );
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await API.put(
        `/admin/pengurus/${selectedUser.id}/reset-password`,
        { passwordBaru },
      );
      setSuccess(res.data.message || "Password berhasil di-reset!");
      setPasswordBaru("");
      setTimeout(() => {
        setResetModalOpen(false);
        setSuccess("");
        setSelectedUser(null);
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal mereset password pengguna.",
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadLaporan = async (type) => {
    try {
      const response = await API.get(`/laporan/${type}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `laporan-penyaluran.${type === "pdf" ? "pdf" : "xlsx"}`,
      );
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert("Gagal mengunduh laporan!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* SIDEBAR NAVIGASI KIRI */}
      <aside className="w-64 bg-emerald-950 text-white flex flex-col justify-between shrink-0 fixed top-0 bottom-0 left-0 z-40 shadow-xl">
        <div>
          {/* Header Sidebar */}
          <div className="p-6 border-b border-emerald-900/60 flex items-center gap-3">
            <img
              src={logoYayasan}
              alt="Logo Yayasan"
              className="w-10 h-10 object-contain bg-white rounded-full p-1 shrink-0"
            />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide leading-tight">
                Yayasan Mulia Karya
              </h2>
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider block mt-0.5">
                Panel Pengurus
              </span>
            </div>
          </div>

          {/* Navigasi Menu */}
          <nav className="p-4 space-y-1.5 text-xs font-bold">
            <div className="text-[10px] uppercase tracking-wider text-emerald-400/70 px-3 pt-2 pb-1">
              Menu Utama
            </div>

            <button
              onClick={() => setActiveMenu("verifikasi")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 ${
                activeMenu === "verifikasi"
                  ? "bg-amber-400 text-emerald-950 shadow-md font-extrabold"
                  : "text-emerald-100/80 hover:bg-emerald-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4" />
                <span>Verifikasi Penerima</span>
              </div>
              {penerimaPending.length > 0 && (
                <span
                  className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
                    activeMenu === "verifikasi"
                      ? "bg-emerald-950 text-amber-300"
                      : "bg-amber-400 text-emerald-950"
                  }`}
                >
                  {penerimaPending.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu("program")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 ${
                activeMenu === "program"
                  ? "bg-amber-400 text-emerald-950 shadow-md font-extrabold"
                  : "text-emerald-100/80 hover:bg-emerald-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4" />
                <span>Program Donasi</span>
              </div>
              <span className="text-[10px] text-emerald-200 bg-emerald-900/80 px-2 py-0.5 rounded-full">
                {programList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu("donasi")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 ${
                activeMenu === "donasi"
                  ? "bg-amber-400 text-emerald-950 shadow-md font-extrabold"
                  : "text-emerald-100/80 hover:bg-emerald-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4" />
                <span>Transaksi Donasi</span>
              </div>
              <span className="text-[10px] text-emerald-200 bg-emerald-900/80 px-2 py-0.5 rounded-full font-bold">
                {donasiList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu("penerima")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 ${
                activeMenu === "penerima"
                  ? "bg-amber-400 text-emerald-950 shadow-md font-extrabold"
                  : "text-emerald-100/80 hover:bg-emerald-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Daftar Penerima</span>
              </div>
              <span className="text-[10px] text-emerald-200 bg-emerald-900/80 px-2 py-0.5 rounded-full">
                {penerimaList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu("donatur")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 ${
                activeMenu === "donatur"
                  ? "bg-amber-400 text-emerald-950 shadow-md font-extrabold"
                  : "text-emerald-100/80 hover:bg-emerald-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HeartHandshake className="w-4 h-4" />
                <span>Daftar Donatur</span>
              </div>
              <span className="text-[10px] text-emerald-200 bg-emerald-900/80 px-2 py-0.5 rounded-full">
                {donaturList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu("pengurus")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 ${
                activeMenu === "pengurus"
                  ? "bg-amber-400 text-emerald-950 shadow-md font-extrabold"
                  : "text-emerald-100/80 hover:bg-emerald-900 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Daftar Pengurus</span>
              </div>
              <span className="text-[10px] text-emerald-200 bg-emerald-900/80 px-2 py-0.5 rounded-full">
                {pengurusList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu("laporan")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                activeMenu === "laporan"
                  ? "bg-amber-400 text-emerald-950 shadow-md font-extrabold"
                  : "text-emerald-100/80 hover:bg-emerald-900 hover:text-white"
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export Laporan</span>
            </button>
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-emerald-900/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-950/50 hover:text-rose-200 transition-all border border-rose-900/40"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* AREA KONTEN UTAMA */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {activeMenu === "verifikasi" &&
                "Verifikasi Akun Penerima Bantuan"}
              {activeMenu === "program" && "Manajemen Program Donasi"}
              {activeMenu === "donasi" && "Riwayat Transaksi Donasi Masuk"}
              {activeMenu === "penerima" && "Daftar Penerima Bantuan"}
              {activeMenu === "donatur" && "Daftar Donatur Terdaftar"}
              {activeMenu === "pengurus" && "Manajemen Pengurus Yayasan"}
              {activeMenu === "laporan" && "Export Laporan Penyaluran"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Panel administrasi internal Yayasan Mulia Karya Bersama
            </p>
          </div>

          {activeMenu === "program" && (
            <button
              onClick={() => {
                setError("");
                setSuccess("");
                setModalProgramOpen(true);
              }}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              <PlusCircle className="w-4 h-4" /> Tambah Program
            </button>
          )}

          {activeMenu === "pengurus" && (
            <button
              onClick={() => {
                setError("");
                setSuccess("");
                setModalOpen(true);
              }}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              <UserPlus className="w-4 h-4" /> Tambah Pengurus
            </button>
          )}
        </header>

        {/* RINGKASAN STATISTIK KEUANGAN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Donasi Masuk
              </span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">
                Rp {summaryKeuangan.totalMasuk.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Bantuan Keluar
              </span>
              <span className="text-xl font-black text-rose-600 mt-1 block">
                Rp {summaryKeuangan.totalKeluar.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Sisa Saldo Kas
              </span>
              <span className="text-xl font-black text-amber-600 mt-1 block">
                Rp {summaryKeuangan.sisaSaldo.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* TAB 1: VERIFIKASI PENERIMA BANTUAN PENDING */}
        {activeMenu === "verifikasi" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden text-left">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-700" /> Antrean
                  Persetujuan Akun
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Setujui atau tolak pendaftar akun penerima bantuan baru
                </p>
              </div>
              <span className="bg-amber-100 text-amber-900 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {penerimaPending.length} Menunggu
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Nama Lengkap</th>
                    <th className="p-4">Kontak</th>
                    <th className="p-4">Alamat</th>
                    <th className="p-4">Alasan Pengajuan</th>
                    <th className="p-4 text-center">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingPending ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-6 text-center text-slate-400"
                      >
                        Memuat antrean verifikasi...
                      </td>
                    </tr>
                  ) : penerimaPending.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-8 text-center text-slate-400 font-medium"
                      >
                        Tidak ada antrean pendaftaran penerima bantuan saat ini.
                      </td>
                    </tr>
                  ) : (
                    penerimaPending.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 transition"
                      >
                        <td className="p-4 font-bold text-slate-900">
                          {item.user?.nama || "-"}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">
                            {item.user?.email}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item.noHp}
                          </div>
                        </td>
                        <td className="p-4 max-w-xs text-slate-600">
                          {item.alamat}
                        </td>
                        <td className="p-4 max-w-sm italic text-slate-500">
                          "{item.alasan}"
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                handleVerifikasiPenerima(item.id, "DISETUJUI")
                              }
                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-3 py-1.5 rounded-xl transition flex items-center gap-1 text-[11px]"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Setujui
                            </button>
                            <button
                              onClick={() =>
                                handleVerifikasiPenerima(item.id, "DITOLAK")
                              }
                              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3 py-1.5 rounded-xl transition flex items-center gap-1 text-[11px]"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Tolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB PROGRAM: DAFTAR PROGRAM DONASI */}
        {activeMenu === "program" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden text-left">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-700" /> Semua Program Donasi
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kelola program penggalangan dana dan target bantuan yayasan
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                {programList.length} Program
              </span>
            </div>

            {programList.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Heart className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">
                  Belum Ada Program Donasi
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Yayasan belum memiliki program donasi aktif. Klik tombol "+ Tambah Program" di pojok kanan atas untuk membuat program donasi baru.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-6">Judul Program</th>
                      <th className="py-3 px-6">Target Dana</th>
                      <th className="py-3 px-6">Terkumpul</th>
                      <th className="py-3 px-6">Progress</th>
                      <th className="py-3 px-6 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {programList.map((prog) => {
                      const persen = Math.min(
                        100,
                        Math.round(
                          ((prog.terkumpul || 0) / (prog.targetDana || 1)) * 100,
                        ),
                      );
                      return (
                        <tr
                          key={prog.id}
                          className="hover:bg-slate-50/60 transition"
                        >
                          <td className="py-4 px-6">
                            <span className="font-extrabold text-slate-900 block text-xs">
                              {prog.judul}
                            </span>
                            <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-md">
                              {prog.deskripsi}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-800 whitespace-nowrap">
                            Rp {(prog.targetDana || 0).toLocaleString("id-ID")}
                          </td>
                          <td className="py-4 px-6 font-bold text-emerald-600 whitespace-nowrap">
                            Rp {(prog.terkumpul || 0).toLocaleString("id-ID")}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="w-28 bg-slate-100 rounded-full h-2 overflow-hidden mb-1">
                              <div
                                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${persen}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">
                              {persen}% tercapai
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleHapusProgram(prog.id, prog.judul)}
                              className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition"
                              title="Hapus Program"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB TRANSAKSI DONASI: DAFTAR TRANSAKSI DONASI LENGKAP & PELAKU TX */}
        {activeMenu === "donasi" && (
          <div className="space-y-6">
            {/* STAT CHIPS */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Transaksi
                  </span>
                  <span className="text-lg font-black text-slate-900 mt-0.5 block">
                    {donasiList.length} Transaksi
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Donatur Terdaftar
                  </span>
                  <span className="text-lg font-black text-emerald-700 mt-0.5 block">
                    {donasiList.filter((d) => d.donatur).length} Transaksi
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <HeartHandshake className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Donatur Anonim / Tamu
                  </span>
                  <span className="text-lg font-black text-amber-700 mt-0.5 block">
                    {donasiList.filter((d) => !d.donatur).length} Transaksi
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Rata-rata Nominal
                  </span>
                  <span className="text-lg font-black text-teal-700 mt-0.5 block">
                    Rp{" "}
                    {donasiList.length > 0
                      ? Math.round(
                          donasiList.reduce(
                            (acc, d) => acc + (d.jumlah || 0),
                            0,
                          ) / donasiList.length,
                        ).toLocaleString("id-ID")
                      : 0}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* TABEL DATA TRANSAKSI */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden text-left">
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-700" /> Seluruh
                    Transaksi Donasi Masuk
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Data transaksi donasi real-time beserta informasi identitas
                    donatur (pelaku transaksi)
                  </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari donatur / program / metode..."
                      value={searchDonasi}
                      onChange={(e) => setSearchDonasi(e.target.value)}
                      className="bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                    />
                  </div>

                  <select
                    value={filterDonasiType}
                    onChange={(e) => setFilterDonasiType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 transition"
                  >
                    <option value="all">Semua Tipe Donatur</option>
                    <option value="terdaftar">Donatur Terdaftar</option>
                    <option value="anonim">Anonim / Publik</option>
                  </select>

                  <button
                    onClick={fetchDaftarDonasi}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition text-xs font-bold"
                    title="Refresh data"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabel Isi */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="p-4">ID Transaksi</th>
                      <th className="p-4">Pelaku Transaksi (Donatur)</th>
                      <th className="p-4">Program Donasi</th>
                      <th className="p-4">Nominal</th>
                      <th className="p-4">Metode Bayar</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Waktu Transaksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingDonasi ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="p-8 text-center text-slate-400"
                        >
                          Memuat riwayat transaksi donasi...
                        </td>
                      </tr>
                    ) : donasiList.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="p-8 text-center text-slate-400 font-medium"
                        >
                          Belum ada transaksi donasi yang tercatat di sistem.
                        </td>
                      </tr>
                    ) : (
                      donasiList
                        .filter((item) => {
                          if (
                            filterDonasiType === "terdaftar" &&
                            !item.donatur
                          )
                            return false;
                          if (filterDonasiType === "anonim" && item.donatur)
                            return false;

                          if (!searchDonasi.trim()) return true;
                          const q = searchDonasi.toLowerCase();
                          const donaturNama =
                            item.donatur?.nama?.toLowerCase() || "";
                          const donaturEmail =
                            item.donatur?.email?.toLowerCase() || "";
                          const progJudul =
                            item.program?.judul?.toLowerCase() || "";
                          const metode =
                            item.metodePembayaran?.toLowerCase() || "";
                          return (
                            donaturNama.includes(q) ||
                            donaturEmail.includes(q) ||
                            progJudul.includes(q) ||
                            metode.includes(q) ||
                            String(item.id).includes(q)
                          );
                        })
                        .map((item) => {
                          const isTerdaftar = Boolean(item.donatur);
                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-slate-50/80 transition"
                            >
                              <td className="p-4 font-mono font-bold text-slate-500 whitespace-nowrap">
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-black border border-slate-200">
                                  #TRX-{String(item.id).padStart(3, "0")}
                                </span>
                              </td>

                              <td className="p-4">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                      isTerdaftar
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {isTerdaftar
                                      ? item.donatur.nama
                                          .charAt(0)
                                          .toUpperCase()
                                      : "H"}
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-slate-900 text-xs">
                                      {isTerdaftar
                                        ? item.donatur.nama
                                        : "Hamba Allah"}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                      {isTerdaftar
                                        ? item.donatur.email
                                        : "Donasi Publik / Tamu (Tanpa Akun)"}
                                    </div>
                                    <span
                                      className={`inline-block mt-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                        isTerdaftar
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                          : "bg-amber-50 text-amber-800 border border-amber-200"
                                      }`}
                                    >
                                      {isTerdaftar
                                        ? "Donatur Terdaftar"
                                        : "Anonim"}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="p-4 max-w-xs">
                                <span className="font-bold text-slate-800 block text-xs">
                                  {item.program?.judul || "Program Yayasan"}
                                </span>
                              </td>

                              <td className="p-4 whitespace-nowrap">
                                <span className="font-black text-emerald-700 text-sm">
                                  Rp{" "}
                                  {(item.jumlah || 0).toLocaleString("id-ID")}
                                </span>
                              </td>

                              <td className="p-4 whitespace-nowrap">
                                <span className="bg-slate-100 text-slate-700 font-extrabold text-[10px] px-2.5 py-1 rounded-lg border border-slate-200 uppercase">
                                  {item.metodePembayaran || "QRIS"}
                                </span>
                              </td>

                              <td className="p-4 whitespace-nowrap">
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
                                  <CheckCircle className="w-3 h-3 text-emerald-700" />
                                  {item.status || "BERHASIL"}
                                </span>
                              </td>

                              <td className="p-4 whitespace-nowrap text-slate-500">
                                <div className="font-semibold text-slate-700">
                                  {new Date(
                                    item.createdAt,
                                  ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {new Date(
                                    item.createdAt,
                                  ).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  WIB
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DAFTAR PENERIMA BANTUAN */}
        {activeMenu === "penerima" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden text-left">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-700" /> Semua Penerima
                  Bantuan
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kelola data akun penerima bantuan, status verifikasi, dan kata
                  sandi
                </p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full">
                {penerimaList.length} Penerima
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Nama Lengkap</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Status Akun</th>
                    <th className="p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {penerimaList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-6 text-center text-slate-400 font-medium"
                      >
                        Belum ada data penerima bantuan.
                      </td>
                    </tr>
                  ) : (
                    penerimaList.map((item) => {
                      const statusAkun =
                        item.penerimaBantuan?.status || "VERIFIKASI";
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="p-4 font-bold text-slate-900">
                            {item.nama}
                          </td>
                          <td className="p-4 font-semibold text-slate-600">
                            {item.email}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                statusAkun === "DISETUJUI"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : statusAkun === "DITOLAK"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {statusAkun}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditFormData({
                                    id: item.id,
                                    nama: item.nama,
                                    email: item.email,
                                    alamat: item.penerimaBantuan?.alamat || "",
                                    noHp: item.penerimaBantuan?.noHp || "",
                                    alasan: item.penerimaBantuan?.alasan || "",
                                    role: "PENERIMA_BANTUAN",
                                  });
                                  setError("");
                                  setEditModalOpen(true);
                                }}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-xl border border-blue-200 transition flex items-center gap-1 text-[11px]"
                              >
                                <Edit className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(item);
                                  setError("");
                                  setSuccess("");
                                  setPasswordBaru("");
                                  setResetModalOpen(true);
                                }}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-3 py-1.5 rounded-xl border border-amber-200 transition flex items-center gap-1 text-[11px]"
                              >
                                <KeyRound className="w-3.5 h-3.5" /> Reset Pass
                              </button>
                              <button
                                onClick={() =>
                                  handleHapusUser(item.id, item.nama)
                                }
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-xl border border-rose-200 transition flex items-center gap-1 text-[11px]"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DAFTAR DONATUR TERDAFTAR */}
        {activeMenu === "donatur" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden text-left">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-emerald-700" /> Daftar
                  Donatur Terdaftar
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daftar akun pengguna yang terdaftar sebagai donatur
                </p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full">
                {donaturList.length} Donatur
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Nama Donatur</th>
                    <th className="p-4">Alamat Email</th>
                    <th className="p-4">Tanggal Bergabung</th>
                    <th className="p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donaturList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-6 text-center text-slate-400 font-medium"
                      >
                        Belum ada donatur terdaftar.
                      </td>
                    </tr>
                  ) : (
                    donaturList.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-bold text-slate-900">
                          {d.nama}
                        </td>
                        <td className="p-4 font-semibold text-slate-600">
                          {d.email}
                        </td>
                        <td className="p-4 text-slate-500">
                          {new Date(d.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditFormData({
                                  id: d.id,
                                  nama: d.nama,
                                  email: d.email,
                                  role: "DONATUR",
                                });
                                setError("");
                                setEditModalOpen(true);
                              }}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-xl border border-blue-200 transition flex items-center gap-1 text-[11px]"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(d);
                                setError("");
                                setSuccess("");
                                setPasswordBaru("");
                                setResetModalOpen(true);
                              }}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-3 py-1.5 rounded-xl border border-amber-200 transition flex items-center gap-1 text-[11px]"
                            >
                              <KeyRound className="w-3.5 h-3.5" /> Reset Pass
                            </button>
                            <button
                              onClick={() => handleHapusUser(d.id, d.nama)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-xl border border-rose-200 transition flex items-center gap-1 text-[11px]"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DAFTAR PENGURUS */}
        {activeMenu === "pengurus" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden text-left">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" /> Pengurus
                  Terdaftar
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daftar akun pengurus yang memiliki hak akses dashboard admin
                </p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full">
                {pengurusList.length} Pengurus
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Nama Pengurus</th>
                    <th className="p-4">Alamat Email</th>
                    <th className="p-4">Tanggal Dibuat</th>
                    <th className="p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pengurusList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-6 text-center text-slate-400 font-medium"
                      >
                        Belum ada pengurus lain terdaftar.
                      </td>
                    </tr>
                  ) : (
                    pengurusList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                            {p.nama.charAt(0).toUpperCase()}
                          </div>
                          {p.nama}
                        </td>
                        <td className="p-4 font-semibold text-slate-600">
                          {p.email}
                        </td>
                        <td className="p-4 font-medium text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditFormData({
                                  id: p.id,
                                  nama: p.nama,
                                  email: p.email,
                                  role: "PENGURUS",
                                });
                                setError("");
                                setEditModalOpen(true);
                              }}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-xl border border-blue-200 transition flex items-center gap-1 text-[11px]"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(p);
                                setError("");
                                setSuccess("");
                                setPasswordBaru("");
                                setResetModalOpen(true);
                              }}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-3 py-1.5 rounded-xl border border-amber-200 transition flex items-center gap-1 text-[11px]"
                            >
                              <KeyRound className="w-3.5 h-3.5" /> Reset Pass
                            </button>
                            <button
                              onClick={() => handleHapusUser(p.id, p.nama)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-xl border border-rose-200 transition flex items-center gap-1 text-[11px]"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: EXPORT LAPORAN & CATAT PENYALURAN */}
        {activeMenu === "laporan" && (
          <div className="space-y-6 text-left max-w-2xl">
            {/* CARD INPUT PENYALURAN BANTUAN BARU */}
            <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-md flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base">
                  Input Penyaluran Bantuan
                </h3>
                <p className="text-xs text-emerald-100/80 mt-1">
                  Catat transaksi penyaluran baru agar langsung masuk ke laporan
                  PDF & Excel
                </p>
              </div>
              <button
                onClick={() => setModalPenyaluranOpen(true)}
                className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black px-4 py-2.5 rounded-xl text-xs transition shrink-0"
              >
                + Catat Penyaluran
              </button>
            </div>

            {/* UNDUH LAPORAN BERKAS */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-800">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Rekapitulasi Laporan Penyaluran
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pilih format berkas untuk mengunduh laporan keuangan dan
                    penyaluran donasi
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => downloadLaporan("pdf")}
                  className="p-5 bg-red-50 hover:bg-red-100/80 text-red-700 rounded-2xl border border-red-200/80 transition flex flex-col gap-2 text-left"
                >
                  <FileText className="w-6 h-6 text-red-600" />
                  <span className="font-extrabold text-sm">Format PDF</span>
                  <span className="text-[11px] text-red-600/70">
                    Cocok untuk dicetak langsung sebagai dokumen fisik
                  </span>
                </button>

                <button
                  onClick={() => downloadLaporan("excel")}
                  className="p-5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 rounded-2xl border border-emerald-200/80 transition flex flex-col gap-2 text-left"
                >
                  <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
                  <span className="font-extrabold text-sm">
                    Format Excel (.xlsx)
                  </span>
                  <span className="text-[11px] text-emerald-700/70">
                    Cocok untuk pengolahan data tabel lanjutan
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: FORM TAMBAH PENGURUS BARU */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white p-6 relative text-left">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-black flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-300" /> Tambah Pengurus
                Baru
              </h3>
              <p className="text-xs text-emerald-100/90 mt-1">
                Buat akun kredensial untuk pengurus/staf yayasan baru
              </p>
            </div>

            <form
              onSubmit={handleTambahPengurus}
              className="p-6 space-y-4 text-left"
            >
              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-xl border border-emerald-100 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap Pengurus
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="nama"
                    placeholder="Nama lengkap pengurus"
                    value={formData.nama}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Email Resmi
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    placeholder="email@muliakaryabersama.or.id"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password Sementara
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <PlusCircle className="w-4 h-4" />
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESET PASSWORD USER */}
      {resetModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-br from-amber-800 to-amber-950 text-white p-6 relative text-left">
              <button
                onClick={() => setResetModalOpen(false)}
                className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-black flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-300" /> Reset Password
              </h3>
              <p className="text-xs text-amber-100/90 mt-1">
                Ubah password untuk akun{" "}
                <span className="font-bold underline">{selectedUser.nama}</span>
              </p>
            </div>

            <form
              onSubmit={handleResetPassword}
              className="p-6 space-y-4 text-left"
            >
              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-xl border border-emerald-100 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Masukkan password baru (minimal 6 karakter)"
                    value={passwordBaru}
                    onChange={(e) => setPasswordBaru(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-amber-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-amber-800 hover:bg-amber-900 text-white font-extrabold py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <KeyRound className="w-4 h-4" />
                  {loading ? "Memproses..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT DATA AKUN USER */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6 relative text-left">
              <button
                onClick={() => setEditModalOpen(false)}
                className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-black flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-300" /> Edit Akun Pengguna
              </h3>
              <p className="text-xs text-blue-100/90 mt-1">
                Perbarui informasi akun {editFormData.nama}
              </p>
            </div>

            <form
              onSubmit={handleEditSubmit}
              className="p-6 space-y-4 text-left"
            >
              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editFormData.nama}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, nama: e.target.value })
                  }
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>

              {editFormData.role === "PENERIMA_BANTUAN" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      No. HP / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={editFormData.noHp}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          noHp: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alamat
                    </label>
                    <textarea
                      value={editFormData.alamat}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          alamat: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="w-1/2 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-blue-800 hover:bg-blue-900 text-white font-bold py-2.5 rounded-xl text-xs transition"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CATAT PENYALURAN BANTUAN BARU */}
      {modalPenyaluranOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white p-6 relative text-left">
              <button
                onClick={() => setModalPenyaluranOpen(false)}
                className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-black">Tambah Penyaluran Bantuan</h3>
              <p className="text-xs text-emerald-100/90 mt-1">
                Catat penyaluran dana ke penerima agar masuk laporan PDF & Excel
              </p>
            </div>

            <form
              onSubmit={handleSimpanPenyaluran}
              className="p-6 space-y-4 text-left"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Program Donasi
                </label>
                <select
                  value={penyaluranForm.programId}
                  onChange={(e) =>
                    setPenyaluranForm({
                      ...penyaluranForm,
                      programId: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                >
                  <option value="">-- Pilih Program --</option>
                  {programList.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.judul || prog.namaProgram}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Penerima Bantuan
                </label>
                <select
                  value={penyaluranForm.penerimaId}
                  onChange={(e) =>
                    setPenyaluranForm({
                      ...penyaluranForm,
                      penerimaId: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                >
                  <option value="">-- Pilih Penerima --</option>
                  {penerimaList.map((p) => (
                    <option
                      key={p.penerimaBantuan?.id || p.id}
                      value={p.penerimaBantuan?.id || p.id}
                    >
                      {p.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jumlah Bantuan (Rp)
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 500000"
                  value={penyaluranForm.jumlah}
                  onChange={(e) =>
                    setPenyaluranForm({
                      ...penyaluranForm,
                      jumlah: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan Penyaluran
                </label>
                <textarea
                  rows="2"
                  placeholder="Contoh: Penyaluran sembako tahap 2"
                  value={penyaluranForm.keterangan}
                  onChange={(e) =>
                    setPenyaluranForm({
                      ...penyaluranForm,
                      keterangan: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalPenyaluranOpen(false)}
                  className="w-1/2 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-200 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl text-xs transition"
                >
                  {loading ? "Menyimpan..." : "Simpan Penyaluran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL TAMBAH PROGRAM DONASI */}
      {modalProgramOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-950 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <PlusCircle className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight">
                    Tambah Program Donasi
                  </h3>
                  <p className="text-[11px] text-emerald-200/80">
                    Buat kampanye program donasi yayasan baru
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalProgramOpen(false)}
                className="text-emerald-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleTambahProgram}
              className="p-6 space-y-4 text-xs font-bold text-slate-700"
            >
              <div>
                <label className="block mb-1.5">Judul Program</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Santunan 100 Anak Yatim Dhuafa"
                  value={programForm.judul}
                  onChange={(e) =>
                    setProgramForm({ ...programForm, judul: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block mb-1.5">Target Dana (Rp)</label>
                <input
                  type="number"
                  required
                  min="10000"
                  placeholder="Contoh: 15000000"
                  value={programForm.targetDana}
                  onChange={(e) =>
                    setProgramForm({
                      ...programForm,
                      targetDana: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block mb-1.5">Deskripsi Lengkap</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Tuliskan tujuan dan peruntukan donasi ini..."
                  value={programForm.deskripsi}
                  onChange={(e) =>
                    setProgramForm({
                      ...programForm,
                      deskripsi: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setModalProgramOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-extrabold shadow-md transition"
                >
                  {loading ? "Menyimpan..." : "Simpan Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
