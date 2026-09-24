import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  User,
  Mail,
  Lock,
  UserPlus,
  Heart,
  HandHeart,
  Phone,
  MapPin,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";
import logoYayasan from "../assets/logo-yayasan.jpeg";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

      alert("Pendaftaran akun berhasil! Silakan login.");
      navigate("/login");
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden my-8">
        {/* Header Form */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-8 text-center relative">
          <Link
            to="/"
            className="inline-block mb-3 p-2 bg-white rounded-2xl shadow-md"
          >
            <img
              src={logoYayasan}
              alt="Yayasan Mulia Karya Bersama"
              className="w-12 h-12 object-contain"
            />
          </Link>
          <h2 className="text-xl font-black tracking-tight">
            Daftar Akun Baru
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            Bergabung bersama Yayasan Mulia Karya Bersama
          </p>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4 text-left">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-2xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          {/* Tombol Pilihan Role (Donatur vs Penerima Bantuan) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Daftar Sebagai
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "DONATUR" })}
                className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  formData.role === "DONATUR"
                    ? "bg-emerald-800 text-white border-emerald-800 shadow-md"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    formData.role === "DONATUR" ? "fill-white" : ""
                  }`}
                />
                Donatur
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, role: "PENERIMA_BANTUAN" })
                }
                className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  formData.role === "PENERIMA_BANTUAN"
                    ? "bg-emerald-800 text-white border-emerald-800 shadow-md"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <HandHeart className="w-4 h-4" />
                Penerima Bantuan
              </button>
            </div>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="nama"
                placeholder="Masukkan nama lengkap Anda"
                value={formData.nama}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Alamat Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                placeholder="contoh@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Form Tambahan Khusus Penerima Bantuan */}
          {formData.role === "PENERIMA_BANTUAN" && (
            <>
              {/* Nomor HP / WA (HANYA ANGKA) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor Telepon / WA (Angka)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric" // Menampilkan keyboard angka di perangkat mobile
                    name="noHp"
                    placeholder="08123456789"
                    value={formData.noHp}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Alamat Tempat Tinggal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Lengkap
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    name="alamat"
                    rows="2"
                    placeholder="Alamat domisili saat ini"
                    value={formData.alamat}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  ></textarea>
                </div>
              </div>

              {/* Alasan Pengajuan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alasan Pengajuan Bantuan
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    name="alasan"
                    rows="2"
                    placeholder="Jelaskan secara singkat kondisi/kebutuhan bantuan Anda"
                    value={formData.alasan}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  ></textarea>
                </div>
              </div>
            </>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"} // 🟢 Tipe input dinamis
                name="password"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-10 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
              {/* 🟢 Tombol Mata Show/Hide Password */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Konfirmasi Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? "text" : "password"} // 🟢 Tipe input dinamis
                name="confirmPassword"
                placeholder="Ulangi password di atas"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-10 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
              {/* 🟢 Tombol Mata Show/Hide Konfirmasi Password */}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-emerald-800/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider mt-2"
          >
            <UserPlus className="w-4 h-4" />{" "}
            {loading ? "Memproses..." : "Daftar Sekarang"}
          </button>

          {/* Link ke Halaman Login */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Sudah memiliki akun?{" "}
              <Link
                to="/login"
                className="text-emerald-800 font-bold hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
