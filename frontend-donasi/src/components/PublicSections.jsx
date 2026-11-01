import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Users, Award, Sparkles, HandHeart, Search, Expand, Calendar } from "lucide-react";
import { SectionHeading, EmptyState, LoadingCards, ProgramProgress, Dialog } from "./PublicUI";
import Notice from "./Notice";
import { formatRupiah, formatTanggal } from "../utils/format";
import gambarTahfidz from "../assets/galeri-tahfidz.webp";
import gambarSantunan from "../assets/galeri-santunan.webp";
import gambarPemberdayaan from "../assets/galeri-pemberdayaan.webp";
import gambarPengajian from "../assets/galeri-pengajian.webp";
import gambarRelawan from "../assets/galeri-relawan.webp";
import gambarPenyaluran from "../assets/galeri-penyaluran.webp";
import TransparencyDashboard from "./TransparencyDashboard";
import ProgramImage from "./ProgramImage";

const pillars = [
  { title: "Pendidikan & Tahfidz Al-Qur'an", description: "Program bimbingan hafalan dan pemahaman Al-Qur'an secara terstruktur bagi santri dan generasi muda.", icon: BookOpen, tag: "Pendidikan Qur'an" },
  { title: "Santunan Yatim & Dhuafa", description: "Penyediaan beasiswa pendidikan, kebutuhan pangan, dan perlengkapan sekolah bagi anak yatim serta keluarga dhuafa.", icon: Users, tag: "Sosial kemanusiaan" },
  { title: "Pemberdayaan Ekonomi Umat", description: "Bantuan modal usaha serta pelatihan keterampilan guna menciptakan kemandirian ekonomi keluarga penerima bantuan.", icon: Award, tag: "Pemberdayaan" },
  { title: "Kajian & Pembinaan Akhlak", description: "Pembentukan karakter Islami dan pembinaan moral masyarakat agar tercipta lingkungan yang harmonis dan religius.", icon: Sparkles, tag: "Dakwah & moral" },
];

const galleryItems = [
  {
    tag: "Tahfidz",
    title: "Bimbingan Tahfidz & Wisuda Santri",
    description: "Mendampingi generasi muda dalam belajar dan memahami Al-Qur'an merupakan salah satu fokus kegiatan yayasan.",
    image: gambarTahfidz,
  },
  {
    tag: "Santunan",
    title: "Santunan Anak Yatim & Dhuafa",
    description: "Dukungan kebutuhan belajar dan pangan bagi anak-anak serta keluarga yang membutuhkan.",
    image: gambarSantunan,
  },
  {
    tag: "Pemberdayaan",
    title: "Pelatihan Usaha untuk Masyarakat",
    description: "Pendampingan keterampilan usaha agar masyarakat dapat membangun kemandirian ekonomi.",
    image: gambarPemberdayaan,
  },
  {
    tag: "Pengajian",
    title: "Pengajian dan Kajian Al-Qur'an",
    description: "Belajar bersama untuk memperdalam pemahaman Al-Qur'an dan mempererat kebersamaan.",
    image: gambarPengajian,
  },
  {
    tag: "Gotong Royong",
    title: "Aksi Bersama Relawan",
    description: "Warga dan relawan bekerja bersama merawat lingkungan dan saling membantu.",
    image: gambarRelawan,
  },
  {
    tag: "Penyaluran",
    title: "Penyaluran Bantuan ke Warga",
    description: "Penyerahan bantuan kebutuhan sehari-hari kepada keluarga di lingkungan masyarakat.",
    image: gambarPenyaluran,
  },
];

function ProgramDetails({ program, programs, onClose, onDonate, onSelect }) {
  const reports = program.penyaluranBantuan || [];
  return <Dialog title={program.judul} onClose={onClose} className="program-detail">
    <div className="ds-dialog-body">
      <ProgramImage imageUrl={program.imageUrl} title={program.judul} className="program-detail-image" loading="eager" />
      <span className="ds-badge">Program donasi</span>
      {program.createdAt && <p className="ds-help"><Calendar size={14} /> Dibuat {formatTanggal(program.createdAt)}</p>}
      <p className="program-description-full">{program.deskripsi}</p>
      <ProgramProgress program={program} />
      <p className="ds-help">Dana terkumpul hanya mencakup donasi yang telah berhasil diverifikasi.</p>
      <button className="ds-button ds-button-primary" onClick={() => { onClose(); onDonate(program); }}><HandHeart size={18} /> Donasi Sekarang</button>
      <section className="program-reports"><h3>Catatan penyaluran</h3>
        {reports.length ? <ul className="report-list">{reports.map((report) => <li key={report.id}><time>{formatTanggal(report.tanggalSalur)}</time><strong>{formatRupiah(report.jumlahBantuan)}</strong><p>Penyaluran bantuan program</p></li>)}</ul> : <p className="ds-muted">Belum ada catatan penyaluran untuk program ini.</p>}
      </section>
      {programs.length > 1 && <section><h3>Program lainnya</h3><div className="related-programs">{programs.filter((p) => p.id !== program.id).slice(0, 3).map((p) => <button key={p.id} onClick={() => onSelect(p)}>{p.judul}<ArrowRight size={16} /></button>)}</div></section>}
    </div>
  </Dialog>;
}

