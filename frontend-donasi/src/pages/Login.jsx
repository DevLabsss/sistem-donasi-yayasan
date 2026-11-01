import { useState } from "react";
import API from "../services/api";
import { AuthLayout } from "../components/PublicUI";
import Notice from "../components/Notice";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PasswordField from "../components/PasswordField";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Pengarahan halaman sesuai role user
      if (res.data.user.role === "PENGURUS") {
        navigate("/admin");
      } else if (res.data.user.role === "PENERIMA_BANTUAN") {
        navigate("/penerima");
      } else {
        navigate("/donatur");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login gagal! Periksa kembali email dan password Anda.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Masuk akun" description="Lanjutkan kebaikan dan kelola aktivitas Anda di yayasan.">
      <form onSubmit={handleLogin} className="ds-form" aria-busy={loading}>
        <Notice type="error" message={error} />
        <Notice message={location.state?.message} />
        <div className="ds-field"><label htmlFor="login-email">Alamat email</label><input id="login-email" type="email" autoComplete="username" placeholder="contoh@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <PasswordField id="login-password" label="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Masukkan password Anda" />
        <Link to="/forgot-password" className="auth-forgot">Lupa password?</Link>
        <button type="submit" disabled={loading} className="ds-button ds-button-primary">{loading ? "Memproses…" : "Masuk"}</button>
        <p className="ds-form-footer">Belum memiliki akun? <Link to="/register">Daftar sekarang</Link></p>
      </form>
    </AuthLayout>
  );
}
