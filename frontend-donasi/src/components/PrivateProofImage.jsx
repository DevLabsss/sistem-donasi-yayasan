import { useEffect, useState } from "react";
import API from "../services/api";

export default function PrivateProofImage({ donationId, proof, alt, ...imageProps }) {
  const [source, setSource] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!proof) return undefined;
    if (proof.startsWith("data:image/") || proof.startsWith("blob:")) return undefined;
    let active = true;
    let objectUrl;
    API.get(`/donasi/${donationId}/bukti`, { responseType: "blob" })
      .then(({ data }) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(data);
        setSource(objectUrl);
        setError(false);
      })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [donationId, proof]);

  if (error) return <p role="status" className="p-3 text-sm text-slate-500">Bukti pembayaran tidak dapat dimuat.</p>;
  const src = proof?.startsWith("data:image/") || proof?.startsWith("blob:") ? proof : source;
  if (!src) return <p role="status" className="p-3 text-sm text-slate-500">Memuat bukti pembayaran…</p>;
  return <img {...imageProps} src={src} alt={alt} />;
}
