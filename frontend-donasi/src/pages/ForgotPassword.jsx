import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import logoYayasan from "../assets/logo-yayasan.jpeg";

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden my-8 text-left">
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
          <h2 className="text-xl font-black tracking-tight flex items-center justify-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-300" /> Lupa Password
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            Masukkan email terdaftar untuk membuat tautan pemulihan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-2xl border border-red-100 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {message && (
            <div className="bg-emerald-50 text-emerald-700 text-xs p-3.5 rounded-2xl border border-emerald-100 font-medium space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
              </div>
              {resetLink && (
                <p className="text-[11px] text-emerald-800 font-normal">
                  Mengarahkan Anda secara otomatis... Jika tidak dialihkan,{" "}
                  <a
                    href={resetLink}
                    className="font-bold underline inline-flex items-center gap-1"
                  >
                    Klik di sini <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              )}
            </div>
          )}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-emerald-800/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider mt-2"
          >
            {loading ? "Membuat Tautan..." : "Kirim Link Reset"}
          </button>

          <div className="text-center pt-4 border-t border-slate-100">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Halaman Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
