import React, { useEffect, useState } from "react";
import API from "../services/api";
import ModalDonasi from "../components/ModalDonasi";
import {
  BookOpen,
  Heart,
  Award,
  Users,
  CheckCircle2,
  Sparkles,
  MapPin,
  Search,
  TrendingUp,
  ShieldCheck,
  Image as GalleryIcon,
} from "lucide-react";
import logoYayasan from "../assets/logo-yayasan.jpeg";

export default function Home() {
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    API.get("/program")
      .then((res) => {
        const data = res.data.data || res.data;
        setPrograms(data);
        setFilteredPrograms(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Handler Pencarian Program
  useEffect(() => {
    if (searchTerm) {
      const result = programs.filter(
        (p) =>
          p.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredPrograms(result);
    } else {
      setFilteredPrograms(programs);
    }
  }, [searchTerm, programs]);

  const programLembaga = [
    {
      judul: "Pendidikan & Tahfidz Al-Qur'an",
      deskripsi:
        "Program bimbingan hafalan dan pemahaman Al-Qur'an secara terstruktur bagi santri dan generasi muda.",
      icon: BookOpen,
      tag: "Pendidikan Qur'an",
      color: "from-emerald-600 to-teal-800",
    },
    {
      judul: "Santunan Yatim & Dhuafa",
      deskripsi:
        "Penyediaan beasiswa pendidikan, kebutuhan pangan, dan perlengkapan sekolah bagi anak yatim serta keluarga dhuafa.",
      icon: Users,
      tag: "Sosial Kemanusiaan",
      color: "from-amber-500 to-orange-600",
    },
    {
      judul: "Pemberdayaan Ekonomi Ummat",
      deskripsi:
        "Bantuan modal usaha serta pelatihan keterampilan guna menciptakan kemandirian ekonomi keluarga penerima bantuan.",
      icon: Award,
      tag: "Pemberdayaan",
      color: "from-blue-600 to-indigo-800",
    },
    {
      judul: "Kajian & Pembinaan Akhlak",
      deskripsi:
        "Pembentukan karakter Islami dan pembinaan moral masyarakat agar tercipta lingkungan yang harmonis dan religius.",
      icon: Sparkles,
      tag: "Dakwah & Moral",
      color: "from-emerald-700 to-teal-900",
    },
  ];

  const galeriKegiatan = [
    {
      judul: "Kajian Rutin & Pembacaan Doa Santri",
      kategori: "Pendidikan",
      img: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80",
    },
    {
      judul: "Penyaluran Paket Sembako Yatim Dhuafa",
      kategori: "Sosial",
      img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
    },
    {
      judul: "Bimbingan Tahfidz & Wisuda Santri",
      kategori: "Tahfidz",
      img: "./src/assets/gambar-anak-1.jpeg",
    },
    {
      judul: "Pemeriksaan Kesehatan Gratis",
      kategori: "Kesehatan",
      img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    },
  ];

  // Kalkulasi Ringkasan Transparansi
  const totalDanaTerhimpun = programs.reduce(
    (acc, curr) => acc + (curr.terkumpul || 0),
    0,
  );
  const totalTargetDana = programs.reduce(
    (acc, curr) => acc + (curr.targetDana || 0),
    0,
  );

  return (
    <div className="w-full bg-slate-50 font-sans text-slate-800 selection:bg-emerald-500 selection:text-white">
      {/* 1. HERO BANNER SECTION */}
      <section
        id="beranda"
        className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white py-20 px-4 md:py-28"
      >
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 max-w-6xl">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 fill-amber-300 animate-spin" />
              <span>Yayasan Mulia Karya Bersama</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
              Bersama Mewujudkan{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200">
                Karya Mulia
              </span>{" "}
              & Kepedulian
            </h1>

            <p className="text-emerald-100/90 text-base md:text-lg leading-relaxed max-w-2xl font-normal">
              Wadah pengabdian masyarakat dalam membina santri penghafal
              Al-Qur'an, menyalurkan kepedulian sosial, serta memberdayakan anak
              yatim dan dhuafa secara profesional dan akuntabel.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="#donasi"
                className="group bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-emerald-950 font-black px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-1 flex items-center gap-3 text-sm"
              >
                <Heart className="w-5 h-5 fill-emerald-950 group-hover:scale-110 transition-transform" />
                Donasi Sekarang
              </a>
              <a
                href="#tentang"
                className="border border-white/20 hover:bg-white/10 text-white font-bold px-7 py-4 rounded-2xl transition backdrop-blur-sm text-sm"
              >
                Mengenal Yayasan
              </a>
            </div>

            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <span className="block text-2xl font-black text-amber-300">
                  {programs.length}
                </span>
                <span className="text-xs text-emerald-200/80">
                  Program Aktif
                </span>
              </div>
              <div>
                <span className="block text-2xl font-black text-amber-300">
                  100%
                </span>
                <span className="text-xs text-emerald-200/80">Transparan</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-amber-300">
                  Tangerang
                </span>
                <span className="text-xs text-emerald-200/80">
                  Pusat Kegiatan
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6 text-left relative group hover:border-amber-400/40 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-2xl shadow-lg ring-4 ring-white/10 shrink-0">
                <img
                  src={logoYayasan}
                  alt="Yayasan Mulia Karya Bersama"
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white group-hover:text-amber-300 transition-colors">
                  Yayasan Mulia Karya Bersama
                </h3>
                <p className="text-xs text-emerald-200 font-medium">
                  Lembaga Sosial & Pendidikan Keagamaan
                </p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-emerald-100 italic leading-relaxed pt-2 border-t border-white/10">
              "Menjadi lembaga yang amanah dan profesional dalam membangun
              generasi Qur'ani serta meningkatkan kesejahteraan sosial anak
              yatim dan dhuafa."
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5 text-amber-400 mb-1" />
                <span className="block text-xs font-bold text-white">
                  Akuntabel
                </span>
                <span className="text-[10px] text-emerald-200">
                  Laporan Berkala
                </span>
              </div>
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-amber-400 mb-1" />
                <span className="block text-xs font-bold text-white">
                  Berkelanjutan
                </span>
                <span className="text-[10px] text-emerald-200">
                  Pemberdayaan Ummat
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATISTIK REKAP TRANSPARANSI DANA */}
      <section className="-mt-10 relative z-20 container mx-auto px-4 max-w-5xl">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex items-center gap-5 text-left border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-inner">
              <Heart className="w-7 h-7 fill-emerald-700" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Total Infaq Terhimpun
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-emerald-800 mt-0.5">
                Rp {totalDanaTerhimpun.toLocaleString("id-ID")}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-5 text-left">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Target Kebutuhan Dana
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 mt-0.5">
                Rp {totalTargetDana.toLocaleString("id-ID")}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SEKSI TENTANG KAMI */}
      <section
        id="tentang"
        className="py-20 bg-gradient-to-b from-white via-slate-50 to-white border-b border-gray-100"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-full tracking-wider inline-block mb-3">
              Mengenal Lebih Dekat
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              Tentang{" "}
              <span className="text-emerald-700">
                Yayasan Mulia Karya Bersama
              </span>
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-emerald-600 to-amber-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between space-y-6">
              <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed text-left">
                <p className="text-gray-800 font-medium leading-relaxed">
                  <strong className="text-emerald-900 font-bold">
                    Yayasan Mulia Karya Bersama
                  </strong>{" "}
                  adalah organisasi nirlaba yang bergerak di bidang sosial,
                  keagamaan, dan kemanusiaan. Kami hadir untuk menjadi jembatan
                  kebaikan antara para donatur dan masyarakat yang membutuhkan.
                </p>
                <p className="text-gray-600 text-sm">
                  Melalui pengajaran Al-Qur'an, santunan yatim & dhuafa, serta
                  pemberdayaan ekonomi ummat, kami terus berikhtiar menciptakan
                  dampak positif yang nyata dan berkelanjutan.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3.5 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100/80">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h5 className="font-bold text-gray-900 text-sm">
                      Pengelolaan Amanah & Transparan
                    </h5>
                    <p className="text-xs text-gray-500">
                      Penyaluran dana donasi yang tercatat dengan akuntabilitas
                      tinggi.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100/80">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h5 className="font-bold text-gray-900 text-sm">
                      Bantuan Tepat Sasaran
                    </h5>
                    <p className="text-xs text-gray-500">
                      Menjangkau anak-anak yatim, piatu, serta kaum dhuafa
                      membutuhkan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-8 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                    <MapPin className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] text-emerald-200 uppercase font-semibold tracking-wider">
                      Sekretariat Yayasan
                    </span>
                    <h4 className="font-bold text-white text-base">
                      Tangerang, Banten, Indonesia
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed text-left border-l-2 border-amber-400/80 pl-3 py-0.5">
                  Terbuka untuk kunjungan silaturahmi, konsultasi program, dan
                  penyaluran donasi langsung.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/15 text-left">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 fill-amber-300" /> Nilai-Nilai
                  Utama Yayasan
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                    <span className="block font-extrabold text-amber-400 text-sm">
                      Amanah
                    </span>
                    <span className="text-[11px] text-emerald-100">
                      Jujur & Ikhlas
                    </span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                    <span className="block font-extrabold text-amber-400 text-sm">
                      Mulia
                    </span>
                    <span className="text-[11px] text-emerald-100">
                      Berakhlak Karakter
                    </span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                    <span className="block font-extrabold text-amber-400 text-sm">
                      Karya
                    </span>
                    <span className="text-[11px] text-emerald-100">
                      Aksi Nyata Sosial
                    </span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                    <span className="block font-extrabold text-amber-400 text-sm">
                      Bersama
                    </span>
                    <span className="text-[11px] text-emerald-100">
                      Gotong Royong
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SEKSI PILAR PROGRAM UTAMA */}
      <section id="program" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="bg-amber-100 text-amber-900 text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-full tracking-wider inline-block mb-3">
              Fokus Kegiatan Lembaga
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Program Utama Yayasan
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-2">
              Empat pilar utama pelayanan sosial dan keagamaan untuk ummat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programLembaga.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md mb-4`}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 inline-block mb-2">
                      {item.tag}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      {item.judul}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.deskripsi}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. SEKSI GALERI KEGIATAN */}
      <section id="galeri" className="py-20 bg-slate-100/80">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase px-3.5 py-1.5 rounded-full tracking-wider inline-block mb-3">
              Dokumentasi Aksi Nyata
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Galeri Kegiatan
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-2">
              Potret aktivitas santri dan penyaluran bantuan kepada penerima
              manfaat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galeriKegiatan.map((g, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200 group hover:shadow-xl transition-all text-left"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={g.img}
                    alt={g.judul}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-emerald-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    {g.kategori}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                    {g.judul}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SEKSI KATALOG DONASI & INFAQ */}
      <section
        id="donasi"
        className="py-20 bg-white border-t border-slate-200/60"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-left">
            <div>
              <span className="bg-amber-100 text-amber-900 text-xs font-extrabold uppercase px-4 py-1.5 rounded-full tracking-wider inline-block mb-3">
                Mari Berbagi Kebaikan
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Program Donasi & Infaq
              </h2>
            </div>

            {/* Input Pencarian */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari program donasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 pl-11 pr-4 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 mt-3 font-semibold">
                Memuat program donasi...
              </p>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto shadow-sm">
              <p className="text-slate-500 text-sm font-semibold">
                Program donasi tidak ditemukan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPrograms.map((prog) => {
                const persen = Math.min(
                  ((prog.terkumpul || 0) / prog.targetDana) * 100,
                  100,
                );
                return (
                  <div
                    key={prog.id}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group text-left"
                  >
                    <div className="h-44 bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-950 p-6 flex flex-col justify-between relative overflow-hidden">
                      <div className="flex justify-between items-center relative z-10">
                        <span className="bg-amber-400 text-emerald-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          Program Aktif
                        </span>
                        <span className="text-[11px] font-extrabold text-amber-300 bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                          {persen.toFixed(0)}% Terkumpul
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white line-clamp-2 leading-snug relative z-10 group-hover:text-amber-300 transition-colors">
                        {prog.judul}
                      </h3>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 font-normal">
                        {prog.deskripsi}
                      </p>

                      <div className="space-y-2.5 pt-2 border-t border-slate-100">
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-1.5 rounded-full transition-all duration-700 shadow-sm"
                            style={{ width: `${persen}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-xs font-bold pt-1">
                          <div>
                            <span className="text-slate-400 block text-[10px] font-medium">
                              Terkumpul
                            </span>
                            <span className="text-emerald-700 font-extrabold">
                              Rp {(prog.terkumpul || 0).toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 block text-[10px] font-medium">
                              Target Dana
                            </span>
                            <span className="text-slate-800 font-extrabold">
                              Rp {prog.targetDana.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedProgram(prog)}
                        className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3.5 rounded-2xl transition shadow-lg shadow-emerald-800/20 hover:shadow-emerald-800/40 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                      >
                        <Heart className="w-4 h-4 fill-white" /> Donasi Sekarang
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 7. SEKSI GOOGLE MAPS LOKASI YAYASAN */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Lokasi Kantor Sekretariat
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
              Silaturahmi ke Yayasan Kami
            </h2>
            <p className="text-slate-500 text-xs mt-2">
              Kunjungi lokasi kantor dan sekretariat kami di Tangerang untuk
              informasi dan penyaluran langsung.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 h-96 w-full relative">
            <iframe
              title="Google Maps Yayasan Mulia Karya Bersama"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126922.38382343905!2d106.56472088825654!3d-6.178306127206103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f8e8542e325d%3A0x301576d14feb9e0!2sTangerang%2C%20Tangerang%20City%2C%20Banten!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* MODAL POP-UP FORM DONASI */}
      {selectedProgram && (
        <ModalDonasi
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
          onSuccess={() => {
            API.get("/program").then((res) => {
              const data = res.data.data || res.data;
              setPrograms(data);
              setFilteredPrograms(data);
            });
          }}
        />
      )}
    </div>
  );
}
