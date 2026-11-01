import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredUser } from "../utils/format";

// Decode payload JWT (tanpa verifikasi signature — verifikasi tetap di backend)
const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const HOME_BY_ROLE = {
  PENGURUS: "/admin",
  DONATUR: "/donatur",
  PENERIMA_BANTUAN: "/penerima",
};

// Membatasi halaman dashboard sesuai role. Ini hanya lapisan UI;
// otorisasi sebenarnya tetap ditegakkan oleh middleware backend.
export default function ProtectedRoute({ roles, children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = getStoredUser();
  const payload = token ? decodeToken(token) : null;

  const [isExpired] = useState(() => {
    return Boolean(payload?.exp && payload.exp * 1000 < Date.now());
  });

  if (!token || !payload || isExpired) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Role diambil dari token (lebih sulit dimanipulasi daripada localStorage)
  const role = payload.role || user.role;
  if (roles && !roles.includes(role)) {
    return <Navigate to={HOME_BY_ROLE[role] || "/"} replace />;
  }

  return children;
}
