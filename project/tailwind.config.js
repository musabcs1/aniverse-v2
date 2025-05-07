/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#9900FF',
          light: '#B347FF',
          dark: '#7500CC',
        },
        secondary: {
          DEFAULT: '#00FFFF',
          light: '#66FFFF',
          dark: '#00CCCC',
        },
        accent: {
          DEFAULT: '#FF00FF',
          light: '#FF66FF',
          dark: '#CC00CC',
        },
        background: {
          DEFAULT: '#080215',
          light: '#150D29',
          dark: '#050113',
        },
        surface: {
          DEFAULT: '#110726',
          light: '#1B0D3E',
          dark: '#0C051A',
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
          '0%': { 'text-shadow': '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #9900FF, 0 0 20px #9900FF' },
          '100%': { 'text-shadow': '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #9900FF, 0 0 40px #9900FF' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(rgba(8, 2, 21, 0.8), rgba(8, 2, 21, 0.8)), url("https://images.pexels.com/photos/3732475/pexels-photo-3732475.jpeg")',
      },
    },
  },
  plugins: [],
};