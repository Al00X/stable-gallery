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
  }
}

// // // // // // // // // // // // //
//
//
//
// // // // // // // // // // // // //

const colors: any = {}
const variables: any = {};

for(const themeKey in THEME) {
  colors[themeKey] = {};
  variables[themeKey] = {};
  for(const colorKey in THEME[themeKey]) {
    colors[themeKey][colorKey] = THEME[themeKey][colorKey];
    const variable = `--colors-${themeKey}-${colorKey}-rgb`;
    variables[themeKey][colorKey] = ({ opacityVariable, opacityValue }) => {
      if (opacityValue !== undefined) {
        return `rgba(var(${variable}), ${opacityValue})`
      }
      if (opacityVariable !== undefined) {
        return `rgba(var(${variable}), var(${opacityVariable}, 1))`
      }
      return `rgb(var(${variable}))`
    }
  }
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

export const COLORS = colors;
export const VARIABLES = variables;
