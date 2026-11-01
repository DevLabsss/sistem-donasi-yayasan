import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  KeyRound,
  Save,
  RefreshCw,
  Lock,
  Camera,
  Trash2,
} from "lucide-react";
import API from "../services/api";
import Notice from "./Notice";
import StatusBadge from "./StatusBadge";
import ModalFotoProfil from "./ModalFotoProfil";
import ModalHapusFoto from "./ModalHapusFoto";
import { getAvatarUrl } from "../utils/imageCompressor";
import {
  PHONE_REGEX,
  STATUS_AKUN_PENERIMA,
  formatTanggal,
  getErrorMessage,
  getStoredUser,
  setStoredUser,
} from "../utils/format";

const ROLE_LABEL = {
  PENGURUS: "Pengurus Yayasan",
  DONATUR: "Donatur",
  PENERIMA_BANTUAN: "Penerima Bantuan",
};

const inputCls =
  "w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all disabled:opacity-60";
const errCls = "text-[11px] text-red-600 mt-1 font-semibold";

// Helper inisial nama untuk avatar default
function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ProfilSaya({ onProfileLoaded }) {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState({ nama: "", noHp: "", alamat: "" });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  const [pwForm, setPwForm] = useState({
    passwordLama: "",
    passwordBaru: "",
    konfirmasi: "",
  });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);
  const [pwNotice, setPwNotice] = useState({ type: "", message: "" });

  // Modal Foto Profil & Hapus Foto
  const [modalFotoOpen, setModalFotoOpen] = useState(false);
  const [modalHapusOpen, setModalHapusOpen] = useState(false);
  const [savingFoto, setSavingFoto] = useState(false);
  const [deletingFoto, setDeletingFoto] = useState(false);

  const fetchProfil = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await API.get("/profil");
      const data = res.data.data;
      if (!data) throw new Error("Data profil kosong");
      setProfil(data);
      setForm({
        nama: data.nama || "",
        noHp: data.noHp || "",
        alamat: data.alamat || "",
      });
      // Sinkronkan foto profil ke session storage lokal jika ada
      const stored = getStoredUser();
      if (stored && data.fotoProfil !== stored.fotoProfil) {
        setStoredUser({
          ...stored,
          fotoProfil: data.fotoProfil || null,
          nama: data.nama || stored.nama,
        });
      }
      if (onProfileLoaded) onProfileLoaded(data);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Gagal memuat data profil."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    API.get("/profil")
      .then((res) => {
        if (ignore) return;
        const data = res.data.data;
        if (!data) throw new Error("Data profil kosong");
        setProfil(data);
        setForm({
          nama: data.nama || "",
          noHp: data.noHp || "",
          alamat: data.alamat || "",
        });
        const stored = getStoredUser();
        if (stored && data.fotoProfil !== stored.fotoProfil) {
          setStoredUser({
            ...stored,
            fotoProfil: data.fotoProfil || null,
            nama: data.nama || stored.nama,
          });
        }
        if (onProfileLoaded) onProfileLoaded(data);
      })
      .catch((err) => {
        if (ignore) return;
        setLoadError(getErrorMessage(err, "Gagal memuat data profil."));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateProfil = () => {
    const e = {};
    const nama = form.nama.trim();
    if (!nama) e.nama = "Nama wajib diisi.";
    else if (nama.length < 3) e.nama = "Nama minimal 3 karakter.";
    else if (nama.length > 100) e.nama = "Nama maksimal 100 karakter.";

    const noHp = form.noHp.trim().replace(/[\s-]/g, "");
    if (noHp && !PHONE_REGEX.test(noHp))
      e.noHp = "Format nomor HP tidak valid (contoh: 081234567890).";

    if (form.alamat.trim().length > 191)
      e.alamat = "Alamat maksimal 191 karakter.";
    return e;
  };

  const handleSimpanProfil = async (ev) => {
    ev.preventDefault();
    if (saving) return;
    setNotice({ type: "", message: "" });
    const e = validateProfil();
    setFormErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      const payload = {
        nama: form.nama.trim(),
        noHp: form.noHp.trim().replace(/[\s-]/g, ""),
        alamat: form.alamat.trim(),
      };
      const res = await API.put("/profil", payload);
      const updated = res.data.data || {};
      setProfil((p) => ({ ...p, ...updated }));
      // Sinkronkan data sesi agar dashboard & navbar langsung ikut berubah
      const stored = getStoredUser();
      setStoredUser({
        ...stored,
        nama: updated.nama ?? payload.nama,
        email: updated.email ?? stored.email,
        fotoProfil: updated.fotoProfil ?? stored.fotoProfil,
      });
      if (onProfileLoaded) onProfileLoaded({ ...profil, ...updated });
      setNotice({
        type: "success",
        message: res.data.message || "Profil berhasil diperbarui!",
      });
    } catch (err) {
      setNotice({
        type: "error",
        message: getErrorMessage(err, "Gagal memperbarui profil."),
      });
    } finally {
      setSaving(false);
    }
  };

  const validatePassword = () => {
    const e = {};
    if (!pwForm.passwordLama) e.passwordLama = "Password lama wajib diisi.";
    if (!pwForm.passwordBaru) e.passwordBaru = "Password baru wajib diisi.";
    else if (pwForm.passwordBaru.length < 6)
      e.passwordBaru = "Password baru minimal 6 karakter.";
    else if (pwForm.passwordBaru === pwForm.passwordLama)
      e.passwordBaru = "Password baru harus berbeda dari password lama.";
    if (pwForm.konfirmasi !== pwForm.passwordBaru)
      e.konfirmasi = "Konfirmasi password tidak sama.";
    return e;
  };

  const handleGantiPassword = async (ev) => {
    ev.preventDefault();
    if (savingPw) return;
    setPwNotice({ type: "", message: "" });
    const e = validatePassword();
    setPwErrors(e);
    if (Object.keys(e).length) return;

    setSavingPw(true);
    try {
      const res = await API.put("/profil/ganti-password", {
        passwordLama: pwForm.passwordLama,
        passwordBaru: pwForm.passwordBaru,
      });
      setPwForm({ passwordLama: "", passwordBaru: "", konfirmasi: "" });
      setPwNotice({
        type: "success",
        message: res.data.message || "Password berhasil diperbarui!",
      });
    } catch (err) {
      setPwNotice({
        type: "error",
        message: getErrorMessage(err, "Gagal mengganti password."),
      });
    } finally {
      setSavingPw(false);
    }
  };

  // Handler Simpan Foto Profil dari Modal Crop
  const handleSaveFoto = async (dataUrl) => {
    if (savingFoto) return;
    setSavingFoto(true);
    try {
      const res = await API.put("/profil/foto", { fotoProfil: dataUrl });
      const updatedUser = res.data.data;
      setProfil((p) => ({ ...p, fotoProfil: updatedUser.fotoProfil }));

      // Sinkronkan ke localStorage dan beritahu seluruh komponen
      const stored = getStoredUser();
      setStoredUser({
        ...stored,
        fotoProfil: updatedUser.fotoProfil,
      });

      if (onProfileLoaded) {
        onProfileLoaded({ ...profil, fotoProfil: updatedUser.fotoProfil });
      }

      setModalFotoOpen(false);
      setNotice({
        type: "success",
        message: "Foto profil berhasil diperbarui!",
      });
    } catch (err) {
      setNotice({
        type: "error",
        message: getErrorMessage(err, "Terjadi kesalahan saat mengunggah foto."),
      });
    } finally {
      setSavingFoto(false);
    }
  };

  // Handler Hapus Foto Profil
  const handleConfirmHapusFoto = async () => {
    if (deletingFoto) return;
    setDeletingFoto(true);
    try {
      const res = await API.delete("/profil/foto");
      setProfil((p) => ({ ...p, fotoProfil: null }));

      // Sinkronkan ke localStorage dan beritahu seluruh komponen
      const stored = getStoredUser();
      setStoredUser({
        ...stored,
        fotoProfil: null,
      });

      if (onProfileLoaded) {
        onProfileLoaded({ ...profil, fotoProfil: null });
      }

      setModalHapusOpen(false);
      setNotice({
        type: "success",
        message: res.data.message || "Foto profil berhasil dihapus.",
      });
    } catch (err) {
      setNotice({
        type: "error",
        message: getErrorMessage(err, "Gagal menghapus foto profil."),
      });
    } finally {
      setDeletingFoto(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center text-xs text-slate-400 font-semibold">
        Memuat data profil...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-4 text-left">
        <Notice type="error" message={loadError} />
        <button
          onClick={fetchProfil}
          className="dashboard-button dashboard-button-secondary dashboard-button-compact"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
        </button>
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(profil.fotoProfil);
  const initials = getInitials(profil.nama);

  return (
    <div className="space-y-6 text-left">
      {/* A. HEADER & BREADCRUMB */}
      <div className="flex flex-col gap-1 pb-2">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-emerald-700">Profil Saya</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Profil Saya
        </h2>
        <p className="text-xs text-slate-500">
          Kelola informasi akun dan foto profil Anda.
        </p>
      </div>

      {/* NOTIFIKASI GLOBAL */}
      <Notice
        type={notice.type}
        message={notice.message}
        onClose={() => setNotice({ type: "", message: "" })}
      />

      {/* B. CARD FOTO PROFIL (MINIMALIST PREMIUM) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar Lingkaran */}
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profil.nama}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-emerald-500/30"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-emerald-700 to-teal-900 text-white font-black text-2xl sm:text-3xl flex items-center justify-center border-4 border-white shadow-md ring-2 ring-emerald-500/20 tracking-wider">
                {initials}
              </div>
            )}

            {/* Quick Action Overlay on Avatar */}
            <button
              onClick={() => setModalFotoOpen(true)}
              className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
              title="Ubah Foto"
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>

          {/* Info Nama & Role */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                {profil.nama}
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {ROLE_LABEL[profil.role] || profil.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{profil.email}</p>
            <p className="text-[11px] text-slate-400 mt-2">
              Format JPG, JPEG, PNG, WebP (Maksimal 2 MB)
            </p>
          </div>
        </div>

        {/* Tombol Aksi Foto Profil */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setModalFotoOpen(true)}
            className="dashboard-button dashboard-button-primary"
          >
            <Camera className="w-4 h-4" />
            <span>Ubah Foto</span>
          </button>

          {profil.fotoProfil && (
            <button
              type="button"
              onClick={() => setModalHapusOpen(true)}
              className="dashboard-button dashboard-button-danger-outline"
              title="Hapus foto profil saat ini"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus</span>
            </button>
          )}
        </div>
      </div>

      {/* C. INFORMASI PRIBADI & GANTI PASSWORD (GRID 2 KOLOM) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
        {/* FORM DATA PROFIL */}
        <form
          onSubmit={handleSimpanProfil}
          noValidate
          className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-700" /> Informasi Pribadi
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {ROLE_LABEL[profil.role] || profil.role} · Bergabung{" "}
                {formatTanggal(profil.createdAt)}
              </p>
            </div>
            {profil.role === "PENERIMA_BANTUAN" && profil.penerimaBantuan && (
              <StatusBadge
                status={profil.penerimaBantuan.status}
                map={STATUS_AKUN_PENERIMA}
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                maxLength={100}
                className={inputCls}
              />
            </div>
            {formErrors.nama && <p className={errCls}>{formErrors.nama}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={profil.email || ""}
                disabled
                className={inputCls}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Email terdaftar secara permanen. Hubungi admin bila perlu perubahan.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              No. HP / WhatsApp
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="081234567890"
                value={form.noHp}
                onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                maxLength={20}
                className={inputCls}
              />
            </div>
            {formErrors.noHp && <p className={errCls}>{formErrors.noHp}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Alamat
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                rows={2}
                placeholder="Alamat lengkap domisili"
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                maxLength={191}
                className={inputCls}
              />
            </div>
            {formErrors.alamat && <p className={errCls}>{formErrors.alamat}</p>}
          </div>

          {profil.role === "PENERIMA_BANTUAN" && profil.penerimaBantuan && (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-[11px] text-slate-500 space-y-0.5">
              <div className="font-bold text-slate-600">
                Data verifikasi penerima bantuan
              </div>
              <div>No. HP: {profil.penerimaBantuan.noHp || "-"}</div>
              <div>Alamat: {profil.penerimaBantuan.alamat || "-"}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="dashboard-button dashboard-button-primary dashboard-button-block"
          >
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : "Simpan Informasi Pribadi"}
          </button>
        </form>

        {/* FORM GANTI PASSWORD */}
        <form
          onSubmit={handleGantiPassword}
          noValidate
          className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 h-max"
        >
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-700" /> Ganti Password
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Password lama wajib diverifikasi sebelum password baru disimpan.
            </p>
          </div>

          <Notice
            type={pwNotice.type}
            message={pwNotice.message}
            onClose={() => setPwNotice({ type: "", message: "" })}
          />

          {[
            ["passwordLama", "Password Lama", "current-password"],
            ["passwordBaru", "Password Baru (min. 6 karakter)", "new-password"],
            ["konfirmasi", "Konfirmasi Password Baru", "new-password"],
          ].map(([key, label, ac]) => (
            <div key={key}>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {label}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  autoComplete={ac}
                  value={pwForm[key]}
                  onChange={(e) =>
                    setPwForm({ ...pwForm, [key]: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              {pwErrors[key] && <p className={errCls}>{pwErrors[key]}</p>}
            </div>
          ))}

          <button
            type="submit"
            disabled={savingPw}
            className="dashboard-button dashboard-button-primary dashboard-button-block"
          >
            <KeyRound className="w-4 h-4" />
            {savingPw ? "Memproses..." : "Ganti Password"}
          </button>
        </form>
      </div>

      {/* MODAL PILIH & CROP FOTO PROFIL */}
      <ModalFotoProfil
        isOpen={modalFotoOpen}
        onClose={() => setModalFotoOpen(false)}
        onSave={handleSaveFoto}
        saving={savingFoto}
      />

      {/* MODAL KONFIRMASI HAPUS FOTO PROFIL */}
      <ModalHapusFoto
        isOpen={modalHapusOpen}
        onClose={() => setModalHapusOpen(false)}
        onConfirm={handleConfirmHapusFoto}
        deleting={deletingFoto}
      />
    </div>
  );
}
