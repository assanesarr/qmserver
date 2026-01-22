/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './views/**/*.ejs',
    './**/*.js'
  ],
  theme: {
    extend: {
        animation: {
        marquee: 'marquee 12s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    }
  }
};