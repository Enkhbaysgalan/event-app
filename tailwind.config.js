/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        primary: {
          DEFAULT: "#05ff23",
          light: "#00DF81",
          dark: "#06302B",
        },
        secondary: {
          DEFAULT: "#d946ef",  // fuchsia-500
          light: "#e879f9",    // fuchsia-400
          dark: "#c026d3",     // fuchsia-600
        },
        surface: {
          DEFAULT: "#1a1a26",  // card background
          deep: "#0c0c12",     // page background
          raised: "#1e1e2e",   // elevated elements
        },
        accent: "#f59e0b",     // amber — for highlights
      },
    },
  },
  plugins: [],
};