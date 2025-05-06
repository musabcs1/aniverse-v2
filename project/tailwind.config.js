/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff0000',
          light: '#ff3333',
          dark: '#cc0000',
        },
        secondary: {
          DEFAULT: '#990000',
          light: '#b30000',
          dark: '#800000',
        },
        accent: {
          DEFAULT: '#ff5555',
          light: '#ff7777',
          dark: '#cc4444',
        },
        background: {
          DEFAULT: '#330000',
          light: '#4d0000',
          dark: '#200000',
        },
        surface: {
          DEFAULT: '#4d0000',
          light: '#660000',
          dark: '#330000',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { 'text-shadow': '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ff0000, 0 0 20px #ff0000' },
          '100%': { 'text-shadow': '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #ff0000, 0 0 40px #ff0000' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(rgba(51, 0, 0, 0.8), rgba(51, 0, 0, 0.8)), url("https://images.pexels.com/photos/3732475/pexels-photo-3732475.jpeg")',
      },
    },
  },
  plugins: [],
};