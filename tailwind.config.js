/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/views/**/*.ejs", "./src/public/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#0A0A0C",
          900: "#121214",
          800: "#1B1B1F",
          700: "#28282D",
          600: "#3A3A41",
        },
        gold: {
          300: "#E7D3A1",
          400: "#D8B978",
          500: "#C9A45C",
          600: "#AD8845",
          700: "#8C6B33",
        },
        cream: {
          50: "#FBF9F5",
          100: "#F4EFE6",
          200: "#EAE1D1",
        },
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        gold: "0 8px 30px -8px rgba(201, 164, 92, 0.45)",
      },
    },
  },
  plugins: [],
};
