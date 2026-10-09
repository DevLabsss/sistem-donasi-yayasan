import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowDown, MapPin, RefreshCw, Search } from "lucide-react";
import API from "../services/api";
import ModalDonasi from "../components/ModalDonasi";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import Reveal from "../components/ui/Reveal";
import { galeri, nilaiYayasan, pilarProgram, yayasan } from "../content/yayasan";
import {
  kategoriProgram,
  persenTercapai,
  pesanGalat,
  rupiah,
} from "../lib/format";

function SectionHeader({ eyebrow, title, children }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {children && <p className="mt-3 text-base text-ink-muted">{children}</p>}
    </div>
  );
}

function GalatMuat({ pesan, onUlang }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-2.5 text-sm font-medium text-red-800">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        {pesan}
      </p>
      <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onUlang}>
        Coba lagi
      </Button>
    </div>
  );
}

function RangkumanTransparansi({ state, onUlang }) {
  if (state.status === "error") {
    return (
      <div className="container-page py-8">
        <GalatMuat pesan={state.pesan} onUlang={onUlang} />
      </div>
    );
  }

  const memuat = state.status === "loading";
  const terhimpun = state.data?.totalTerhimpun ?? 0;
  const tersalurkan = state.data?.totalTersalurkan ?? 0;
  const persenSalur = terhimpun > 0 ? persenTercapai(tersalurkan, terhimpun) : null;

  const angka = (nilai) =>
    memuat ? (
      <span className="inline-block h-9 w-44 rounded bg-white/15 motion-safe:animate-pulse" />
    ) : (
      nilai
    );

  return (
    <div className="bg-brand-900 text-white">
      <div className="container-page py-10 sm:py-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-500">
          Transparansi dana
        </h2>
        <dl className="mt-5 grid gap-8 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-white/80">Dana terhimpun</dt>
            <dd className="mt-1 text-3xl font-bold tabular-nums">
              {angka(rupiah(terhimpun))}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-white/80">Dana tersalurkan</dt>
            <dd className="mt-1 text-3xl font-bold tabular-nums">
              {angka(rupiah(tersalurkan))}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-white/80">Persentase tersalurkan</dt>
            <dd className="mt-1 text-3xl font-bold tabular-nums">
              {angka(persenSalur === null ? "Belum ada data" : `${persenSalur}%`)}
            </dd>
          </div>
        </dl>
        <p className="mt-6 max-w-3xl text-sm text-white/75">
          Dihitung dari donasi berstatus berhasil, yaitu yang sudah diverifikasi
          pengurus, dan dari penyaluran yang dicatat pengurus yayasan.
        </p>
      </div>
    </div>
  );
}

function BarisProgram({ program, onDonasi }) {
  const persen = persenTercapai(program.terkumpul, program.targetDana);
  return (
    <li className="grid gap-6 py-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-7">
        <p className="text-sm font-semibold text-brand-700">
          {kategoriProgram(program)}
        </p>
        <h3 className="mt-1 text-xl font-bold leading-snug">{program.judul}</h3>
        <p className="mt-2 line-clamp-3 text-base leading-relaxed text-ink-muted">
          {program.deskripsi}
        </p>
      </div>

      <div className="lg:col-span-5">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-2xl font-bold tabular-nums text-brand-900">
            {rupiah(program.terkumpul)}
          </p>
          <p className="text-sm font-semibold tabular-nums text-ink-muted">
            {persen}%
          </p>
        </div>
        <div className="mt-2">
          <ProgressBar value={persen} label={`Progres dana ${program.judul}`} />
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          terkumpul dari target{" "}
          <span className="font-semibold tabular-nums text-ink">
            {rupiah(program.targetDana)}
          </span>
        </p>
        <Button
          variant="primary"
          size="md"
          className="mt-5 w-full sm:w-auto"
          onClick={() => onDonasi(program)}
        >
          Donasi untuk program ini
        </Button>
      </div>
    </li>
  );
}

