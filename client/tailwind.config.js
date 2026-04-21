/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1e293b",
        accent: "#0ea5e9",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      animation: {
        slideUp: "slideUp 0.6s ease-out",
        fadeIn: "fadeIn 0.5s ease-in",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