export default function PublicSections({ programs, loading, programError, onRetryPrograms, transparansi, loadingTransparansi, transparencyError, onRetryTransparency, onDonate }) {
  const [query, setQuery] = useState("");
  const [activePillar, setActivePillar] = useState(0);
  const [detailId, setDetailId] = useState(null);
  const [lightbox, setLightbox] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);
  useEffect(() => {
    if (!pageVisible || lightbox) return undefined;
    const timer = window.setTimeout(() => {
      setGalleryIndex((index) => (index + 1) % galleryItems.length);
      setImageFailed(false);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [galleryIndex, pageVisible, lightbox]);
  useEffect(() => {
    if (!lightbox) return;
    const handleGalleryKey = (event) => {
      if (event.key === "ArrowLeft") {
        setGalleryIndex((index) => Math.max(0, index - 1));
      } else if (event.key === "ArrowRight") {
        setGalleryIndex((index) => Math.min(galleryItems.length - 1, index + 1));
      }
    };
    window.addEventListener("keydown", handleGalleryKey);
    return () => window.removeEventListener("keydown", handleGalleryKey);
  }, [lightbox]);
  const programTrackRef = useRef(null);
  const [scrollState, setScrollState] = useState({ overflow: false, previous: false, next: false });
  const filtered = programs.filter((p) => `${p.judul} ${p.deskripsi || ""}`.toLowerCase().includes(query.trim().toLowerCase()));
  const updateScrollState = useCallback(() => {
    const track = programTrackRef.current;
    if (!track) return;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const next = {
      overflow: maxScroll > 2,
      previous: track.scrollLeft > 2,
      next: track.scrollLeft < maxScroll - 2,
    };
    setScrollState((current) => current.overflow === next.overflow && current.previous === next.previous && current.next === next.next ? current : next);
  }, []);

  useEffect(() => {
    const track = programTrackRef.current;
    if (!track) return;
    track.scrollLeft = 0;
    const frame = requestAnimationFrame(updateScrollState);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollState) : null;
    observer?.observe(track);
    window.addEventListener("resize", updateScrollState);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", updateScrollState);
    };
  }, [loading, programError, query, filtered.length, updateScrollState]);

  const scrollPrograms = (direction) => {
    const track = programTrackRef.current;
    if (!track) return;
    const card = track.querySelector(".program-card");
    const step = (card?.getBoundingClientRect().width || track.clientWidth) + parseFloat(getComputedStyle(track).columnGap || 0);
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };
  const detail = programs.find((p) => p.id === detailId);
  const galleryItem = galleryItems[galleryIndex];
  return <div className="public-ui public-content">
    <section id="tentang" className="ds-section about-showcase-section">
      <div className="about-showcase-layout">
        <div className="about-showcase-main">
          <div className="about-showcase-intro">
            <span className="ds-eyebrow">Tentang Kami</span>
            <h2>Merawat harapan.<br /><em>Menumbuhkan</em> kemandirian.</h2>
            <p>Organisasi nirlaba di bidang sosial, keagamaan, dan kemanusiaan. Kami menjadi jembatan kebaikan antara donatur dan masyarakat yang membutuhkan.</p>
            <div className="about-showcase-actions">
              <a className="ds-button ds-button-primary" href="#program">Kenali program kami</a>
              <a className="about-showcase-link" href="#kontak">Hubungi yayasan</a>
            </div>
          </div>
          <dl className="about-values" aria-label="Nilai Yayasan Mulia Karya Bersama">
            {[["Amanah", "Jujur dan ikhlas mengelola titipan."], ["Mulia", "Menjaga akhlak dan martabat sesama."], ["Karya", "Aksi nyata di masyarakat."], ["Bersama", "Kepedulian lewat gotong royong."]].map(([title, text], index) => <div key={title}><span aria-hidden="true">0{index + 1}</span><dt>{title}</dt><dd>{text}</dd></div>)}
          </dl>
        </div>
        <aside className="about-photo-panel">
          <div className="about-photo-content">
            <span className="ds-eyebrow">Yang kami kerjakan</span>
            <h3>Kebaikan yang dikerjakan bersama.</h3>
            <ol className="about-work-list">
              <li>Pengajaran Al-Qur'an <span>01</span></li>
              <li>Santunan Yatim &amp; Dhuafa <span>02</span></li>
              <li>Pemberdayaan Ekonomi Umat <span>03</span></li>
            </ol>
          </div>
          <a className="about-management-link" href="#transparansi">
            <span><strong>Lihat pengelolaan dan penyaluran</strong><small>Setiap titipan dapat diperiksa</small></span>
            <i aria-hidden="true"><ArrowRight size={18} /></i>
          </a>
        </aside>
      </div>
    </section>

    <section id="program" className="ds-section program-showcase-section" aria-labelledby="program-heading">
      <div className="ds-container program-showcase-layout">
        <div className="program-showcase-head">
          <div>
            <span className="ds-eyebrow">Fokus Kegiatan</span>
            <h2 id="program-heading">Empat jalan untuk berbagi kebaikan.</h2>
            <p>Pendidikan, kepedulian sosial, pemberdayaan, dan pembinaan akhlak untuk umat.</p>
          </div>
          <a className="ds-button ds-button-primary" href="#donasi">Lihat program donasi <ArrowRight size={18} aria-hidden="true" /></a>
        </div>
        <div className="pillar-panels">
          {pillars.map(({ title, description, tag, icon: Icon }, index) => <article
            className={`pillar-panel pillar-panel-${index}${activePillar === index ? " is-active" : ""}`}
            key={title}
            onMouseEnter={() => setActivePillar(index)}
            onFocus={() => setActivePillar(index)}>
            <button type="button" className="pillar-panel-trigger" aria-pressed={activePillar === index}
              onClick={() => setActivePillar(index)}>
              <span className="pillar-panel-top">
                <span className="pillar-panel-icon"><Icon size={28} strokeWidth={1.7} aria-hidden="true" /></span>
                <span className="pillar-panel-number">0{index + 1}</span>
              </span>
              <span className="pillar-panel-heading"><span>{tag}</span><strong>{title}</strong></span>
            </button>
            <div id={`pillar-detail-${index}`} className="pillar-panel-more">
              <p>{description}</p>
              <a href="#donasi" tabIndex={activePillar === index ? 0 : -1}>Pelajari program <ArrowRight size={17} aria-hidden="true" /></a>
            </div>
          </article>)}
        </div>
      </div>
    </section>

    <section id="donasi" className="ds-section">
      <div className="ds-container"><SectionHeading eyebrow="Program donasi" title="Pilih kebaikan yang ingin Anda hadirkan.">Temukan program, kenali kebutuhannya, dan salurkan donasi sesuai kemampuan Anda.</SectionHeading>
        <div className="catalog-toolbar"><p className="ds-muted" aria-live="polite">{!loading && !programError ? `${filtered.length} program tersedia` : "Program yayasan"}</p>
          <div className="catalog-toolbar-actions"><div className="catalog-search"><Search size={20} aria-hidden="true" /><label className="sr-only" htmlFor="program-search">Cari program donasi</label><input id="program-search" type="search" value={query} placeholder="Cari program donasi…" onChange={(event) => setQuery(event.target.value)} /></div>
            {scrollState.overflow && <div className="program-carousel-controls"><button type="button" onClick={() => scrollPrograms(-1)} disabled={!scrollState.previous} aria-label="Lihat program sebelumnya" aria-controls="program-track"><ArrowLeft size={20} /></button><button type="button" onClick={() => scrollPrograms(1)} disabled={!scrollState.next} aria-label="Lihat program berikutnya" aria-controls="program-track"><ArrowRight size={20} /></button></div>}
          </div>
        </div>
        {loading ? <LoadingCards label="Memuat program donasi" /> : programError ? <div className="ds-card"><Notice type="error" message={programError} /><button className="ds-button ds-button-secondary" onClick={onRetryPrograms}>Coba lagi</button></div> : filtered.length === 0 ? <EmptyState title={query ? "Program tidak ditemukan" : "Belum ada program donasi"} action={query && <button className="ds-button ds-button-secondary" onClick={() => setQuery("")}>Hapus pencarian</button>}>{query ? "Coba gunakan kata kunci lain." : "Program donasi akan ditampilkan di sini saat tersedia."}</EmptyState> : <>
          <div id="program-track" ref={programTrackRef} className="program-track" role="region" aria-label="Daftar program donasi, geser ke kanan atau kiri" tabIndex={0} onScroll={updateScrollState}>
          {filtered.map((program) => <article className="ds-card program-card" key={program.id}>
            <ProgramImage imageUrl={program.imageUrl} title={program.judul} className="program-cover" />
            <div className="program-card-body"><span className="ds-badge">Program donasi</span><h3><button onClick={() => setDetailId(program.id)}>{program.judul}</button></h3><p className="program-excerpt">{program.deskripsi}</p><ProgramProgress program={program} /><div className="program-card-actions"><button className="ds-button ds-button-primary" onClick={() => onDonate(program)}>Donasi Sekarang</button><button className="ds-button ds-button-secondary" onClick={() => setDetailId(program.id)} aria-label={`Lihat detail ${program.judul}`}>Detail <ArrowRight size={16} /></button></div></div>
          </article>)}
          </div>
        </>}
      </div>
    </section>

    <TransparencyDashboard data={transparansi} loading={loadingTransparansi} error={transparencyError} onRetry={onRetryTransparency} />

    <section id="galeri" className="ds-section gallery-section" aria-labelledby="gallery-heading">
      <div className="gallery-layout">
        <div className="gallery-stage">
          {imageFailed
            ? <div className="gallery-image-error" role="status">Gambar belum dapat ditampilkan.</div>
            : <img key={galleryItem.image} src={galleryItem.image} alt={galleryItem.title} width="1536" height="1024" loading="lazy" decoding="async" onError={() => setImageFailed(true)} />}
          {!imageFailed && <button className="gallery-view" type="button" onClick={() => setLightbox(true)}>
            <Expand size={18} aria-hidden="true" /> Lihat gambar
          </button>}
          <span className="gallery-count" aria-label={`Gambar ${galleryIndex + 1} dari ${galleryItems.length}`}>
            {String(galleryIndex + 1).padStart(2, "0")} / {String(galleryItems.length).padStart(2, "0")}
          </span>
        </div>
        <div className="gallery-info">
          <div className="gallery-intro">
            <span className="ds-eyebrow">Galeri Kegiatan</span>
            <h2 id="gallery-heading">Cerita kebaikan dalam gambar.</h2>
          </div>
          <div className="gallery-story">
            <span className="ds-badge">{galleryItem.tag}</span>
            <h3>{galleryItem.title}</h3>
            <p>{galleryItem.description}</p>
            <a className="ds-button ds-button-primary" href="#program">Kenali kegiatan yayasan</a>
          </div>
          <div className="gallery-documentation">
            <div className="gallery-documentation-heading">
              <div className="gallery-arrows">
                <button type="button" aria-label="Gambar sebelumnya" onClick={() => { setGalleryIndex((index) => (index - 1 + galleryItems.length) % galleryItems.length); setImageFailed(false); }}><ArrowLeft size={18} /></button>
                <button type="button" aria-label="Gambar berikutnya" onClick={() => { setGalleryIndex((index) => (index + 1) % galleryItems.length); setImageFailed(false); }}><ArrowRight size={18} /></button>
              </div>
            </div>
            <div className="gallery-thumbnails">
              {galleryItems.map((item, index) => <button key={item.title} type="button"
                className={`gallery-thumbnail${index === galleryIndex ? " is-active" : ""}`}
                aria-label={`Lihat gambar ${index + 1}: ${item.title}`}
                aria-current={index === galleryIndex ? "true" : undefined}
                onClick={() => { setGalleryIndex(index); setImageFailed(false); }}>
                <img src={item.image} alt="" loading="lazy" />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </button>)}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="bantuan" className="ds-section assistance-section">
      <div className="ds-container">
        <SectionHeading eyebrow="Pengajuan bantuan" title="Sampaikan kebutuhan. Kami siap mendengarkan.">Daftar sebagai penerima bantuan untuk mengajukan kebutuhan dan memantau proses verifikasi oleh pengurus.</SectionHeading>
        <ol className="assistance-steps">
          <li><span>01</span><h3>Lengkapi akun</h3><p>Isi identitas, alamat, kontak, dan alasan pengajuan.</p></li>
          <li><span>02</span><h3>Ajukan kebutuhan</h3><p>Pilih jenis bantuan, tuliskan kebutuhan, dan nominal yang diajukan.</p></li>
          <li><span>03</span><h3>Pantau hasilnya</h3><p>Lihat status dan catatan pengurus melalui akun penerima.</p></li>
        </ol>
        <div className="assistance-cta">
          <div><h3>Siap mengajukan bantuan?</h3><p>Masuk ke akun penerima untuk memulai dan memantau pengajuan Anda.</p></div>
          <div className="ds-actions"><Link to="/penerima" className="ds-button ds-button-primary">Masuk &amp; ajukan bantuan <ArrowRight size={16} /></Link><Link to="/register" className="ds-text-link">Belum punya akun? Daftar</Link></div>
        </div>
      </div>
    </section>

    {detail && <ProgramDetails program={detail} programs={programs} onClose={() => setDetailId(null)} onDonate={onDonate} onSelect={(program) => setDetailId(program.id)} />}
    {lightbox && <Dialog title={galleryItem.title} onClose={() => setLightbox(false)} className="gallery-lightbox"><img src={galleryItem.image} alt={galleryItem.title} /><p>{galleryItem.tag}</p></Dialog>}
  </div>;
}
