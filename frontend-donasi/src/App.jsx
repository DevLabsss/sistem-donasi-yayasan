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
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardDonatur from "./pages/DashboardDonatur";
import DashboardPenerima from "./pages/DashboardPenerima";

// Komponen Pembungkus Layout
function MainLayout() {
  const location = useLocation();
  // Sembunyikan Navbar, Footer, & WhatsAppChat jika sedang di halaman Admin (/admin)
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between bg-paper">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-brand-900 focus:shadow"
      >
        Lewati ke konten utama
      </a>
      <div className="w-full flex-1">
        {/* Tampilkan Navbar publik hanya jika BUKAN halaman admin */}
        {!isAdminPage && <Navbar />}

        <main id="konten">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/donatur" element={<DashboardDonatur />} />
          <Route path="/admin" element={<DashboardAdmin />} />
          <Route path="/penerima" element={<DashboardPenerima />} />
        </Routes>
        </main>
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
