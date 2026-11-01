import { useState } from "react";
import logoYayasan from "../assets/logo-yayasan.png";
import "../styles/program-image.css";

export default function ProgramImage({ imageUrl, title, className = "", loading = "lazy" }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const showImage = typeof imageUrl === "string" && imageUrl.length > 0 && failedUrl !== imageUrl;

  return <div className={`program-image ${className}`}>
    {showImage ? <img src={imageUrl} alt={`Gambar program ${title}`} loading={loading} decoding="async" onError={() => setFailedUrl(imageUrl)} /> : <div className="program-image-fallback">
      <img src={logoYayasan} alt={`Logo Yayasan Mulia Karya Bersama, pengganti gambar program ${title}`} />
      <span>Yayasan Mulia Karya Bersama</span>
    </div>}
  </div>;
}
