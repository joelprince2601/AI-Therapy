/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        'sound-wave': {
          '0%, 100%': { height: '4px' },
          '50%': { height: '16px' }
        },
        'sound-wave-speaking': {
          '0%, 100%': { height: '6px' },
          '50%': { height: '14px' }
        },
        'sound-wave-random': {
          '0%': { height: '4px' },
          '20%': { height: '12px' },
          '40%': { height: '8px' },
          '60%': { height: '18px' },
          '80%': { height: '6px' },
          '100%': { height: '4px' }
        }
      },
      animation: {
        'sound-wave': 'sound-wave 0.8s ease-in-out infinite',
        'sound-wave-speaking': 'sound-wave-speaking 1s ease-in-out infinite',
        'sound-wave-random': 'sound-wave-random 1.2s ease-in-out infinite'
      }
    },
  },
  plugins: [],
};
