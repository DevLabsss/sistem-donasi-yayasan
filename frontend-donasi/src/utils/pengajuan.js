// Helper khusus pengajuan bantuan.

export const JENIS_BANTUAN = [
  "Pendidikan",
  "Kesehatan",
  "Sembako / Pangan",
  "Modal Usaha",
  "Biaya Hidup",
  "Perbaikan Tempat Tinggal",
  "Lainnya",
];

// Backend hanya menyediakan kolom `judul`, sehingga jenis bantuan disimpan
// sebagai awalan judul: "[Jenis] Judul singkat".
export const parseJudulPengajuan = (judul = "") => {
  const m = /^\[(.+?)\]\s*(.*)$/.exec(judul || "");
  return m ? { jenis: m[1], judul: m[2] || m[1] } : { jenis: "-", judul };
};
