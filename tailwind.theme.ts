const THEME = {
  primary: {
    50: '#e8f2ff',
    100: '#cee5ff',
    200: '#98cbff',
    300: '#61b1f7',
    400: '#4296da',
    500: '#1b7cbe',
    600: '#00639c',
    700: '#004a77',
    800: '#003354',
    900: '#001d33',
    950: '#01101c',
  },
  secondary: {
    50: '#ffeed8',
    100: '#ffdea8',
    200: '#fabc41',
    300: '#dba125',
    400: '#bd8700',
    500: '#9c6f00',
    600: '#7c5800',
    700: '#5e4200',
    800: '#422d00',
    900: '#271900',
    950: '#120c00',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  error: {
    50: '#ffe9e9',
    100: '#ffc7c7',
    200: '#ff9999',
    300: '#ff7373',
    400: '#ff4d4d',
    500: '#ff1a1a',
    600: '#cc0000',
    700: '#990000',
    800: '#660000',
    900: '#330000',
    950: '#1d0000',
  },
};

const DARK_THEME = {
  primary: {
    50: '#001d33',
    100: '#003354',
    200: '#004a77',
    300: '#00639c',
    400: '#0078d7',
    500: '#0088ff',
    600: '#00a1ff',
    700: '#00b8ff',
    800: '#00d0ff',
    900: '#00e7ff',
    950: '#bdf3f3',
  },
  secondary: {
    50: '#271900',
    100: '#422d00',
    200: '#5e4200',
    300: '#7c5800',
    400: '#9c6f00',
    500: '#bd8700',
    600: '#dba125',
    700: '#fabc41',
    800: '#ffdea8',
    900: '#ffeed8',
    950: '#fffbf0',
  },
  neutral: {
    50: '#0a0a0a',
    100: '#171717',
    200: '#262626',
    300: '#404040',
    400: '#525252',
    500: '#737373',
    600: '#a3a3a3',
    700: '#d4d4d4',
    800: '#e5e5e5',
    900: '#f5f5f5',
    950: '#fafafa',
  },
  error: {
    50: '#1d0000',
    100: '#330000',
    200: '#660000',
    300: '#990000',
    400: '#cc0000',
    500: '#ff1a1a',
    600: '#ff4d4d',
    700: '#ff7373',
    800: '#ff9999',
    900: '#ffc7c7',
    950: '#ffe9e9',
  },
} satisfies typeof THEME;

// // // // // // // // // // // // //
//
//
//
// // // // // // // // // // // // //

const colors: any = {};
const darkColors: any = {};
const variables: any = {};

for (const themeKey in THEME) {
  colors[themeKey] = {};
  darkColors[themeKey] = {};
  variables[themeKey] = {};
  for (const colorKey in THEME[themeKey]) {
    colors[themeKey][colorKey] = THEME[themeKey][colorKey];
    colors[themeKey][colorKey] = DARK_THEME[themeKey][colorKey];
    const variable = `--colors-${themeKey}-${colorKey}-rgb`;
    variables[themeKey][colorKey] = ({ opacityVariable, opacityValue }) => {
      if (opacityValue !== undefined) {
        return `rgba(var(${variable}), ${opacityValue})`;
      }
      if (opacityVariable !== undefined) {
        return `rgba(var(${variable}), var(${opacityVariable}, 1))`;
      }
      return `rgb(var(${variable}))`;
    };
  }
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : null;
}

export const COLORS = colors;
export const DARKCOLORS = darkColors;
export const VARIABLES = variables;
