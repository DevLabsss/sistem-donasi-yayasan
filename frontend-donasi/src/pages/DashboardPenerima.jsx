import { useEffect, useRef, useState } from "react";
import {
  HandHeart,
  FileText,
  PlusCircle,
  RefreshCw,
  X,
  Eye,
  User,
  Send,
  Paperclip,
  Gift,
  CheckCircle2,
  Wallet,
  Calendar,
} from "lucide-react";
import { Dialog } from "../components/PublicUI";
import API from "../services/api";
import ProfilSaya from "../components/ProfilSaya";
import Notice from "../components/Notice";
import StatusBadge from "../components/StatusBadge";
import AssistanceFlow from "../components/AssistanceFlow";
import { findRelatedDisbursement } from "../utils/assistanceFlow";
import {
  STATUS_PENGAJUAN,
  STATUS_AKUN_PENERIMA,
  formatRupiah,
  formatTanggal,
  getErrorMessage,
  getStoredUser,
} from "../utils/format";
import { JENIS_BANTUAN, parseJudulPengajuan } from "../utils/pengajuan";
import { getAvatarUrl } from "../utils/imageCompressor";

const MIN_NOMINAL = 10000;
const MAX_NOMINAL = 1000000000;

const emptyForm = { jenis: "", judul: "", deskripsi: "", jumlahDiajukan: "" };

