import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, LogIn, User, LogOut, Menu, X } from "lucide-react";
import logoYayasan from "../assets/logo-yayasan.jpeg";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Deteksi efek scroll layar untuk kaca transparan (glassmorphism) & bayangan
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Handler navigasi smooth scroll yang aktif dari halaman mana saja
  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);

    if (location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.hash = sectionId;
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full font-sans transition-all duration-300">
      {/* MAIN NAVBAR DENGAN STICKY GLASSMORPHISM */}
      <nav
        className={`w-full transition-all duration-300 border-b ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md border-slate-200/80 py-3"
            : "bg-white border-slate-100 py-4"
        }`}
      >
        <div className="w-full px-6 md:px-12 flex justify-between items-center">
          {/* Logo & Nama Yayasan */}
          <Link to="/" className="flex items-center gap-3 group text-left">
            <div className="p-1.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <img
                src={logoYayasan}
                alt="Logo Yayasan Mulia Karya Bersama"
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain"
              />
            </div>
            <div>
              <span className="block text-sm font-black text-emerald-900 tracking-tight leading-none group-hover:text-emerald-700 transition">
                YAYASAN
              </span>
              <span className="block text-xs font-black text-amber-600 tracking-wider leading-tight">
                MULIA KARYA BERSAMA
              </span>
            </div>
          </Link>

          {/* Menu Navigasi Desktop */}
          <div className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-700">
            <button
              onClick={() => handleNavClick("beranda")}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              Beranda
            </button>
            <button
              onClick={() => handleNavClick("tentang")}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              Tentang Kami
            </button>
            <button
              onClick={() => handleNavClick("program")}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              Program Utama
            </button>
            <button
              onClick={() => handleNavClick("galeri")}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              Galeri
            </button>
            <button
              onClick={() => handleNavClick("donasi")}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              Infaq & Sedekah
            </button>

            {user.role === "PENGURUS" && (
              <Link
                to="/admin"
                className="text-emerald-800 font-extrabold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition"
              >
                Dashboard Admin
              </Link>
            )}

            {user.role === "DONATUR" && (
              <Link
                to="/donatur"
                className="text-emerald-700 hover:text-emerald-900 transition"
              >
                Riwayat Donasi
              </Link>
            )}

            {user.role === "PENERIMA_BANTUAN" && (
              <Link
                to="/penerima"
                className="text-emerald-700 hover:text-emerald-900 transition"
              >
                Status Bantuan
              </Link>
            )}
          </div>

          {/* Tombol Aksi Desktop (Masuk / User Profile / Donasi) */}
          <div className="hidden sm:flex items-center gap-3">
            {token ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-900 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  {user.nama || "User"}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-emerald-800 hover:bg-emerald-50 active:scale-95 transition-all duration-200"
              >
                <LogIn className="w-4 h-4" /> Masuk
              </Link>
            )}

            {/* 🟢 SUDAH DIPERBAIKI: Mengarah ke handleNavClick("donasi") */}
            <button
              onClick={() => handleNavClick("donasi")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold px-5 py-2.5 rounded-full shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/35 active:scale-95 transition-all duration-200 text-xs tracking-wider uppercase ml-1 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" /> Donasi
            </button>
          </div>

          {/* Tombol Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-emerald-800 rounded-xl"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Menu Navigasi Mobile Pop-up */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-100 px-6 py-4 space-y-3 text-left animate-in slide-in-from-top duration-200">
            <button
              onClick={() => handleNavClick("beranda")}
              className="block w-full text-left text-xs font-bold text-slate-700 hover:text-emerald-700"
            >
              Beranda
            </button>
            <button
              onClick={() => handleNavClick("tentang")}
              className="block w-full text-left text-xs font-bold text-slate-700 hover:text-emerald-700"
            >
              Tentang Kami
            </button>
            <button
              onClick={() => handleNavClick("program")}
              className="block w-full text-left text-xs font-bold text-slate-700 hover:text-emerald-700"
            >
              Program Utama
            </button>
            <button
              onClick={() => handleNavClick("galeri")}
              className="block w-full text-left text-xs font-bold text-slate-700 hover:text-emerald-700"
            >
              Galeri
            </button>
            <button
              onClick={() => handleNavClick("donasi")}
              className="block w-full text-left text-xs font-bold text-slate-700 hover:text-emerald-700"
            >
              Infaq & Sedekah
            </button>

            {user.role === "PENGURUS" && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-bold text-emerald-700"
              >
                Dashboard Admin
              </Link>
            )}

            {user.role === "DONATUR" && (
              <Link
                to="/donatur"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-bold text-emerald-700"
              >
                Riwayat Donasi
              </Link>
            )}

            {user.role === "PENERIMA_BANTUAN" && (
              <Link
                to="/penerima"
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
      </nav>
    </header>
  );
}
