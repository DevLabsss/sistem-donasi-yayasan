import { useState } from "react";
import API from "../services/api";
import { AuthLayout } from "../components/PublicUI";
import Notice from "../components/Notice";
import { Link, useNavigate } from "react-router-dom";
import PasswordField from "../components/PasswordField";

export default function Register() {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "DONATUR", // Default pilihan role
    noHp: "",
    alamat: "",
    alasan: "",
  });

  // 🟢 State toggle visibilitas password

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🟢 Filter nomor telepon agar HANYA BISA ANGKA
    if (name === "noHp") {
      const onlyNums = value.replace(/\D/g, ""); // Hapus karakter non-digit
      setFormData({ ...formData, [name]: onlyNums });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/register", {
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        noHp: formData.noHp,
        alamat: formData.alamat,
        alasan: formData.alasan,
      });

      navigate("/login", { state: { message: "Pendaftaran akun berhasil. Silakan masuk dengan akun Anda." } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal mendaftar. Silakan coba beberapa saat lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Bergabung dalam kebaikan" description="Buat akun untuk berdonasi atau mengajukan kebutuhan bantuan.">
      <form onSubmit={handleSubmit} className="ds-form" aria-busy={loading}>
        <Notice type="error" message={error} />
        <fieldset><legend>Daftar sebagai</legend><div className="role-options">
          <button type="button" aria-pressed={formData.role === "DONATUR"} onClick={() => setFormData({ ...formData, role: "DONATUR" })}>Donatur</button>
          <button type="button" aria-pressed={formData.role === "PENERIMA_BANTUAN"} onClick={() => setFormData({ ...formData, role: "PENERIMA_BANTUAN" })}>Penerima bantuan</button>
        </div></fieldset>
        <div className="ds-field"><label htmlFor="register-name">Nama lengkap</label><input id="register-name" name="nama" autoComplete="name" value={formData.nama} onChange={handleChange} placeholder="Nama lengkap Anda" required /></div>
        <div className="ds-field"><label htmlFor="register-email">Alamat email</label><input id="register-email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} placeholder="contoh@email.com" required /></div>
        {formData.role === "PENERIMA_BANTUAN" && <fieldset className="ds-form-group"><legend>Informasi penerima bantuan</legend>
          <div className="ds-field"><label htmlFor="register-phone">Nomor telepon / WhatsApp</label><input id="register-phone" type="tel" inputMode="numeric" name="noHp" autoComplete="tel" value={formData.noHp} onChange={handleChange} placeholder="08xxxxxxxxxx" required /></div>
          <div className="ds-field"><label htmlFor="register-address">Alamat tempat tinggal</label><textarea id="register-address" name="alamat" autoComplete="street-address" rows={3} value={formData.alamat} onChange={handleChange} placeholder="Alamat domisili saat ini" required /></div>
          <div className="ds-field"><label htmlFor="register-reason">Alasan membutuhkan bantuan</label><textarea id="register-reason" name="alasan" rows={3} value={formData.alasan} onChange={handleChange} placeholder="Ceritakan kondisi dan kebutuhan Anda" required /></div>
          <p className="ds-help">Informasi ini digunakan pengurus untuk proses verifikasi akun penerima.</p>
        </fieldset>}
        <PasswordField id="register-password" label="Password" hint="Gunakan minimal 6 karakter." name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} minLength={6} required />
        <PasswordField id="register-confirm" label="Konfirmasi password" name="confirmPassword" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} required />
        <button type="submit" disabled={loading} className="ds-button ds-button-primary">{loading ? "Memproses…" : "Buat akun"}</button>
        <p className="ds-form-footer">Sudah memiliki akun? <Link to="/login">Masuk di sini</Link></p>
      </form>
    </AuthLayout>
  );
}
