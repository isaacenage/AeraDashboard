/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0EB1D2',
        secondary: '#34E4EA',
        tertiary: '#8AB9B5',
        neutral: '#C8C2AE',
        background: '#2B4141',
      },
    },
  },
  plugins: [],
} 