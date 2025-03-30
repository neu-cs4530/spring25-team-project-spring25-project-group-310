import React, { useState } from 'react';
import { Box, Flex, Button, Text } from 'theme-ui';
import { useTheme, ThemeType } from '../../hooks/useTheme';
import themePresets from './ThemePresets';

// Create a component to preview a theme
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

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Available themes

  const availableThemes: ThemeType[] = ['light', 'dark', 'deep', 'funk', 'tosh', 'swiss'];

  return (
    <Box sx={{ position: 'relative' }}>
      <Button
        className='theme-toggle-button' // Add your CSS class for consistent styling
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          'display': 'flex',
          'alignItems': 'center',
          'gap': 2,
          'backgroundColor': 'buttonBg', // Use theme variables
          'color': 'buttonText',
          'padding': '10px 15px',
          'borderRadius': '5px',
          'cursor': 'pointer',
          'transition': 'background-color 0.3s',
          '&:hover': {
            backgroundColor: 'buttonHover',
          },
        }}>
        <Box
          sx={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            bg: 'primary',
          }}
        />
        <Text>Theme: {theme}</Text>
      </Button>

      {isOpen && (
        <Box
          sx={{
            position: 'absolute',
            top: '40px',
            right: 0,
            width: '400px',
            bg: 'background',
            borderRadius: '8px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            p: 2,
            zIndex: 100,
          }}>
          <Text sx={{ fontSize: 2, fontWeight: 'bold', mb: 2, color: 'text' }}>Select a Theme</Text>

          <Flex sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {availableThemes.map(themeName => (
              <ThemePreviewCard
                key={themeName}
                themeName={themeName}
                isActive={theme === themeName}
                onSelect={newTheme => {
                  setTheme(newTheme);
                  setIsOpen(false);
                }}
              />
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default ThemeSelector;
