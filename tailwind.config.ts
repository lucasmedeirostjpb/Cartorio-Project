import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2f7',
          100: '#d4dde8',
          200: '#a9bbcd',
          300: '#7e99b2',
          400: '#537797',
          500: '#2d5a85',
          600: '#1e3f5e',
          700: '#0f2b4c',
          800: '#0a1e36',
          900: '#061220',
        },
      },
    },
  },
  plugins: [],
};
export default config;
