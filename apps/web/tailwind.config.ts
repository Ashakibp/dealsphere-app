import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F9FAFB",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#1B365D",
          hover: "#2A4975",
          light: "#3D5A8C",
        },
        accent: {
          DEFAULT: "#00A896",
          hover: "#00BFA8",
        },
        semantic: {
          success: "#16A34A",
          warning: "#F59E0B",
          danger: "#DC2626",
        },
        text: {
          primary: "#111827",
          secondary: "#374151",
          muted: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        h1: ["32px", { lineHeight: "1.2", fontWeight: "600" }],
        h2: ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "1.4", fontWeight: "500" }],
        body: ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        small: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      borderRadius: {
        card: "8px",
        pill: "9999px",
      },
      boxShadow: {
        soft: "0 2px 4px rgba(0, 0, 0, 0.08)",
        card: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
        elevated: "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
      },
      animation: {
        slideIn: "slideIn 0.2s ease-out",
        slideOut: "slideOut 0.2s ease-in",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideOut: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config;