/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0a0a0f",
          card: "#14141e",
          surface: "#1a1a26",
          border: "rgba(255, 255, 255, 0.08)",
          muted: "#8e8ea0",
        },
        accent: {
          cyan: "#4facfe",
          blue: "#00f2fe",
          purple: "#7f00ff",
        },
      },
      boxShadow: {
        "neu-raised": "6px 6px 14px #06060a, -6px -6px 14px #1a1a28",
        "neu-pressed": "inset 4px 4px 8px #06060a, inset -4px -4px 8px #1a1a28",
        "glow-cyan": "0 0 20px rgba(79, 172, 254, 0.45), 0 0 40px rgba(79, 172, 254, 0.2)",
        "glow-cyan-sm": "0 0 10px rgba(79, 172, 254, 0.5)",
      },
    },
  },
  plugins: [],
};
