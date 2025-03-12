import React, { useEffect, useState } from 'react';
import ThemeContext, { ThemeType } from '../../contexts/ThemeContext';

type ThemeProviderProps = {
  children: React.ReactNode;
};

function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Was trying to use jsx here but for some reason it kept erroring.
  return React.createElement(ThemeContext.Provider, { value: { theme, setTheme } }, children);
}

export default ThemeProvider;