function KerangkaProgram() {
  return (
    <ul className="divide-y divide-line" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className="grid gap-6 py-8 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-3 lg:col-span-7">
            <div className="h-4 w-28 rounded bg-brand-100 motion-safe:animate-pulse" />
            <div className="h-6 w-3/4 rounded bg-brand-100 motion-safe:animate-pulse" />
            <div className="h-4 w-full rounded bg-brand-100 motion-safe:animate-pulse" />
          </div>
          <div className="space-y-3 lg:col-span-5">
            <div className="h-7 w-40 rounded bg-brand-100 motion-safe:animate-pulse" />
            <div className="h-2 w-full rounded-full bg-brand-100 motion-safe:animate-pulse" />
            <div className="h-11 w-48 rounded bg-brand-100 motion-safe:animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  const [programs, setPrograms] = useState([]);
  const [statusProgram, setStatusProgram] = useState({ status: "loading", pesan: "" });
  const [transparansi, setTransparansi] = useState({
    status: "loading",
    data: null,
    pesan: "",
  });
  const [versi, setVersi] = useState(0);
  const [cari, setCari] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [dipilih, setDipilih] = useState(null);

  // Memuat program dan ringkasan transparansi dari API yang sudah ada.
  useEffect(() => {
    let batal = false;

    API.get("/program")
      .then((res) => {
        if (batal) return;
        const data = res.data?.data || res.data;
        setPrograms(Array.isArray(data) ? data : []);
        setStatusProgram({ status: "ready", pesan: "" });
      })
      .catch((err) => {
        if (batal) return;
        setStatusProgram({
          status: "error",
          pesan: pesanGalat(err, "Program donasi belum dapat dimuat."),
        });
      });

    API.get("/donasi/transparansi")
      .then((res) => {
        if (batal) return;
        setTransparansi({ status: "ready", data: res.data, pesan: "" });
      })
      .catch((err) => {
        if (batal) return;
        setTransparansi({
          status: "error",
          data: null,
          pesan: pesanGalat(err, "Ringkasan transparansi belum dapat dimuat."),
        });
      });

    return () => {
      batal = true;
    };
  }, [versi]);

  const muatUlang = () => {
    setStatusProgram({ status: "loading", pesan: "" });
    setTransparansi({ status: "loading", data: null, pesan: "" });
    setVersi((v) => v + 1);
  };

  const daftarKategori = useMemo(() => {
    const unik = [...new Set(programs.map(kategoriProgram))];
    return unik.length > 1 ? ["Semua", ...unik] : [];
  }, [programs]);

  const tampil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return programs.filter((p) => {
      const cocokKategori = kategori === "Semua" || kategoriProgram(p) === kategori;
      const cocokCari =
        !q ||
        (p.judul || "").toLowerCase().includes(q) ||
        (p.deskripsi || "").toLowerCase().includes(q);
      return cocokKategori && cocokCari;
    });
  }, [programs, cari, kategori]);

  const resetFilter = () => {
    setCari("");
    setKategori("Semua");
  };

  return (
    <div className="w-full">
      {/* HERO */}
      <section id="beranda" className="border-b border-line bg-paper">
        <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-14 lg:py-20">
          <div className="lg:col-span-7">
            <p className="eyebrow flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {yayasan.tagline} · Kota Tangerang
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.15] tracking-tight text-brand-900 sm:text-5xl">
              Bersama mewujudkan karya mulia untuk yatim, dhuafa, dan generasi
              Qur&apos;ani
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
              Wadah pengabdian masyarakat dalam membina santri penghafal
              Al-Qur&apos;an, menyalurkan kepedulian sosial, serta memberdayakan
              anak yatim dan dhuafa secara profesional dan akuntabel.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as="a" href="#donasi" variant="accent" size="lg" icon={ArrowDown}>
                Lihat program donasi
              </Button>
              <Button as="a" href="#tentang" variant="secondary" size="lg">
                Mengenal yayasan
              </Button>
            </div>
            {statusProgram.status === "ready" && (
              <p className="mt-6 text-sm text-ink-muted">
                <span className="font-bold tabular-nums text-ink">
                  {programs.length}
                </span>{" "}
                program donasi sedang berjalan
              </p>
            )}
          </div>

          <figure className="lg:col-span-5">
            <img
              src={yayasan.fotoUtama}
              alt={yayasan.fotoUtamaAlt}
              width="800"
              height="600"
              fetchPriority="high"
              className="aspect-[4/3] w-full rounded-lg border border-line object-cover"
            />
            <figcaption className="mt-2 text-sm text-ink-faint">
              Bimbingan tahfidz dan wisuda santri.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* TRANSPARANSI */}
      <RangkumanTransparansi state={transparansi} onUlang={muatUlang} />

      {/* TENTANG */}
      <section id="tentang" className="bg-white py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <SectionHeader eyebrow="Tentang yayasan" title={yayasan.nama} />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-muted">
              <p>
                {yayasan.nama} adalah organisasi nirlaba yang bergerak di bidang
                sosial, keagamaan, dan kemanusiaan. Kami hadir sebagai jembatan
                kebaikan antara para donatur dan masyarakat yang membutuhkan.
              </p>
              <p>
                Melalui pengajaran Al-Qur&apos;an, santunan yatim dan dhuafa,
                serta pemberdayaan ekonomi ummat, kami berikhtiar menciptakan
                dampak yang nyata dan berkelanjutan.
              </p>
            </div>
            <blockquote className="mt-8 border-l-4 border-gold-500 pl-5 text-lg font-medium leading-relaxed text-ink">
              {yayasan.visi}
            </blockquote>
          </Reveal>

          <Reveal className="lg:col-span-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700">
              Nilai-nilai utama
            </h3>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {nilaiYayasan.map((n) => (
                <div key={n.nama} className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="text-lg font-bold text-brand-900">{n.nama}</dt>
                  <dd className="text-right text-base text-ink-muted">{n.arti}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 flex items-start gap-2.5 text-base text-ink-muted">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" />
              Sekretariat di {yayasan.lokasi}. Terbuka untuk kunjungan
              silaturahmi, konsultasi program, dan penyaluran donasi langsung.
            </p>
          </Reveal>
        </div>
      </section>

      {/* PILAR PROGRAM */}
      <section id="program" className="border-y border-line bg-paper py-16 sm:py-20">
        <div className="container-page">
          <Reveal>
            <SectionHeader eyebrow="Fokus kegiatan" title="Empat pilar pelayanan yayasan" />
          </Reveal>
          <Reveal as="ol" className="mt-10 divide-y divide-line border-y border-line">
            {pilarProgram.map((p, i) => (
              <li key={p.judul} className="grid gap-2 py-6 md:grid-cols-12 md:gap-8">
                <span
                  aria-hidden="true"
                  className="text-sm font-bold tabular-nums text-brand-700 md:col-span-1"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-bold md:col-span-4">{p.judul}</h3>
                <p className="text-base leading-relaxed text-ink-muted md:col-span-7">
                  {p.deskripsi}
                </p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* GALERI: hanya tampil jika ada foto dokumentasi asli */}
      {galeri.length > 0 && (
        <section id="galeri" className="bg-white py-16 sm:py-20">
          <div className="container-page">
            <SectionHeader eyebrow="Dokumentasi" title="Galeri kegiatan" />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {galeri.map((g) => (
                <li key={g.judul}>
                  <figure>
                    <img
                      src={g.src}
                      alt={g.alt || g.judul}
                      loading="lazy"
                      className="aspect-[4/3] w-full rounded-lg border border-line object-cover"
                    />
                    <figcaption className="mt-2 text-sm text-ink-muted">
                      {g.judul}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* PROGRAM DONASI */}
      <section id="donasi" className="bg-white py-16 sm:py-20">
        <div className="container-page">
          <Reveal>
            <SectionHeader eyebrow="Mari berbagi kebaikan" title="Program donasi dan infaq">
              Dana yang tampil sebagai terkumpul hanya donasi yang sudah
              diverifikasi pengurus yayasan.
            </SectionHeader>
          </Reveal>

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <label htmlFor="cari-program" className="sr-only">
                Cari program donasi
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                aria-hidden="true"
              />
              <input
                id="cari-program"
                type="search"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Cari program donasi"
                className="h-11 w-full rounded-md border border-line bg-white pl-10 pr-3.5 text-base placeholder:text-ink-faint focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/25"
              />
            </div>

            {daftarKategori.length > 0 && (
              <div role="group" aria-label="Filter kategori program" className="flex flex-wrap gap-2">
                {daftarKategori.map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={kategori === k}
                    onClick={() => setKategori(k)}
                    className={`h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
                      kategori === k
                        ? "border-brand-900 bg-brand-900 text-white"
                        : "border-line bg-white text-ink-muted hover:border-brand-900 hover:text-brand-900"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="sr-only" aria-live="polite">
            {statusProgram.status === "ready" &&
              `${tampil.length} program ditampilkan`}
          </p>

          <div className="mt-4 border-t border-line">
            {statusProgram.status === "loading" && <KerangkaProgram />}

            {statusProgram.status === "error" && (
              <div className="py-8">
                <GalatMuat pesan={statusProgram.pesan} onUlang={muatUlang} />
              </div>
            )}

            {statusProgram.status === "ready" && programs.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-lg font-bold">Belum ada program donasi aktif</p>
                <p className="mx-auto mt-2 max-w-md text-base text-ink-muted">
                  Program baru akan tampil di sini setelah dibuka oleh pengurus
                  yayasan. Silakan kembali lagi nanti.
                </p>
              </div>
            )}

            {statusProgram.status === "ready" &&
              programs.length > 0 &&
              tampil.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-lg font-bold">Program tidak ditemukan</p>
                  <p className="mx-auto mt-2 max-w-md text-base text-ink-muted">
                    Tidak ada program yang cocok dengan pencarian atau kategori
                    yang dipilih.
                  </p>
                  <Button variant="secondary" className="mt-5" onClick={resetFilter}>
                    Hapus filter
                  </Button>
                </div>
              )}

            {statusProgram.status === "ready" && tampil.length > 0 && (
              <ul className="divide-y divide-line">
                {tampil.map((p) => (
                  <BarisProgram key={p.id} program={p} onDonasi={setDipilih} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* LOKASI */}
      <section className="border-t border-line bg-paper py-16 sm:py-20">
        <div className="container-page">
          <SectionHeader eyebrow="Lokasi sekretariat" title="Silaturahmi ke yayasan kami">
            Kunjungi sekretariat kami di Kota Tangerang untuk informasi dan
            penyaluran langsung.
          </SectionHeader>
          <div className="mt-8 h-80 w-full overflow-hidden rounded-lg border border-line sm:h-96">
            <iframe
              title="Peta lokasi Yayasan Mulia Karya Bersama di Kota Tangerang"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126922.38382343905!2d106.56472088825654!3d-6.178306127206103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f8e8542e325d%3A0x301576d14feb9e0!2sTangerang%2C%20Tangerang%20City%2C%20Banten!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {dipilih && (
        <ModalDonasi
          program={dipilih}
          onClose={() => setDipilih(null)}
          onSuccess={() => setVersi((v) => v + 1)}
        />
      )}
    </div>
  );
}
