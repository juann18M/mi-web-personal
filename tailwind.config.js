// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'kenburns': 'kenburns 20s ease-out infinite alternate',
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1.0) translate(0, 0)' },
          '100%': { transform: 'scale(1.1) translate(0, -2%)' }, // Mueve un poquito hacia arriba
        },
      },
    },
  },
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      animation: {
        'kenburns': 'kenburns 25s ease-out infinite alternate',
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08) translate(1%, -1%)' },
        },
      },
    },
  },
}