// Kelas input standar agar semua kolom formulir konsisten.
export const inputClass = (invalid) =>
  `h-11 w-full rounded-md border bg-white px-3.5 text-base text-ink placeholder:text-ink-faint transition-colors focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/25 ${
    invalid ? "border-red-600" : "border-line"
  }`;
