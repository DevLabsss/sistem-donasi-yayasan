// Informasi resmi yayasan. Semua nilai diambil dari konten yang sudah ada di situs.
// Tambahkan foto dokumentasi asli ke `galeri` agar bagian Galeri tampil.

import fotoKegiatan from "../assets/gambar-anak-1.jpeg";

export const yayasan = {
  nama: "Yayasan Mulia Karya Bersama",
  tagline: "Lembaga Sosial & Pendidikan Keagamaan",
  visi: "Menjadi lembaga yang amanah dan profesional dalam membangun generasi Qur'ani serta meningkatkan kesejahteraan sosial anak yatim dan dhuafa.",
  lokasi: "Kota Tangerang, Banten, Indonesia",
  telepon: "+62 859-2291-4919",
  email: "yayasanbina2025@gmail.com",
  bank: {
    nama: "BSI (Bank Syariah Indonesia)",
    nomor: "7123 828 547",
    atasNama: "Yayasan Mulia Karya Bersama",
  },
  qris: { nmid: "ID2025448051701" },
  sosial: {
    facebook:
      "https://web.facebook.com/people/Yayasan-Mulia-Karya-Bersama/61594462259553/",
    instagram: "https://www.instagram.com/yayasanmuliakaryabersama/",
  },
  fotoUtama: fotoKegiatan,
  fotoUtamaAlt: "Bimbingan tahfidz dan wisuda santri Yayasan Mulia Karya Bersama",
};

export const pilarProgram = [
  {
    judul: "Pendidikan & Tahfidz Al-Qur'an",
    deskripsi:
      "Bimbingan hafalan dan pemahaman Al-Qur'an secara terstruktur bagi santri dan generasi muda.",
  },
  {
    judul: "Santunan Yatim & Dhuafa",
    deskripsi:
      "Beasiswa pendidikan, kebutuhan pangan, dan perlengkapan sekolah bagi anak yatim serta keluarga dhuafa.",
  },
  {
    judul: "Pemberdayaan Ekonomi Ummat",
    deskripsi:
      "Bantuan modal usaha dan pelatihan keterampilan untuk kemandirian ekonomi keluarga penerima bantuan.",
  },
  {
    judul: "Kajian & Pembinaan Akhlak",
    deskripsi:
      "Pembentukan karakter Islami dan pembinaan moral masyarakat agar tercipta lingkungan yang harmonis.",
  },
];

export const nilaiYayasan = [
  { nama: "Amanah", arti: "Jujur dan ikhlas" },
  { nama: "Mulia", arti: "Berakhlak dan berkarakter" },
  { nama: "Karya", arti: "Aksi nyata sosial" },
  { nama: "Bersama", arti: "Gotong royong" },
];

// Isi hanya dengan foto dokumentasi asli: { judul, kategori, src, alt }
export const galeri = [];
