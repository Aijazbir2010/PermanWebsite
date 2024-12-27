/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'blue-5-opacity': 'rgba(33, 118, 255, 0.05)',
        'blue-10-opacity': 'rgba(33, 118, 255, 0.10)',
        'black-opacity': 'rgba(0, 0, 0, 0.3)',
        'black-50-opacity': "rgba(8, 8, 8, 0.5)",
        'black-90-opacity': "rgba(8, 8, 8, 0.9)",
        'black-70-opacity': "rgba(8, 8, 8, 0.7)",
      },
      dropShadow: {
        'custom-blue': '7px 7px 0px rgba(33, 118, 255, 1)',
      },
    },
  },
  plugins: [],
};
