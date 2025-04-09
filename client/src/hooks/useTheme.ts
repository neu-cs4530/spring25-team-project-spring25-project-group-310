import { useState, createContext, useContext } from 'react';

export type ThemeType = 'light' | 'dark' | 'deep' | 'funk' | 'tosh' | 'swiss';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const defaultContextValue: ThemeContextType = {
  theme: 'light',
  setTheme: () => {},
};

export const ThemeContext = createContext<ThemeContextType>(defaultContextValue);

/**
 * Hook to be used inside the provider to create the theme state
 */
export const useThemeProvider = () => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    if (savedTheme && ['light', 'dark', 'deep', 'funk', 'tosh', 'swiss'].includes(savedTheme)) {
      return savedTheme;
    }
    return 'light';
  });

  // Function to both update state and save to localStorage
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return { theme, setTheme };
};

/**
 * Hook to be used by components to access the theme
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};
