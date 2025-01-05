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
        vercel: {
          dark: '#000000',
          gray: {
            100: '#fafafa',
            200: '#eaeaea',
            300: '#999999',
            400: '#888888',
            500: '#666666',
            600: '#444444',
            700: '#333333',
            800: '#111111',
            900: '#000000'
          },
          blue: '#0070f3',
          cyan: '#50e3c2',
          purple: '#7928ca',
          pink: '#ff0080'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(50% 50% at 50% 50%, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-up': 'fade-up 0.5s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
};

export default config;
