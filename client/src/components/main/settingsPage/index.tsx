import React from 'react';
import { Box, Heading, Flex, Text, Button } from 'theme-ui';
import { useTheme, ThemeType } from '../../../hooks/useTheme';
import themePresets from '../../theme/ThemePresets';
import useAccessibilitySettings from '../../../hooks/useAccessibility';

// Use the same ThemePreviewCard component from the original ThemeSelector
const ThemePreviewCard = ({
  themeName,
  isActive,
  onSelect,
}: {
  themeName: ThemeType;
  isActive: boolean;
  onSelect: (theme: ThemeType) => void;
}) => {
  const themeColors = themePresets[themeName].colors;

  return (
    <Box
      sx={{
        width: '120px',
        height: '140px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: isActive ? '3px solid' : '1px solid',
        borderColor: isActive ? 'primary' : 'borderColor',
        boxShadow: isActive ? '0 0 10px rgba(0,0,0,0.2)' : 'none',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        m: 2,
      }}
      onClick={() => onSelect(themeName)}>
      {/* Preview header */}
      <Box sx={{ bg: themeColors.headerBg, height: '20px' }} />

      {/* Preview content */}
      <Box sx={{ bg: themeColors.background, p: 2, height: '90px' }}>
        <Text
          sx={{
            color: themeColors.text,
            fontSize: '10px',
            fontWeight: 'bold',
            mb: 1,
          }}>
          {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
        </Text>

        {/* Preview buttons */}
        <Box
          sx={{
            bg: themeColors.buttonBg,
            width: '40px',
            height: '12px',
            borderRadius: '3px',
            mb: 1,
          }}
        />

        {/* Preview text line */}
        <Box
          sx={{
            bg: themeColors.muted,
            width: '80%',
            height: '4px',
            borderRadius: '2px',
            mb: 1,
          }}
        />
        <Box
          sx={{
            bg: themeColors.muted,
            width: '60%',
            height: '4px',
            borderRadius: '2px',
          }}
        />
      </Box>
    </Box>
  );
};

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const {
    fontSize,
    lineHeight,
    contrast,
    updateFontSize,
    updateLineHeight,
    updateContrast,
    resetToDefaults,
  } = useAccessibilitySettings();

  // Available themes - use the same list as in your original ThemeSelector
  const availableThemes: ThemeType[] = ['light', 'dark', 'deep', 'funk', 'tosh', 'swiss'];

  return (
    <Box className='right_main' sx={{ p: 4 }}>
      <Box
        sx={{
          maxWidth: '800px',
          mx: 'auto',
          p: 4,
          bg: 'background',
          borderRadius: 8,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          my: 4,
        }}>
        <Heading as='h1' mb={4}>
          Settings
        </Heading>

        {/* Theme selection section with preview cards */}
        <Box mb={5}>
          <Heading as='h2' mb={3}>
            Theme
          </Heading>
          <Text mb={2}>Select a theme for the application</Text>

          <Flex sx={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            {availableThemes.map(themeName => (
              <ThemePreviewCard
                key={themeName}
                themeName={themeName}
                isActive={theme === themeName}
                onSelect={newTheme => {
                  setTheme(newTheme);
                }}
              />
            ))}
          </Flex>
        </Box>

        {/* Accessibility section */}
        <Box mb={5}>
          <Heading as='h2' mb={3}>
            Accessibility
          </Heading>

          <Box mb={4}>
            <Text mb={2}>Text Size: {fontSize}%</Text>
            <input
              type='range'
              min={75}
              max={130}
              step={5}
              value={fontSize}
              onChange={e => updateFontSize(parseInt(e.target.value, 10))}
              style={{ width: '100%', maxWidth: '300px' }}
            />
          </Box>

          <Box mb={4}>
            <Text mb={2}>Line Spacing: {lineHeight}</Text>
            <input
              type='range'
              min={1}
              max={2.5}
              step={0.1}
              value={lineHeight}
              onChange={e => updateLineHeight(parseFloat(e.target.value))}
              style={{ width: '100%', maxWidth: '300px' }}
            />
          </Box>

          <Box mb={4}>
            <Text mb={2}>Contrast: {contrast}%</Text>
            <input
              type='range'
              min={75}
              max={150}
              step={5}
              value={contrast}
              onChange={e => updateContrast(parseInt(e.target.value, 10))}
              style={{ width: '100%', maxWidth: '300px' }}
            />
          </Box>
        </Box>

        <Button onClick={resetToDefaults} sx={{ bg: 'accent-color', color: 'white' }}>
          Reset to Defaults
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPage;
