import { useState } from "react";
import API from "../services/api";
import { AuthLayout } from "../components/PublicUI";
import Notice from "../components/Notice";
import { useParams, useNavigate, Link } from "react-router-dom";
import PasswordField from "../components/PasswordField";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [passwordBaru, setPasswordBaru] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordBaru !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/reset-password", {
        token,
        passwordBaru,
      });
      setSuccess(res.data.message || "Password berhasil di-reset!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal mereset password. Tautan mungkin kadaluwarsa.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Buat password baru" description="Pilih password baru untuk kembali mengakses akun Anda.">
      <form onSubmit={handleSubmit} className="ds-form" aria-busy={loading}>
        <Notice type="error" message={error} />
        <Notice message={success} />
        <PasswordField id="reset-password" label="Password baru" hint="Gunakan minimal 6 karakter." autoComplete="new-password" value={passwordBaru} onChange={(e) => setPasswordBaru(e.target.value)} minLength={6} required />
        <PasswordField id="reset-confirm" label="Konfirmasi password baru" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <button type="submit" disabled={loading || !!success} className="ds-button ds-button-primary">{loading ? "Memproses…" : "Simpan password baru"}</button>
        <p className="ds-form-footer"><Link to="/forgot-password">Minta tautan pemulihan baru</Link></p>
      </form>
    </AuthLayout>
  );
}
