import { useEffect, useState } from "react";
import { foundation } from "../data/foundation";
import { X, Send } from "lucide-react";

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.getElementById("kontak");
    if (!footer || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      setFooterVisible(entry.isIntersecting);
    }, { rootMargin: "0px 0px -72px 0px" });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // Nomor WhatsApp resmi Yayasan, dengan kode negara dan tanpa tanda +.
  const noHp = foundation.whatsapp;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const phoneNumber = noHp.replace(/\D/g, "");
    if (!phoneNumber) return;

    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message.trim())}`;
    const whatsappWindow = window.open(waUrl, "_blank");

    // Keep the draft if the browser blocks the new tab so the user can retry.
    if (!whatsappWindow) return;
    whatsappWindow.opener = null;

    setMessage("");
    setIsOpen(false);
  };

  if (footerVisible && !isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Widget Pop-up Chatbot */}
      {isOpen && (
        <div
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[min(20rem,calc(100vw-2rem))] mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
          role="dialog"
          aria-label="Layanan bantuan WhatsApp"
        >
          {/* Header Chat */}
          <div className="bg-emerald-700 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
                {/* Logo SVG Resmi WhatsApp di Header */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-sm">Layanan Bantuan</h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>{" "}
                  Online | Yayasan Mulia Karya Bersama
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg transition"
              aria-label="Tutup layanan bantuan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Chat / Pesan Otomatis */}
          <div className="p-4 bg-slate-50 space-y-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-gray-100 text-gray-700 shadow-sm leading-relaxed">
              Assalamu'alaikum/Halo! 👋
              <br />
              <br />
              Ada yang bisa kami bantu terkait program infaq, sedekah, atau
              informasi Yayasan Mulia Karya Bersama?
            </div>
          </div>

          {/* Form Input Pesan */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              aria-label="Pesan WhatsApp"
              placeholder="Tulis pesan Anda..."
              className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-600"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              aria-label="Kirim pesan melalui WhatsApp"
              disabled={!message.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-xl transition flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Tombol Floating WhatsApp Button dengan Logo Resmi */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="bg-emerald-700 hover:bg-emerald-800 text-white w-14 h-14 rounded-full shadow-xl transition-transform hover:scale-105 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
        title="Hubungi Kami via WhatsApp"
        aria-label={
          isOpen
            ? "Tutup layanan bantuan WhatsApp"
            : "Buka layanan bantuan WhatsApp"
        }
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7 text-white"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </button>
    </div>
  );
}
