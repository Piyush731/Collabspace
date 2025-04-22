/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'gradient-pulse': 'gradient-pulse 12s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'gradient-pulse': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      colors: {
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          text: '#f8fafc',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwind-scrollbar'),
    require('@tailwindcss/typography'),
  ],
  safelist: [
    'justify-start',
    'justify-end',
    'bg-blue-600',
    'bg-gray-100',
    'dark',
    'dark:bg-dark-bg',
    'dark:text-dark-text',
    // Add any other dynamic classes you need here
  ],
};