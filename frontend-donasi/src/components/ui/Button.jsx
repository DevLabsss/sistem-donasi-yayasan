import { Loader2 } from "lucide-react";

const VARIAN = {
  // Aksi utama halaman (hijau tua)
  primary:
    "bg-brand-900 text-white hover:bg-brand-950 disabled:hover:bg-brand-900",
  // Satu-satunya penggunaan emas: ajakan donasi utama
  accent:
    "bg-gold-500 text-brand-950 hover:bg-amber-400 disabled:hover:bg-gold-500",
  secondary:
    "border border-brand-900/30 bg-white text-brand-900 hover:border-brand-900 hover:bg-brand-50",
  ghost: "text-brand-900 hover:bg-brand-50",
  danger: "text-red-700 hover:bg-red-50",
};

const UKURAN = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  children,
  disabled,
  type,
  ...rest
}) {
  const isButton = Tag === "button";
  return (
    <Tag
      type={isButton ? type || "button" : undefined}
      disabled={isButton ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${VARIAN[variant]} ${UKURAN[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="h-4 w-4" aria-hidden="true" />
      )}
      {children}
    </Tag>
  );
}
