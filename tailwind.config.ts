import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch "Serene Academic Mindfulness System"
        primary: {
          DEFAULT: "#065F46",
          dark:    "#044E3A",
          light:   "#ECFDF5",
          50:      "#F0FDF4",
          100:     "#DCFCE7",
          200:     "#A7F3D0",
          600:     "#059669",
          700:     "#065F46",
          800:     "#044E3A",
          900:     "#002116",
        },
        secondary: {
          DEFAULT: "#1E3A8A",
          light:   "#EFF6FF",
          500:     "#4059aa",
          700:     "#1E3A8A",
          800:     "#1e3a8a",
        },
        teal: {
          DEFAULT: "#0D9488",
          light:   "#CCFBF1",
          500:     "#14B8A6",
          600:     "#0D9488",
          700:     "#0F766E",
        },
        surface: {
          DEFAULT: "#F8FAFC",
          card:    "#FFFFFF",
          low:     "#F2F4F6",
          border:  "#E2E8F0",
        },
        slate: {
          50:  "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      fontFamily: {
        sans:     ["Plus Jakarta Sans", "Sarabun", "Inter", "sans-serif"],
        body:     ["Inter", "Sarabun", "sans-serif"],
        thai:     ["Sarabun", "sans-serif"],
        mono:     ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card:   "0 1px 3px 0 rgba(6,95,70,0.04), 0 1px 2px -1px rgba(6,95,70,0.04)",
        hover:  "0 4px 12px -2px rgba(6,95,70,0.08), 0 2px 6px -1px rgba(30,58,138,0.05)",
        modal:  "0 20px 25px -5px rgba(15,23,42,0.08), 0 8px 10px -6px rgba(15,23,42,0.04)",
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "16px",
        xl: "24px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
