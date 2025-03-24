import { useContext } from 'react';
import ThemeContext, { ThemeContextType } from '../contexts/ThemeContext';

const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error('Theme context is null.');
  }

  return context;
};

export default useTheme;
