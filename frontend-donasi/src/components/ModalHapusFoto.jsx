import { Trash2, AlertTriangle } from "lucide-react";

export default function ModalHapusFoto({ isOpen, onClose, onConfirm, deleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in text-left">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transition-all">
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-base font-black text-slate-900 mb-1.5">
            Hapus Foto Profil?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            Foto profil Anda akan dihapus dari server dan diganti dengan avatar default inisial nama.
          </p>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={deleting}
              onClick={onClose}
              className="dashboard-button dashboard-button-secondary"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={deleting}
              onClick={onConfirm}
              className="dashboard-button dashboard-button-danger"
            >
              {deleting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Foto</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
