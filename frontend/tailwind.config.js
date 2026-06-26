/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/app.component.ts",
    "./src/app/app.module.ts",
    "./src/app/app-routing.module.ts",
    "./src/app/core/**/*.{html,ts}",
    "./src/app/pages/**/*.{html,ts}",
    "./src/app/shared/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
