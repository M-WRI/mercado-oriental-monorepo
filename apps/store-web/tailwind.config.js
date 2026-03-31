import baseConfig from "@mercado/config/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [baseConfig],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/shared-ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};
