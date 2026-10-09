// Helper format dan turunan data yang dipakai lintas halaman.

export const rupiah = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

export const persenTercapai = (terkumpul, target) => {
  const t = Number(target) || 0;
  if (t <= 0) return 0;
  return Math.min(100, Math.round(((Number(terkumpul) || 0) / t) * 100));
};

// Nomor referensi donasi yang tampil ke donatur, diturunkan dari id donasi.
export const kodeReferensi = (id) => `YMKB-${String(id).padStart(6, "0")}`;

// Kategori sementara diturunkan dari kata kunci judul dan deskripsi program,
// karena skema ProgramDonasi belum memiliki kolom kategori.
const ATURAN_KATEGORI = [
  {
    nama: "Pendidikan Qur'an",
    kata: ["tahfidz", "qur", "santri", "pendidikan", "beasiswa", "sekolah", "pesantren"],
  },
  {
    nama: "Yatim & Dhuafa",
    kata: ["yatim", "dhuafa", "santunan", "sembako", "pangan", "piatu"],
  },
  {
    nama: "Pemberdayaan",
    kata: ["modal", "usaha", "ekonomi", "pelatihan", "umkm", "pemberdayaan"],
  },
];

export const kategoriProgram = (program) => {
  // Judul lebih menentukan daripada deskripsi, sehingga dicocokkan lebih dulu.
  for (const teks of [program?.judul, program?.deskripsi]) {
    const t = (teks || "").toLowerCase();
    const cocok = ATURAN_KATEGORI.find((a) => a.kata.some((k) => t.includes(k)));
    if (cocok) return cocok.nama;
  }
  return "Lainnya";
};

export const pesanGalat = (err, fallback) => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.code === "ERR_NETWORK" || !err?.response)
    return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda lalu coba lagi.";
  return fallback;
};
