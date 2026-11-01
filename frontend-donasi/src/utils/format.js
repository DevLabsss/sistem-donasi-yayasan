// Utilitas format & pemetaan status yang dipakai lintas halaman.

export const formatRupiah = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

export const formatTanggal = (value, withTime = false) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const opts = { day: "numeric", month: "long", year: "numeric" };
  if (withTime) {
    opts.hour = "2-digit";
    opts.minute = "2-digit";
  }
  return d.toLocaleString("id-ID", opts);
};

// Ambil pesan error yang paling informatif dari response axios
export const getErrorMessage = (err, fallback = "Terjadi kesalahan.") => {
  if (!err?.response) {
    return "Tidak dapat terhubung ke server. Periksa koneksi Anda.";
  }
  return err.response.data?.message || err.response.data?.error || fallback;
};

// ===== STATUS PENGAJUAN BANTUAN =====
// Backend memakai enum MENUNGGU / DISETUJUI / DITOLAK / DIBATALKAN.
export const STATUS_PENGAJUAN = {
  MENUNGGU: { label: "PENDING", className: "bg-amber-100 text-amber-800" },
  DISETUJUI: { label: "DITERIMA", className: "bg-emerald-100 text-emerald-800" },
  DITOLAK: { label: "DITOLAK", className: "bg-rose-100 text-rose-800" },
  DIBATALKAN: { label: "DIBATALKAN", className: "bg-slate-200 text-slate-700" },
};

// ===== STATUS AKUN PENERIMA BANTUAN (status pengguna, BUKAN status pengajuan) =====
// Backend memakai enum VERIFIKASI / DISETUJUI / DITOLAK pada tabel penerimabantuan.
export const STATUS_AKUN_PENERIMA = {
  VERIFIKASI: {
    label: "MENUNGGU VERIFIKASI",
    className: "bg-amber-100 text-amber-800",
  },
  DISETUJUI: { label: "AKTIF", className: "bg-emerald-100 text-emerald-800" },
  DITOLAK: { label: "NONAKTIF / DITOLAK", className: "bg-slate-200 text-slate-700" },
};

// ===== STATUS TRANSAKSI DONASI =====
export const STATUS_DONASI = {
  PENDING: { label: "PENDING", className: "bg-amber-100 text-amber-800" },
  BERHASIL: { label: "BERHASIL", className: "bg-emerald-100 text-emerald-800" },
  GAGAL: { label: "GAGAL", className: "bg-rose-100 text-rose-800" },
};

// Total dana BERHASIL dari daftar donasi (PENDING & GAGAL tidak dihitung)
export const sumDonasiBerhasil = (list = []) =>
  list
    .filter((d) => d.status === "BERHASIL")
    .reduce((acc, d) => acc + Number(d.jumlah || 0), 0);

// Hitung dana terkumpul program berdasarkan transaksi BERHASIL.
// Endpoint GET /program menyertakan relasi `donasi`, sehingga angka ini
// dapat diverifikasi terhadap kolom `terkumpul` yang tersimpan di database.
export const hitungTerkumpul = (program) => {
  if (Array.isArray(program?.donasi)) {
    return sumDonasiBerhasil(program.donasi);
  }
  return Number(program?.terkumpul || 0);
};

// true jika kolom `terkumpul` di database tidak sama dengan jumlah donasi BERHASIL
export const isTerkumpulTidakSinkron = (program) =>
  Array.isArray(program?.donasi) &&
  Math.abs(Number(program.terkumpul || 0) - sumDonasiBerhasil(program.donasi)) >
    0.009;

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}") || {};
  } catch {
    return {};
  }
};

// Simpan user ke localStorage & beri tahu komponen lain (mis. Navbar)
export const setStoredUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("user-updated"));
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_REGEX = /^(\+62|62|0)8[0-9]{7,12}$/;
