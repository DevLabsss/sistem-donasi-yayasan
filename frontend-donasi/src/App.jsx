import { lazy, Suspense, useEffect } from "react";
import "./styles/public-design.css";
import "./styles/dashboard-design.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppChat from "./components/WhatsAppChat";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
const DashboardAdmin = lazy(() => import("./pages/DashboardAdmin"));
import DashboardDonatur from "./pages/DashboardDonatur";
import DashboardPenerima from "./pages/DashboardPenerima";
import ProtectedRoute from "./components/ProtectedRoute";
import { scrollToPublicSection } from "./utils/scrollToPublicSection";
import { bersihkanCacheBuktiLama } from "./utils/imageCompressor";

// Komponen Pembungkus Layout
function MainLayout() {
  const location = useLocation();
  const scrollBehavior = location.state?.scrollBehavior;
  useEffect(() => { bersihkanCacheBuktiLama(); }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (location.hash) {
        scrollToPublicSection(decodeURIComponent(location.hash.slice(1)), scrollBehavior === "smooth" ? "smooth" : "auto");
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash, scrollBehavior]);
  useEffect(() => {
    const titles = {
      "/": "Beranda", "/login": "Masuk", "/register": "Daftar",
      "/forgot-password": "Lupa Kata Sandi", "/donatur": "Panel Donatur",
      "/penerima": "Panel Penerima Bantuan", "/admin": "Panel Pengurus",
    };
    const sections = { tentang: "Tentang Kami", program: "Fokus Kegiatan", donasi: "Program Donasi", sedekah: "Sedekah", transparansi: "Transparansi", galeri: "Galeri", bantuan: "Pengajuan Bantuan" };
    const section = location.pathname === "/" ? sections[location.hash.slice(1)] : null;
    document.title = `${section || titles[location.pathname] || "Yayasan"} | Yayasan Mulia Karya Bersama`;
    const privatePage = ["/login", "/register", "/forgot-password", "/donatur", "/penerima", "/admin"].includes(location.pathname) || location.pathname.startsWith("/reset-password/");
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement("meta"); robots.name = "robots"; document.head.appendChild(robots); }
    robots.content = privatePage ? "noindex, nofollow" : "index, follow";
    const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "");
    let canonical = document.querySelector('link[rel="canonical"]');
    if (siteUrl && !privatePage) {
      if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
      canonical.href = `${siteUrl}${location.pathname}`;
    } else canonical?.remove();
  }, [location.pathname, location.hash]);
  // Sembunyikan Navbar, Footer, & WhatsAppChat jika sedang di halaman Admin (/admin)
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    // 🟢 PERBAIKAN: Ditambahkan 'w-full max-w-full overflow-x-hidden' agar melebar penuh ke seluruh layar
    <div className="w-full min-h-screen bg-slate-50 flex flex-col justify-between relative overflow-clip">
      <div className="w-full flex-1">
        {/* Tampilkan Navbar publik hanya jika BUKAN halaman admin */}
        {!isAdminPage && <Navbar />}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/donatur"
            element={
              <ProtectedRoute roles={["DONATUR"]}>
                <DashboardDonatur />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["PENGURUS"]}>
                <Suspense fallback={<div className="public-ui ds-container py-12" role="status">Memuat panel pengurus…</div>}>
                  <DashboardAdmin />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/penerima"
            element={
              <ProtectedRoute roles={["PENERIMA_BANTUAN"]}>
                <DashboardPenerima />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* Tampilkan Footer & Widget WhatsApp hanya jika BUKAN halaman admin */}
      {!isAdminPage && <Footer />}
      {!isAdminPage && <WhatsAppChat />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}