export default function DashboardPenerima() {
  const [user, setUser] = useState(getStoredUser());
  const [tab, setTab] = useState("pengajuan");
  const [akunStatus, setAkunStatus] = useState(null);

  const [pengajuanList, setPengajuanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState({ type: "", message: "" });
  const noticeId = useRef(0);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const submitLock = useRef(false);

  const [detail, setDetail] = useState(null);

  const [penyaluranList, setPenyaluranList] = useState([]);
  const [loadingPenyaluran, setLoadingPenyaluran] = useState(false);
  const [penyaluranError, setPenyaluranError] = useState("");

  const showNotice = (type, message) => setNotice({ type, message, id: ++noticeId.current });
  useEffect(() => {
    if (!notice.message) return undefined;
    const timer = window.setTimeout(() => setNotice((current) => current.id === notice.id ? { type: "", message: "" } : current), 6000);
    return () => window.clearTimeout(timer);
  }, [notice.id, notice.message]);

  const fetchPengajuan = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await API.get("/pengajuan/saya");
      setPengajuanList(res.data.data || []);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Gagal memuat data pengajuan."));
    } finally {
      setLoading(false);
    }
  };

  const fetchPenyaluran = async () => {
    setLoadingPenyaluran(true);
    setPenyaluranError("");
    try {
      const res = await API.get("/penyaluran/saya");
      setPenyaluranList(res.data.data || []);
    } catch (err) {
      setPenyaluranError(
        getErrorMessage(err, "Gagal memuat riwayat bantuan diterima."),
      );
    } finally {
      setLoadingPenyaluran(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    API.get("/pengajuan/saya")
      .then((res) => {
        if (!ignore) setPengajuanList(res.data.data || []);
      })
      .catch((err) => {
        if (!ignore)
          setLoadError(getErrorMessage(err, "Gagal memuat data pengajuan."));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    API.get("/penyaluran/saya")
      .then((res) => {
        if (!ignore) setPenyaluranList(res.data.data || []);
      })
      .catch(() => {});

    // Status akun penerima diambil dari profil
    API.get("/profil")
      .then((res) => {
        if (!ignore)
          setAkunStatus(res.data.data?.penerimaBantuan?.status || null);
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  const validate = () => {
    const e = {};
    if (!form.jenis) e.jenis = "Pilih jenis bantuan.";
    const judul = form.judul.trim();
    if (!judul) e.judul = "Judul pengajuan wajib diisi.";
    else if (judul.length < 5) e.judul = "Judul minimal 5 karakter.";
    else if (judul.length > 150) e.judul = "Judul maksimal 150 karakter.";

    const deskripsi = form.deskripsi.trim();
    if (!deskripsi) e.deskripsi = "Alasan pengajuan wajib diisi.";
    else if (deskripsi.length < 20)
      e.deskripsi = "Jelaskan alasan pengajuan minimal 20 karakter.";
    else if (deskripsi.length > 5000)
      e.deskripsi = "Alasan maksimal 5000 karakter.";

    const raw = String(form.jumlahDiajukan).trim();
    const nominal = Number(raw);
    if (!raw) e.jumlahDiajukan = "Nominal kebutuhan wajib diisi.";
    else if (!/^\d+$/.test(raw) || !Number.isFinite(nominal))
      e.jumlahDiajukan = "Nominal harus berupa angka bulat tanpa titik/koma.";
    else if (nominal < MIN_NOMINAL)
      e.jumlahDiajukan = `Nominal minimal ${formatRupiah(MIN_NOMINAL)}.`;
    else if (nominal > MAX_NOMINAL)
      e.jumlahDiajukan = `Nominal maksimal ${formatRupiah(MAX_NOMINAL)}.`;
    return e;
  };

  const updateForm = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setFormErrors((previous) => ({ ...previous, [field]: undefined }));
    setFormError("");
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    // Cegah pengiriman ganda (double click / enter berulang)
    if (submitLock.current) return;
    if (pengajuanList.some((item) => item.status === "MENUNGGU")) {
      setFormError("Batalkan pengajuan yang masih menunggu sebelum membuat pengajuan lain.");
      return;
    }
    setFormError("");
    const e = validate();
    setFormErrors(e);
    if (Object.keys(e).length) return;

    submitLock.current = true;
    setSubmitting(true);
    try {
      const res = await API.post("/pengajuan", {
        judul: `[${form.jenis}] ${form.judul.trim()}`,
        deskripsi: form.deskripsi.trim(),
        jumlahDiajukan: Number(form.jumlahDiajukan),
      });
      setFormOpen(false);
      setForm(emptyForm);
      setFormErrors({});
      showNotice("success", res.data.message || "Pengajuan bantuan berhasil dikirim! Menunggu verifikasi admin.");
      fetchPengajuan();
    } catch (err) {
      setFormError(getErrorMessage(err, "Gagal mengirim pengajuan bantuan."));
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!cancelTarget || canceling) return;
    setCanceling(true);
    setCancelError("");
    try {
      const res = await API.patch(`/pengajuan/${cancelTarget.id}/batalkan`);
      const updated = res.data.data;
      setPengajuanList((previous) => previous.map((item) => item.id === cancelTarget.id ? updated : item));
      setDetail(null);
      setCancelTarget(null);
      showNotice("success", "Pengajuan berhasil dibatalkan. Riwayatnya tetap tersimpan.");
    } catch (err) {
      setCancelError(getErrorMessage(err, "Gagal membatalkan pengajuan."));
      if (err.response?.status === 409) fetchPengajuan();
    } finally {
      setCanceling(false);
    }
  };

  const counts = pengajuanList.reduce(
    (acc, p) => ({ ...acc, [p.status]: (acc[p.status] || 0) + 1 }),
    {},
  );
  const activeApplication = pengajuanList.find((item) => item.status === "MENUNGGU");
  const latestApplication = pengajuanList[0];

  const totalBantuanDiterima = penyaluranList.reduce(
    (acc, p) => acc + Number(p.jumlahBantuan || 0),
    0,
  );

  const tabBtn = (key, label, Icon) => (
    <button
      onClick={() => setTab(key)}
      role="tab"
      aria-selected={tab === key}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
        tab === key
          ? "bg-emerald-800 text-white shadow-sm"
          : "bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50"
      }`}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  return (
    <div className="public-ui member-page dashboard-member dashboard-recipient min-h-screen">
      <div className="dashboard-heading flex justify-between items-center mb-6">
        <div>
          <span className="dashboard-eyebrow">Ruang Penerima</span>
          <h1 className="text-2xl font-black text-slate-900 text-left">
            Pengajuan &amp; Bantuan Saya
          </h1>
          <p className="text-xs text-slate-500 text-left mt-0.5">
            Satu tempat untuk mengajukan, memantau, dan melihat bantuan.
          </p>
        </div>
      </div>

      <p className="member-intro">Sampaikan kebutuhan Anda, pantau proses verifikasi, dan lihat bantuan yang telah diterima dalam satu tempat.</p>
      {loading ? <div className="recipient-flow" role="status">Memuat alur pengajuan Anda…</div> : pengajuanList.length > 0 ? <>
        <p className="recipient-flow-label">Pengajuan terbaru</p>
        <AssistanceFlow application={latestApplication} disbursements={penyaluranList} onDetail={() => setDetail(latestApplication)} onCancel={latestApplication.status === "MENUNGGU" ? () => setCancelTarget(latestApplication) : undefined} />
      </> : <div className="member-guide dashboard-guide">
        <div><span>01 · Lengkapi informasi</span><h2>Siapkan kebutuhan</h2><p>Tuliskan jenis bantuan, alasan, dan nominal yang dibutuhkan.</p></div>
        <div><span>02 · Pengurus meninjau</span><h2>Pantau verifikasi</h2><p>Pengajuan yang dikirim menunggu pemeriksaan pengurus yayasan.</p></div>
        <div><span>03 · Lihat hasilnya</span><h2>Baca catatan pengurus</h2><p>Status dan catatan tersedia pada detail pengajuan Anda.</p></div>
      </div>}
      {/* Card Profil Penerima */}
      <div className="dashboard-profile-card bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 rounded-3xl shadow-lg text-left mb-6 border border-emerald-800/40">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="member-profile flex items-center gap-4">
            {user.fotoProfil ? (
              <img
                src={getAvatarUrl(user.fotoProfil)}
                alt={user.nama}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white/40 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                <HandHeart className="w-6 h-6 text-amber-300" />
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300">
                Profil Penerima Terdaftar
              </span>
              <h3 className="text-xl font-extrabold text-white">{user.nama}</h3>
              <p className="text-xs text-emerald-200">
                {user.email || "Penerima Bantuan"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap text-[10px] font-extrabold">
            {akunStatus && (
              <StatusBadge status={akunStatus} map={STATUS_AKUN_PENERIMA} />
            )}
            <span className="bg-white/10 px-2.5 py-1 rounded-full">
              {counts.MENUNGGU || 0} PENDING
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-full">
              {counts.DISETUJUI || 0} DITERIMA
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-full">
              {counts.DITOLAK || 0} DITOLAK
            </span>
            {(counts.DIBATALKAN || 0) > 0 && <span className="bg-white/10 px-2.5 py-1 rounded-full">{counts.DIBATALKAN} DIBATALKAN</span>}
            {totalBantuanDiterima > 0 && (
              <span className="bg-amber-300 text-emerald-950 px-2.5 py-1 rounded-full font-black">
                {formatRupiah(totalBantuanDiterima)} DITERIMA
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="member-tabs dashboard-tabs flex gap-2 mb-6" role="tablist" aria-label="Menu dashboard penerima">
        {tabBtn("pengajuan", "Pengajuan Bantuan", FileText)}
        {tabBtn(
          "penyaluran",
          `Bantuan Diterima (${penyaluranList.length})`,
          Gift,
        )}
        {tabBtn("profil", "Profil Saya", User)}
      </div>

      {tab === "profil" && (
        <ProfilSaya
          onProfileLoaded={(p) => {
            setUser((u) => ({ ...u, nama: p.nama, email: p.email }));
            if (p.penerimaBantuan?.status)
              setAkunStatus(p.penerimaBantuan.status);
          }}
        />
      )}

      {tab === "penyaluran" && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white p-5 rounded-3xl text-left border border-emerald-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-200">
                  Total Bantuan Yang Telah Disalurkan
                </span>
                <h3 className="text-2xl font-black text-amber-300 mt-0.5">
                  {formatRupiah(totalBantuanDiterima)}
                </h3>
                <span className="text-[11px] text-emerald-200/80">
                  Dari {penyaluranList.length} kali penyaluran yayasan
                </span>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-amber-300" />
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-5 rounded-3xl text-left shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Status Bantuan
                </span>
                <h3 className="text-base font-extrabold text-slate-800 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {penyaluranList.length > 0
                    ? "Bantuan Aktif Disalurkan"
                    : "Belum Ada Penyaluran"}
                </h3>
                <span className="text-[11px] text-slate-500">
                  Penyaluran dicatat saat bantuan resmi diserahkan
                </span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-emerald-700" />
              </div>
            </div>
          </div>

          {/* Tabel Penyaluran */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Daftar Bantuan yang Telah Diterima
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Seluruh dana dan bantuan yang resmi disalurkan oleh yayasan tercatat transparan di sini.
                </p>
              </div>
              <button
                onClick={fetchPenyaluran}
                className="dashboard-icon-button"
                title="Muat ulang data"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingPenyaluran ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            {loadingPenyaluran ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                Memuat riwayat penyaluran bantuan...
              </div>
            ) : penyaluranError ? (
              <div className="p-5">
                <Notice type="error" message={penyaluranError} />
              </div>
            ) : penyaluranList.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-semibold space-y-2">
                <Gift className="w-8 h-8 mx-auto text-slate-300" />
                <p>
                  Belum ada riwayat penyaluran bantuan yang dicatat untuk Anda.
                </p>
                <p className="text-[11px] text-slate-400 font-normal">
                  Jika pengajuan bantuan Anda disetujui, pengurus yayasan akan
                  berkoordinasi dan mencatat penyaluran di sini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4">Tanggal Salur</th>
                      <th className="p-4">Program Donasi Sumber</th>
                      <th className="p-4">Jumlah Bantuan</th>
                      <th className="p-4">Keterangan</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {penyaluranList.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 transition"
                      >
                        <td className="p-4 font-semibold text-slate-500 whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatTanggal(item.tanggalSalur)}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-900">
                          {item.program?.judul || "Program Yayasan"}
                        </td>
                        <td className="p-4 font-black text-emerald-700 whitespace-nowrap">
                          {formatRupiah(item.jumlahBantuan)}
                        </td>
                        <td className="p-4 text-slate-600">
                          {item.keterangan || "Penyaluran bantuan"}
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />{" "}
                            Tersalurkan
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
      )}

      {tab === "pengajuan" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm text-left overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" /> Riwayat
                Pengajuan Bantuan
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pantau status dan hasil verifikasi pengajuan Anda
              </p>
            </div>
            <div className="member-toolbar flex gap-2">
              <button
                onClick={fetchPengajuan}
                className="dashboard-button dashboard-button-secondary dashboard-button-compact"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={() => {
                  setNotice({ type: "", message: "" });
                  setFormError("");
                  setFormErrors({});
                  setFormOpen(true);
                }}
                disabled={loading || !!loadError || !!activeApplication}
                className="dashboard-button dashboard-button-primary dashboard-button-compact"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Ajukan Bantuan
              </button>
            </div>
          </div>

          {activeApplication && (
            <p className="px-6 pt-4 text-xs text-slate-600">
              Anda masih memiliki pengajuan yang menunggu. Batalkan pengajuan #{activeApplication.id} jika ingin mengajukan bantuan lain.
            </p>
          )}

          {notice.message && (
            <div className="px-6 pt-4">
              <Notice
                type={notice.type}
                message={notice.message}
                onClose={() => setNotice({ type: "", message: "" })}
              />
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              Memuat data pengajuan...
            </div>
          ) : loadError ? (
            <div className="p-6">
              <Notice type="error" message={loadError} />
            </div>
          ) : pengajuanList.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              Anda belum pernah mengajukan bantuan. Klik "Ajukan Bantuan" untuk
              membuat pengajuan pertama.
            </div>
          ) : (
            <div className="recipient-history-scroll" role="region" aria-label="Daftar riwayat pengajuan" tabIndex={0}>
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Jenis</th>
                    <th className="p-4">Judul</th>
                    <th className="p-4">Nominal</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pengajuanList.map((p) => {
                    const { jenis, judul } = parseJudulPengajuan(p.judul);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 whitespace-nowrap font-semibold text-slate-500">
                          {formatTanggal(p.createdAt)}
                        </td>
                        <td className="p-4 whitespace-nowrap">{jenis}</td>
                        <td className="p-4 font-bold text-slate-900 max-w-xs">
                          {judul}
                        </td>
                        <td className="p-4 whitespace-nowrap font-black text-emerald-700">
                          {formatRupiah(p.jumlahDiajukan)}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={p.status} map={STATUS_PENGAJUAN} />
                        </td>
                        <td className="p-4 text-center">
                          <div className="recipient-row-actions">
                          <button
                            onClick={() => setDetail(p)}
                            className="dashboard-button dashboard-button-secondary dashboard-button-compact"
                          >
                            <Eye className="w-3.5 h-3.5" /> Detail
                          </button>
                          {p.status === "MENUNGGU" && <button type="button" onClick={() => setCancelTarget(p)} className="dashboard-button dashboard-button-compact recipient-cancel-button">Batalkan</button>}
                          </div>
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

      {/* MODAL FORM PENGAJUAN */}
      {formOpen && (
        <Dialog title="Form Pengajuan Bantuan" hideHeader className="member-modal" onClose={() => { if (!submitting) setFormOpen(false); }}>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white p-6 relative text-left">
              <button
                aria-label="Tutup formulir pengajuan"
                disabled={submitting}
                onClick={() => !submitting && setFormOpen(false)}
                className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-black pr-10">Form Pengajuan Bantuan</h3>
              <p className="text-xs text-emerald-100/90 mt-1">
                Pengajuan akan berstatus PENDING sampai diverifikasi pengurus
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="ds-form p-6 space-y-4 text-left">
              <Notice type="error" message={formError} />

              <div>
                <label htmlFor="applicant-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pemohon
                </label>
                <input
                  type="text"
                  id="applicant-name"
                  value={user.nama || ""}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Diambil dari akun Anda. Ubah melalui menu Profil Saya.
                </p>
              </div>

              <div>
                <label htmlFor="assistance-type" className="block text-xs font-bold text-slate-700 mb-1">
                  Jenis Bantuan
                </label>
                <select
                  id="assistance-type"
                  aria-invalid={!!formErrors.jenis}
                  aria-describedby={formErrors.jenis ? "assistance-type-error" : undefined}
                  value={form.jenis}
                  onChange={(e) => updateForm("jenis", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                >
                  <option value="">-- Pilih Jenis Bantuan --</option>
                  {JENIS_BANTUAN.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
                {formErrors.jenis && (
                  <p id="assistance-type-error" role="alert" className="text-[11px] text-red-600 mt-1 font-semibold">{formErrors.jenis}</p>
                )}
              </div>

              <div>
                <label htmlFor="assistance-title" className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Pengajuan
                </label>
                <input
                  type="text"
                  id="assistance-title"
                  aria-invalid={!!formErrors.judul}
                  aria-describedby={formErrors.judul ? "assistance-title-error" : undefined}
                  maxLength={150}
                  placeholder="Contoh: Biaya SPP semester ganjil anak"
                  value={form.judul}
                  onChange={(e) => updateForm("judul", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
                {formErrors.judul && (
                  <p id="assistance-title-error" role="alert" className="text-[11px] text-red-600 mt-1 font-semibold">{formErrors.judul}</p>
                )}
              </div>

              <div>
                <label htmlFor="assistance-description" className="block text-xs font-bold text-slate-700 mb-1">
                  Alasan Pengajuan
                </label>
                <textarea
                  id="assistance-description"
                  aria-invalid={!!formErrors.deskripsi}
                  aria-describedby={formErrors.deskripsi ? "assistance-description-error" : undefined}
                  rows={4}
                  maxLength={5000}
                  placeholder="Jelaskan kondisi dan alasan Anda membutuhkan bantuan..."
                  value={form.deskripsi}
                  onChange={(e) => updateForm("deskripsi", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
                <div className="flex justify-between">
                  {formErrors.deskripsi ? (
                    <p id="assistance-description-error" role="alert" className="text-[11px] text-red-600 mt-1 font-semibold">{formErrors.deskripsi}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-[10px] text-slate-400 mt-1">
                    {form.deskripsi.trim().length}/5000
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="assistance-amount" className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Kebutuhan (Rp)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  id="assistance-amount"
                  aria-invalid={!!formErrors.jumlahDiajukan}
                  aria-describedby={formErrors.jumlahDiajukan ? "assistance-amount-error" : undefined}
                  min={MIN_NOMINAL}
                  step="1"
                  placeholder="Contoh: 1500000"
                  value={form.jumlahDiajukan}
                  onChange={(e) => updateForm("jumlahDiajukan", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600"
                />
                {formErrors.jumlahDiajukan ? (
                  <p id="assistance-amount-error" role="alert" className="text-[11px] text-red-600 mt-1 font-semibold">{formErrors.jumlahDiajukan}
                  </p>
                ) : (
                  form.jumlahDiajukan && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      {formatRupiah(form.jumlahDiajukan)}
                    </p>
                  )
                )}
              </div>

              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3 text-[11px] text-slate-500 flex items-start gap-2">
                <Paperclip className="w-4 h-4 shrink-0 mt-px" />
                <span>
                  Siapkan dokumen pendukung untuk ditunjukkan kepada pengurus
                  saat dihubungi. Pengajuan ini tidak memerlukan unggahan berkas.
                </span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setFormOpen(false)}
                  className="dashboard-button dashboard-button-secondary w-1/2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="dashboard-button dashboard-button-primary w-1/2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? "Mengirim..." : "Kirim Pengajuan"}
                </button>
              </div>
            </form>
          </div>
        </Dialog>
      )}

      {/* MODAL DETAIL PENGAJUAN */}
      {detail && (
        <DetailPengajuanModal
          pengajuan={detail}
          penyaluranList={penyaluranList}
          onCancel={(application) => { setDetail(null); setCancelTarget(application); }}
          onClose={() => setDetail(null)}
        />
      )}
      {cancelTarget && <Dialog title="Batalkan pengajuan bantuan" onClose={() => { if (!canceling) { setCancelTarget(null); setCancelError(""); } }} className="member-modal">
        <div className="ds-dialog-body text-left">
          <p>Batalkan pengajuan <strong>#{cancelTarget.id} · {parseJudulPengajuan(cancelTarget.judul).judul}</strong>? Pengajuan yang dibatalkan tidak akan diperiksa lebih lanjut, tetapi tetap tercatat dalam riwayat Anda.</p>
          <Notice type="error" message={cancelError} />
          <div className="recipient-confirm-actions">
            <button type="button" className="dashboard-button dashboard-button-secondary" disabled={canceling} onClick={() => { setCancelTarget(null); setCancelError(""); }}>Kembali</button>
            <button type="button" className="dashboard-button recipient-cancel-button" disabled={canceling} onClick={handleCancelApplication}>{canceling ? "Membatalkan…" : "Ya, batalkan pengajuan"}</button>
          </div>
        </div>
      </Dialog>}
    </div>
  );
}

function DetailPengajuanModal({ pengajuan, penyaluranList, onClose, onCancel }) {
  const { jenis, judul } = parseJudulPengajuan(pengajuan.judul);
  const sudahDiverifikasi = ["DISETUJUI", "DITOLAK"].includes(pengajuan.status);
  return (
    <Dialog title={`Detail pengajuan: ${judul}`} hideHeader className="member-modal" onClose={onClose}>
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto text-left">
        <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white p-6 relative">
          <button
            aria-label="Tutup detail pengajuan"
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300">
            Pengajuan #{pengajuan.id} · {jenis}
          </span>
          <h3 className="text-lg font-black mt-0.5 pr-6">{judul}</h3>
        </div>
        <div className="p-6 space-y-4 text-xs">
          <AssistanceFlow application={pengajuan} disbursements={penyaluranList} compact />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                Status
              </div>
              <StatusBadge
                status={pengajuan.status}
                map={STATUS_PENGAJUAN}
                className="mt-1"
              />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                Nominal Diajukan
              </div>
              <div className="font-black text-emerald-700 mt-1">
                {formatRupiah(pengajuan.jumlahDiajukan)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                Tanggal Pengajuan
              </div>
              <div className="font-semibold text-slate-700 mt-1">
                {formatTanggal(pengajuan.createdAt, true)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                {pengajuan.status === "DIBATALKAN" ? "Waktu Pembatalan" : "Waktu Verifikasi"}
              </div>
              <div className="font-semibold text-slate-700 mt-1">
                {pengajuan.status === "DIBATALKAN" || sudahDiverifikasi
                  ? formatTanggal(pengajuan.updatedAt, true)
                  : "Belum diverifikasi"}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
              Alasan Pengajuan
            </div>
            <p className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-slate-700 whitespace-pre-wrap leading-relaxed">
              {pengajuan.deskripsi}
            </p>
          </div>

          {pengajuan.status === "DITOLAK" && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
              <div className="text-[10px] font-extrabold text-rose-700 uppercase mb-1">
                Alasan Penolakan
              </div>
              <p className="text-rose-800 whitespace-pre-wrap">
                {pengajuan.catatanAdmin || "Tidak ada alasan yang dicantumkan."}
              </p>
            </div>
          )}

          {pengajuan.status === "DISETUJUI" &&
            (() => {
              const salur = findRelatedDisbursement(pengajuan, penyaluranList);
              return (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-emerald-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-extrabold uppercase">
                      Pengajuan Diterima
                    </div>
                    {salur && (
                      <span className="bg-emerald-200 text-emerald-950 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-800" />{" "}
                        Bantuan Telah Disalurkan
                      </span>
                    )}
                  </div>
                  {pengajuan.catatanAdmin && (
                    <p className="whitespace-pre-wrap">
                      Catatan pengurus: {pengajuan.catatanAdmin}
                    </p>
                  )}
                  {salur ? (
                    <div className="bg-white/80 border border-emerald-200 rounded-lg p-2.5 mt-1 text-[11px] text-emerald-950 space-y-1 font-semibold">
                      <p className="text-emerald-900 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />{" "}
                        Dana Bantuan Resmi Disalurkan
                      </p>
                      <p>
                        Program:{" "}
                        <b>{salur.program?.judul || "Program Yayasan"}</b>
                      </p>
                      <p>
                        Nominal Disalurkan:{" "}
                        <b className="text-emerald-700">
                          {formatRupiah(salur.jumlahBantuan)}
                        </b>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Tanggal Salur: {formatTanggal(salur.tanggalSalur)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] leading-relaxed">
                      Pengurus akan menghubungi Anda untuk koordinasi penyaluran
                      bantuan. Status diterima tidak langsung mencatat
                      penyaluran sampai bantuan resmi diserahkan.
                    </p>
                  )}
                </div>
              );
            })()}

          {pengajuan.status === "MENUNGGU" && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-amber-800">
              Pengajuan sedang menunggu verifikasi pengurus yayasan.
            </div>
          )}

          {pengajuan.status === "DIBATALKAN" && <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-700">Pengajuan ini dibatalkan oleh pemohon sebelum keputusan pengurus.</div>}

          {pengajuan.status === "MENUNGGU" && <button type="button" className="dashboard-button dashboard-button-block recipient-cancel-button" onClick={() => onCancel(pengajuan)}>Batalkan pengajuan ini</button>}

          <button
            aria-label="Tutup detail pengajuan"
            onClick={onClose}
            className="dashboard-button dashboard-button-secondary dashboard-button-block"
          >
            Tutup
          </button>
        </div>
      </div>
    </Dialog>
  );
}
