import { useState } from "react";
import ModalDonasi from "../components/ModalDonasi";
import PublicSections from "../components/PublicSections";
import useApiResource from "../hooks/useApiResource";
import { CheckCircle2, ShieldCheck, ArrowRight, HandHeart, Compass, RefreshCw } from "lucide-react";
import "../styles/home-hero.css";

export default function Home() {
  const programResource = useApiResource("/program");
  const transparencyResource = useApiResource("/donasi/transparansi");
  const programs = Array.isArray(programResource.data) ? programResource.data : [];
  const loading = programResource.loading;
  const transparansi = transparencyResource.data;
  const [selectedProgram, setSelectedProgram] = useState(null);

  // State untuk Card Donasi Cepat di Hero Section
  const [quickNominal, setQuickNominal] = useState(null);
  const [quickCustomNominal, setQuickCustomNominal] = useState("");
  const [isCustomActive, setIsCustomActive] = useState(false);
  const [quickAnonim, setQuickAnonim] = useState(false);
  const [quickError, setQuickError] = useState("");

  // Fitur Dinamis & Interaktif: Kutipan Hadits Berganti
  const haditsList = [
    {
      quote: "Sedekah itu tidak akan pernah mengurangi harta.",
      riwayat: "HR. Muslim no. 2588",
    },
    {
      quote:
        "Bentengilah hartamu dengan zakat dan obatilah orang sakitmu dengan sedekah.",
      riwayat: "HR. Abu Dawud",
    },
    {
      quote:
        "Naungan bagi setiap mukmin pada hari kiamat kelak adalah sedekahnya.",
      riwayat: "HR. Ahmad",
    },
    {
      quote:
        "Tangan yang di atas memberi lebih mulia daripada tangan yang di bawah.",
      riwayat: "HR. Bukhari & Muslim",
    },
  ];
  const [haditsIndex, setHaditsIndex] = useState(0);

  const handleNextHadits = () => {
    setHaditsIndex((prev) => (prev + 1) % haditsList.length);
  };

  const handleTunaikanCepat = (event) => {
    event.preventDefault();
    setQuickError("");
    const rawNominal = isCustomActive ? quickCustomNominal.trim() : quickNominal ? String(quickNominal) : "";
    const nominalAngka = Number(rawNominal);
    if (!/^\d+$/.test(rawNominal) || !Number.isSafeInteger(nominalAngka) || nominalAngka < 10000) {
      setQuickError("Masukkan nominal bulat minimal Rp 10.000.");
      return;
    }
    if (nominalAngka > 1000000000) {
      setQuickError("Maksimal donasi per transaksi Rp 1.000.000.000.");
      return;
    }
    if (loading || !programs.length) {
      setQuickError(loading ? "Program sedang dimuat. Silakan tunggu sebentar." : "Program donasi belum tersedia. Silakan coba lagi nanti.");
      return;
    }

    setSelectedProgram({
      ...programs[0],
      _quickNominal: nominalAngka,
      _quickAnonim: quickAnonim,
    });
  };

  return (
    <div className="w-full bg-slate-50 font-sans text-slate-800 selection:bg-emerald-500 selection:text-white">
      {/* Beranda: pengantar yayasan dan pilihan donasi cepat */}
      <section
        id="beranda"
        className="home-hero"
      >
        <svg className="hero-pattern" aria-hidden="true" width="100%" height="100%">
          <defs>
            <pattern id="home-islamic-star" width="72" height="72" patternUnits="userSpaceOnUse">
              <path d="M36 0 L46 14 L62 10 L60 26 L72 36 L60 46 L62 62 L46 60 L36 72 L26 60 L10 62 L12 46 L0 36 L12 26 L10 10 L26 14 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path d="M36 12 L43 21 L53 19 L51 29 L60 36 L51 43 L53 53 L43 51 L36 60 L29 51 L19 53 L21 43 L12 36 L21 29 L19 19 L29 21 Z" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2" />
              <circle cx="36" cy="36" r="5" fill="none" stroke="currentColor" />
              <path d="M0 0 L10 10 M72 0 L62 10 M72 72 L62 62 M0 72 L10 62" stroke="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#home-islamic-star)" />
        </svg>

        <div className="hero-layout">
          <div className="hero-intro">
            <div className="hero-bismillah">
              <span
                className="hero-arabic"
                dir="rtl"
                lang="ar"
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </span>
              <span className="hero-bismillah-caption">
                Mengawali niat tulus berbagi
              </span>
            </div>

            <h1 className="hero-title">
              Mengalirkan Berkah,
              <span className="hero-title-accent">Merawat Martabat &amp;</span>
              Kemandirian Umat
            </h1>
            <p className="hero-description">
              Bersama, hadirkan harapan bagi santri yatim, dhuafa, dan keluarga
              prasejahtera melalui sedekah dan zakat yang memberdayakan.
            </p>

            <div className="hero-actions">
              <a href="#program" className="hero-button hero-button-primary">
                <HandHeart className="h-5 w-5" aria-hidden="true" />
                Pelajari Program Unggulan
              </a>
              <a href="#program" className="hero-button hero-button-secondary">
                <Compass className="h-5 w-5 text-emerald-200" aria-hidden="true" />
                Eksplorasi Program
              </a>
            </div>

            <div className="hero-quote">
              <blockquote className="min-w-0 flex-1">
                <p className="hero-quote-text">
                  “{haditsList[haditsIndex].quote}”
                </p>
                <cite className="hero-quote-source">
                  {haditsList[haditsIndex].riwayat}
                </cite>
              </blockquote>
              <button
                type="button"
                onClick={handleNextHadits}
                aria-label="Lihat kutipan berikutnya"
                className="hero-quote-next"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                {haditsIndex + 1}/{haditsList.length}
              </button>
            </div>

            <div className="hero-impact">
              <div className="hero-impact-message">
                <span className="hero-impact-icon">
                  <HandHeart className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="hero-impact-title">Setiap kebaikan berarti</p>
                  <p className="hero-impact-caption">Bersama menumbuhkan kemandirian umat</p>
                </div>
              </div>
              <a href="#transparansi" className="hero-report-link">
                Lihat laporan penyaluran
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="hero-donation-column">
            <div id="donasi-cepat" className="quick-donation-card">
              <form onSubmit={handleTunaikanCepat} noValidate className="quick-donation-form">
                <div>
                  <h2 className="quick-donation-title">Donasi Cepat</h2>
                  <p className="quick-donation-description">Tunaikan kebaikan dengan mudah & amanah.</p>
                </div>

                <fieldset>
                  <legend className="sr-only">Pilihan nominal</legend>
                  <div className="quick-nominal-grid">
                    {[25000, 50000, 100000, 250000].map((val) => {
                      const isSelected = quickNominal === val && !isCustomActive;
                      return (
                        <button
                          key={val}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            setQuickNominal(val);
                            setQuickCustomNominal("");
                            setIsCustomActive(false);
                            setQuickError("");
                          }}
                          className="quick-nominal-option"
                        >
                          <span>Rp {val.toLocaleString("id-ID")}</span>
                          {isSelected ? (
                            <CheckCircle2 className="quick-selected-icon" aria-hidden="true" />
                          ) : (
                            <span className="quick-radio-indicator" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="quick-custom-nominal" className="sr-only">Nominal lainnya</label>
                  <div className="quick-custom-field">
                    <span className="quick-currency" aria-hidden="true">Rp</span>
                    <input
                      id="quick-custom-nominal"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      value={quickCustomNominal}
                      aria-describedby="quick-nominal-help quick-donation-feedback"
                      aria-invalid={isCustomActive && !!quickError}
                      onFocus={() => setIsCustomActive(true)}
                      onChange={(event) => {
                        setQuickCustomNominal(event.target.value.replace(/\D/g, ""));
                        setIsCustomActive(true);
                        setQuickError("");
                      }}
                      placeholder="Nominal lainnya..."
                      className="quick-custom-input"
                    />
                  </div>
                  <p id="quick-nominal-help" className={isCustomActive ? "quick-nominal-help" : "sr-only"}>Minimal donasi Rp 10.000</p>
                </div>

                <label className="quick-anonymous">
                  <input type="checkbox" checked={quickAnonim} onChange={(event) => setQuickAnonim(event.target.checked)} className="quick-anonymous-check" />
                  Donasi sebagai Hamba Allah (Anonim)
                </label>

                <div>
                  <p id="quick-donation-feedback" role="status" className="quick-feedback">
                    {quickError || (!loading && programs.length === 0 ? "Program donasi belum tersedia. Silakan coba lagi nanti." : "")}
                  </p>
                  <button type="submit" disabled={loading || programs.length === 0} className="hero-button hero-button-primary quick-submit">
                    {loading ? "Memuat program…" : "Donasi Sekarang"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="quick-trust-footer">
                  <ShieldCheck aria-hidden="true" />
                  <span>Dana dihitung setelah verifikasi pembayaran</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <PublicSections
        programs={programs}
        loading={loading}
        programError={programResource.error}
        onRetryPrograms={programResource.reload}
        transparansi={transparansi}
        loadingTransparansi={transparencyResource.loading}
        transparencyError={transparencyResource.error}
        onRetryTransparency={transparencyResource.reload}
        onDonate={setSelectedProgram}
      />
      {selectedProgram && (
        <ModalDonasi
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
          initialNominal={selectedProgram._quickNominal}
          initialAnonim={selectedProgram._quickAnonim}
          onSuccess={programResource.reload}
        />
      )}
    </div>
  );
}
