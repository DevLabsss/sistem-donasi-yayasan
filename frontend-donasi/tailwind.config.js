/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "system-ui",
          "-apple-system",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        // Hijau institusional: 900 = primer, 700 = sekunder
        brand: {
          50: "#F1F7F4",
          100: "#DDEBE4",
          200: "#BBD7C9",
          700: "#15803D",
          800: "#0B6B3A",
          900: "#064E3B",
          950: "#043D2E",
        },
        // Emas: hanya untuk satu aksi utama dan penanda penting
        gold: {
          100: "#FEF3C7",
          500: "#F59E0B",
          700: "#B45309",
          900: "#78350F",
        },
        paper: "#FAF8F4",
        ink: {
          DEFAULT: "#1C1917",
          muted: "#57534E",
          faint: "#78716C",
        },
        line: "#E7E2D9",
      },
      // Satu bahasa radius untuk seluruh situs: maksimal 8px (kecuali rounded-full).
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "6px",
        lg: "8px",
        xl: "8px",
        "2xl": "8px",
        "3xl": "8px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
