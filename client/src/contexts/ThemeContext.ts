import { createContext } from 'react';

export type ThemeType = 'light' | 'dark';

export interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export default ThemeContext;
