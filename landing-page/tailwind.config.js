/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      colors: {
        // FocusBear dark theme
        dark: {
          bg: '#060606',
          card: '#0d0d0d',
          border: '#1a1a1a',
        },
        // Brand colors
        primary: '#0E75B6', // Bear Blue
        secondary: '#6C5CE7', // Focus Purple
        accent: '#1bff6e', // Bright Green (main accent)
        success: '#55EFC4', // Success Green
        warning: '#FF9F43', // Warning Orange
        danger: '#D63031', // Alert Red
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },

  plugins: [],
};
