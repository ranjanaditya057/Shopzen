import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Swap these two lines to re-theme the entire store.
        brand: colors.teal,
        accent: colors.amber,
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        "slide-in": { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "toast-in": {
          from: { opacity: 0, transform: "translateY(12px) scale(.98)" },
          to: { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
      },
      animation: {
        "slide-in": "slide-in .25s ease-out",
        "fade-in": "fade-in .2s ease-out",
        "toast-in": "toast-in .2s ease-out",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
