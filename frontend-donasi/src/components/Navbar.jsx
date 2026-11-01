import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, User, LogOut, Menu, X, HandHeart } from "lucide-react";
import logoYayasan from "../assets/logo-yayasan.png";
import { publicNavigationItems } from "../data/publicNavigation";
import { getAvatarUrl } from "../utils/imageCompressor";
import { scrollToPublicSection } from "../utils/scrollToPublicSection";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [clickedItem, setClickedItem] = useState(null);
  const [clickedDonasi, setClickedDonasi] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // Render ulang saat profil diperbarui (nama di navbar langsung berubah)
  const [, setUserVersion] = useState(0);
  useEffect(() => {
    const onUserUpdated = () => setUserVersion((v) => v + 1);
    window.addEventListener("user-updated", onUserUpdated);
    return () => window.removeEventListener("user-updated", onUserUpdated);
  }, []);

  // Deteksi efek scroll layar, progress scroll bar, dan scrollspy dinamis
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Hitung persentase scroll halaman secara dinamis untuk progress bar di bawah header
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(
          100,
          Math.max(0, (scrollY / totalHeight) * 100),
        );
        setScrollProgress(progress);
      }

      // Dynamic ScrollSpy: pantau section aktif saat halaman di-scroll
      if (location.pathname === "/") {
        const navbarHeight = document.querySelector(".public-navbar .navbar-container")?.getBoundingClientRect().height || 80;
        const activationLine = navbarHeight + 48;
        let currentSection = publicNavigationItems[0].id;

        for (const item of publicNavigationItems) {
          const section = document.getElementById(item.id);
          if (!section || section.getBoundingClientRect().top > activationLine) break;
          currentSection = item.id;
        }

        setActiveSection(currentSection);
      }

    };
    const frame = requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        document.querySelector('[aria-controls="mobile-navigation"]')?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Handler navigasi smooth scroll dengan animasi klik yang responsif
  const handleNavClick = (sectionId) => {
    setClickedItem(sectionId);
    setTimeout(() => setClickedItem(null), 300);
    setMobileMenuOpen(false);

    const targetHash = `#${sectionId}`;
    if (location.pathname === "/" && location.hash === targetHash) {
      scrollToPublicSection(sectionId, "smooth");
      return;
    }
    navigate({ pathname: "/", hash: targetHash }, { state: { scrollBehavior: "smooth" } });
  };

  // Handler klik tombol Donasi Sekarang dengan efek ripple gelombang nyata
  const handleDonasiClick = () => {
    setClickedDonasi(true);
    setTimeout(() => setClickedDonasi(false), 450);
    handleNavClick("donasi");
  };

  return (
    <>
      {/* HEADER PERMANEN FIXED (Tidak ikut bergerak/jalan ke atas saat scroll atau klik button) */}
      <header
        className={`public-navbar ${isHome ? "public-navbar--forest" : "public-navbar--inner"} fixed top-0 left-0 right-0 z-50 w-full font-sans`}
        data-scrolled={scrolled}
      >
        {/* MAIN NAVBAR DENGAN FIXED GLASSMORPHISM */}
        <nav
          className={`w-full transition-colors duration-200 border-b ${
            isHome
              ? "border-transparent"
              : scrolled
              ? "bg-white/95 backdrop-blur-md shadow-xs border-slate-200/80"
              : "bg-white border-slate-100"
          }`}
        >
          <div className="navbar-container w-full max-w-7xl mx-auto h-[80px] px-4 sm:px-8 flex justify-between items-center gap-3 xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            {/* Logo & Nama Yayasan (Satu Warna Konsisten Hijau Lembaga & Animasi Menarik) */}
            <Link
              to="/"
              className="flex min-w-0 items-center gap-2.5 group text-left cursor-pointer select-none active:scale-95 transition-transform duration-200"
            >
              {/* Logo Emblem */}
              <div className="relative flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <img
                  src={logoYayasan}
                  alt="Logo Yayasan Mulia Karya Bersama"
                  className="relative w-10 h-10 sm:w-11 sm:h-11 object-contain transition-all duration-300 ease-out group-hover:scale-110 group-hover:drop-shadow-[0_4px_10px_rgba(4,121,70,0.35)]"
                />
              </div>

              {/* Nama Yayasan (Satu Warna Konsisten: Hijau Zamrud Yayasan, Tanpa Belang Warna) */}
              <div className="navbar-brand flex max-w-[150px] flex-col justify-center">
                <span className="block text-[11px] sm:text-xs font-extrabold text-emerald-800 uppercase tracking-widest leading-none group-hover:text-emerald-600 transition-colors">
                  YAYASAN
                </span>
                <span className="block text-xs sm:text-[13.5px] font-black text-emerald-950 tracking-tight leading-snug group-hover:text-emerald-700 transition-colors mt-0.5">
                  MULIA KARYA BERSAMA
                </span>
              </div>
            </Link>

            {/* Menu Navigasi Desktop (Apple iOS Segmented Control Track dengan Spring Physics) */}
            <div className="hidden xl:flex shrink-0 items-center ios-segmented-track text-xs font-semibold text-slate-600">
              {publicNavigationItems.map((item) => {
                const isActive = isHome && activeSection === item.id;
                const isClicked = clickedItem === item.id;
                return (
                  <button
                    key={item.id}
                    aria-current={isHome && isActive ? "location" : undefined}
                    onClick={() => handleNavClick(item.id)}
                    className={`ios-segment-item whitespace-nowrap px-2.5 py-2 rounded-full cursor-pointer select-none text-xs ${
                      isClicked
                        ? "scale-90 opacity-80"
                        : isActive
                          ? "ios-segment-active"
                          : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {user.role === "PENGURUS" && (
                <Link
                  to="/admin"
                aria-current={location.pathname === "/admin" ? "page" : undefined}
                  className="navbar-role ios-segment-item text-emerald-800 font-bold bg-emerald-100/70 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 ml-1"
                >
                  Dashboard Admin
                </Link>
              )}

              {user.role === "DONATUR" && (
                <Link
                  to="/donatur"
                aria-current={location.pathname === "/donatur" ? "page" : undefined}
                  className="navbar-role ios-segment-item text-emerald-800 font-bold bg-emerald-100/70 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 ml-1"
                >
                  Riwayat Donasi
                </Link>
              )}

              {user.role === "PENERIMA_BANTUAN" && (
                <Link
                  to="/penerima"
                aria-current={location.pathname === "/penerima" ? "page" : undefined}
                  className="navbar-role ios-segment-item text-emerald-800 font-bold bg-emerald-100/70 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 ml-1"
                >
                  Status Bantuan
                </Link>
              )}
            </div>

            {/* Tombol Aksi Desktop (Masuk / User Profile / Donasi Sekarang dengan Apple iOS Button Style) */}
            <div className="hidden sm:flex shrink-0 items-center gap-2.5 xl:justify-self-end">
              {token ? (
                <div className="flex items-center gap-2">
                  <span className="navbar-account text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-2xs">
                    {user.fotoProfil ? (
                      <img
                        src={getAvatarUrl(user.fotoProfil)}
                        alt={user.nama}
                        className="w-5 h-5 rounded-full object-cover border border-emerald-500 shadow-2xs"
                      />
                    ) : (
                      <User className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    <span className="max-w-[100px] truncate">
                      {user.nama || "User"}
                    </span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="ios-btn p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full cursor-pointer"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="navbar-login ios-btn ios-btn-secondary inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer group"
                >
                  <User className="w-3.5 h-3.5 text-slate-700 group-hover:scale-110 transition-transform" />
                  <span>Masuk</span>
                </Link>
              )}

              {!isHome && (
                <button
                  onClick={handleDonasiClick}
                  className={`ios-btn ios-btn-amber inline-flex whitespace-nowrap items-center gap-2 font-bold px-5 py-2.5 rounded-full text-xs cursor-pointer select-none ${
                    clickedDonasi
                      ? "scale-90 brightness-90 ring-4 ring-amber-400/40"
                      : ""
                  }`}
                >
                  <HandHeart className="w-4 h-4 text-slate-950 fill-slate-950/20" />
                  <span>Donasi Sekarang</span>
                </button>
              )}
            </div>

            {/* Tombol Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={
                mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="navbar-menu-toggle xl:hidden shrink-0 p-2 text-slate-700 hover:text-emerald-800 rounded-xl"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Menu Navigasi Mobile Pop-up Dinamis */}
          {mobileMenuOpen && (
            <div
              id="mobile-navigation"
              className="navbar-mobile xl:hidden max-h-[calc(100dvh-80px)] overflow-y-auto bg-white border-b border-slate-100 px-6 py-4 space-y-2 text-left animate-in slide-in-from-top duration-200 shadow-md"
            >
              {publicNavigationItems.map((item) => {
                const isActive = isHome && activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    aria-current={isHome && isActive ? "location" : undefined}
                    onClick={() => handleNavClick(item.id)}
                    className={`block w-full text-left text-xs py-2 px-3 rounded-xl transition ${
                      isActive
                        ? "bg-slate-100 text-slate-900 font-bold"
                        : "text-slate-700 hover:text-emerald-700 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {user.role === "PENGURUS" && (
                <Link
                  to="/admin"
                aria-current={location.pathname === "/admin" ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs font-bold text-emerald-700"
                >
                  Dashboard Admin
                </Link>
              )}

              {user.role === "DONATUR" && (
                <Link
                  to="/donatur"
                aria-current={location.pathname === "/donatur" ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs font-bold text-emerald-700"
                >
                  Riwayat Donasi
                </Link>
              )}

              {user.role === "PENERIMA_BANTUAN" && (
                <Link
                  to="/penerima"
                aria-current={location.pathname === "/penerima" ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs font-bold text-emerald-700"
                >
                  Status Bantuan
                </Link>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {token ? (
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 text-red-600 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Keluar
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full bg-emerald-50 text-emerald-800 font-bold text-xs py-2.5 rounded-xl text-center flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> Masuk Akun
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Scroll Progress Bar di Bawah Header */}
          <div
            className="absolute bottom-0 left-0 h-[2px] bg-emerald-600 transition-all duration-150 ease-out pointer-events-none"
            style={{ width: `${scrollProgress}%` }}
          />
        </nav>
      </header>

      {/* Beranda menempatkan latar hero di belakang navbar transparan. */}
      {!isHome && <div className="h-[80px] w-full shrink-0" aria-hidden="true" />}
    </>
  );
}
