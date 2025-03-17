/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      height: {
        /** Thay thế cho 100vh */
        screen_dvh: '100dvh',
      },
      width: {
        /** Thay thế cho 100vw */
        screen_dvw: '100dvw',
      },
      spacing: {
        '1px': '1px',
      },
      /** Tạo tiện ích tùy chỉnh cho mask */
      maskImage: {
        'rounded-oval':
          "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' fill='none'%3E%3Cpath fill='%23000' d='M100 0C20 0 0 20 0 100s20 100 100 100 100-20 100-100S180 0 100 0z'/%3E%3C/svg%3E\")",
      },

      fontSize: {
        xxs: '10px',
      },
      backgroundImage: {
        'bg-gradient':
          'linear-gradient(to right,  #EEEDF3 0%, #EFEEF4 7%,   #EFECF3 14%,   #F0EDF4 21%,   #F2ECF4 29%,   #EFECF3 36%,   #EEEBF6 43%,   #EBEAF9 50%,   #E8E8F8 57%,   #E6E7F8 64%,   #E4E5F9 71%,   #E3E4F8 79%,   #E2E3F8 86%,   #E0E0FC 93%,   #DCDFFC 100%);',
      },
      colors: {
        primary: '#4a90e2',
        scrollbarTrack: '#f1f1f1',
        scrollbarThumb: '#4a90e2',
        colorOpacity: '#64748B',
        messBg: '#FEF8E4',
        bgBtnBold: '#1E293B',
        bgBtnLight: '#475569',
        textYellow: '#FEF08A',
        onlineColor: '#22C55E',
        inputBg: '#F3F4F7',
        'slate-500': '#64748b',
        'slate-100': '#e2e8f0',
        'blue-500': '#3b82f6',
        'ai-bg': '#f5f5f5',
      },

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
          typing: {
            '0%': { content: '"."' },
            '33%': { content: '".."' },
            '66%': { content: '"..."' },
          },
          blink: {
            '0%': { opacity: '1' },
            '50%': { opacity: '0' },
          },
          jumping: {
            '0%, 80%, 100%': { transform: 'translateY(0)' },
            '40%': { transform: 'translateY(-8px)' },
          },
        },
        zoomInBottomLeft: {
          '0%': {
            transform: 'scale(0)',
            transformOrigin: 'bottom left',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1)',
            transformOrigin: 'bottom left',
            opacity: '1',
          },
        },
        zoomOutTopRight: {
          '0%': {
            transform: 'scale(1)',
            opacity: '1',
            transformOrigin: 'top right',
          },
          '100%': {
            transform: 'scale(0)',
            opacity: '0',
            transformOrigin: 'top right',
          },
        },
        typing: {
          '0%': { content: '"."' },
          '33%': { content: '".."' },
          '66%': { content: '"..."' },
        },
        blink: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        jumping: {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-6px)' },
        },
      },

      animation: {
        spinSlow: 'spin 3s linear infinite', // Adding a slower spin animation
        bounce: 'bounce 1s infinite',
        scale: 'scale 1s infinite',
        zoomIn: 'zoomIn 0.2s ease-in-out forwards',
        zoomInBottomRight: 'zoomInBottomRight 0.2s ease-in-out forwards',
        zoomOutTopLeft: 'zoomOutTopLeft 0.2s ease-in-out forwards',
        zoomInBottomLeft: 'zoomInBottomLeft 0.2s ease-in-out forwards',
        zoomOutTopRight: 'zoomOutTopRight 0.2s ease-in-out forwards',
        typing: 'typing 1.5s infinite',
        blink: 'blink 0.6s infinite',
        jumping: 'jumping 1s infinite',
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

        '.progress-bar': {
          '-webkit-appearance': 'none',
          appearance: 'none',
          width: '100%',
          height: '4px',
          'border-radius': '9999px',
          'background-color': '#e2e8f0', // bg-slate-100
          cursor: 'pointer',
          overflow: 'hidden',
        },
        '.progress-bar::-webkit-slider-runnable-track': {
          'background-color': '#e2e8f0', // bg-slate-100
          height: '4px',
        },
        '.progress-bar::-webkit-slider-thumb': {
          '-webkit-appearance': 'none',
          appearance: 'none',
          width: '4px',
          height: '4px',
          'background-color': '#000', // Thumb màu đen
          'border-radius': '50%',
          'margin-top': '-4px',
          cursor: 'pointer',
        },
        '.progress-bar::-moz-range-track': {
          'background-color': '#e2e8f0', // bg-slate-100
          height: '4px',
        },
        '.progress-bar::-moz-range-thumb': {
          width: '12px',
          height: '12px',
          'background-color': '#000', // Thumb màu đen
          'border-radius': '50%',
          cursor: 'pointer',
        },
        '.progress-bar::-webkit-slider-runnable-track': {
          background:
            'linear-gradient(to right, black var(--progress), #e2e8f0 var(--progress))', // Màu đen khi đã chạy
        },

        '.mask-rounded-oval': {
          'mask-position': 'center', // Đặt vị trí mask
          'mask-repeat': 'no-repeat', // Không lặp lại
          'mask-size': 'contain', // Mask có kích thước vừa khít
          'mask-image':
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' fill='none'%3E%3Cpath fill='%23000' d='M100 0C20 0 0 20 0 100s20 100 100 100 100-20 100-100S180 0 100 0z'/%3E%3C/svg%3E\")",
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    },
  ],
}
