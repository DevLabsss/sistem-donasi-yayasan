import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload, X } from "lucide-react";
import API from "../services/api";
import { getErrorMessage } from "../utils/format";
import ProgramImage from "./ProgramImage";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export default function ProgramFormModal({ program, onClose, onSaved }) {
  const isEdit = Boolean(program);
  const [form, setForm] = useState({
    judul: program?.judul || "",
    deskripsi: program?.deskripsi || "",
    targetDana: program?.targetDana?.toString() || "",
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => () => { if (previewRef.current) URL.revokeObjectURL(previewRef.current); }, []);

  const selectFile = (selected) => {
    if (!selected) return;
    if (!ALLOWED_TYPES.has(selected.type)) return setError("Gunakan gambar JPG, PNG, atau WebP.");
    if (!selected.size) return setError("File gambar kosong atau rusak.");
    if (selected.size > MAX_IMAGE_BYTES) return setError("Ukuran gambar maksimal 5 MB.");
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = URL.createObjectURL(selected);
    setPreviewUrl(previewRef.current);
    setFile(selected);
    setRemoveImage(false);
    setError("");
  };

  const clearImage = () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreviewUrl(null);
    setFile(null);
    setRemoveImage(Boolean(program?.imageUrl));
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.judul.trim() || !form.deskripsi.trim()) return setError("Judul dan deskripsi program wajib diisi.");
    if (!Number.isFinite(Number(form.targetDana)) || Number(form.targetDana) <= 0) return setError("Target dana harus lebih dari 0.");

    const body = new FormData();
    body.append("judul", form.judul.trim());
    body.append("deskripsi", form.deskripsi.trim());
    body.append("targetDana", form.targetDana);
    if (file) body.append("image", file);
    if (removeImage) body.append("removeImage", "true");

    setSaving(true);
    try {
      const response = isEdit ? await API.put(`/program/${program.id}`, body) : await API.post("/program", body);
      onSaved(response.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Program tidak dapat disimpan. Silakan coba lagi."));
    } finally {
      setSaving(false);
    }
  };

  const visibleImage = previewUrl || (!removeImage ? program?.imageUrl : null);
  return <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4" role="presentation">
    <div className="bg-white rounded-3xl max-w-lg w-full max-h-[calc(100dvh-32px)] overflow-y-auto shadow-2xl border border-slate-100 text-left" role="dialog" aria-modal="true" aria-labelledby="program-form-title">
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 p-6 text-white flex justify-between items-center">
        <div className="flex items-center gap-3"><ImagePlus className="w-5 h-5 text-amber-300" /><div>
          <h3 id="program-form-title" className="font-extrabold text-sm tracking-tight">{isEdit ? "Edit Program Donasi" : "Tambah Program Donasi"}</h3>
          <p className="text-[11px] text-emerald-200/80">Kelola informasi dan gambar utama program</p>
        </div></div>
        <button type="button" onClick={onClose} disabled={saving} aria-label="Tutup form program" className="text-emerald-300 hover:text-white p-1 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
      </div>

      <form onSubmit={submit} className="p-6 space-y-4 text-xs font-bold text-slate-700">
        <div><label htmlFor="program-title" className="block mb-1.5">Judul Program</label><input id="program-title" type="text" required value={form.judul} onChange={(event) => setForm({ ...form, judul: event.target.value })} className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white" /></div>
        <div><label htmlFor="program-target" className="block mb-1.5">Target Dana (Rp)</label><input id="program-target" type="number" required min="1" value={form.targetDana} onChange={(event) => setForm({ ...form, targetDana: event.target.value })} className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white" /></div>
        <div><label htmlFor="program-description" className="block mb-1.5">Deskripsi Lengkap</label><textarea id="program-description" rows="3" required value={form.deskripsi} onChange={(event) => setForm({ ...form, deskripsi: event.target.value })} className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white" /></div>

        <div><span className="block mb-1.5">Gambar Utama Program</span>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Pilih gambar utama program" onChange={(event) => selectFile(event.target.files?.[0])} />
          <div className={`rounded-xl border-2 border-dashed p-3 transition ${dragging ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-slate-50"}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files?.[0]); }}>
            <ProgramImage imageUrl={visibleImage} title={form.judul || "baru"} className="program-upload-preview rounded-lg" loading="eager" />
            <p className="mt-2 text-[11px] font-medium text-slate-500">Tarik gambar ke sini atau pilih dari perangkat. Gunakan foto lanskap agar tampil rapi pada kartu. JPG, PNG, WebP · maksimal 5 MB.</p>
            {file && <p className="mt-1 text-[11px] text-emerald-700 font-semibold truncate">{file.name}</p>}
            <div className="flex flex-wrap gap-2 mt-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="dashboard-button dashboard-button-secondary inline-flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" />{visibleImage ? "Ganti Gambar" : "Pilih Gambar"}</button>
              {(visibleImage || removeImage) && <button type="button" onClick={clearImage} disabled={removeImage && !file} className="dashboard-button dashboard-button-secondary inline-flex items-center gap-1.5 text-rose-600"><Trash2 className="w-3.5 h-3.5" />Hapus Gambar</button>}
            </div>
          </div>
        </div>

        {error && <p role="alert" className="rounded-xl bg-rose-50 text-rose-700 px-3 py-2 font-medium">{error}</p>}
        <div className="flex gap-2.5 pt-3"><button type="button" onClick={onClose} disabled={saving} className="dashboard-button dashboard-button-secondary w-1/2">Batal</button><button type="submit" disabled={saving} className="dashboard-button dashboard-button-primary w-1/2">{saving ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan Program"}</button></div>
      </form>
    </div>
  </div>;
}
