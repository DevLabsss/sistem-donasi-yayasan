import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import logoYayasan from "../assets/logo-yayasan.png";
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
  Wallet,
  Receipt,
  Search,
  Eye,
  FileCheck,
  UserCircle,
  RefreshCw,
  Ban,
  ZoomIn,
  Upload,
  BarChart3,
  Printer,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import Notice from "../components/Notice";
import StatusBadge from "../components/StatusBadge";
import ProfilSaya from "../components/ProfilSaya";
import ProgramFormModal from "../components/ProgramFormModal";
import ProgramImage from "../components/ProgramImage";
import PrivateProofImage from "../components/PrivateProofImage";
import {
  EMAIL_REGEX,
  STATUS_AKUN_PENERIMA,
  STATUS_DONASI,
  STATUS_PENGAJUAN,
  formatRupiah,
  formatTanggal,
  getErrorMessage,
  getStoredUser,
  hitungTerkumpul,
  isTerkumpulTidakSinkron,
} from "../utils/format";
import { parseJudulPengajuan } from "../utils/pengajuan";
import {
  compressImage,
  hapusBuktiDonasi,
  getAvatarUrl,
} from "../utils/imageCompressor";

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getStoredUser());

  useEffect(() => {
    const handleUserUpdate = () => setCurrentUser(getStoredUser());
    window.addEventListener("user-updated", handleUserUpdate);
    return () => window.removeEventListener("user-updated", handleUserUpdate);
  }, []);

  // Active Menu: "verifikasi" | "program" | "donasi" | "penerima" | "donatur" | "pengurus" | "laporan"
  const [activeMenu, setActiveMenu] = useState("verifikasi");

  const [pengurusList, setPengurusList] = useState([]);
  const [donaturList, setDonaturList] = useState([]);
  const [penerimaList, setPenerimaList] = useState([]);
  const [penerimaPending, setPenerimaPending] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [programLoading, setProgramLoading] = useState(true);
  const [programError, setProgramError] = useState("");
  const [donasiList, setDonasiList] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingDonasi, setLoadingDonasi] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchDonasi, setSearchDonasi] = useState("");
  const [filterDonasiType, setFilterDonasiType] = useState("all"); // "all" | "terdaftar" | "anonim"
  const [filterDonasiStatus, setFilterDonasiStatus] = useState("all"); // "all" | "PENDING" | "BERHASIL" | "GAGAL"
  const [verifyingDonasiId, setVerifyingDonasiId] = useState(null);
  const [detailDonasi, setDetailDonasi] = useState(null);
  const [zoomBukti, setZoomBukti] = useState(false);
  const [adminUploadError, setAdminUploadError] = useState("");
  const adminFileInputRef = useRef(null);

  // Notifikasi global panel admin
  const [adminNotice, setAdminNotice] = useState({ type: "", message: "" });
  const showNotice = (type, message) => {
    setAdminNotice({ type, message });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // State Pengajuan Bantuan
  const [pengajuanList, setPengajuanList] = useState([]);
  const [loadingPengajuan, setLoadingPengajuan] = useState(true);
  const [pengajuanError, setPengajuanError] = useState("");
  const [filterPengajuan, setFilterPengajuan] = useState("MENUNGGU");
  const [searchPengajuan, setSearchPengajuan] = useState("");
  const [detailPengajuan, setDetailPengajuan] = useState(null);
  const [catatanVerifikasi, setCatatanVerifikasi] = useState("");
  const [catatanError, setCatatanError] = useState("");
  const [confirmPengajuanStatus, setConfirmPengajuanStatus] = useState(null);
  const [verifyingPengajuan, setVerifyingPengajuan] = useState(false);
  const verifyLock = useRef(false);

  // State Detail / Status Penerima
  const [detailPenerima, setDetailPenerima] = useState(null);
  const [updatingStatusPenerima, setUpdatingStatusPenerima] = useState(false);
  const [searchPenerima, setSearchPenerima] = useState("");
  const penyaluranLock = useRef(false);
  const [penyaluranError, setPenyaluranError] = useState("");

  // State Ringkasan Keuangan
  const [summaryKeuangan, setSummaryKeuangan] = useState({
    totalMasuk: 0,
    totalKeluar: 0,
    sisaSaldo: 0,
    donasiPending: 0,
  });

  // Form tambah/edit menggunakan komponen yang sama.
  const [modalProgramOpen, setModalProgramOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);

  // State Modal Tambah Pengurus
  const [modalOpen, setModalOpen] = useState(false);

  // State Modal Catat Penyaluran Bantuan
  const [modalPenyaluranOpen, setModalPenyaluranOpen] = useState(false);
  const [penyaluranForm, setPenyaluranForm] = useState({
    programId: "",
    penerimaId: "",
    jumlah: "",
    keterangan: "",
    pengajuanId: "",
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
    let active = true;
    const load = (url, onData, onError, onDone) => {
      API.get(url)
        .then((res) => { if (active) onData(res.data.data); })
        .catch((err) => { if (active) onError?.(err); })
        .finally(() => { if (active) onDone?.(); });
    };
    load("/admin/pengurus", (data) => setPengurusList(data || []));
    load("/admin/penerima", (data) => setPenerimaList(data || []));
    load("/admin/donatur", (data) => setDonaturList(data || []));
    load("/admin/penerima-pending", (data) => setPenerimaPending(data || []), null, () => setLoadingPending(false));
    load("/admin/pengajuan", (data) => setPengajuanList(data || []), (err) => setPengajuanError(getErrorMessage(err, "Gagal mengambil data pengajuan bantuan.")), () => setLoadingPengajuan(false));
    load("/admin/donasi", (data) => setDonasiList(data || []), null, () => setLoadingDonasi(false));
    load("/program", (data) => setProgramList(data || []), (err) => setProgramError(getErrorMessage(err, "Gagal mengambil daftar program.")), () => setProgramLoading(false));
    load("/admin/summary-keuangan", (data) => {
      if (data) setSummaryKeuangan({ totalMasuk: data.totalMasuk || 0, totalKeluar: data.totalKeluar || 0, sisaSaldo: data.sisaSaldo || 0, donasiPending: data.donasiPending || 0 });
    });
    return () => { active = false; };
  }, []);

  const fetchAllData = () => {
    fetchDaftarPengurus();
    fetchDaftarPenerima();
    fetchDaftarDonatur();
    fetchPenerimaPending();
    fetchDaftarDonasi();
    fetchPengajuan();
  };

  const fetchPengajuan = () => {
    setLoadingPengajuan(true);
    setPengajuanError("");
    API.get("/admin/pengajuan")
      .then((res) => setPengajuanList(res.data.data || []))
      .catch((err) => {
        console.error("Gagal mengambil pengajuan bantuan:", err);
        setPengajuanError(getErrorMessage(err, "Gagal mengambil data pengajuan bantuan."));
      })
      .finally(() => setLoadingPengajuan(false));
  };

  // Kelompokkan pengajuan per user (untuk riwayat per penerima)
  const pengajuanByUser = useMemo(() => {
    const map = {};
    pengajuanList.forEach((p) => {
      const uid = p.userId ?? p.user?.id;
      if (!map[uid]) map[uid] = [];
      map[uid].push(p);
    });
    return map;
  }, [pengajuanList]);

  // Semua penyaluran (endpoint /program menyertakan relasi penyaluranBantuan)
  const semuaPenyaluran = useMemo(
    () =>
      programList.flatMap((prog) =>
        (prog.penyaluranBantuan || []).map((s) => ({
          ...s,
          programJudul: prog.judul,
        })),
      ),
    [programList],
  );

  const pengajuanMenungguCount = pengajuanList.filter(
    (p) => p.status === "MENUNGGU",
  ).length;

  const donasiPendingCount = donasiList.filter((d) => d.status === "PENDING").length;

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
            donasiPending: res.data.data.donasiPending || 0,
          });
        }
      })
      .catch((err) =>
        console.error("Gagal mengambil ringkasan keuangan:", err),
      );
  };

  const fetchProgram = () => {
    setProgramLoading(true);
    setProgramError("");
    API.get("/program")
      .then((res) => setProgramList(res.data.data || []))
      .catch((err) => setProgramError(getErrorMessage(err, "Gagal mengambil daftar program.")))
      .finally(() => setProgramLoading(false));
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

  // State dan Kalkulasi Analitik Laporan
  const [periodeAnalitik, setPeriodeAnalitik] = useState("all"); // "all" | "bulan_ini" | "tahun_ini"

  const analitikData = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    // Filter donasi berdasarkan periode
    const filteredDonasi = donasiList.filter((d) => {
      if (!d.createdAt) return true;
      const tgl = new Date(d.createdAt);
      if (periodeAnalitik === "bulan_ini") {
        return tgl.getFullYear() === curYear && tgl.getMonth() === curMonth;
      }
      if (periodeAnalitik === "tahun_ini") {
        return tgl.getFullYear() === curYear;
      }
      return true;
    });

    const donasiBerhasil = filteredDonasi.filter((d) => d.status === "BERHASIL");
    const totalDonasi = donasiBerhasil.reduce(
      (acc, d) => acc + Number(d.jumlah || 0),
      0,
    );

    // Donatur unik
    const donaturUnikSet = new Set();
    donasiBerhasil.forEach((d) => {
      const key =
        d.donaturId || d.donatur?.email || d.donatur?.nama || `anon-${d.id}`;
      donaturUnikSet.add(key);
    });
    const totalDonaturAktif =
      donaturUnikSet.size > 0
        ? donaturUnikSet.size
        : donasiBerhasil.length > 0
          ? donasiBerhasil.length
          : donaturList.length;

    // Tingkat verifikasi sukses (%)
    const totalSemua = filteredDonasi.length;
    const successRate =
      totalSemua > 0
        ? Math.round((donasiBerhasil.length / totalSemua) * 100)
        : 100;

    // Rata-rata donasi per transaksi berhasil
    const avgDonasi =
      donasiBerhasil.length > 0
        ? Math.round(totalDonasi / donasiBerhasil.length)
        : 0;

    // 6 Periode waktu terakhir untuk grafik tren (Line Chart)
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agt",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const bulanLabels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curYear, curMonth - i, 1);
      bulanLabels.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,
        total: 0,
      });
    }

    donasiList.forEach((d) => {
      if (d.status === "BERHASIL" && d.createdAt) {
        const tgl = new Date(d.createdAt);
        const item = bulanLabels.find(
          (b) => b.year === tgl.getFullYear() && b.month === tgl.getMonth(),
        );
        if (item) {
          item.total += Number(d.jumlah || 0);
        }
      }
    });

    const maxTren = Math.max(...bulanLabels.map((b) => b.total), 1000000);

    // Performa per Program (Bar Chart)
    const programStats = programList.map((p) => {
      const donasiProgram = donasiList.filter(
        (d) => d.programId === p.id && d.status === "BERHASIL",
      );
      const terkumpul =
        donasiProgram.length > 0
          ? donasiProgram.reduce((a, b) => a + Number(b.jumlah || 0), 0)
          : Number(p.terkumpul || 0);
      const target = Number(p.targetDana || 1);
      const persen = Math.min(100, Math.round((terkumpul / target) * 100));
      return {
        id: p.id,
        judul: p.judul,
        target,
        terkumpul,
        persen,
        donasiCount: donasiProgram.length,
      };
    });

    return {
      totalDonasi,
      totalDonaturAktif,
      successRate,
      avgDonasi,
      bulanLabels,
      maxTren,
      programStats,
      totalTransaksi: filteredDonasi.length,
    };
  }, [donasiList, programList, donaturList, periodeAnalitik]);

  // Helpers bukti transfer donasi
  const getBuktiDonasi = (d) => {
    if (!d) return null;
    if (d._buktiLocal) return d._buktiLocal;
    if (d.buktiPembayaran) return d.buktiPembayaran;
    return null;
  };

  const handleAdminUploadBukti = async (e) => {
    setAdminUploadError("");
    const file = e.target.files?.[0];
    if (!file || !detailDonasi) return;
    if (!file.type.startsWith("image/")) {
      setAdminUploadError("File harus berupa gambar (JPG, PNG, JPEG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAdminUploadError("Ukuran gambar maksimal 10MB.");
      return;
    }
    try {
      const dataUrl = await compressImage(file);
      const res = await API.put(`/donasi/${detailDonasi.id}/bukti`, {
        buktiPembayaran: dataUrl,
      });
      const serverPath = res.data?.data?.buktiPembayaran || dataUrl;
      setDetailDonasi((prev) =>
        prev
          ? { ...prev, _buktiLocal: dataUrl, buktiPembayaran: serverPath }
          : prev,
      );
      showNotice("success", "Bukti transfer berhasil disimpan ke database!");
      fetchDaftarDonasi();
    } catch (err) {
      setAdminUploadError(
        err.response?.data?.message ||
          "Gagal memproses gambar. Silakan gunakan format JPG/PNG.",
      );
    }
  };

  const handleHapusBuktiAdmin = async () => {
    if (!detailDonasi) return;
    try {
      await API.delete(`/donasi/${detailDonasi.id}/bukti`);
      hapusBuktiDonasi(detailDonasi.id);
      setDetailDonasi((prev) => prev ? { ...prev, _buktiLocal: null, buktiPembayaran: null } : prev);
      fetchDaftarDonasi();
      showNotice("success", "Bukti transfer berhasil dihapus dari transaksi.");
    } catch (err) {
      showNotice("error", getErrorMessage(err, "Gagal menghapus bukti transfer."));
    }
  };

  // Verifikasi transaksi donasi (PENDING -> BERHASIL / GAGAL).
  // Saldo program hanya bertambah di backend saat status BERHASIL.
  const handleVerifikasiDonasi = async (item, status) => {
    if (verifyingDonasiId) return; // cegah klik ganda / proses paralel
    if (item.status !== "PENDING") {
      showNotice("error", `Transaksi ini sudah diverifikasi (${item.status}).`);
      return;
    }
    const kode = `#TRX-${String(item.id).padStart(3, "0")}`;
    const pesan =
      status === "BERHASIL"
        ? `Konfirmasi pembayaran ${kode} sebesar ${formatRupiah(item.jumlah)} SUDAH DITERIMA?\n\nDana akan ditambahkan ke program "${item.program?.judul || "-"}". Tindakan ini tidak dapat dibatalkan.`
        : `Tandai transaksi ${kode} sebesar ${formatRupiah(item.jumlah)} sebagai GAGAL?\n\nDana tidak akan dihitung. Tindakan ini tidak dapat dibatalkan.`;
    if (!window.confirm(pesan)) return;

    setVerifyingDonasiId(item.id);
    try {
      const res = await API.put(`/donasi/${item.id}/verifikasi`, { status });
      showNotice("success", res.data.message || `Donasi ${kode} diverifikasi sebagai ${status}.`);
      if (detailDonasi && detailDonasi.id === item.id) {
        setDetailDonasi(null);
      }
    } catch (err) {
      showNotice("error", getErrorMessage(err, "Gagal memverifikasi donasi."));
    } finally {
      setVerifyingDonasiId(null);
      // Selalu muat ulang dari database agar angka konsisten
      fetchDaftarDonasi();
      fetchProgram();
      fetchSummaryKeuangan();
    }
  };

  const bukaDetailPengajuan = (p) => {
    setDetailPengajuan(p);
    setCatatanVerifikasi("");
    setCatatanError("");
    setConfirmPengajuanStatus(null);
  };

  // Verifikasi pengajuan bantuan (MENUNGGU -> DISETUJUI / DITOLAK)
  const handleVerifikasiPengajuan = async (status) => {
    if (!detailPengajuan || verifyLock.current) return;
    if (detailPengajuan.status !== "MENUNGGU") {
      setCatatanError("Pengajuan ini sudah diverifikasi dan tidak dapat diproses ulang.");
      return;
    }
    const catatan = catatanVerifikasi.trim();
    if (status === "DITOLAK" && catatan.length < 10) {
      setCatatanError("Alasan penolakan wajib diisi (minimal 10 karakter).");
      return;
    }
    if (catatan.length > 2000) {
      setCatatanError("Catatan maksimal 2000 karakter.");
      return;
    }
    if (confirmPengajuanStatus !== status) {
      setConfirmPengajuanStatus(status);
      return;
    }

    verifyLock.current = true;
    setVerifyingPengajuan(true);
    setCatatanError("");
    try {
      const res = await API.put(`/admin/pengajuan/${detailPengajuan.id}/verifikasi`, {
        status,
        catatanAdmin: catatan || null,
      });
      setDetailPengajuan(null);
      setConfirmPengajuanStatus(null);
      showNotice(
        "success",
        res.data.message ||
          `Pengajuan berhasil ${status === "DISETUJUI" ? "diterima" : "ditolak"}.`,
      );
    } catch (err) {
      setCatatanError(getErrorMessage(err, "Gagal memverifikasi pengajuan."));
    } finally {
      verifyLock.current = false;
      setVerifyingPengajuan(false);
      fetchPengajuan();
    }
  };

  // Ubah status akun penerima (AKTIF = DISETUJUI, NONAKTIF = DITOLAK)
  const handleUbahStatusPenerima = async (penerimaUser, status) => {
    const pb = penerimaUser?.penerimaBantuan;
    if (!pb || updatingStatusPenerima) return;
    if (pb.status === status) return;
    const label = STATUS_AKUN_PENERIMA[status]?.label || status;
    const efek =
      status === "DITOLAK"
        ? "\n\nPenerima tidak akan bisa login sampai diaktifkan kembali. Riwayat pengajuan & penyaluran tetap tersimpan."
        : "\n\nPenerima akan dapat login dan mengajukan bantuan.";
    if (!window.confirm(`Ubah status akun ${penerimaUser.nama} menjadi ${label}?${efek}`)) return;

    setUpdatingStatusPenerima(true);
    try {
      const res = await API.put(`/admin/verifikasi-penerima/${pb.id}`, { status });
      showNotice("success", res.data.message || "Status penerima berhasil diperbarui.");
      setDetailPenerima((d) =>
        d && d.id === penerimaUser.id
          ? { ...d, penerimaBantuan: { ...d.penerimaBantuan, status } }
          : d,
      );
      fetchDaftarPenerima();
      fetchPenerimaPending();
    } catch (err) {
      showNotice("error", getErrorMessage(err, "Gagal memperbarui status penerima."));
    } finally {
      setUpdatingStatusPenerima(false);
    }
  };

  // Buka form penyaluran yang terhubung dengan pengajuan yang sudah DITERIMA
  const bukaPenyaluranDariPengajuan = (p) => {
    const penerimaUser = penerimaList.find((u) => u.id === (p.userId ?? p.user?.id));
    const pbId = penerimaUser?.penerimaBantuan?.id;
    if (!pbId) {
      showNotice("error", "Profil penerima bantuan untuk pengajuan ini tidak ditemukan.");
      return;
    }
    const { judul } = parseJudulPengajuan(p.judul);
    setPenyaluranError("");
    setPenyaluranForm({
      programId: "",
      penerimaId: String(pbId),
      jumlah: String(Math.round(p.jumlahDiajukan || 0)),
      keterangan: `Pengajuan #${p.id}: ${judul}`.slice(0, 191),
      pengajuanId: String(p.id),
    });
    setDetailPengajuan(null);
    setModalPenyaluranOpen(true);
  };

  const handleVerifikasiPenerima = async (id, status) => {
    if (
      status === "DITOLAK" &&
      !window.confirm("Tolak pendaftaran akun penerima bantuan ini?")
    )
      return;
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
    setError("");
    const email = (editFormData.email || "").trim().toLowerCase();
    if (!(editFormData.nama || "").trim()) {
      setError("Nama wajib diisi.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Format email tidak valid.");
      return;
    }
    const duplikat = [...pengurusList, ...donaturList, ...penerimaList].some(
      (u) => u.id !== editFormData.id && (u.email || "").toLowerCase() === email,
    );
    if (duplikat) {
      setError("Email sudah digunakan oleh pengguna lain.");
      return;
    }
    setLoading(true);
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
    if (penyaluranLock.current) return;
    setPenyaluranError("");

    const raw = String(penyaluranForm.jumlah).trim();
    const jumlah = Number(raw);
    if (!penyaluranForm.programId) return setPenyaluranError("Pilih program donasi.");
    if (!penyaluranForm.penerimaId) return setPenyaluranError("Pilih penerima bantuan.");
    if (!/^\d+$/.test(raw) || jumlah <= 0)
      return setPenyaluranError("Jumlah bantuan harus berupa angka bulat lebih dari 0.");
    if ((penyaluranForm.keterangan || "").length > 191)
      return setPenyaluranError("Keterangan maksimal 191 karakter.");
    if (
      jumlah > summaryKeuangan.sisaSaldo &&
      !window.confirm(
        `Jumlah penyaluran (${formatRupiah(jumlah)}) melebihi sisa saldo kas (${formatRupiah(summaryKeuangan.sisaSaldo)}). Tetap catat?`,
      )
    )
      return;

    penyaluranLock.current = true;
    setLoading(true);
    try {
      const res = await API.post("/penyaluran", {
        programId: Number(penyaluranForm.programId),
        penerimaId: Number(penyaluranForm.penerimaId),
        jumlah,
        keterangan: penyaluranForm.keterangan.trim() || "Penyaluran Bantuan",
      });
      showNotice("success", res.data.message || "Penyaluran bantuan berhasil dicatat!");
      setModalPenyaluranOpen(false);
      setPenyaluranForm({
        programId: "",
        penerimaId: "",
        jumlah: "",
        keterangan: "",
        pengajuanId: "",
      });
      fetchAllData();
      fetchProgram();
      fetchSummaryKeuangan();
    } catch (err) {
      setPenyaluranError(getErrorMessage(err, "Gagal mencatat penyaluran."));
    } finally {
      penyaluranLock.current = false;
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

  const handleHapusProgram = async (id, judul) => {
    if (!window.confirm(`Hapus program donasi "${judul}"?`)) return;
    try {
      const response = await API.delete(`/program/${id}`);
      setSuccess(response.data?.cleanupPending ? `Program "${judul}" dihapus. File gambar lama perlu dibersihkan dari penyimpanan.` : `Program donasi "${judul}" berhasil dihapus.`);
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
    } catch {
      alert("Gagal mengunduh laporan!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-shell flex min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      {/* SIDEBAR NAVIGASI KIRI - CLEAN, SOPHISTICATED, HUMAN-CRAFTED */}
      <aside className="admin-sidebar w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 fixed top-0 bottom-0 left-0 z-40 shadow-xs">
        <div>
          {/* Header Sidebar (Logo & Nama Yayasan) */}
          <div className="admin-brand h-16 px-5 border-b border-slate-100 flex items-center gap-3">
            <img
              src={logoYayasan}
              alt="Logo Yayasan"
              className="w-9 h-9 object-contain shrink-0"
            />
            <div className="min-w-0 text-left">
              <h2 className="text-xs font-bold text-slate-900 tracking-tight truncate leading-tight">
                Mulia Karya Bersama
              </h2>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Panel Pengurus
              </span>
            </div>
          </div>

          {/* Navigasi Menu */}
          <nav className="admin-nav p-3 space-y-1 text-xs">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold px-3 pt-3 pb-1.5 text-left">
              Menu Utama
            </div>

            <button
              onClick={() => setActiveMenu("verifikasi")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeMenu === "verifikasi"
                  ? "bg-emerald-50 text-emerald-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className={`w-4 h-4 ${activeMenu === "verifikasi" ? "text-emerald-700" : "text-slate-400"}`} />
                <span>Verifikasi Penerima</span>
              </div>
              {penerimaPending.length > 0 && (
                <span className="px-2 py-0.5 text-[10px] rounded-full font-bold bg-amber-100 text-amber-800">
                  {penerimaPending.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu("pengajuan")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeMenu === "pengajuan"
                  ? "bg-emerald-50 text-emerald-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className={`w-4 h-4 ${activeMenu === "pengajuan" ? "text-emerald-700" : "text-slate-400"}`} />
                <span>Pengajuan Bantuan</span>
              </div>
              {pengajuanMenungguCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] rounded-full font-bold bg-amber-100 text-amber-800">
                  {pengajuanMenungguCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu("program")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeMenu === "program"
                  ? "bg-emerald-50 text-emerald-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Heart className={`w-4 h-4 ${activeMenu === "program" ? "text-emerald-700" : "text-slate-400"}`} />
                <span>Program Donasi</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                {programList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu("donasi")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeMenu === "donasi"
                  ? "bg-emerald-50 text-emerald-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className={`w-4 h-4 ${activeMenu === "donasi" ? "text-emerald-700" : "text-slate-400"}`} />
                <span>Transaksi Donasi</span>
              </div>
              {donasiPendingCount > 0 ? (
                <span className="px-2 py-0.5 text-[10px] rounded-full font-bold bg-amber-100 text-amber-800">
                  {donasiPendingCount}
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                  {donasiList.length}
                </span>
              )}
            </button>

            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold px-3 pt-4 pb-1.5 text-left">
              Data &amp; Anggota
            </div>

            <button
              onClick={() => setActiveMenu("penerima")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeMenu === "penerima"
                  ? "bg-emerald-50 text-emerald-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className={`w-4 h-4 ${activeMenu === "penerima" ? "text-emerald-700" : "text-slate-400"}`} />
                <span>Daftar Penerima</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                {penerimaList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu("donatur")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeMenu === "donatur"
                  ? "bg-emerald-50 text-emerald-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HeartHandshake className={`w-4 h-4 ${activeMenu === "donatur" ? "text-emerald-700" : "text-slate-400"}`} />
                <span>Daftar Donatur</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                {donaturList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu("pengurus")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeMenu === "pengurus"
                  ? "bg-emerald-50 text-emerald-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className={`w-4 h-4 ${activeMenu === "pengurus" ? "text-emerald-700" : "text-slate-400"}`} />
                <span>Daftar Pengurus</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                {pengurusList.length}
              </span>
            </button>

            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold px-3 pt-4 pb-1.5 text-left">
              Analitik &amp; Akun
            </div>

            <button
              onClick={() => setActiveMenu("laporan")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeMenu === "laporan"
                  ? "bg-emerald-50 text-emerald-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className={`w-4 h-4 ${activeMenu === "laporan" ? "text-emerald-700" : "text-slate-400"}`} />
                <span>Laporan &amp; Analitik</span>
              </div>
            </button>

            <button
              onClick={() => setActiveMenu("profil")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer text-left ${
                activeMenu === "profil"
                  ? "bg-emerald-50 text-emerald-900 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
              }`}
            >
              <UserCircle className={`w-4 h-4 ${activeMenu === "profil" ? "text-emerald-700" : "text-slate-400"}`} />
              <span>Profil Saya</span>
            </button>
          </nav>
        </div>

        {/* User Admin Info & Logout */}
        <div className="admin-account p-3 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 border border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              {currentUser.fotoProfil ? (
                <img
                  src={getAvatarUrl(currentUser.fotoProfil)}
                  alt={currentUser.nama}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                  {currentUser.nama ? currentUser.nama.slice(0, 2).toUpperCase() : "A"}
                </div>
              )}
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                  {currentUser.nama || "Admin Yayasan"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Pengurus
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="dashboard-icon-button dashboard-icon-button-danger"
              title="Keluar (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* AREA KONTEN UTAMA */}
      <main className="admin-main flex-1 ml-64 p-6 sm:p-8">
        {/* HEADER HALAMAN - CLEAN & FUNCTIONAL */}
        <div className="admin-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {activeMenu === "verifikasi" && "Verifikasi Akun Penerima Bantuan"}
              {activeMenu === "pengajuan" && "Verifikasi Pengajuan Bantuan"}
              {activeMenu === "program" && "Manajemen Program Donasi"}
              {activeMenu === "donasi" && "Riwayat Transaksi Donasi"}
              {activeMenu === "penerima" && "Daftar Penerima Bantuan"}
              {activeMenu === "donatur" && "Daftar Donatur Terdaftar"}
              {activeMenu === "pengurus" && "Manajemen Pengurus Yayasan"}
              {activeMenu === "laporan" && "Laporan & Analitik Keuangan"}
              {activeMenu === "profil" && "Profil Saya"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeMenu === "verifikasi" && "Tinjau dan setujui permohonan pendaftaran akun penerima bantuan baru"}
              {activeMenu === "pengajuan" && "Tinjau dan validasi permohonan bantuan dana dari penerima terdaftar"}
              {activeMenu === "program" && "Kelola program penggalangan dana dan target bantuan yayasan"}
              {activeMenu === "donasi" && "Riwayat donasi masuk, status pembayaran, dan bukti transfer donatur"}
              {activeMenu === "penerima" && "Daftar seluruh penerima bantuan yang telah diverifikasi di sistem"}
              {activeMenu === "donatur" && "Daftar donatur terdaftar beserta riwayat partisipasi program"}
              {activeMenu === "pengurus" && "Kelola akun dan hak akses pengurus internal yayasan"}
              {activeMenu === "laporan" && "Ringkasan performa penggalangan dana, tren bulanan, dan penyaluran"}
              {activeMenu === "profil" && "Kelola informasi akun dan pengaturan profil pengurus"}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeMenu === "program" && (
              <button
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setEditingProgram(null);
                  setModalProgramOpen(true);
                }}
                className="admin-primary-action bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-2xs transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tambah Program</span>
              </button>
            )}

            {activeMenu === "pengurus" && (
              <button
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setModalOpen(true);
                }}
                className="admin-primary-action bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-2xs transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Pengurus</span>
              </button>
            )}
          </div>
        </div>

        {adminNotice.message && (
          <div className="mb-6">
            <Notice
              type={adminNotice.type}
              message={adminNotice.message}
              onClose={() => setAdminNotice({ type: "", message: "" })}
            />
          </div>
        )}

        {/* TAB 1: VERIFIKASI PENERIMA BANTUAN PENDING */}
        {activeMenu === "verifikasi" && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden text-left">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>Antrean Persetujuan Akun</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Setujui atau tolak pendaftar akun penerima bantuan baru
                </p>
              </div>
              <span className="bg-amber-50 text-amber-800 border border-amber-200/70 font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{penerimaPending.length} Menunggu</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">Kontak</th>
                    <th className="py-3 px-4">Alamat</th>
                    <th className="py-3 px-4">Alasan Pengajuan</th>
                    <th className="py-3 px-4 text-center">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingPending ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-8 text-center text-slate-400"
                      >
                        Memuat antrean verifikasi...
                      </td>
                    </tr>
                  ) : penerimaPending.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-10 text-center text-slate-400 font-medium"
                      >
                        Tidak ada antrean pendaftaran penerima bantuan saat ini.
                      </td>
                    </tr>
                  ) : (
                    penerimaPending.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {item.user?.nama || "-"}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">
                            {item.user?.email}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item.noHp}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs text-slate-600">
                          {item.alamat}
                        </td>
                        <td className="py-3.5 px-4 max-w-sm italic text-slate-500">
                          "{item.alasan}"
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                handleVerifikasiPenerima(item.id, "DISETUJUI")
                              }
                              className="dashboard-button dashboard-button-success dashboard-button-compact"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>
                            <button
                              onClick={() =>
                                handleVerifikasiPenerima(item.id, "DITOLAK")
                              }
                              className="dashboard-button dashboard-button-danger-outline dashboard-button-compact"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Tolak</span>
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
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden text-left">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-emerald-700" />
                  <span>Semua Program Donasi</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola program penggalangan dana dan target bantuan yayasan
                </p>
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                {programList.length} Program
              </span>
            </div>

            {programLoading ? (
              <div className="p-6 space-y-3" role="status" aria-label="Memuat program donasi"><div className="h-12 rounded-xl bg-slate-100 animate-pulse" /><div className="h-12 rounded-xl bg-slate-100 animate-pulse" /><div className="h-12 rounded-xl bg-slate-100 animate-pulse" /></div>
            ) : programError ? (
              <div className="p-6"><Notice type="error" message={programError} /><button type="button" onClick={fetchProgram} className="dashboard-button dashboard-button-secondary mt-3">Coba lagi</button></div>
            ) : programList.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Heart className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-700">
                  Belum Ada Program Donasi
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Yayasan belum memiliki program donasi aktif. Klik tombol "+ Tambah Program" di pojok kanan atas untuk membuat program baru.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Judul Program</th>
                      <th className="py-3 px-4">Target Dana</th>
                      <th className="py-3 px-4">Terkumpul</th>
                      <th className="py-3 px-4">Progress</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {programList.map((prog) => {
                      const terkumpul = hitungTerkumpul(prog);
                      const tidakSinkron = isTerkumpulTidakSinkron(prog);
                      const jumlahPending = (prog.donasi || []).filter(
                        (d) => d.status === "PENDING",
                      ).length;
                      const persen = Math.min(
                        100,
                        Math.round((terkumpul / (prog.targetDana || 1)) * 100),
                      );
                      return (
                        <tr
                          key={prog.id}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3 min-w-[220px]">
                              <ProgramImage imageUrl={prog.imageUrl} title={prog.judul} className="dashboard-program-thumb w-12 h-12 rounded-lg shrink-0" />
                              <div><span className="font-semibold text-slate-900 block text-xs">{prog.judul}</span><span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 max-w-md">{prog.deskripsi}</span></div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                            Rp {(prog.targetDana || 0).toLocaleString("id-ID")}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-emerald-600 whitespace-nowrap">
                            Rp {terkumpul.toLocaleString("id-ID")}
                            {jumlahPending > 0 && (
                              <span className="block text-[10px] font-medium text-amber-600 mt-0.5">
                                {jumlahPending} donasi pending
                              </span>
                            )}
                            {tidakSinkron && (
                              <span
                                className="block text-[10px] font-medium text-rose-600 mt-0.5"
                                title="Nilai kolom 'terkumpul' di database tidak sama dengan jumlah transaksi BERHASIL."
                              >
                                ⚠ Di DB: Rp {(prog.terkumpul || 0).toLocaleString("id-ID")}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1">
                              <div
                                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${persen}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-medium text-slate-500">
                              {persen}% tercapai
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => { setError(""); setSuccess(""); setEditingProgram(prog); setModalProgramOpen(true); }}
                              className="dashboard-icon-button"
                              title={`Edit ${prog.judul}`}
                              aria-label={`Edit ${prog.judul}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleHapusProgram(prog.id, prog.judul)}
                              disabled={(prog.donasi?.length || 0) > 0 || (prog.penyaluranBantuan?.length || 0) > 0}
                              className="dashboard-icon-button dashboard-icon-button-danger"
                              title={(prog.donasi?.length || 0) > 0 || (prog.penyaluranBantuan?.length || 0) > 0 ? "Tidak dapat dihapus karena memiliki riwayat donasi atau penyaluran" : "Hapus Program"}
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
          <div className="space-y-4 text-left">
            {/* TOOLBAR FILTER & SEARCH */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
              {/* Segmented Status Filter */}
              <div className="dashboard-segmented flex items-center gap-1 overflow-x-auto">
                {[
                  { id: "all", label: "Semua", count: donasiList.length },
                  { id: "PENDING", label: "Menunggu", count: donasiPendingCount },
                  { id: "BERHASIL", label: "Berhasil", count: donasiList.filter((d) => d.status === "BERHASIL").length },
                  { id: "GAGAL", label: "Gagal", count: donasiList.filter((d) => d.status === "GAGAL").length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterDonasiStatus(tab.id)}
                    aria-pressed={filterDonasiStatus === tab.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      filterDonasiStatus === tab.id
                        ? "bg-slate-900 text-white font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        filterDonasiStatus === tab.id
                          ? "bg-slate-700 text-slate-200"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search & Tipe Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari donatur / program..."
                    value={searchDonasi}
                    onChange={(e) => setSearchDonasi(e.target.value)}
                    className="bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white transition w-44 sm:w-56"
                  />
                </div>

                <select
                  value={filterDonasiType}
                  onChange={(e) => setFilterDonasiType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-600 transition cursor-pointer"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="terdaftar">Donatur Terdaftar</option>
                  <option value="anonim">Anonim / Publik</option>
                </select>

                <button
                  onClick={() => {
                    fetchDaftarDonasi();
                    fetchSummaryKeuangan();
                  }}
                  className="dashboard-icon-button"
                  title="Muat Ulang"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingDonasi ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* TABEL DATA TRANSAKSI */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden text-left">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">ID Transaksi</th>
                      <th className="py-3 px-4">Donatur</th>
                      <th className="py-3 px-4">Program Donasi</th>
                      <th className="py-3 px-4">Nominal</th>
                      <th className="py-3 px-4">Metode</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Waktu</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingDonasi ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="p-8 text-center text-slate-400"
                        >
                          Memuat riwayat transaksi donasi...
                        </td>
                      </tr>
                    ) : donasiList.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
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
                          if (
                            filterDonasiStatus !== "all" &&
                            item.status !== filterDonasiStatus
                          )
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
                                <StatusBadge status={item.status} map={STATUS_DONASI} />
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

                              <td className="p-4 whitespace-nowrap text-center">
                                <button
                                  onClick={() => {
                                    setDetailDonasi(item);
                                    setAdminUploadError("");
                                  }}
                                  className={`dashboard-button dashboard-button-compact ${
                                    item.status === "PENDING"
                                      ? "dashboard-button-primary"
                                      : "dashboard-button-secondary"
                                  }`}
                                  title={
                                    item.status === "PENDING"
                                      ? "Periksa bukti transfer dan verifikasi donasi ini"
                                      : "Lihat detail transaksi"
                                  }
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>
                                    {item.status === "PENDING"
                                      ? "Periksa & Verifikasi"
                                      : "Detail"}
                                  </span>
                                </button>
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

        {/* TAB PENGAJUAN BANTUAN */}
        {activeMenu === "pengajuan" && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden text-left">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-700" />
                  <span>Pengajuan Bantuan Masuk</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tinjau dan validasi permohonan bantuan dana dari penerima terdaftar
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari pemohon / judul..."
                    value={searchPengajuan}
                    onChange={(e) => setSearchPengajuan(e.target.value)}
                    className="bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white transition w-44 sm:w-56"
                  />
                </div>
                <select
                  value={filterPengajuan}
                  onChange={(e) => setFilterPengajuan(e.target.value)}
                  className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-600 transition cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="MENUNGGU">Pending</option>
                  <option value="DISETUJUI">Diterima</option>
                  <option value="DITOLAK">Ditolak</option>
                  <option value="DIBATALKAN">Dibatalkan</option>
                </select>
                <button
                  onClick={fetchPengajuan}
                  className="dashboard-icon-button"
                  title="Muat Ulang"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingPengajuan ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Pemohon</th>
                    <th className="py-3 px-4">Jenis &amp; Judul</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    if (loadingPengajuan && pengajuanList.length === 0) {
                      return (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-400">
                            Memuat data pengajuan...
                          </td>
                        </tr>
                      );
                    }
                    if (pengajuanError) {
                      return (
                        <tr>
                          <td colSpan="7" className="p-6">
                            <Notice type="error" message={pengajuanError} />
                          </td>
                        </tr>
                      );
                    }
                    const q = searchPengajuan.trim().toLowerCase();
                    const rows = pengajuanList.filter((p) => {
                      if (filterPengajuan !== "all" && p.status !== filterPengajuan) return false;
                      if (!q) return true;
                      return (
                        (p.user?.nama || "").toLowerCase().includes(q) ||
                        (p.user?.email || "").toLowerCase().includes(q) ||
                        (p.judul || "").toLowerCase().includes(q) ||
                        String(p.id).includes(q)
                      );
                    });
                    if (rows.length === 0) {
                      return (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-400 font-medium">
                            Tidak ada pengajuan bantuan
                            {filterPengajuan !== "all" ? " dengan status ini" : ""}.
                          </td>
                        </tr>
                      );
                    }
                    return rows.map((p) => {
                      const { jenis, judul } = parseJudulPengajuan(p.judul);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition">
                          <td className="p-4 font-mono font-bold text-slate-500">#{p.id}</td>
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{p.user?.nama || "-"}</div>
                            <div className="text-[11px] text-slate-400">{p.user?.email}</div>
                          </td>
                          <td className="p-4 max-w-xs">
                            <div className="text-[10px] font-bold text-emerald-700 uppercase">{jenis}</div>
                            <div className="font-semibold text-slate-800 line-clamp-2">{judul}</div>
                          </td>
                          <td className="p-4 whitespace-nowrap font-black text-emerald-700">
                            {formatRupiah(p.jumlahDiajukan)}
                          </td>
                          <td className="p-4 whitespace-nowrap text-slate-500">
                            {formatTanggal(p.createdAt)}
                          </td>
                          <td className="p-4">
                            <StatusBadge status={p.status} map={STATUS_PENGAJUAN} />
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => bukaDetailPengajuan(p)}
                                className={`dashboard-button dashboard-button-compact ${
                                  p.status === "MENUNGGU"
                                    ? "dashboard-button-primary"
                                    : "dashboard-button-secondary"
                                }`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{p.status === "MENUNGGU" ? "Periksa" : "Detail"}</span>
                              </button>
                              {p.status === "DISETUJUI" && (
                                <button
                                  onClick={() => bukaPenyaluranDariPengajuan(p)}
                                  className="dashboard-button dashboard-button-primary dashboard-button-compact"
                                  title="Catat penyaluran dana untuk pengajuan ini"
                                >
                                  <span>+ Salurkan</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB PROFIL ADMIN */}
        {activeMenu === "profil" && <ProfilSaya />}

        {/* TAB 2: DAFTAR PENERIMA BANTUAN */}
        {activeMenu === "penerima" && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden text-left">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>Semua Penerima Bantuan</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar akun penerima bantuan, status verifikasi berkas, dan pengaturan akun
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama / email..."
                    value={searchPenerima}
                    onChange={(e) => setSearchPenerima(e.target.value)}
                    className="bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white transition w-44 sm:w-56"
                  />
                </div>
                <span className="bg-slate-100 text-slate-600 font-medium text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
                  {penerimaList.length} Penerima
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status Akun</th>
                    <th className="py-3 px-4">Status Pengajuan</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {penerimaList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-6 text-center text-slate-400 font-medium"
                      >
                        Belum ada data penerima bantuan.
                      </td>
                    </tr>
                  ) : (
                    penerimaList
                      .filter((item) => {
                        const q = searchPenerima.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          (item.nama || "").toLowerCase().includes(q) ||
                          (item.email || "").toLowerCase().includes(q)
                        );
                      })
                      .map((item) => {
                      const statusAkun =
                        item.penerimaBantuan?.status || "VERIFIKASI";
                      const riwayat = pengajuanByUser[item.id] || [];
                      const hitung = (s) => riwayat.filter((p) => p.status === s).length;
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
                            <StatusBadge status={statusAkun} map={STATUS_AKUN_PENERIMA} />
                          </td>
                          <td className="p-4">
                            {riwayat.length === 0 ? (
                              <span className="text-[11px] text-slate-400">Belum ada pengajuan</span>
                            ) : (
                              <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                                <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full">
                                  {hitung("MENUNGGU")} Pending
                                </span>
                                <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full">
                                  {hitung("DISETUJUI")} Diterima
                                </span>
                                <span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded-full">
                                  {hitung("DITOLAK")} Ditolak
                                </span>
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                                  {hitung("DIBATALKAN")} Dibatalkan
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <button
                                onClick={() => setDetailPenerima(item)}
                                className="dashboard-button dashboard-button-secondary dashboard-button-compact"
                              >
                                <Eye className="w-3.5 h-3.5" /> <span>Detail</span>
                              </button>
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
                                className="dashboard-button dashboard-button-secondary dashboard-button-compact"
                              >
                                <Edit className="w-3.5 h-3.5" /> <span>Edit</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(item);
                                  setError("");
                                  setSuccess("");
                                  setPasswordBaru("");
                                  setResetModalOpen(true);
                                }}
                                className="dashboard-button dashboard-button-secondary dashboard-button-compact"
                              >
                                <KeyRound className="w-3.5 h-3.5" /> <span>Reset Pass</span>
                              </button>
                              <button
                                onClick={() =>
                                  handleHapusUser(item.id, item.nama)
                                }
                                className="dashboard-icon-button dashboard-icon-button-danger"
                                title="Hapus Penerima"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden text-left">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-emerald-700" />
                  <span>Daftar Donatur Terdaftar</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar akun pengguna yang terdaftar sebagai donatur yayasan
                </p>
              </div>
              <span className="bg-slate-100 text-slate-600 font-medium text-xs px-2.5 py-1 rounded-full">
                {donaturList.length} Donatur
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nama Donatur</th>
                    <th className="py-3 px-4">Alamat Email</th>
                    <th className="py-3 px-4">Tanggal Bergabung</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donaturList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-10 text-center text-slate-400 font-medium"
                      >
                        Belum ada donatur terdaftar.
                      </td>
                    </tr>
                  ) : (
                    donaturList.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {d.nama}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {d.email}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(d.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
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
                              className="dashboard-icon-button"
                              title="Edit Donatur"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(d);
                                setError("");
                                setSuccess("");
                               setPasswordBaru("");
                                setResetModalOpen(true);
                              }}
                              className="dashboard-icon-button"
                              title="Reset Password"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleHapusUser(d.id, d.nama)}
                              className="dashboard-icon-button dashboard-icon-button-danger"
                              title="Hapus Donatur"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden text-left">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Pengurus Terdaftar</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar akun pengurus yang memiliki hak akses dashboard admin
                </p>
              </div>
              <span className="bg-slate-100 text-slate-600 font-medium text-xs px-2.5 py-1 rounded-full">
                {pengurusList.length} Pengurus
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nama Pengurus</th>
                    <th className="py-3 px-4">Alamat Email</th>
                    <th className="py-3 px-4">Tanggal Dibuat</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pengurusList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-10 text-center text-slate-400 font-medium"
                      >
                        Belum ada pengurus lain terdaftar.
                      </td>
                    </tr>
                  ) : (
                    pengurusList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {p.nama.charAt(0).toUpperCase()}
                          </div>
                          <span>{p.nama}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {p.email}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
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
                              className="dashboard-icon-button"
                              title="Edit Pengurus"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(p);
                                setError("");
                                setSuccess("");
                                setPasswordBaru("");
                                setResetModalOpen(true);
                              }}
                              className="dashboard-icon-button"
                              title="Reset Password"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleHapusUser(p.id, p.nama)}
                              className="dashboard-icon-button dashboard-icon-button-danger"
                              title="Hapus Pengurus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

        {/* TAB 5: LAPORAN & ANALITIK DONASI */}
        {activeMenu === "laporan" && (
          <div className="space-y-6 text-left w-full max-w-6xl">
            {/* TOOLBAR FILTER & TOMBOL AKSI */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Filter Periode */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Periode:
                </span>
                <div className="dashboard-segmented flex items-center gap-1 text-xs font-medium">
                  <button
                    onClick={() => setPeriodeAnalitik("all")}
                    aria-pressed={periodeAnalitik === "all"}
                    className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                      periodeAnalitik === "all"
                        ? "bg-white text-slate-900 shadow-2xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Semua Waktu
                  </button>
                  <button
                    onClick={() => setPeriodeAnalitik("bulan_ini")}
                    aria-pressed={periodeAnalitik === "bulan_ini"}
                    className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                      periodeAnalitik === "bulan_ini"
                        ? "bg-white text-slate-900 shadow-2xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Bulan Ini
                  </button>
                  <button
                    onClick={() => setPeriodeAnalitik("tahun_ini")}
                    aria-pressed={periodeAnalitik === "tahun_ini"}
                    className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                      periodeAnalitik === "tahun_ini"
                        ? "bg-white text-slate-900 shadow-2xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Tahun Ini
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={() => window.print()}
                  className="dashboard-button dashboard-button-secondary dashboard-button-compact"
                  title="Cetak Laporan ke Printer atau Simpan PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cetak</span>
                </button>

                <button
                  onClick={() => downloadLaporan("pdf")}
                  className="dashboard-button dashboard-button-secondary dashboard-button-compact"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  <span>Unduh PDF</span>
                </button>

                <button
                  onClick={() => downloadLaporan("excel")}
                  className="dashboard-button dashboard-button-secondary dashboard-button-compact"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unduh Excel</span>
                </button>

                <button
                  onClick={() => {
                    setPenyaluranError("");
                    setPenyaluranForm({
                      programId: "",
                      penerimaId: "",
                      jumlah: "",
                      keterangan: "",
                      pengajuanId: "",
                    });
                    setModalPenyaluranOpen(true);
                  }}
                  className="dashboard-button dashboard-button-primary dashboard-button-compact"
                >
                  <span>+ Catat Penyaluran</span>
                </button>
              </div>
            </div>

            {/* 4 KARTU KPI / METRIK UTAMA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* KPI 1: Total Donasi */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs text-left">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Donasi Terhimpun
                </span>
                <div className="text-xl font-bold text-slate-900 mt-1 mb-1 tracking-tight">
                  {formatRupiah(analitikData.totalDonasi)}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{analitikData.totalTransaksi} transaksi donasi</span>
                </div>
              </div>

              {/* KPI 2: Donatur Aktif */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs text-left">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Donatur Aktif
                </span>
                <div className="text-xl font-bold text-slate-900 mt-1 mb-1 tracking-tight">
                  {analitikData.totalDonaturAktif} Donatur
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700">
                  <Users className="w-3.5 h-3.5" />
                  <span>Donatur terdaftar & dermawan</span>
                </div>
              </div>

              {/* KPI 3: Tingkat Verifikasi */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs text-left">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Tingkat Verifikasi Sukses
                </span>
                <div className="text-xl font-bold text-slate-900 mt-1 mb-1 tracking-tight">
                  {analitikData.successRate}% Sukses
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-teal-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Donasi valid diverifikasi</span>
                </div>
              </div>

              {/* KPI 4: Rata-rata Donasi */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs text-left">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Rata-rata per Donasi
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 mb-2 tracking-tight">
                  {formatRupiah(analitikData.avgDonasi)}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Per transaksi berhasil</span>
                </div>
                <div className="absolute -right-2 -bottom-2 w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 opacity-60 group-hover:scale-110 transition">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* DUA (2) GRAFIK ANALITIK UTAMA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* GRAFIK 1: TREN PENGHIMPUNAN DONASI (LINE & AREA CHART) */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        Tren Penghimpunan Donasi
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Pertumbuhan donasi berhasil 6 bulan terakhir
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      <span>Realisasi Kas Masuk</span>
                    </div>
                  </div>

                  {/* SVG Chart Area */}
                  <div className="w-full h-64 relative pt-2">
                    <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="adminChartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1.5" />
                      <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1.5" />
                      <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1.5" />
                      <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1.5" />
                      <line x1="40" y1="180" x2="480" y2="180" stroke="#e2e8f0" strokeWidth="1.5" />

                      {/* Y-Axis Reference Labels */}
                      <text x="32" y="24" textAnchor="end" fill="#94a3b8" fontSize="10" fontWeight="bold">
                        {formatRupiah(analitikData.maxTren)}
                      </text>
                      <text x="32" y="104" textAnchor="end" fill="#94a3b8" fontSize="10" fontWeight="bold">
                        {formatRupiah(Math.round(analitikData.maxTren / 2))}
                      </text>
                      <text x="32" y="184" textAnchor="end" fill="#94a3b8" fontSize="10" fontWeight="bold">
                        0
                      </text>

                      {/* Plotting Coordinates */}
                      {(() => {
                        const points = analitikData.bulanLabels.map((item, idx) => {
                          const x = 50 + idx * 80;
                          const ratio = analitikData.maxTren > 0 ? item.total / analitikData.maxTren : 0;
                          const y = 180 - ratio * 150;
                          return { x, y, ...item };
                        });

                        const pathD = points.reduce((acc, p, idx) => {
                          if (idx === 0) return `M ${p.x} ${p.y}`;
                          const prev = points[idx - 1];
                          const cx = (prev.x + p.x) / 2;
                          return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
                        }, "");

                        const first = points[0] || { x: 50, y: 180 };
                        const last = points[points.length - 1] || { x: 450, y: 180 };
                        const areaD = `${pathD} L ${last.x} 180 L ${first.x} 180 Z`;

                        return (
                          <g>
                            {/* Area Gradient */}
                            <path d={areaD} fill="url(#adminChartGrad)" />
                            {/* Curved Stroke */}
                            <path d={pathD} fill="none" stroke="#059669" strokeWidth="3" />

                            {/* Circles and Labels */}
                            {points.map((p, idx) => (
                              <g key={idx}>
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r={idx === points.length - 1 ? 6 : 4.5}
                                  fill={idx === points.length - 1 ? "#047857" : "#ffffff"}
                                  stroke="#059669"
                                  strokeWidth="2.5"
                                />
                                <text
                                  x={p.x}
                                  y="196"
                                  textAnchor="middle"
                                  fill={idx === points.length - 1 ? "#047857" : "#64748b"}
                                  fontSize="10"
                                  fontWeight={idx === points.length - 1 ? "bold" : "600"}
                                >
                                  {p.label}
                                </text>
                              </g>
                            ))}
                          </g>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-emerald-800">
                    Akumulasi dana tersimpan aman di kas yayasan
                  </span>
                  <span>Data terupdate otomatis</span>
                </div>
              </div>

              {/* GRAFIK 2: PERFORMA PROGRAM DONASI (BAR CHART) */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        Performa Program Donasi
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Target vs Realisasi Perolehan Dana
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                      {analitikData.programStats.length} Program
                    </span>
                  </div>

                  {analitikData.programStats.length === 0 ? (
                    <p className="text-xs text-slate-400 py-12 text-center">
                      Belum ada data program donasi.
                    </p>
                  ) : (
                    <div className="space-y-4 pt-1 max-h-64 overflow-y-auto pr-1">
                      {analitikData.programStats.map((p, idx) => (
                        <div key={p.id || idx}>
                          <div className="flex justify-between items-baseline text-xs font-bold text-slate-800 mb-1">
                            <span className="truncate max-w-[200px]" title={p.judul}>
                              {idx + 1}. {p.judul}
                            </span>
                            <span className="text-emerald-700 shrink-0">
                              {p.persen}% ({formatRupiah(p.terkumpul)})
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                p.persen >= 80
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                  : p.persen >= 40
                                    ? "bg-gradient-to-r from-teal-500 to-emerald-600"
                                    : "bg-gradient-to-r from-amber-400 to-orange-500"
                              }`}
                              style={{ width: `${Math.max(5, p.persen)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                            <span>Target: {formatRupiah(p.target)}</span>
                            <span>{p.donasiCount} donasi</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">
                    Sisa Kas Amanah: {formatRupiah(summaryKeuangan.sisaSaldo)}
                  </span>
                  <span className="text-emerald-700 font-bold">Siap Disalurkan</span>
                </div>
              </div>
            </div>

            {/* BAGIAN BAWAH: STATUS KAS YAYASAN & UNDUH BERKAS RESMI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Posisi Kas Keuangan */}
              <div className="bg-emerald-900 text-white p-7 rounded-3xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                      Ringkasan Kas Amanah
                    </span>
                    <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 my-2">
                    <div className="bg-emerald-950/50 p-3.5 rounded-2xl border border-emerald-800/80">
                      <span className="text-[11px] text-emerald-300 block">Total Masuk</span>
                      <span className="text-base font-black text-white">
                        {formatRupiah(summaryKeuangan.totalMasuk)}
                      </span>
                    </div>
                    <div className="bg-emerald-950/50 p-3.5 rounded-2xl border border-emerald-800/80">
                      <span className="text-[11px] text-emerald-300 block">Total Penyaluran</span>
                      <span className="text-base font-black text-white">
                        {formatRupiah(summaryKeuangan.totalKeluar)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 bg-emerald-800/60 p-3.5 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-200">Saldo Kas Bersih:</span>
                    <span className="text-lg font-black text-amber-300">
                      {formatRupiah(summaryKeuangan.sisaSaldo)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-emerald-800 flex items-center justify-between">
                  <p className="text-xs text-emerald-200/80">
                    Ada bantuan baru yang siap diserahkan?
                  </p>
                  <button
                    onClick={() => {
                      setPenyaluranError("");
                      setPenyaluranForm({
                        programId: "",
                        penerimaId: "",
                        jumlah: "",
                        keterangan: "",
                        pengajuanId: "",
                      });
                      setModalPenyaluranOpen(true);
                    }}
                    className="dashboard-button dashboard-button-primary dashboard-button-compact"
                  >
                    + Catat Penyaluran
                  </button>
                </div>
              </div>

              {/* Card 2: Transaksi Donasi Terbaru (Menggantikan Ekspor Duplikat) */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-7 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-800">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">
                          Aktivitas Donasi Terbaru
                        </h3>
                        <p className="text-xs text-slate-400">
                          Riwayat donasi yang baru saja masuk ke sistem
                        </p>
                      </div>
                    </div>
                    {donasiPendingCount > 0 && (
                      <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
                        {donasiPendingCount} Pending
                      </span>
                    )}
                  </div>

                  {/* List Donasi Terbaru */}
                  {donasiList.length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center">
                      Belum ada transaksi donasi yang tercatat.
                    </p>
                  ) : (
                    <div className="space-y-2.5 pt-1">
                      {donasiList.slice(0, 4).map((d) => {
                        const namaDonatur =
                          d.donatur?.nama ||
                          (d.donaturId ? "Donatur Terdaftar" : "Hamba Allah");
                        return (
                          <div
                            key={d.id}
                            className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 transition"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {namaDonatur}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  • #{d.id}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate max-w-[180px] sm:max-w-[240px]">
                                {d.program?.judul || "Program Yayasan"}
                              </p>
                            </div>

                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                              <span className="text-xs font-black text-emerald-700">
                                {formatRupiah(d.jumlah)}
                              </span>
                              <StatusBadge
                                status={d.status}
                                mapping={STATUS_DONASI}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Total {donasiList.length} transaksi di database
                  </span>
                  <button
                    onClick={() => setActiveMenu("donasi")}
                    className="dashboard-text-button"
                  >
                    Buka Riwayat Donasi
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
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
                  className="dashboard-button dashboard-button-secondary w-1/2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="dashboard-button dashboard-button-primary w-1/2"
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
                  className="dashboard-button dashboard-button-secondary w-1/2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="dashboard-button dashboard-button-primary w-1/2"
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
                  className="dashboard-button dashboard-button-secondary w-1/2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="dashboard-button dashboard-button-primary w-1/2"
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
              noValidate
              className="p-6 space-y-4 text-left"
            >
              <Notice type="error" message={penyaluranError} />
              {penyaluranForm.pengajuanId && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] rounded-xl p-3">
                  Penyaluran untuk pengajuan <b>#{penyaluranForm.pengajuanId}</b> yang
                  telah diterima. Catat hanya jika bantuan benar-benar sudah
                  disalurkan.
                </div>
              )}
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
                  {/* Hanya penerima dengan akun AKTIF (DISETUJUI) & profil penerima valid */}
                  {penerimaList
                    .filter(
                      (p) =>
                        p.penerimaBantuan?.id &&
                        (p.penerimaBantuan.status === "DISETUJUI" ||
                          String(p.penerimaBantuan.id) === String(penyaluranForm.penerimaId)),
                    )
                    .map((p) => (
                      <option key={p.penerimaBantuan.id} value={p.penerimaBantuan.id}>
                        {p.nama} ({p.email})
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
                  min="1"
                  step="1"
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
                  maxLength={191}
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
                  className="dashboard-button dashboard-button-secondary w-1/2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="dashboard-button dashboard-button-primary w-1/2"
                >
                  {loading ? "Menyimpan..." : "Simpan Penyaluran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL PERIKSA & VERIFIKASI TRANSAKSI DONASI */}
      {detailDonasi && (() => {
        const d = detailDonasi;
        const isTerdaftar = Boolean(d.donatur);
        const namaDonatur = isTerdaftar ? d.donatur.nama : "Hamba Allah";
        const emailDonatur = isTerdaftar
          ? d.donatur.email
          : "Tanpa Akun (Donasi Publik)";
        const isPending = d.status === "PENDING";
        const bukti = getBuktiDonasi(d);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col text-left">
              {/* HEADER */}
              <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 text-white p-5 relative shrink-0">
                <button
                  onClick={() => !verifyingDonasiId && setDetailDonasi(null)}
                  className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300 bg-white/10 px-2 py-0.5 rounded-md">
                    #TRX-{String(d.id).padStart(3, "0")}
                  </span>
                  <StatusBadge status={d.status} map={STATUS_DONASI} />
                </div>
                <h3 className="text-base font-extrabold text-white">
                  Periksa & Verifikasi Transaksi Donasi
                </h3>
                <p className="text-[11px] text-emerald-200/80 mt-0.5">
                  Pastikan dana telah benar-benar masuk ke rekening yayasan sebelum memverifikasi.
                </p>
              </div>

              {/* BODY (SCROLLABLE) */}
              <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
                {/* RINGKASAN NOMINAL & PROGRAM */}
                <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Nominal Donasi
                    </span>
                    <span className="text-xl font-black text-emerald-800">
                      {formatRupiah(d.jumlah)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Metode
                    </span>
                    <span className="bg-emerald-100 text-emerald-900 font-black text-[11px] px-2.5 py-1 rounded-lg uppercase">
                      {d.metodePembayaran || "QRIS"}
                    </span>
                  </div>
                </div>

                {/* GRID INFORMASI DETAIL */}
                <div className="grid grid-cols-2 gap-3.5 bg-white border border-slate-100 rounded-2xl p-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Nama Donatur
                    </span>
                    <span className="font-extrabold text-slate-900 text-xs block mt-0.5">
                      {namaDonatur}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {emailDonatur}
                    </span>
                    <span
                      className={`inline-block mt-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        isTerdaftar
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {isTerdaftar ? "Donatur Terdaftar" : "Anonim / Publik"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Program Tujuan
                    </span>
                    <span className="font-bold text-slate-800 text-xs block mt-0.5">
                      {d.program?.judul || "Program Yayasan"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mt-2">
                      Waktu Transaksi
                    </span>
                    <span className="text-slate-600 font-semibold text-[11px] block mt-0.5">
                      {formatTanggal(d.createdAt, true)}
                    </span>
                  </div>

                  <div className="col-span-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Doa / Pesan Kebaikan
                    </span>
                    <p className="bg-slate-50 rounded-xl p-2.5 text-slate-700 italic border border-slate-100 text-[11px]">
                      "{d.doa && d.doa !== "-" ? d.doa : "Semoga berkah untuk yayasan dan sesama."}"
                    </p>
                  </div>
                </div>

                {/* SECTION: BUKTI PEMBAYARAN / TRANSFER */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                      <Receipt className="w-4 h-4 text-emerald-700" />
                      Bukti Pembayaran / Struk Transfer
                    </h4>
                    {bukti && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Terlampir
                      </span>
                    )}
                  </div>

                  {bukti ? (
                    <div className="space-y-3">
                      <div className="relative group bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center max-h-72">
                        <PrivateProofImage
                          donationId={d.id}
                          proof={bukti}
                          alt="Bukti Transfer Donasi"
                          className="w-full h-auto max-h-72 object-contain cursor-pointer transition group-hover:opacity-90"
                          onClick={() => setZoomBukti(true)}
                        />
                        <button
                          type="button"
                          onClick={() => setZoomBukti(true)}
                          className="dashboard-button dashboard-button-secondary dashboard-button-compact absolute bottom-3 right-3"
                        >
                          <ZoomIn className="w-3.5 h-3.5 text-emerald-700" />
                          Perbesar Gambar
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>
                          Cocokkan nominal <b>{formatRupiah(d.jumlah)}</b> dan waktu di struk dengan mutasi rekening.
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleHapusBuktiAdmin}
                            className="dashboard-text-button dashboard-text-button-danger"
                          >
                            Hapus Struk
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-amber-900">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="font-extrabold text-[11px] block">
                              Belum Ada Unggahan Struk Pembayaran
                            </span>
                            <p className="text-[11px] text-amber-800/90 leading-relaxed">
                              Donatur menggunakan <b>QRIS Statis Yayasan</b>. Donatur mungkin tidak mengunggah struk saat checkout.
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-amber-200/60 text-[11px] space-y-1 font-semibold text-amber-950">
                          <p className="font-black text-[10px] uppercase text-amber-800">
                            Panduan Verifikasi Mutasi Rekening:
                          </p>
                          <ul className="list-disc pl-4 space-y-0.5">
                            <li>Buka aplikasi m-Banking / mutasi rekening QRIS Yayasan.</li>
                            <li>
                              Cari transaksi masuk sebesar <b>{formatRupiah(d.jumlah)}</b> pada sekitar waktu <b>{formatTanggal(d.createdAt, true)}</b>.
                            </li>
                            <li>
                              Jika dana sudah tertera di mutasi, konfirmasi sebagai <b>Berhasil</b>.
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Opsi lampirkan bukti manual oleh admin */}
                      <div className="pt-1">
                        <input
                          type="file"
                          ref={adminFileInputRef}
                          accept="image/*"
                          onChange={handleAdminUploadBukti}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => adminFileInputRef.current?.click()}
                          className="dashboard-upload-button w-full"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-400" />
                          Lampirkan Struk Manual (Jika donatur mengirim via WhatsApp)
                        </button>
                        {adminUploadError && (
                          <p className="text-[10px] text-rose-600 font-semibold mt-1">
                            {adminUploadError}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {!isPending && (
                  <div
                    className={`rounded-2xl p-3.5 border ${
                      d.status === "BERHASIL"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-rose-50 border-rose-200 text-rose-900"
                    }`}
                  >
                    <span className="font-extrabold text-[11px] block">
                      Transaksi Ini Sudah Selesai Diverifikasi ({d.status})
                    </span>
                    <p className="text-[10px] mt-0.5 opacity-90">
                      {d.status === "BERHASIL"
                        ? "Dana sudah ditambahkan ke total dana terkumpul program di database."
                        : "Transaksi berstatus gagal dan tidak dihitung ke total dana program."}
                    </p>
                  </div>
                )}
              </div>

              {/* FOOTER ACTIONS */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                {isPending ? (
                  <>
                    <button
                      type="button"
                      disabled={Boolean(verifyingDonasiId)}
                      onClick={() => handleVerifikasiDonasi(d, "GAGAL")}
                      className="dashboard-button dashboard-button-danger"
                    >
                      <XCircle className="w-4 h-4" />
                      Tolak (Gagal)
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(verifyingDonasiId)}
                      onClick={() => handleVerifikasiDonasi(d, "BERHASIL")}
                      className="dashboard-button dashboard-button-success"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {verifyingDonasiId === d.id
                        ? "Memproses..."
                        : "Konfirmasi Pembayaran (Berhasil)"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDetailDonasi(null)}
                    className="dashboard-button dashboard-button-secondary"
                  >
                    Tutup
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* LIGHTBOX ZOOM BUKTI PEMBAYARAN */}
      {zoomBukti && detailDonasi && (() => {
        const bukti = getBuktiDonasi(detailDonasi);
        if (!bukti) return null;
        return (
          <div
            className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setZoomBukti(false)}
          >
            <div
              className="relative max-w-3xl max-h-[92vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setZoomBukti(false)}
                className="absolute -top-12 right-0 bg-white/20 hover:bg-white text-white hover:text-slate-900 rounded-full p-2 transition cursor-pointer"
                title="Tutup Preview"
              >
                <X className="w-5 h-5" />
              </button>
              <PrivateProofImage
                donationId={detailDonasi.id}
                proof={bukti}
                alt="Struk Donasi Full"
                className="max-h-[85vh] w-auto max-w-full rounded-2xl shadow-2xl border border-white/20 object-contain"
              />
              <span className="text-white/80 text-xs mt-3 font-semibold">
                Struk Transaksi #TRX-{String(detailDonasi.id).padStart(3, "0")} · {formatRupiah(detailDonasi.jumlah)}
              </span>
            </div>
          </div>
        );
      })()}

      {/* MODAL DETAIL & VERIFIKASI PENGAJUAN */}
      {detailPengajuan && (() => {
        const p = detailPengajuan;
        const { jenis, judul } = parseJudulPengajuan(p.judul);
        const menunggu = p.status === "MENUNGGU";
        const pb = p.user?.penerimaBantuan;
        return (
          <div className="admin-review-backdrop">
            <section className="admin-review-modal" role="dialog" aria-modal="true" aria-labelledby="admin-review-title">
              <header className="admin-review-header">
                <div>
                  <p className="admin-review-eyebrow">Pengajuan #{p.id} · {jenis}</p>
                  <h3 id="admin-review-title">{judul}</h3>
                </div>
                <div className="admin-review-header-actions">
                  <StatusBadge status={p.status} map={STATUS_PENGAJUAN} />
                  <button type="button" className="admin-review-close" aria-label="Tutup detail pengajuan" disabled={verifyingPengajuan} onClick={() => setDetailPengajuan(null)}>
                    <X size={20} />
                  </button>
                </div>
              </header>

              <div className="admin-review-content">
                <section className="admin-review-section">
                  <h4>Informasi pemohon</h4>
                  <div className="admin-review-applicant">
                    <div>
                      <strong>{p.user?.nama || "Nama tidak tersedia"}</strong>
                      <span>{p.user?.email || "Email tidak tersedia"}</span>
                      {pb?.noHp && <span>{pb.noHp}</span>}
                      {pb?.alamat && <span>{pb.alamat}</span>}
                    </div>
                    <div className="admin-review-account">
                      <span className="admin-review-label">Status akun</span>
                      {pb ? <StatusBadge status={pb.status} map={STATUS_AKUN_PENERIMA} /> : <span>Belum tersedia</span>}
                    </div>
                  </div>
                </section>

                <section className="admin-review-section">
                  <h4>Ringkasan pengajuan</h4>
                  <dl className="admin-review-facts">
                    <div><dt>Nominal diajukan</dt><dd className="admin-review-amount">{formatRupiah(p.jumlahDiajukan)}</dd></div>
                    <div><dt>Tanggal pengajuan</dt><dd>{formatTanggal(p.createdAt, true)}</dd></div>
                    {!menunggu && <div><dt>{p.status === "DIBATALKAN" ? "Dibatalkan pada" : "Diputuskan pada"}</dt><dd>{formatTanggal(p.updatedAt, true)}</dd></div>}
                  </dl>
                </section>

                <section className="admin-review-section">
                  <h4>Alasan pengajuan</h4>
                  <p className="admin-review-reason">{p.deskripsi}</p>
                </section>

                {!menunggu && (
                  <div
                    className={`admin-review-outcome ${
                      p.status === "DITOLAK"
                        ? "admin-review-outcome--rejected"
                        : p.status === "DIBATALKAN"
                          ? "admin-review-outcome--canceled"
                        : "admin-review-outcome--approved"
                    }`}
                  >
                    <strong>{p.status === "DIBATALKAN" ? "Dibatalkan oleh pemohon" : p.status === "DITOLAK" ? "Alasan penolakan" : "Keputusan pengurus"}</strong>
                    <p>{p.status === "DIBATALKAN" ? "Pemohon membatalkan pengajuan sebelum diputuskan." : p.catatanAdmin || (p.status === "DISETUJUI" ? "Pengajuan disetujui tanpa catatan tambahan." : "Tidak ada catatan.")}</p>
                  </div>
                )}

                {menunggu && (
                  <section className="admin-review-section">
                    <h4>Keputusan pengurus</h4>
                    <label className="admin-review-label" htmlFor="admin-review-note">Catatan untuk pemohon</label>
                    <textarea
                      id="admin-review-note"
                      rows={4}
                      maxLength={2000}
                      value={catatanVerifikasi}
                      onChange={(e) => {
                        setCatatanVerifikasi(e.target.value);
                        setCatatanError("");
                        setConfirmPengajuanStatus(null);
                      }}
                      placeholder="Tulis alasan atau catatan yang perlu diketahui pemohon"
                      className="admin-review-textarea"
                    />
                    <p className="admin-review-hint">Wajib diisi saat menolak (minimal 10 karakter). Opsional saat menyetujui.</p>
                  </section>
                )}

                <Notice type="error" message={catatanError} />
              </div>

              <footer className="admin-review-footer">
                {menunggu && <p>{confirmPengajuanStatus === "DISETUJUI" ? `Setujui pengajuan #${p.id}? Penyaluran dana dicatat terpisah.` : confirmPengajuanStatus === "DITOLAK" ? `Tolak pengajuan #${p.id}? Alasan akan terlihat oleh pemohon.` : "Menyetujui pengajuan belum mencatat penyaluran dana."}</p>}
                <div className="admin-review-actions">
                  {menunggu ? (
                    confirmPengajuanStatus ? (
                    <>
                      <button type="button" onClick={() => setConfirmPengajuanStatus(null)} disabled={verifyingPengajuan} className="dashboard-button dashboard-button-secondary">Kembali</button>
                      <button type="button" onClick={() => handleVerifikasiPengajuan(confirmPengajuanStatus)} disabled={verifyingPengajuan} className={`dashboard-button ${confirmPengajuanStatus === "DITOLAK" ? "dashboard-button-danger" : "dashboard-button-success"}`}>
                        {verifyingPengajuan ? "Memproses..." : confirmPengajuanStatus === "DITOLAK" ? "Ya, tolak" : "Ya, setujui"}
                      </button>
                    </>
                    ) : (
                    <>
                      <button
                        onClick={() => handleVerifikasiPengajuan("DITOLAK")}
                        disabled={verifyingPengajuan}
                        className="dashboard-button dashboard-button-danger-outline"
                      >
                        <XCircle className="w-4 h-4" /> Tolak pengajuan
                      </button>
                      <button
                        onClick={() => handleVerifikasiPengajuan("DISETUJUI")}
                        disabled={verifyingPengajuan}
                        className="dashboard-button dashboard-button-success"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {verifyingPengajuan ? "Memproses..." : "Setujui pengajuan"}
                      </button>
                    </>
                    )
                  ) : (
                    <>
                      {p.status === "DISETUJUI" && (
                        <button
                          onClick={() => bukaPenyaluranDariPengajuan(p)}
                          className="dashboard-button dashboard-button-primary"
                        >
                          Catat penyaluran
                        </button>
                      )}
                      <button
                        onClick={() => setDetailPengajuan(null)}
                        className="dashboard-button dashboard-button-secondary"
                      >
                        Tutup
                      </button>
                    </>
                  )}
                </div>
              </footer>
            </section>
          </div>
        );
      })()}

      {/* MODAL DETAIL & STATUS PENERIMA BANTUAN */}
      {detailPenerima && (() => {
        const u = detailPenerima;
        const pb = u.penerimaBantuan;
        const riwayat = pengajuanByUser[u.id] || [];
        const penyaluran = pb
          ? semuaPenyaluran.filter((s) => s.penerimaId === pb.id)
          : [];
        const totalDisalurkan = penyaluran.reduce((a, s) => a + Number(s.jumlahBantuan || 0), 0);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto text-left">
              <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white p-6 relative">
                <button
                  onClick={() => setDetailPenerima(null)}
                  className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300">
                  Data Penerima Bantuan
                </span>
                <h3 className="text-lg font-black mt-0.5">{u.nama}</h3>
                <p className="text-xs text-emerald-100/90">{u.email}</p>
              </div>

              <div className="p-6 space-y-6 text-xs">
                {/* STATUS AKUN */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Status Akun Penerima (status pengguna)
                      </div>
                      {pb ? (
                        <StatusBadge status={pb.status} map={STATUS_AKUN_PENERIMA} className="mt-1" />
                      ) : (
                        <span className="text-rose-600 font-semibold">Profil penerima tidak ditemukan</span>
                      )}
                    </div>
                    {pb && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUbahStatusPenerima(u, "DISETUJUI")}
                          disabled={updatingStatusPenerima || pb.status === "DISETUJUI"}
                          className="dashboard-button dashboard-button-success dashboard-button-compact"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Aktifkan
                        </button>
                        <button
                          onClick={() => handleUbahStatusPenerima(u, "DITOLAK")}
                          disabled={updatingStatusPenerima || pb.status === "DITOLAK"}
                          className="dashboard-button dashboard-button-danger-outline dashboard-button-compact"
                        >
                          <Ban className="w-3.5 h-3.5" /> Nonaktifkan
                        </button>
                      </div>
                    )}
                  </div>
                  {pb && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                      <div><b>No. HP:</b> {pb.noHp || "-"}</div>
                      <div><b>Alamat:</b> {pb.alamat || "-"}</div>
                      <div><b>Terdaftar:</b> {formatTanggal(u.createdAt)}</div>
                      <div className="sm:col-span-3"><b>Alasan pendaftaran:</b> {pb.alasan || "-"}</div>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400">
                    Status akun berbeda dari status pengajuan. Mengubah status
                    akun tidak menghapus riwayat pengajuan maupun penyaluran.
                  </p>
                </div>

                {/* RIWAYAT PENGAJUAN */}
                <div>
                  <h4 className="font-extrabold text-slate-800 mb-2">
                    Riwayat Pengajuan &amp; Hasil Verifikasi ({riwayat.length})
                  </h4>
                  {riwayat.length === 0 ? (
                    <p className="text-slate-400">Belum ada pengajuan bantuan.</p>
                  ) : (
                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[9px] tracking-wider">
                          <tr>
                            <th className="p-2.5">ID</th>
                            <th className="p-2.5">Judul</th>
                            <th className="p-2.5">Nominal</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5">Verifikasi</th>
                            <th className="p-2.5"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {riwayat.map((p) => (
                            <tr key={p.id}>
                              <td className="p-2.5 font-mono">#{p.id}</td>
                              <td className="p-2.5 max-w-[200px]">
                                <div className="line-clamp-1">{parseJudulPengajuan(p.judul).judul}</div>
                                {p.status === "DITOLAK" && p.catatanAdmin && (
                                  <div className="text-rose-600 line-clamp-1">Alasan: {p.catatanAdmin}</div>
                                )}
                              </td>
                              <td className="p-2.5 whitespace-nowrap">{formatRupiah(p.jumlahDiajukan)}</td>
                              <td className="p-2.5"><StatusBadge status={p.status} map={STATUS_PENGAJUAN} /></td>
                              <td className="p-2.5 whitespace-nowrap text-slate-500">
                                {p.status === "MENUNGGU" ? "-" : formatTanggal(p.updatedAt, true)}
                              </td>
                              <td className="p-2.5">
                                <button
                                  onClick={() => {
                                    setDetailPenerima(null);
                                    bukaDetailPengajuan(p);
                                  }}
                                  className="dashboard-text-button"
                                >
                                  Buka
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* RIWAYAT PENYALURAN */}
                <div>
                  <h4 className="font-extrabold text-slate-800 mb-2">
                    Riwayat Penyaluran Bantuan ({penyaluran.length}) · Total{" "}
                    {formatRupiah(totalDisalurkan)}
                  </h4>
                  {penyaluran.length === 0 ? (
                    <p className="text-slate-400">Belum ada penyaluran yang dicatat untuk penerima ini.</p>
                  ) : (
                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[9px] tracking-wider">
                          <tr>
                            <th className="p-2.5">Tanggal</th>
                            <th className="p-2.5">Program</th>
                            <th className="p-2.5">Jumlah</th>
                            <th className="p-2.5">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {penyaluran.map((s) => (
                            <tr key={s.id}>
                              <td className="p-2.5 whitespace-nowrap">{formatTanggal(s.tanggalSalur)}</td>
                              <td className="p-2.5">{s.programJudul}</td>
                              <td className="p-2.5 whitespace-nowrap font-bold text-rose-700">
                                {formatRupiah(s.jumlahBantuan)}
                              </td>
                              <td className="p-2.5">{s.keterangan}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setDetailPenerima(null)}
                  className="dashboard-button dashboard-button-secondary dashboard-button-block"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {modalProgramOpen && <ProgramFormModal
        key={editingProgram?.id || "new"}
        program={editingProgram}
        onClose={() => setModalProgramOpen(false)}
        onSaved={(result) => {
          setSuccess(result.cleanupPending ? "Program tersimpan. File gambar lama perlu dibersihkan dari penyimpanan." : result.message);
          setModalProgramOpen(false);
          setEditingProgram(null);
          fetchProgram();
        }}
      />}
    </div>
  );
}
