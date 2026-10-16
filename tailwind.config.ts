import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488", // primary healthcare teal
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        navy: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9ddfe",
          500: "#0284c7",
          600: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        coral: {
          500: "#f97316", // warm accent CTA
          600: "#ea580c",
        },
        urgency: {
          green: "#10b981",
          amber: "#f59e0b",
          red: "#ef4444",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
