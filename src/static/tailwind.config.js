/** @type {import('tailwindcss').Config} */
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["*.{html,js}"],
  theme: {
    fontFamily: {
      sans: ["Inter", ...fontFamily.sans],
    },
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "768px",
        md: "768px",
        lg: "768px",
        xl: "768px",
      },
    },
    extend: {
      cursor: {
        crosshair: "crosshair",
      },
    },
  },
  variants: {
    extend: {
      ringWidth: ["focus-visible"],
    },
  },
  plugins: [],
};
