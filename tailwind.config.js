const colors = require("tailwindcss/colors");
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ["./public/index.html"],
  darkMode: false,
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
      colors: {
        gray: {
          ...colors.gray,
          1000: "#050505",
        },
      },
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
