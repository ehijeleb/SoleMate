/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}', // For your Next.js pages
    './src/components/**/*.{js,ts,jsx,tsx}', // If you have components here
    './src/lib/**/*.{js,ts,jsx,tsx}', // For other reusable components, if any
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
