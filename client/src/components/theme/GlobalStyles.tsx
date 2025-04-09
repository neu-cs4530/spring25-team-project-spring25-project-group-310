import { useEffect } from 'react';
import { useThemeUI } from 'theme-ui';
import { useAccessibilitySettings } from '../../hooks/useAccessibility';

const GlobalStyles = () => {
  const { theme } = useThemeUI();
  const { fontSize, lineHeight, contrast } = useAccessibilitySettings();

  // Apply the theme immediately on component mount and whenever theme changes
  useEffect(() => {
    // Safely access theme properties without type errors
    const colors = theme?.colors || {};
    const themeName = (theme as unknown as { name?: string })?.name || 'light';

    // Force immediate application of styles before next render cycle
    function applyStyles() {
      // Apply theme colors to root CSS variables
      document.documentElement.style.setProperty('--primary-bg', String(colors.background || ''));
      document.documentElement.style.setProperty('--secondary-bg', String(colors.muted || ''));
      document.documentElement.style.setProperty('--primary-text', String(colors.text || ''));
      document.documentElement.style.setProperty(
        '--secondary-text',
        String(colors.secondary || ''),
      );
      document.documentElement.style.setProperty(
        '--border-color',
        String(colors.borderColor || ''),
      );
      document.documentElement.style.setProperty('--accent-color', String(colors.primary || ''));
      document.documentElement.style.setProperty('--button-bg', String(colors.buttonBg || ''));
      document.documentElement.style.setProperty(
        '--button-hover',
        String(colors.buttonHover || ''),
      );
      document.documentElement.style.setProperty(
        '--button-active',
        String(colors.buttonActive || ''),
      );
      document.documentElement.style.setProperty('--button-text', String(colors.buttonText || ''));
      document.documentElement.style.setProperty(
        '--shadow-color',
        String(colors.shadowColor || ''),
      );
      document.documentElement.style.setProperty('--input-bg', String(colors.inputBg || ''));
      document.documentElement.style.setProperty('--header-bg', String(colors.headerBg || ''));

      // Apply accessibility settings
      document.documentElement.style.setProperty('--text-size-factor', `${fontSize}`);
      document.documentElement.style.setProperty('--line-height', `${lineHeight}`);
      document.documentElement.style.setProperty('--contrast-filter', `contrast(${contrast}%)`);

      // Create a style element with all theme overrides
      const styleEl = document.createElement('style');
      styleEl.id = 'theme-overrides';

      // Add CSS that forces everything to use theme variables and fixes specific issues
      styleEl.innerHTML = `
        /* Priority override to ensure our styles take precedence */
        html, body, #root, #__next {
          background-color: var(--primary-bg) !important;
          color: var(--primary-text) !important;
        }
        
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
          border-color: var(--border-color) !important;
        }
          
        html {
          font-size: calc(16px * var(--text-size-factor, 100%) / 100) !important;
        }

        /* Apply line height */
        p, li, div, span, input, textarea, button, a {
          line-height: var(--line-height, 1.5) !important;
        }

        /* Apply contrast */
        body {
          filter: var(--contrast-filter, contrast(100%)) !important;
        }
        
        /* Ensure all theme elements have transitions for smooth changes */
        * {
          transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
      `;

      // Remove existing one if it exists
      const existingStyle = document.getElementById('theme-overrides');
      if (existingStyle) existingStyle.remove();

      // Add to the document head to ensure it takes precedence
      document.head.appendChild(styleEl);

      // Apply data-theme attribute to both html and body for more consistent styling
      document.documentElement.setAttribute('data-theme', themeName);
      document.body.setAttribute('data-theme', themeName);
    }

    // Apply styles immediately
    applyStyles();

    // Also apply styles after a short delay to ensure they're applied after any other style operations
    const timeoutId = setTimeout(applyStyles, 50);

    return () => {
      // Clean up
      clearTimeout(timeoutId);
      const styleEl = document.getElementById('theme-overrides');
      if (styleEl) styleEl.remove();
    };
  }, [theme, fontSize, lineHeight, contrast]); // Add accessibility settings as dependencies

  return null;
};

export default GlobalStyles;
