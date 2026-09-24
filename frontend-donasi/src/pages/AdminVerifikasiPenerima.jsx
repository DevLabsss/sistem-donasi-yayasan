import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Clock, UserCheck } from "lucide-react";

export default function AdminVerifikasiPenerima() {
  const [listPending, setListPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // Ambil data penerima bantuan status VERIFIKASI dari backend
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/admin/penerima-pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListPending(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil antrean verifikasi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // Handler untuk Setuju (DISETUJUI) atau Tolak (DITOLAK)
  const handleVerifikasi = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_URL}/admin/verifikasi-penerima/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessage(res.data.message);
      fetchPendingUsers(); // Refresh daftar tabel

      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memperbarui status akun.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="flex items-center gap-3 mb-6">
        <UserCheck className="w-8 h-8 text-emerald-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Persetujuan Akun Penerima Bantuan
          </h1>
          <p className="text-sm text-gray-500">
            Daftar pendaftar baru yang memerlukan verifikasi dari Admin/Pengurus
            Yayasan
          </p>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-medium">
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">
          Memuat daftar antrean...
        </div>
      ) : listPending.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 shadow-sm">
          <Clock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="font-semibold text-base">
            Tidak ada antrean verifikasi
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Semua akun pendaftar penerima bantuan sudah diverifikasi.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-emerald-950 text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">Email & No. HP</th>
                  <th className="px-6 py-4">Alamat</th>
                  <th className="px-6 py-4">Alasan Pengajuan</th>
                  <th className="px-6 py-4 text-center">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listPending.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-emerald-50/40 transition"
                  >
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {item.user?.nama || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-700">
                        {item.user?.email}
                      </div>
                      <div className="text-xs text-gray-400">{item.noHp}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 max-w-xs">
                      {item.alamat}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 max-w-sm italic">
                      "{item.alasan}"
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleVerifikasi(item.id, "DISETUJUI")}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                          title="Setujui Akun"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Setujui
                        </button>
                        <button
                          onClick={() => handleVerifikasi(item.id, "DITOLAK")}
                          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                          title="Tolak Akun"
                        >
                          <XCircle className="w-4 h-4" />
                          Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
