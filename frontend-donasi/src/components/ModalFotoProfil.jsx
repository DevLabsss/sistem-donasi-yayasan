import { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const CANVAS_SIZE = 320; // Ukuran viewport canvas interaktif (1:1)

export default function ModalFotoProfil(props) {
  return props.isOpen ? <OpenModalFotoProfil {...props} /> : null;
}

function OpenModalFotoProfil({ onClose, onSave, saving }) {
  const [step, setStep] = useState("select"); // "select" | "crop"
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Parameter transformasi crop
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageObjRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const validateFile = (file) => {
    if (!file) {
      return "Pilih file gambar terlebih dahulu.";
    }
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return "Format file tidak didukung. Harap gunakan format JPG, PNG, atau WebP.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Ukuran foto maksimal 2 MB.";
    }
    if (file.size === 0) {
      return "File gambar kosong atau rusak.";
    }
    return null;
  };

  const processSelectedFile = (file) => {
    setErrorMessage("");
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMessage("Gagal membaca file dari perangkat.");
    };
    reader.onload = (e) => {
      const src = e.target.result;
      const img = new Image();
      img.onerror = () => {
        setErrorMessage("File yang dipilih bukan gambar yang valid.");
      };
      img.onload = () => {
        imageObjRef.current = img;
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setStep("crop");
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processSelectedFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processSelectedFile(file);
  };

  // Render crop canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Hitung dimensi dasar gambar agar menutupi kanvas (cover fit)
    const imgAspect = img.width / img.height;
    let drawWidth, drawHeight;

    if (imgAspect > 1) {
      drawHeight = height;
      drawWidth = height * imgAspect;
    } else {
      drawWidth = width;
      drawHeight = width / imgAspect;
    }

    const scaledWidth = drawWidth * zoom;
    const scaledHeight = drawHeight * zoom;

    // Hitung posisi dengan memperhitungkan pan dan titik tengah
    const centerX = width / 2;
    const centerY = height / 2;
    const drawX = centerX - scaledWidth / 2 + pan.x;
    const drawY = centerY - scaledHeight / 2 + pan.y;

    // 1. Gambar foto
    ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);

    // 2. Gambar overlay bayangan melingkar (Circular Mask)
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.65)"; // Dark overlay
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    // Buat lubang lingkaran di tengah
    ctx.arc(centerX, centerY, width / 2 - 12, 0, Math.PI * 2, true);
    ctx.fill();

    // Border lingkaran emas/emerald penunjuk crop
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, width / 2 - 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 3. Render thumbnail circular preview kecil di pojok
    if (previewCanvasRef.current) {
      const pCanvas = previewCanvasRef.current;
      const pCtx = pCanvas.getContext("2d");
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      pCtx.save();
      pCtx.beginPath();
      pCtx.arc(pCanvas.width / 2, pCanvas.height / 2, pCanvas.width / 2, 0, Math.PI * 2);
      pCtx.clip();
      // Skala relatif ke canvas kecil
      const scaleFactor = pCanvas.width / (width - 24);
      pCtx.drawImage(
        img,
        (drawX - 12) * scaleFactor,
        (drawY - 12) * scaleFactor,
        scaledWidth * scaleFactor,
        scaledHeight * scaleFactor,
      );
      pCtx.restore();
    }
  }, [zoom, pan]);

  useEffect(() => {
    if (step === "crop") {
      drawCanvas();
    }
  }, [step, drawCanvas]);

  // Interaksi Pan / Geser Posisi Gambar
  const handleMouseDown = (e) => {
    setIsPanning(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Touch handlers untuk layar sentuh / mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      const touch = e.touches[0];
      dragStartRef.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
    }
  };

  const handleTouchMove = (e) => {
    if (!isPanning || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStartRef.current.x,
      y: touch.clientY - dragStartRef.current.y,
    });
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  // Ekspor hasil potong 1:1 ke Data URL dan kirim ke handler simpan
  const handleSimpanCrop = () => {
    const img = imageObjRef.current;
    if (!img) return;

    // Buat kanvas ekspor beresolusi tinggi 512x512
    const exportSize = 512;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = exportSize;
    exportCanvas.height = exportSize;
    const ctx = exportCanvas.getContext("2d");

    const width = CANVAS_SIZE;
    const height = CANVAS_SIZE;
    const cropRadius = width / 2 - 12;
    const cropDiameter = cropRadius * 2;

    const imgAspect = img.width / img.height;
    let drawWidth, drawHeight;
    if (imgAspect > 1) {
      drawHeight = height;
      drawWidth = height * imgAspect;
    } else {
      drawWidth = width;
      drawHeight = width / imgAspect;
    }

    const scaledWidth = drawWidth * zoom;
    const scaledHeight = drawHeight * zoom;
    const centerX = width / 2;
    const centerY = height / 2;
    const drawX = centerX - scaledWidth / 2 + pan.x;
    const drawY = centerY - scaledHeight / 2 + pan.y;

    // Hitung koordinat relatif dalam crop circle
    const cropLeft = centerX - cropRadius;
    const cropTop = centerY - cropRadius;

    const factor = exportSize / cropDiameter;
    const finalDrawX = (drawX - cropLeft) * factor;
    const finalDrawY = (drawY - cropTop) * factor;
    const finalDrawWidth = scaledWidth * factor;
    const finalDrawHeight = scaledHeight * factor;

    // Background putih bersih
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportSize, exportSize);
    ctx.drawImage(img, finalDrawX, finalDrawY, finalDrawWidth, finalDrawHeight);

    try {
      const dataUrl = exportCanvas.toDataURL("image/jpeg", 0.85);
      onSave(dataUrl);
    } catch {
      setErrorMessage("Gagal memproses potongan gambar.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left transition-all">
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {step === "select" ? "Pilih Foto Profil" : "Atur & Potong Foto"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {step === "select"
                  ? "Unggah foto profil baru Anda"
                  : "Sesuaikan posisi dan perbesaran foto"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="dashboard-icon-button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifikasi Pesan Error */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAHAP 1: PILIH FILE FOTO */}
        {step === "select" && (
          <div className="p-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
            />

            {/* Dropzone Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? "border-emerald-600 bg-emerald-50/70 scale-[0.99]"
                  : "border-slate-200 hover:border-emerald-500 hover:bg-slate-50"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Tarik & lepas foto di sini, atau{" "}
                  <span className="text-emerald-700 underline font-extrabold">
                    pilih dari perangkat
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mendukung format JPG, JPEG, PNG, dan WebP (Maks. 2 MB)
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="dashboard-button dashboard-button-secondary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="dashboard-button dashboard-button-primary"
              >
                <ImageIcon className="w-4 h-4" />
                Pilih File
              </button>
            </div>
          </div>
        )}

        {/* TAHAP 2: CROP & PREVIEW */}
        {step === "crop" && (
          <div className="p-6">
            <div className="flex flex-col items-center justify-center">
              {/* Canvas Viewport dengan Mask Melingkar */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-inner bg-slate-950 flex items-center justify-center select-none">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`cursor-grab active:cursor-grabbing max-w-full touch-none ${
                    isPanning ? "cursor-grabbing" : ""
                  }`}
                  style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
                />

                {/* Floating Preview Bulat Kecil di Pojok Kanan Atas */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/80 flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Hasil
                  </span>
                  <canvas
                    ref={previewCanvasRef}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full border border-emerald-500 shadow-xs"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 text-center">
                Geser gambar untuk menentukan posisi tengah avatar
              </p>

              {/* Slider Kontrol Zoom */}
              <div className="w-full mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, Number((z - 0.1).toFixed(2))))}
                  className="dashboard-icon-button"
                  title="Perkecil"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                />

                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
                  className="dashboard-icon-button"
                  title="Perbesar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="dashboard-icon-button"
                  title="Reset Posisi"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tombol Aksi Bawah */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => setStep("select")}
                className="dashboard-button dashboard-button-secondary dashboard-button-compact"
              >
                Ganti Gambar
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={onClose}
                  className="dashboard-button dashboard-button-secondary"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSimpanCrop}
                  className="dashboard-button dashboard-button-primary"
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan Foto</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
