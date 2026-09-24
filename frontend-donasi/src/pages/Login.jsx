import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import logoYayasan from "../assets/logo-yayasan.jpeg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 🟢 State toggle password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
          <h2 className="text-xl font-black tracking-tight">Masuk Akun</h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            Selamat datang kembali di Yayasan Mulia Karya Bersama
          </p>
        </div>

        {/* Body Form */}
        <form onSubmit={handleLogin} className="p-8 space-y-4 text-left">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-2xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-extrabold text-emerald-800 hover:underline"
              >
                Lupa Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"} // 🟢 Tipe input dinamis
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-10 py-3 rounded-2xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
              {/* 🟢 Tombol Ikon Mata */}
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

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-emerald-800/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider mt-2"
          >
            <LogIn className="w-4 h-4" /> {loading ? "Memproses..." : "Masuk"}
          </button>

          {/* Link ke Register */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Belum memiliki akun?{" "}
              <Link
                to="/register"
                className="text-emerald-800 font-bold hover:underline"
              >
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
