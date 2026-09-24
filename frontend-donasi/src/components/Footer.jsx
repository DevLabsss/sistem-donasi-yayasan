import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import logoYayasan from "../assets/logo-yayasan.jpeg";

// Component SVG Ikon Media Sosial (Aman & Bebas dari Error Import lucide-react)
const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TiktokIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.901 2.872 2.897 2.897 0 0 1-2.894-2.893 2.896 2.896 0 0 1 2.894-2.892c.32 0 .633.056.928.164V9.453a6.34 6.34 0 0 0-.928-.068 6.333 6.333 0 0 0-6.333 6.333 6.333 6.333 0 0 0 6.333 6.333 6.333 6.333 0 0 0 6.333-6.333V8.807a8.212 8.212 0 0 0 4.786 1.523V6.885a4.823 4.823 0 0 1-1.001-.199z" />
  </svg>
);

const YoutubeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-white pt-12 pb-6 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-emerald-900/60">
          {/* KOLOM 1: PROFILE YAYASAN & MEDIA SOSIAL */}
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <img
                src={logoYayasan}
                alt="Logo Yayasan"
                className="w-12 h-12 object-contain bg-white rounded-full p-1"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <h3 className="text-lg font-bold text-white tracking-wide">
                Yayasan Mulia Karya Bersama
              </h3>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed max-w-sm mx-auto md:mx-0">
              Lembaga sosial dan pendidikan keagamaan yang berkomitmen
              mewujudkan kepedulian sosial, pendidikan Al-Qur'an, serta
              pemberdayaan yatim dan dhuafa.
            </p>

            {/* IKON MEDIA SOSIAL */}
            <div className="pt-2">
              <span className="text-xs font-bold text-amber-400 block mb-3 uppercase tracking-wider">
                Media Sosial Kami
              </span>
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <a
                  href="https://web.facebook.com/people/Yayasan-Mulia-Karya-Bersama/61594462259553/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-emerald-900/60 hover:bg-amber-400 hover:text-emerald-950 text-emerald-200 rounded-xl transition-all duration-200 border border-emerald-800 hover:border-amber-400 cursor-pointer shadow-sm"
                  title="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/yayasanmuliakaryabersama/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-emerald-900/60 hover:bg-amber-400 hover:text-emerald-950 text-emerald-200 rounded-xl transition-all duration-200 border border-emerald-800 hover:border-amber-400 cursor-pointer shadow-sm"
                  title="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-emerald-900/60 hover:bg-amber-400 hover:text-emerald-950 text-emerald-200 rounded-xl transition-all duration-200 border border-emerald-800 hover:border-amber-400 cursor-pointer shadow-sm"
                  title="TikTok"
                >
                  <TiktokIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-emerald-900/60 hover:bg-amber-400 hover:text-emerald-950 text-emerald-200 rounded-xl transition-all duration-200 border border-emerald-800 hover:border-amber-400 cursor-pointer shadow-sm"
                  title="YouTube"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* KOLOM 2: ALAMAT & KONTAK */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
              Alamat & Kontak
            </h4>
            <ul className="space-y-3 text-xs text-emerald-100/90">
              <li className="flex items-center justify-center md:justify-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Kota Tangerang, Banten, Indonesia</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+62 859-2291-4919</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>yayasanbina2025@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* KOLOM 3: REKENING DONASI RESMI */}
          <div className="space-y-3 text-center md:text-left">
            <h4 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
              Rekening Donasi Resmi
            </h4>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Salurkan infaq dan sedekah terbaik Anda melalui rekening resmi:
            </p>
            <div className="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800/80 text-center md:text-left shadow-inner">
              <p className="text-xs font-bold text-white mb-1">
                BSI (Bank Syariah Indonesia)
              </p>
              <p className="text-base font-black text-amber-300 tracking-wider">
                7123 828 547
              </p>
              <p className="text-[11px] text-emerald-200 mt-1">
                a.n. Yayasan Mulia Karya Bersama
              </p>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="pt-6 text-center text-xs text-emerald-300/60 font-medium">
          © {new Date().getFullYear()} Yayasan Mulia Karya Bersama. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
