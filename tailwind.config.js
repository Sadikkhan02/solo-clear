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
        background: "#f0f4f8",
        surface: "#ffffff",
        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#ec4899",
        text: {
          primary: "#1a1a2e",
          secondary: "#4a4a6a",
          muted: "#8a8a9e",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        // Backward-compatible fallback mappings
        dark: {
          bg: "#f0f4f8",
          card: "#ffffff",
          surface: "#f8fafc",
          border: "rgba(0, 0, 0, 0.08)",
          muted: "#8a8a9e",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        sm: "0 2px 8px rgba(0, 0, 0, 0.04)",
        card: "0 4px 24px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 8px 32px rgba(99, 102, 241, 0.12)",
        "glow-primary": "0 0 24px rgba(99, 102, 241, 0.3)",
        "glow-accent": "0 0 20px rgba(236, 72, 153, 0.3)",
        "neu-raised": "4px 4px 12px rgba(0, 0, 0, 0.05), -4px -4px 12px rgba(255, 255, 255, 0.8)",
        "neu-pressed": "inset 2px 2px 6px rgba(0, 0, 0, 0.06), inset -2px -2px 6px rgba(255, 255, 255, 0.7)",
        "glow-cyan": "0 0 20px rgba(99, 102, 241, 0.35)",
        "glow-cyan-sm": "0 0 10px rgba(99, 102, 241, 0.4)",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
    },
  },
  plugins: [],
};
