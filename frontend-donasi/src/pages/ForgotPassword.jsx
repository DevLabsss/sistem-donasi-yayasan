import { useState } from "react";
import API from "../services/api";
import { AuthLayout } from "../components/PublicUI";
import Notice from "../components/Notice";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetLink("");
    setLoading(true);

    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMessage(
        res.data.message || "Tautan pemulihan password berhasil dibuat.",
      );

      if (res.data.resetUrl) {
        setResetLink(res.data.resetUrl);

        // Otomatis mengarahkan ke halaman reset password dalam 1.5 detik
        setTimeout(() => {
          window.location.href = res.data.resetUrl;
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal memproses permintaan reset password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Lupa password?" description="Masukkan email terdaftar untuk memulihkan akses akun Anda.">
      <form onSubmit={handleSubmit} className="ds-form" aria-busy={loading}>
        <Notice type="error" message={error} />
        <Notice message={message} />
        {resetLink && <p className="ds-help">Anda akan diarahkan ke halaman pemulihan. <a href={resetLink} className="ds-text-link">Buka tautan</a></p>}
        <div className="ds-field"><label htmlFor="forgot-email">Alamat email terdaftar</label><input id="forgot-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contoh@email.com" required /></div>
        <button type="submit" disabled={loading} className="ds-button ds-button-primary">{loading ? "Memproses…" : "Kirim tautan pemulihan"}</button>
        <p className="ds-form-footer"><Link to="/login">Kembali ke halaman masuk</Link></p>
      </form>
    </AuthLayout>
  );
}
