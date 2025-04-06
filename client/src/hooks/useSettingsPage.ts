// src/hooks/useSettingsPage.ts
import { useEffect } from 'react';
import { useTheme, ThemeType } from './useTheme';
import useAccessibility from './useAccessibility';

const useSettingsPage = () => {
  const { theme, setTheme } = useTheme();

  const {
    fontSize,
    lineHeight,
    contrast,
    updateFontSize,
    updateLineHeight,
    updateContrast,
    resetToDefaults,
  } = useAccessibility();

  // Available themes
  const availableThemes: ThemeType[] = ['light', 'dark', 'deep', 'funk', 'tosh', 'swiss'];

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFontSize(parseInt(e.target.value, 10));
  };

  const handleLineHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLineHeight(parseFloat(e.target.value));
  };

  const handleContrastChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateContrast(parseInt(e.target.value, 10));
  };

  return {
    theme,
    fontSize,
    lineHeight,
    contrast,
    availableThemes,
    handleThemeChange,
    handleFontSizeChange,
    handleLineHeightChange,
    handleContrastChange,
    resetToDefaults,
  };
};

export default useSettingsPage;
