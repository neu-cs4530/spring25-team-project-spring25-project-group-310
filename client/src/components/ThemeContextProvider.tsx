import React, { ReactNode } from 'react';
import { ThemeUIProvider } from 'theme-ui';
import { ThemeContext, useThemeProvider } from '../hooks/useTheme';
import themePresets from './theme/ThemePresets';

interface ThemeContextProviderProps {
  children: ReactNode;
}

const ThemeContextProvider = ({ children }: ThemeContextProviderProps) => {
  const themeContextValue = useThemeProvider();
  const currentTheme = themePresets[themeContextValue.theme] || themePresets.light;

  return React.createElement(
    ThemeContext.Provider,
    { value: themeContextValue },
    React.createElement(ThemeUIProvider, { theme: currentTheme }, children),
  );
};

export default ThemeContextProvider;
