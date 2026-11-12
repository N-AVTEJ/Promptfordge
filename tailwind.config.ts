import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        forge: {
          950: "#07080A",
          black: "#0B0C0E",
          surface: "#121417",
          elevated: "#171B21",
          overlay: "#1F242D",
          border: "#232832",
          "border-bright": "#373F4E",
          text: "#F5F6F8",
          muted: "#9BA1AD",
          subtle: "#5A6272",
        },
        ember: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#FF6B00",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
          DEFAULT: "#FF6B00",
        },
        cyan: {
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#00E5FF",
          600: "#00B4D8",
          700: "#0891B2",
          800: "#0E7490",
          900: "#155E75",
          DEFAULT: "#00E5FF",
        },
      },
      borderRadius: {
        forge: "6px",
        "forge-sm": "4px",
        "forge-md": "8px",
        "forge-lg": "12px",
        "forge-xl": "16px",
        "forge-2xl": "24px",
        "forge-full": "9999px",
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },
      spacing: {
        forge: "1rem",
        "forge-xs": "0.25rem",
        "forge-sm": "0.5rem",
        "forge-md": "1rem",
        "forge-lg": "1.5rem",
        "forge-xl": "2rem",
        "forge-2xl": "3rem",
        "forge-3xl": "4rem",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      fontSize: {
        "display-2xl": [
          "4.5rem",
          { lineHeight: "1.02", letterSpacing: "-0.04em" },
        ],
        "display-xl": [
          "3.75rem",
          { lineHeight: "1.05", letterSpacing: "-0.035em" },
        ],
        "display-lg": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        "heading-xl": [
          "2.25rem",
          { lineHeight: "1.2", letterSpacing: "-0.025em" },
        ],
        "heading-lg": [
          "1.75rem",
          { lineHeight: "1.25", letterSpacing: "-0.02em" },
        ],
        "heading-md": [
          "1.375rem",
          { lineHeight: "1.3", letterSpacing: "-0.015em" },
        ],
        "forge-code": [
          "0.875rem",
          { lineHeight: "1.6", letterSpacing: "-0.01em" },
        ],
      },
      boxShadow: {
        "ember-glow": "0 0 25px -4px rgba(255, 107, 0, 0.35)",
        "ember-sm": "0 0 12px -2px rgba(255, 107, 0, 0.25)",
        "cyan-glow": "0 0 25px -4px rgba(0, 229, 255, 0.3)",
        "cyan-sm": "0 0 12px -2px rgba(0, 229, 255, 0.2)",
        forge: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        shimmer: "shimmer 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
