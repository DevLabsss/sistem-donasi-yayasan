/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#073f33",
        primaryHover: "#0e5444",
        secondary: "#0e5444",
        secondaryHover: "#065f46",
        accent: "#f5821f",
        accentHover: "#dd6a0b",
        surface: "#ffffff",
        surfaceAlt: "#fcfaf6",
        subtleGreen: "#0e5444",
        mutedSurface: "#3c096c",
        border: "#dfe8e2",
        textPrimary: "#172e27",
        textSecondary: "#5b6d66",
        success: "#059669",
        warning: "#f59e0b",
        error: "#be123c",
        focusRing: "#10b981",
        disabled: "#94a3b8",
      },
      fontFamily: {
        sans: [
          "'Plus Jakarta Sans'",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};