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
  Edit,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";

export default function DashboardAdmin() {
  const navigate = useNavigate();
  // Active Menu: "verifikasi" | "penerima" | "donatur" | "pengurus" | "laporan"
  const [activeMenu, setActiveMenu] = useState("verifikasi");

  const [pengurusList, setPengurusList] = useState([]);
  const [donaturList, setDonaturList] = useState([]);
  const [penerimaList, setPenerimaList] = useState([]);
  const [penerimaPending, setPenerimaPending] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loading, setLoading] = useState(false);

  // State Ringkasan Keuangan
  const [summaryKeuangan, setSummaryKeuangan] = useState({
    totalMasuk: 0,
    totalKeluar: 0,
    sisaSaldo: 0,
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
  }, []);

  const fetchAllData = () => {
    fetchDaftarPengurus();
    fetchDaftarPenerima();
    fetchDaftarDonatur();
    fetchPenerimaPending();
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
              {activeMenu === "penerima" && "Daftar Penerima Bantuan"}
              {activeMenu === "donatur" && "Daftar Donatur Terdaftar"}
              {activeMenu === "pengurus" && "Manajemen Pengurus Yayasan"}
              {activeMenu === "laporan" && "Export Laporan Penyaluran"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Panel administrasi internal Yayasan Mulia Karya Bersama
            </p>
          </div>

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
    </div>
  );
}
