/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        celestial: {
          night: "var(--night)",
          deep: "var(--night-soft)",
        },
        armor: {
          gold: "var(--gold)",
          bronze: "var(--bronze)",
          silver: "var(--silver)",
        },
      },
    },
  },
}
