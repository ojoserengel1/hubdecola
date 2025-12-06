/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF002E',
        dark: '#03041A',
        background: '#F9F9F9',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontWeight: {
        black: '900',
        semibold: '600',
        regular: '400',
      },
    },
  },
  plugins: [],
};

