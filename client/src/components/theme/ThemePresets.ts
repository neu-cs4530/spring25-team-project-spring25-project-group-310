import React from 'react';
import { base, dark, deep, funk, swiss, tosh } from '@theme-ui/presets';

// Define our theme presets collection
const themePresets = {
  light: {
    ...base,
    colors: {
      ...base.colors,
      background: '#ffffff',
      text: '#212529',
      primary: '#0d6efd',
      secondary: '#6c757d',
      accent: '#3d8bfd',
      muted: '#f8f9fa',
      highlight: '#dee2e6',
      headerBg: '#dddddd',
      buttonBg: '#007bff',
      buttonHover: '#0056b3',
      buttonActive: '#003f7f',
      buttonText: '#ffffff',
      inputBg: '#ffffff',
      borderColor: '#dee2e6',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
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
