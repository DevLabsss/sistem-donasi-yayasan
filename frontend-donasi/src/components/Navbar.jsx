import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Menu, User, X } from "lucide-react";
import logoYayasan from "../assets/logo-yayasan.jpeg";
import { galeri } from "../content/yayasan";
import Button from "./ui/Button";

const MENU = [
  { id: "beranda", label: "Beranda" },
  { id: "tentang", label: "Tentang" },
  { id: "program", label: "Program" },
  ...(galeri.length > 0 ? [{ id: "galeri", label: "Galeri" }] : []),
  { id: "donasi", label: "Donasi" },
];

const bacaUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

export default function Navbar() {
  const [terbuka, setTerbuka] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = bacaUser();

  const tautanRole =
    user.role === "PENGURUS"
      ? { to: "/admin", label: "Dashboard Admin" }
      : user.role === "DONATUR"
        ? { to: "/donatur", label: "Riwayat Donasi" }
        : user.role === "PENERIMA_BANTUAN"
          ? { to: "/penerima", label: "Status Bantuan" }
          : null;

  // Esc menutup menu mobile
  useEffect(() => {
    if (!terbuka) return;
    const onKey = (e) => e.key === "Escape" && setTerbuka(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [terbuka]);

  const keBagian = (e, id) => {
    e.preventDefault();
    setTerbuka(false);
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", `/#${id}`);
    } else {
      navigate(`/#${id}`);
    }
  };

  const keluar = () => {
    localStorage.clear();
    navigate("/login");
  };

  const linkClass =
    "rounded-md px-3 py-2 text-sm font-semibold text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-900";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <nav
        aria-label="Navigasi utama"
        className="container-page flex h-16 items-center justify-between gap-4"
      >
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img
            src={logoYayasan}
            alt=""
            className="h-10 w-10 shrink-0 rounded-md object-contain"
          />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-bold text-brand-900">
              Yayasan Mulia Karya Bersama
            </span>
            <span className="hidden text-xs text-ink-faint sm:block">
              Kota Tangerang, Banten
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {MENU.map((m) => (
            <li key={m.id}>
              <a
                href={`/#${m.id}`}
                onClick={(e) => keBagian(e, m.id)}
                className={linkClass}
              >
                {m.label}
              </a>
            </li>
          ))}
          {tautanRole && (
            <li>
              <Link to={tautanRole.to} className={linkClass}>
                {tautanRole.label}
              </Link>
            </li>
          )}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          {token ? (
            <>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
                <User className="h-4 w-4" aria-hidden="true" />
                {user.nama || "Akun"}
              </span>
              <button
                type="button"
                onClick={keluar}
                aria-label="Keluar dari akun"
                className="flex h-10 w-10 items-center justify-center rounded-md text-ink-muted hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <Button as={Link} to="/login" variant="ghost" size="sm" icon={LogIn}>
              Masuk
            </Button>
          )}
          <Button
            as="a"
            href="/#donasi"
            onClick={(e) => keBagian(e, "donasi")}
            variant="accent"
            size="sm"
          >
            Donasi sekarang
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setTerbuka((v) => !v)}
          aria-expanded={terbuka}
          aria-controls="menu-mobile"
          aria-label={terbuka ? "Tutup menu" : "Buka menu"}
          className="flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-brand-50 lg:hidden"
        >
          {terbuka ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {terbuka && (
        <div id="menu-mobile" className="border-t border-line bg-white lg:hidden">
          <ul className="container-page space-y-1 py-3">
            {MENU.map((m) => (
              <li key={m.id}>
                <a
                  href={`/#${m.id}`}
                  onClick={(e) => keBagian(e, m.id)}
                  className="block rounded-md px-3 py-3 text-base font-semibold text-ink hover:bg-brand-50"
                >
                  {m.label}
                </a>
              </li>
            ))}
            {tautanRole && (
              <li>
                <Link
                  to={tautanRole.to}
                  onClick={() => setTerbuka(false)}
                  className="block rounded-md px-3 py-3 text-base font-semibold text-brand-900 hover:bg-brand-50"
                >
                  {tautanRole.label}
                </Link>
              </li>
            )}
            <li className="flex flex-col gap-2 border-t border-line pt-3">
              <Button
                as="a"
                href="/#donasi"
                onClick={(e) => keBagian(e, "donasi")}
                variant="accent"
                size="lg"
              >
                Donasi sekarang
              </Button>
              {token ? (
                <Button variant="secondary" size="lg" icon={LogOut} onClick={keluar}>
                  Keluar ({user.nama || "Akun"})
                </Button>
              ) : (
                <Button
                  as={Link}
                  to="/login"
                  variant="secondary"
                  size="lg"
                  icon={LogIn}
                  onClick={() => setTerbuka(false)}
                >
                  Masuk
                </Button>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
