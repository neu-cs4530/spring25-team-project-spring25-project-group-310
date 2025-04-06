import { useState } from 'react';

interface AccessibilitySettings {
  fontSize: number;
  lineHeight: number;
  contrast: number;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 100, // 100%
  lineHeight: 1.5,
  contrast: 100, // 100%
};

// Get settings from localStorage, with fallback to defaults
const getSavedSettings = (): AccessibilitySettings => {
  const savedSettings = localStorage.getItem('accessibility-settings');
  if (savedSettings) {
    return JSON.parse(savedSettings);
  }
  return defaultSettings;
};

// Apply settings function (to be used outside the hook as well)
export const applyAccessibilitySettings = (settings: AccessibilitySettings): void => {
  document.documentElement.style.setProperty('--text-size-factor', `${settings.fontSize}`);
  document.documentElement.style.setProperty('--line-height', `${settings.lineHeight}`);
  document.documentElement.style.setProperty(
    '--contrast-filter',
    `contrast(${settings.contrast}%)`,
  );

  // Save to localStorage
  localStorage.setItem('accessibility-settings', JSON.stringify(settings));
};

// Apply the settings immediately when the app loads, before any React code runs
const initialSettings = getSavedSettings();
applyAccessibilitySettings(initialSettings);

export const useAccessibilitySettings = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(initialSettings);

  const updateSettings = (newSettings: AccessibilitySettings) => {
    applyAccessibilitySettings(newSettings);
    setSettings(newSettings);
  };

  const updateFontSize = (size: number) => {
    const validSize = Math.min(Math.max(size, 75), 130);
    updateSettings({ ...settings, fontSize: validSize });
  };

  const updateLineHeight = (height: number) => {
    const validHeight = Math.min(Math.max(height, 1), 3);
    updateSettings({ ...settings, lineHeight: validHeight });
  };

  const updateContrast = (contrast: number) => {
    const validContrast = Math.min(Math.max(contrast, 75), 150);
    updateSettings({ ...settings, contrast: validContrast });
  };

  const resetToDefaults = () => {
    updateSettings(defaultSettings);
  };

  return {
    fontSize: settings.fontSize,
    lineHeight: settings.lineHeight,
    contrast: settings.contrast,
    updateFontSize,
    updateLineHeight,
    updateContrast,
    resetToDefaults,
  };
};

export default useAccessibilitySettings;
