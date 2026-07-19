import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        racing: {
          red: "#E10600",
          "red-dark": "#9E0000",
        },
        neon: {
          blue: "#00D9FF",
        },
        charcoal: {
          950: "#0A0B0D",
          900: "#111318",
          800: "#181B21",
          700: "#22262E",
          600: "#2E333D",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["SFMono-Regular", "Menlo", "Consolas", "monospace"],
        display: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
      },
      keyframes: {
        "flash-correct": {
          "0%": { backgroundColor: "rgba(34,197,94,0)" },
          "40%": { backgroundColor: "rgba(34,197,94,0.55)" },
          "100%": { backgroundColor: "rgba(34,197,94,0)" },
        },
        "shake-wrong": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-4px)" },
          "40%": { transform: "translateX(4px)" },
          "60%": { transform: "translateX(-3px)" },
          "80%": { transform: "translateX(3px)" },
        },
        "number-pop": {
          "0%": { transform: "scale(0)" },
          "70%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
        "gold-shimmer": {
          "0%": { boxShadow: "0 0 0 rgba(250,204,21,0)" },
          "50%": { boxShadow: "0 0 18px rgba(250,204,21,0.85)" },
          "100%": { boxShadow: "0 0 0 rgba(250,204,21,0)" },
        },
        "track-move": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "200px 0" },
        },
      },
      animation: {
        "flash-correct": "flash-correct 0.6s ease-out",
        "shake-wrong": "shake-wrong 0.4s ease-in-out",
        "number-pop": "number-pop 0.25s ease-out",
        "gold-shimmer": "gold-shimmer 1.4s ease-in-out infinite",
        "track-move": "track-move 3s linear infinite",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
