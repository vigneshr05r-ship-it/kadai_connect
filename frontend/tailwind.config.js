/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f5efe0",
        "cream-dark": "#ede3cc",
        parchment: "#e8d9b5",
        "brown-deep": "#3b1f0e",
        brown: "#6b3a1f",
        "brown-mid": "#8b5e3c",
        "brown-light": "#b07d54",
        gold: "#c9921a",
        "gold-light": "#e8b84b",
        "gold-pale": "#f5d98b",
        rust: "#a63d2f",
        green: "#2d6a4f",
        "green-light": "#52b788",
        // legacy aliases
        background: "#f5efe0",
        primary: "#3b1f0e",
        accent: "#c9921a",
        secondary: "#2d6a4f",
        text: "#3b1f0e",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "serif"],
        display: ["'Playfair Display'", "serif"],
        body: ["'Crimson Pro'", "serif"],
        tamil: ["'Noto Serif Tamil'", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 6px -1px rgba(59,31,14,0.08)",
        vintage: "5px 5px 0px 0px rgba(201,146,26,0.3)",
      },
    },
  },
  plugins: [],
};
