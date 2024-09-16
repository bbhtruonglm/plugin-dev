/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      screens: {
        xxs: '320px', // Custom extra extra small breakpoint
        xs: '450px', // Custom extra small breakpoint
        mds: '400px',
        '2xl': '1440px', // Custom extra large breakpoint
      },
      fontSize: {
        xxs: '10px',
      },
      backgroundImage: {
        'bg-gradient':
          'linear-gradient(to right,  #EEEDF3 0%, #EFEEF4 7%,   #EFECF3 14%,   #F0EDF4 21%,   #F2ECF4 29%,   #EFECF3 36%,   #EEEBF6 43%,   #EBEAF9 50%,   #E8E8F8 57%,   #E6E7F8 64%,   #E4E5F9 71%,   #E3E4F8 79%,   #E2E3F8 86%,   #E0E0FC 93%,   #DCDFFC 100%);',
      },
      colors: {
        primary: '#4a90e2', // Your custom color
        scrollbarTrack: '#f1f1f1',
        scrollbarThumb: '#4a90e2',
        colorOpacity: '#64748B',
        messBg: '#FEF8E4',
        bgBtnBold: '#1E293B',
        bgBtnLight: '#475569',
        textYellow: '#FEF08A',
        onlineColor: '#22C55E',
        inputBg: '#F3F4F7',
      },
      // animation: {
      //   spinSlow: 'spin 3s linear infinite', // Adding a slower spin animation
      // },
      keyframes: {
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        scale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.5)' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },
        zoomInBottomRight: {
          '0%': {
            transform: 'scale(0)',
            transformOrigin: 'bottom right',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1)',
            transformOrigin: 'bottom right',
            opacity: '1',
          },
        },
        zoomOutTopLeft: {
          '0%': {
            transform: 'scale(1)',
            opacity: '1',
            transformOrigin: 'bottom right',
          },
          '100%': {
            transform: 'scale(0)',
            opacity: '0',
            transformOrigin: 'bottom right',
          },
        },
      },
      animation: {
        spinSlow: 'spin 3s linear infinite', // Adding a slower spin animation
        bounce: 'bounce 1s infinite',
        scale: 'scale 1s infinite',
        zoomIn: 'zoomIn 0.2s ease-in-out forwards',
        zoomInBottomRight: 'zoomInBottomRight 0.2s ease-in-out forwards',
        zoomOutTopLeft: 'zoomOutTopLeft 0.2s ease-in-out forwards',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#7217bd3f transparent',
        },
        '.scrollbar-webkit': {
          '&::-webkit-scrollbar': {
            //do day cua scroll
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            // mau nen scroll
            background: 'transparent',
          },

          '&::-webkit-scrollbar-thumb': {
            // mau scroll
            backgroundColor: '#7217bd3f',
            //bo goc scroll
            borderRadius: '6px',
          },
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    },
  ],
}
