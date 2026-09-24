import React, { useEffect, useState } from "react";
import {
  HandHeart,
  FileText,
  CheckCircle2,
  UserCheck,
  AlertCircle,
} from "lucide-react";

export default function DashboardPenerima() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Gagal membaca data user:", err);
      }
    }
  }, []);

  // Jika belum login / sesi habis, tampilkan peringatan
  if (!user || !user.nama) {
    return (
      <div className="container mx-auto p-12 max-w-xl text-center font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">
            Sesi Login Tidak Ditemukan
          </h3>
          <p className="text-xs text-slate-500">
            Silakan masuk terlebih dahulu menggunakan akun Penerima Bantuan
            Anda.
          </p>
          <a
            href="/login"
            className="inline-block bg-emerald-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-900 transition shadow-sm"
          >
            Buka Halaman Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl min-h-screen font-sans text-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-slate-900 text-left">
          Dashboard Penerima Bantuan
        </h1>
      </div>

      {/* Card Profil Penerima */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 rounded-3xl shadow-lg text-left mb-8 border border-emerald-800/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
            <HandHeart className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300">
              Profil Penerima Terdaftar
            </span>
            <h3 className="text-xl font-extrabold text-white">{user.nama}</h3>
            <p className="text-xs text-emerald-200">
              {user.email || "Penerima Bantuan"}
            </p>
          </div>
        </div>
      </div>

      {/* Status Pengajuan Bantuan */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-left space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" /> Status Penyaluran
            Bantuan
          </h3>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Terverifikasi
          </span>
        </div>

        <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-100 flex items-start gap-3.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h5 className="font-bold text-slate-900 text-sm">
              Data Anda Telah Diverifikasi oleh Pengurus
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pengurus Yayasan Mulia Karya Bersama akan menghubungi Anda melalui
              kontak telepon / WhatsApp yang terdaftar untuk koordinasi
              penyaluran bantuan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
