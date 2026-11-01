/**
 * Helper kompresi gambar struk/bukti transfer donasi
 * Mengubah file gambar berukuran besar (2-5MB) menjadi gambar JPEG ringan (~50-100KB)
 * sehingga tidak melebihi batasan kuota localStorage browser dan tampil instan.
 */
export async function compressImage(
  file,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.75,
) {
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gagal memproses gambar"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // Background putih untuk format JPEG jika input PNG transparan
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Hapus bukti transfer dari localStorage
 */
export function hapusBuktiDonasi(donasiId) {
  if (!donasiId) return;
  try {
    localStorage.removeItem(`bukti_donasi_${donasiId}`);
  } catch { /* Storage may be unavailable. */ }
}

export function bersihkanCacheBuktiLama() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (/^bukti_donasi_\d+$/.test(key)) localStorage.removeItem(key);
    }
  } catch { /* Storage may be unavailable. */ }
}

/**
 * Format URL foto profil pengguna agar dapat ditampilkan baik dari
 * format base64 lokal maupun path static backend (/uploads/avatars/...).
 */
export function getAvatarUrl(foto) {
  if (!foto) return null;
  if (
    foto.startsWith("data:") ||
    foto.startsWith("blob:") ||
    foto.startsWith("http://") ||
    foto.startsWith("https://")
  ) {
    return foto;
  }
  const backendBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
    : "http://localhost:3000";
  return `${backendBase}${foto.startsWith("/") ? "" : "/"}${foto}`;
}
