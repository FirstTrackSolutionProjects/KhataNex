/** @type {import('tailwindcss').Config} */
// KhataNex palette — sampled from the logo (deep violet -> indigo gradient, white mark).
// Logo gradient runs roughly #4B1D9C (top-left) -> #2D1A8A (bottom-right).
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F5F1FF",
          100: "#EBE3FF",
          200: "#D6C6FF",
          300: "#B99DFF",
          400: "#9A70F5",
          500: "#7B47E3",
          600: "#6330C8",
          700: "#4F23A8",
          800: "#3D1B86",
          900: "#2D1568",
          950: "#1B0B45",
        },
        // Warm accent (rupee-gold) used sparingly for highlights and key CTAs.
        accent: {
          300: "#FFD27A",
          400: "#FFBF47",
          500: "#F5A524",
          600: "#D98A0B",
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        brand: "0 8px 24px -8px rgba(75, 29, 156, 0.35)",
        "brand-lg": "0 30px 60px -20px rgba(45, 26, 138, 0.45)",
      },
    },
  },
  plugins: [],
};