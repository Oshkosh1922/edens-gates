import type { Config } from 'tailwindcss'

const config = {
  content: ['index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        egDark: '#0B0B0F',
        egPurple: '#AB2DF5',
        egPink: '#FF3DB2',
      },
      backgroundImage: {
        'eg-gradient': 'linear-gradient(135deg, #AB2DF5 0%, #FF3DB2 100%)',
      },
      boxShadow: {
        glow: '0 10px 40px rgba(171, 45, 245, 0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
