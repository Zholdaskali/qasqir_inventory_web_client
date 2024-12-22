const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      flex:{
        '2': '2 2 0%'
      },
      colors:{
        'main-purp': '#904DC0',
        'main-green': '#3BBB10',
        'main-dull-blue': '#4A5C6A',
        'main-dull-gray': '#9BA8AB'
      }
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
}