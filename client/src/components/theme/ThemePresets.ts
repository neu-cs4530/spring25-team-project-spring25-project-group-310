import { base, dark, deep, funk, swiss, tosh } from '@theme-ui/presets';

// Define our theme presets collection
const themePresets = {
  light: {
    ...base,
    colors: {
      ...base.colors,
      background: '#FFFFFF',
      text: '#2E3338',
      primary: '#0078FF',
      secondary: '#5D6671',
      accent: '#0078FF',
      muted: '#F6F8FA',
      highlight: '#E3E5E8',
      headerBg: '#2F3136',
      buttonBg: '#0078FF',
      buttonHover: '#0064D6',
      buttonActive: '#0050B3',
      buttonText: '#FFFFFF',
      inputBg: '#FFFFFF',
      borderColor: '#E3E5E8',
      shadowColor: 'rgba(0, 0, 0, 0.08)',
    },
    styles: {
      ...base.styles,
    },
  },
  dark: {
    ...dark,
    colors: {
      ...dark.colors,
      background: '#121212',
      text: '#e9ecef',
      primary: '#3d8bfd',
      secondary: '#adb5bd',
      accent: '#0d6efd',
      muted: '#1e1e1e',
      highlight: '#343a40',
      headerBg: '#1a1a1a',
      buttonBg: '#0d6efd',
      buttonHover: '#0b5ed7',
      buttonActive: '#0a58ca',
      buttonText: '#ffffff',
      inputBg: '#2c2c2c',
      borderColor: '#343a40',
      shadowColor: 'rgba(0, 0, 0, 0.3)',
    },
    styles: {
      ...dark.styles,
    },
  },
  deep: {
    ...deep,
    colors: {
      ...deep.colors,
      headerBg: deep.colors.background,
      buttonBg: deep.colors.primary,
      buttonHover: '#156681',
      buttonActive: '#0e4f66',
      buttonText: '#ffffff',
      inputBg: deep.colors.background,
      borderColor: deep.colors.muted,
      highlight: '#333333', // Fallback value
      shadowColor: 'rgba(0, 0, 0, 0.2)',
    },
  },
  funk: {
    ...funk,
    colors: {
      ...funk.colors,
      headerBg: funk.colors.secondary,
      buttonBg: funk.colors.primary,
      buttonHover: '#d25bdc',
      buttonActive: '#ba37c5',
      buttonText: funk.colors.background,
      inputBg: funk.colors.background,
      borderColor: funk.colors.muted,
      highlight: '#ddddff',
      shadowColor: 'rgba(0, 0, 0, 0.2)',
    },
  },
  tosh: {
    ...tosh,
    colors: {
      ...tosh.colors,
      background: '#121212',
      headerBg: tosh.colors.muted,
      buttonBg: tosh.colors.primary,
      buttonHover: '#ff3377',
      buttonActive: '#ff1166',
      buttonText: '#ffffff',
      inputBg: tosh.colors.background,
      borderColor: tosh.colors.muted,
      highlight: '#e0e0e0', // Fallback value
      shadowColor: 'rgba(0, 0, 0, 0.2)',
    },
  },
  swiss: {
    ...swiss,
    colors: {
      ...swiss.colors,
      headerBg: swiss.colors.muted,
      buttonBg: swiss.colors.primary,
      buttonHover: '#cc0000',
      buttonActive: '#aa0000',
      buttonText: '#ffffff',
      inputBg: swiss.colors.background,
      borderColor: swiss.colors.muted,
      highlight: '#e0e0e0', // Fallback value
      shadowColor: 'rgba(0, 0, 0, 0.2)',
    },
  },
};

export default themePresets;
