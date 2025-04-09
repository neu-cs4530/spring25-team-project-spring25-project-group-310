import { ReactNode } from 'react';
import { ThemeUIProvider } from 'theme-ui';
import { ThemeContext, useThemeProvider } from '../hooks/useTheme';
import themePresets from './theme/ThemePresets';
import GlobalStyles from './theme/GlobalStyles';

interface ThemeContextProviderProps {
  children: ReactNode;
}

const ThemeContextProvider = ({ children }: ThemeContextProviderProps) => {
  const themeContextValue = useThemeProvider();
  const currentTheme = themePresets[themeContextValue.theme] || themePresets.light;

  // Add name property to theme
  const themeWithName = {
    ...currentTheme,
    name: themeContextValue.theme,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeUIProvider theme={themeWithName}>
        <GlobalStyles />
        {children}
      </ThemeUIProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
