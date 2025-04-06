// components/theme/GlobalStyles.tsx
import { useEffect } from 'react';
import { useThemeUI } from 'theme-ui';

const GlobalStyles = () => {
  const { theme } = useThemeUI();

  useEffect(() => {
    // Safely access theme properties without type errors
    const colors = theme?.colors || {};
    const themeName = (theme as unknown as { name?: string })?.name || 'light';

    // Apply theme colors to root CSS variables
    document.documentElement.style.setProperty('--primary-bg', String(colors.background || ''));
    document.documentElement.style.setProperty('--secondary-bg', String(colors.muted || ''));
    document.documentElement.style.setProperty('--primary-text', String(colors.text || ''));
    document.documentElement.style.setProperty('--secondary-text', String(colors.secondary || ''));
    document.documentElement.style.setProperty('--border-color', String(colors.borderColor || ''));
    document.documentElement.style.setProperty('--accent-color', String(colors.primary || ''));
    document.documentElement.style.setProperty('--button-bg', String(colors.buttonBg || ''));
    document.documentElement.style.setProperty('--button-hover', String(colors.buttonHover || ''));
    document.documentElement.style.setProperty(
      '--button-active',
      String(colors.buttonActive || ''),
    );
    document.documentElement.style.setProperty('--button-text', String(colors.buttonText || ''));
    document.documentElement.style.setProperty('--shadow-color', String(colors.shadowColor || ''));
    document.documentElement.style.setProperty('--input-bg', String(colors.inputBg || ''));
    document.documentElement.style.setProperty('--header-bg', String(colors.headerBg || ''));

    // Create a style element with all theme overrides
    const styleEl = document.createElement('style');
    styleEl.id = 'theme-overrides';

    // Add CSS that forces everything to use our theme variables and fixes specific issues
    styleEl.innerHTML = `
      /* Fix search input size */
      #searchBar, input[type="text"], input[placeholder="Search ..."] {
        width: auto !important;
        max-width: 300px !important;
      }
      
      /* Force important elements to use theme colors */
      body {
        background-color: var(--primary-bg) !important;
        color: var(--primary-text) !important;
      }
      
      .header {
        background-color: var(--header-bg) !important;
      }
      
      button, .button, .bluebtn, .logout-button, .view-profile-button {
        background-color: var(--button-bg) !important;
        color: var(--button-text) !important;
      }
      
      button:hover, .button:hover, .bluebtn:hover, .logout-button:hover, .view-profile-button:hover {
        background-color: var(--button-hover) !important;
      }
      
      input, textarea, select {
        background-color: var(--input-bg) !important;
        color: var(--primary-text) !important;
      }
    `;

    // Remove existing one if it exists
    const existingStyle = document.getElementById('theme-overrides');
    if (existingStyle) existingStyle.remove();

    // Add to the document
    document.head.appendChild(styleEl);

    // Apply data-theme attribute to body for more consistent styling
    document.body.setAttribute('data-theme', themeName);

    return () => {
      // Clean up on unmount
      styleEl.remove();
    };
  }, [theme]);

  return null;
};

export default GlobalStyles;
