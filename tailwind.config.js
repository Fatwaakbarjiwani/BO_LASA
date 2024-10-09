/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "node_modules/flowbite-react/lib/esm/**/*.js",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        Inter: ["Inter", "sans-serif"],
        Montserrat: ["Montserrat", "sans - serif"],
        Madimi: ["Madimi One", "sans-serif"],
      },
      colors: {
        primary: "#69C53E",
        second: "#E6EAEE",
        thirt: "#B65C60",
        fourth: "#A43338",
      },
      fontSize: {
        y: "40px",
      },
      screens: {
        xs: "370px",
        as: "240px",
        bs: "380px",
        cs: "490px",
        ds: "1200px",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".text-stroke": {
          "-webkit-text-stroke": "1px #A43338",
          color: "white",
        },
        ".text-stroke2": {
          "-webkit-text-stroke": "1/2px #A43338",
          color: "white",
        },
      };

      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
