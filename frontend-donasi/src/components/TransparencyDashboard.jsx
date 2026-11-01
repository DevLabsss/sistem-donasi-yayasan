import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight, Coins, HandHeart, TrendingDown, TrendingUp, Wallet, X } from "lucide-react";
import { Dialog, EmptyState, LoadingCards, SectionHeading } from "./PublicUI";
import Notice from "./Notice";
import { formatRupiah, formatTanggal } from "../utils/format";
import "../styles/transparency-dashboard.css";

const monthFormatter = new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
const DonationTrendChart = lazy(() => import("./DonationTrendChart"));

function completedMonthChange(trends, key) {
  if (!Array.isArray(trends) || trends.length < 3) return null;
  const before = Number(trends.at(-3)?.[key] || 0);
  const last = Number(trends.at(-2)?.[key] || 0);
  return before > 0 ? (last - before) / before * 100 : null;
}

function useCountUp(value, active, duration = 1300) {
  const target = Number.isFinite(Number(value)) ? Number(value) : 0;
  const [displayValue, setDisplayValue] = useState(0);
  const currentValue = useRef(0);

  useEffect(() => {
    if (!active) return undefined;

    const startValue = currentValue.current;
    const difference = target - startValue;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let animationFrame;
    let startTime;

    const update = (time) => {
      if (reduceMotion || difference === 0) {
        currentValue.current = target;
        setDisplayValue(target);
        return;
      }

      startTime ??= time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      const nextValue = Math.round(startValue + difference * easedProgress);
      currentValue.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [active, duration, target]);

  return displayValue;
}

function SummaryMetric({ label, amount, note, action, change, animate, index, icon: Icon }) {
  const displayAmount = useCountUp(amount, animate);
  return <article className="transparency-summary-card" style={{ "--summary-index": index }}>
    <span className="transparency-summary-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.9} /></span>
    <div className="transparency-summary-copy"><span>{label}</span><strong aria-label={formatRupiah(amount)}><span aria-hidden="true">{formatRupiah(displayAmount)}</span></strong><p>{note}</p></div>
    {change !== null && change !== undefined ? <div className="transparency-summary-action transparency-summary-change">
      <span className={change >= 0 ? "positive" : "negative"}>{change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{change >= 0 ? "+" : ""}{change.toFixed(0)}%</span>
      <small>bulan lalu vs sebelumnya</small>
    </div> : action && <div className="transparency-summary-action">{action}</div>}
  </article>;
}

function PanelHeading({ title, description, action }) {
  return <div className="transparency-panel-heading">
    <div><h3>{title}</h3><p>{description}</p></div>
    {action}
  </div>;
}

function AllocationPanel({ data, animate }) {
  const received = Math.max(0, Number(data.totalTerhimpun || 0));
  const distributed = Math.max(0, Number(data.totalTersalurkan || 0));
  const available = Number(data.sisaSaldo || 0);
  const target = Array.isArray(data.programRealisasi) ? data.programRealisasi.reduce((sum, item) => sum + Number(item.targetDana || 0), 0) : 0;
  const distributedPercent = received > 0 ? Math.min(100, distributed / received * 100) : 0;
  const availablePercent = received > 0 ? Math.max(0, Math.min(100, available / received * 100)) : 0;

  return <article id="alokasi-dana" className="transparency-panel transparency-allocation">
    <PanelHeading title="Ringkasan alokasi dana" description="Perbandingan antara dana terhimpun, tersalurkan, dan saldo tersedia." />
    <div className="transparency-panel-body">
    {received === 0 ? <EmptyState title="Belum ada dana terverifikasi">Alokasi akan tampil setelah donasi berhasil diverifikasi.</EmptyState> : <>
      <div className="transparency-allocation-track" role="img" aria-label={`${distributedPercent.toFixed(1)} persen dana tersalurkan, ${availablePercent.toFixed(1)} persen saldo tersedia`}>
        <span className="transparency-allocation-distributed" style={{ width: animate ? `${distributedPercent}%` : "0%" }} />
        <span className="transparency-allocation-available" style={{ width: animate ? `${availablePercent}%` : "0%" }} />
      </div>
      <div className="transparency-allocation-legend">
        <div><span className="transparency-legend-dot distributed" /><span>Tersalurkan · {distributedPercent.toFixed(1)}%</span><strong>{formatRupiah(distributed)}</strong></div>
        <div><span className="transparency-legend-dot available" /><span>Saldo tersedia · {availablePercent.toFixed(1)}%</span><strong>{formatRupiah(available)}</strong></div>
        <div><span className="transparency-legend-dot target" /><span>Target seluruh program</span><strong>{formatRupiah(target)}</strong></div>
      </div>
      {distributed > received && <p className="transparency-data-note" role="status">Penyaluran tercatat melebihi dana terhimpun. Data perlu diperiksa oleh pengurus.</p>}
    </>}
    </div>
  </article>;
}

function DonationTrends({ trends }) {
  const validTrends = Array.isArray(trends) ? trends : [];
  const chartData = validTrends.map((item) => ({
    ...item,
    name: monthFormatter.format(new Date(`${item.bulan}-01T12:00:00+07:00`)),
    jumlah: Number(item.jumlah || 0),
    tersalurkan: Number(item.tersalurkan || 0),
  }));
  const hasActivity = chartData.some((item) => item.jumlah > 0 || item.tersalurkan > 0);

  return <article className="transparency-panel transparency-trends">
    <PanelHeading title="Tren donasi 6 bulan terakhir" description="Pergerakan dana terhimpun dan tersalurkan setiap bulan." action={<div className="transparency-trend-legend"><span><i className="distributed" /> Dana terhimpun</span><span><i className="available" /> Dana tersalurkan</span></div>} />
    <div className="transparency-panel-body">
    {!validTrends.length ? <EmptyState title="Riwayat bulanan belum tersedia">Server belum menyediakan data donasi per bulan.</EmptyState> : !hasActivity ? <EmptyState title="Belum ada aktivitas dalam enam bulan terakhir">Grafik akan muncul setelah ada transaksi atau penyaluran yang tercatat.</EmptyState> : <>
      <div className="transparency-chart" role="img" aria-label={`Grafik bulanan: ${chartData.map((item) => `${item.name} terhimpun ${formatRupiah(item.jumlah)}, tersalurkan ${formatRupiah(item.tersalurkan)}`).join(", ")}`}>
        <Suspense fallback={<div className="transparency-chart-loading" role="status">Memuat grafik…</div>}>
          <DonationTrendChart data={chartData} />
        </Suspense>
      </div>
      <p className="transparency-chart-note">Dana masuk berdasarkan transaksi terverifikasi; penyaluran berdasarkan tanggal pencatatan.</p>
    </>}
    </div>
  </article>;
}

function ProgramRealization({ items, onDetail }) {
  return <article className="transparency-panel transparency-list-panel">
    <PanelHeading title="Realisasi per program" description="Lihat perkembangan penggalangan dana untuk setiap program." action={<a className="transparency-panel-action" href="#donasi">Lihat semua program <ArrowRight size={15} /></a>} />
    <div className="transparency-panel-body">
    {!items?.length ? <EmptyState title="Belum ada program">Realisasi akan tampil saat program tersedia.</EmptyState> : <div className="transparency-list-scroll">
      <ul className="transparency-program-list">{items.map((item) => {
        const target = Number(item.targetDana || 0);
        const collected = Number(item.terkumpul || 0);
        const percent = target > 0 ? Math.min(100, Math.max(0, collected / target * 100)) : 0;
        return <li key={item.id}>
          <div className="transparency-program-copy"><h4>{item.judul}</h4><p>{item.deskripsi || "Deskripsi program belum tersedia."}</p></div>
          <div className="transparency-program-progress">
            <div><strong>{formatRupiah(collected)}</strong><span> / {formatRupiah(target)}</span></div>
            <div className="transparency-progress-line"><progress max="100" value={percent} aria-label={`Progres donasi ${item.judul}`} /><span>{percent.toFixed(0)}%</span></div>
          </div>
          <button type="button" className="transparency-detail-button" onClick={() => onDetail(item.id)}>Detail <ArrowRight size={15} /></button>
        </li>;
      })}</ul>
    </div>}
    </div>
  </article>;
}

function DistributionHistory({ items, onDetail }) {
  return <article className="transparency-panel transparency-list-panel">
    <PanelHeading title="Penyaluran terbaru" description="Catatan bantuan yang telah dicatat kepada penerima manfaat." />
    <div className="transparency-panel-body">
    {!items?.length ? <EmptyState title="Belum ada penyaluran">Catatan penyaluran akan tampil setelah tersedia.</EmptyState> : <div className="transparency-list-scroll">
      <ul className="transparency-distribution-list">{items.map((item) => <li key={item.id}>
        <div className="transparency-distribution-copy"><time dateTime={item.tanggalSalur}>{formatTanggal(item.tanggalSalur)}</time><h4>{item.program?.judul || "Program yayasan"}</h4><p>Penyaluran bantuan program</p><span>Identitas penerima dilindungi</span></div>
        <div className="transparency-distribution-side"><strong>{formatRupiah(item.jumlahBantuan)}</strong><button type="button" className="transparency-detail-button" onClick={() => onDetail(item)}>Lihat detail <ArrowRight size={15} /></button></div>
      </li>)}</ul>
    </div>}
    </div>
  </article>;
}

function RecordsSlides({ programs, distributions, onProgramDetail, onDistributionDetail }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const onTabKeyDown = (event) => {
    const next = event.key === "ArrowRight" || event.key === "End" ? 1 : event.key === "ArrowLeft" || event.key === "Home" ? 0 : null;
    if (next === null) return;
    event.preventDefault();
    setActiveSlide(next);
    event.currentTarget.querySelectorAll('[role="tab"]')[next]?.focus();
  };

  return <div className="transparency-records-slides">
    <div className="transparency-records-nav">
      <div className="transparency-records-intro">
        <span>Rincian laporan</span>
        <h3>Program & penyaluran</h3>
        <p>Data yang tercatat dalam laporan ini.</p>
      </div>
      <div className="transparency-records-tabs" role="tablist" aria-label="Rincian laporan transparansi" onKeyDown={onTabKeyDown}>
        <button id="tab-realisasi" type="button" role="tab" aria-selected={activeSlide === 0} aria-controls="panel-realisasi" tabIndex={activeSlide === 0 ? 0 : -1} onClick={() => setActiveSlide(0)}><span>01</span> Program <ArrowRight size={15} /></button>
        <button id="tab-penyaluran" type="button" role="tab" aria-selected={activeSlide === 1} aria-controls="panel-penyaluran" tabIndex={activeSlide === 1 ? 0 : -1} onClick={() => setActiveSlide(1)}><span>02</span> Penyaluran <ArrowRight size={15} /></button>
      </div>
    </div>
    <div key={activeSlide} id={activeSlide === 0 ? "panel-realisasi" : "panel-penyaluran"} role="tabpanel" aria-labelledby={activeSlide === 0 ? "tab-realisasi" : "tab-penyaluran"} className={`transparency-records-slide ${activeSlide === 0 ? "from-left" : "from-right"}`}>
      {activeSlide === 0 ? <ProgramRealization items={programs} onDetail={onProgramDetail} /> : <DistributionHistory items={distributions} onDetail={onDistributionDetail} />}
    </div>
  </div>;
}

function DistributionDetail({ item, onClose }) {
  return <Dialog title="Detail penyaluran" onClose={onClose} className="transparency-detail-dialog">
    <div className="ds-dialog-body">
      <div className="transparency-detail-amount"><span>Dana tersalurkan</span><strong>{formatRupiah(item.jumlahBantuan)}</strong></div>
      <dl className="transparency-detail-list">
        <div><dt>Tanggal</dt><dd>{formatTanggal(item.tanggalSalur)}</dd></div>
        <div><dt>Program</dt><dd>{item.program?.judul || "Program yayasan"}</dd></div>
        <div><dt>Penerima</dt><dd>Identitas dirahasiakan</dd></div>
      </dl>
      <p className="transparency-data-note">Jumlah dan tanggal berasal dari catatan penyaluran. Sistem belum mencatat status verifikasi atau dokumentasi publik.</p>
      <button type="button" className="ds-button ds-button-secondary" onClick={onClose}><X size={16} /> Tutup</button>
    </div>
  </Dialog>;
}

function ProgramRealizationDetail({ item, onClose }) {
  const target = Number(item.targetDana || 0);
  const collected = Number(item.terkumpul || 0);
  const percent = target > 0 ? Math.min(100, Math.max(0, collected / target * 100)) : 0;
  return <Dialog title={item.judul} onClose={onClose} className="transparency-detail-dialog">
    <div className="ds-dialog-body">
      <span className="ds-badge">Realisasi program</span>
      <progress max="100" value={percent} aria-label={`Progres donasi ${item.judul}`} />
      <dl className="transparency-detail-list">
        <div><dt>Dana terkumpul</dt><dd>{formatRupiah(collected)}</dd></div>
        <div><dt>Target donasi</dt><dd>{formatRupiah(target)}</dd></div>
        <div><dt>Dana tersalurkan</dt><dd>{formatRupiah(item.tersalurkan)}</dd></div>
        <div><dt>Penyaluran tercatat</dt><dd>{item.jumlahPenyaluran || 0}</dd></div>
      </dl>
      <p className="transparency-data-note">Dana terkumpul dihitung dari transaksi yang telah diverifikasi.</p>
      <button type="button" className="ds-button ds-button-secondary" onClick={onClose}><X size={16} /> Tutup</button>
    </div>
  </Dialog>;
}

export default function TransparencyDashboard({ data, loading, error, onRetry }) {
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    if (!("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setIsVisible(true);
      observer.disconnect();
    }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return <section ref={sectionRef} id="transparansi" className={`ds-section ds-section-tinted transparency-dashboard${isVisible ? " is-visible" : ""}`}>
    <div className="ds-container">
      <SectionHeading eyebrow="Transparansi" title="Setiap titipan, tercatat dengan jelas.">Pantau dana yang sudah diverifikasi dan penyalurannya kepada penerima manfaat.</SectionHeading>
      {data?.laporanDibuatPada && !loading && !error && <p className="transparency-report-time">Laporan dibuat <time dateTime={data.laporanDibuatPada}>{new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(data.laporanDibuatPada))} WIB</time></p>}
      {loading ? <LoadingCards label="Memuat laporan transparansi" /> : error ? <div className="ds-card"><Notice type="error" message={error} /><button type="button" className="ds-button ds-button-secondary" onClick={onRetry}>Muat ulang laporan</button></div> : !data ? <EmptyState title="Laporan belum tersedia">Silakan coba muat ulang laporan.</EmptyState> : <>
        <div className="transparency-summary-grid">
          <SummaryMetric icon={Coins} label="Dana terhimpun" amount={data.totalTerhimpun} note={`${data.totalTransaksiBerhasil || 0} donasi berhasil diverifikasi`} change={completedMonthChange(data.trenDonasi, "jumlah")} animate={isVisible} index={0} />
          <SummaryMetric icon={HandHeart} label="Dana tersalurkan" amount={data.totalTersalurkan} note={`${data.totalPenyaluranCount || 0} penyaluran tercatat`} change={completedMonthChange(data.trenDonasi, "tersalurkan")} animate={isVisible} index={1} />
          <SummaryMetric icon={Wallet} label={Number(data.sisaSaldo) < 0 ? "Selisih dana" : "Saldo tersedia"} amount={data.sisaSaldo} note={Number(data.sisaSaldo) < 0 ? "Perlu ditinjau pengurus" : "Untuk penyaluran berikutnya"} action={<a href="#alokasi-dana">Lihat detail <ArrowRight size={14} /></a>} animate={isVisible} index={2} />
        </div>
        <div className="transparency-insights-grid"><DonationTrends trends={data.trenDonasi} /><AllocationPanel data={data} animate={isVisible} /></div>
        <RecordsSlides programs={data.programRealisasi} distributions={data.penyaluranTerbaru} onProgramDetail={(id) => setSelectedProgram(data.programRealisasi?.find((item) => item.id === id) || null)} onDistributionDetail={setSelectedDistribution} />
      </>}
    </div>
    {selectedProgram && <ProgramRealizationDetail item={selectedProgram} onClose={() => setSelectedProgram(null)} />}
    {selectedDistribution && <DistributionDetail item={selectedDistribution} onClose={() => setSelectedDistribution(null)} />}
  </section>;
}
