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
        primary: "#1db233",
        secondary: {  
          DEFAULT: "#f8bf3b", 
        },
        surface: {
          DEFAULT: "#1a1a26",  // card background
          deep: "#170e13",     // page background
          raised: "#1e1e2e",   // elevated elements
        },
        accent: "#f59e0b",     // amber — for highlights
      },
    },
  },
  plugins: [],
};