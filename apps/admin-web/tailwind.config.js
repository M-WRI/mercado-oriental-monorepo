import baseConfig from "@mercado/config/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [baseConfig],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/shared-ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        "5xl": ["3rem", { lineHeight: "1.2" }],
        "4xl": ["2.5rem", { lineHeight: "1.3" }],
        "3xl": ["2rem", { lineHeight: "1.4" }],
        "2xl": ["1.5rem", { lineHeight: "1.5" }],
        xl: ["1.25rem", { lineHeight: "1.5" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
        base: ["1rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
      },
    },
  },
};
