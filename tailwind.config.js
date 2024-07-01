import {COLORS, DARKCOLORS, VARIABLES} from "./tailwind.theme";
import {colorVariable} from "@mertasan/tailwindcss-variables/src/helpers";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/stable-gallery/src/**/*.{html,ts}",
  ],
  important: true,
  darkMode: 'class',
  theme: {
    borderRadius: {
      0: '0rem',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem',
      12: '3rem',
      13: '3.25rem',
      14: '3.5rem',
      15: '3.75rem',
      16: '4rem',
      20: '5rem',
      full: '999999px',
    },
    extend: {
      zIndex: {
        1: 1,
        5: 5,
      },
      screens: {
        '2xl': '1420px',
        '3xl': '1600px',
      },
      backdropBlur: {
        xs: '2px',
      },
      fontSize: {
        'xs': '0.75rem',
        '2xs': '0.625rem',
      },
      spacing: {
        inherit: 'inherit',
        13: '3.25rem',
        14: '3.5rem',
        15: '3.75rem',
        17: '4.25rem',
        18: '4.5rem',
        19: '4.75rem',
        21: '5.25rem',
        22: '5.5rem',
        23: '5.75rem',
      },
      colors: {
        inherit: 'inherit',
        white: colorVariable('--colors-white'),
        black: colorVariable('--colors-black'),
        ...VARIABLES,
      },
    },
    variables: {
      DEFAULT: {
        colors: {
          white: '#f1eeee',
          black: '#101010',
          ...COLORS,
        }
      },
    },
    darkVariables: {
      DEFAULT: {
        colors: {
          white: '#101010',
          black: '#f1eeee',
          ...DARKCOLORS,
        }
      }
    }
  },
  plugins: [
    require('@mertasan/tailwindcss-variables')({
      colorVariables: true,
    })
  ],
}

