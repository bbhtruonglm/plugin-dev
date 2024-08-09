/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4a90e2", // Your custom color
        scrollbarTrack: "#f1f1f1",
        scrollbarThumb: "#4a90e2",
        colorOpacity: "#64748B",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-thin": {
          // scrollbarWidth: "thin",
          scrollbarColor: "#7217bd3f",
        },
        ".scrollbar-webkit": {
          "&::-webkit-scrollbar": {
            //do day cua scroll
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            // mau nen scroll
            background: "transparent",
          },

          "&::-webkit-scrollbar-thumb": {
            // mau scroll
            backgroundColor: "#7217bd3f",
            //bo goc scroll
            borderRadius: "6px",
          },
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
