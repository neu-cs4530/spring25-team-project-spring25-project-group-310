import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Heading, Flex, Text, Button } from 'theme-ui';
import { useTheme, ThemeType } from '../../../hooks/useTheme';
import themePresets from '../../theme/ThemePresets';
import { useAccessibilitySettings } from '../../../hooks/useAccessibility';
import useUserContext from '../../../hooks/useUserContext';
import { getThemeVotes } from '../../../services/themeVoteService';

// Voting Component
const ThemeVoteComponent = ({
  themeName,
  themeVotes,
  onVoteUpdate,
}: {
  themeName: ThemeType;
  themeVotes: Record<string, { upVotes: string[]; downVotes: string[] }>;
  onVoteUpdate: () => void;
}) => {
  const { user } = useUserContext();
  const { socket } = useUserContext();

  const handleVote = (voteType: 'up' | 'down') => {
    if (!user || !socket) return;

    socket.emit('themeVote', {
      theme: themeName,
      voteType,
      username: user.username,
    });
  };

  const votes = themeVotes[themeName] || { upVotes: [], downVotes: [] };
  const hasUpvoted = user ? votes.upVotes.includes(user.username) : false;
  const hasDownvoted = user ? votes.downVotes.includes(user.username) : false;

  // Calculate total score as the difference between upvotes and downvotes
  const score = votes.upVotes.length - votes.downVotes.length;

  return (
    <div className='vote-container'>
      <button
        className={`vote-button upvote ${hasUpvoted === true ? 'active' : ''}`}
        onClick={() => handleVote('up')}
        disabled={!user}
        aria-label='Upvote'>
        <svg
          viewBox='0 0 24 24'
          width='24'
          height='24'
          stroke='currentColor'
          strokeWidth='2'
          fill='none'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <polyline points='18 15 12 9 6 15'></polyline>
        </svg>
      </button>

      <div className='vote-count'>{score}</div>

      <button
        className={`vote-button downvote ${hasDownvoted === true ? 'active' : ''}`}
        onClick={() => handleVote('down')}
        disabled={!user}
        aria-label='Downvote'>
        <svg
          viewBox='0 0 24 24'
          width='24'
          height='24'
          stroke='currentColor'
          strokeWidth='2'
          fill='none'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <polyline points='6 9 12 15 18 9'></polyline>
        </svg>
      </button>
    </div>
  );
};

// Theme Preview Card
const ThemePreviewCard = ({
  themeName,
  isActive,
  onSelect,
}: {
  themeName: ThemeType;
  isActive: boolean;
  onSelect: (theme: ThemeType) => void;
  themeVotes: Record<string, { upVotes: string[]; downVotes: string[] }>;
  onVoteUpdate: () => void;
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
        m: 2,
        display: 'flex',
        flexDirection: 'column',
      }}>
      {/* Preview header */}
      <Box
        sx={{ bg: themeColors.headerBg, height: '20px', cursor: 'pointer' }}
        onClick={() => onSelect(themeName)}
      />

      {/* Preview content */}
      <Box
        sx={{
          bg: themeColors.background,
          p: 2,
          flex: 1,
          cursor: 'pointer',
        }}
        onClick={() => onSelect(themeName)}>
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
  const { socket } = useUserContext();
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
  const availableThemes = useMemo<ThemeType[]>(
    () => ['light', 'dark', 'deep', 'funk', 'tosh', 'swiss'],
    [],
  );

  // State for theme votes
  const [themeVotes, setThemeVotes] = useState<
    Record<string, { upVotes: string[]; downVotes: string[] }>
  >({});
  const [isLoadingVotes, setIsLoadingVotes] = useState<boolean>(true);

  // Fetch theme votes
  const fetchVotes = useCallback(async () => {
    try {
      setIsLoadingVotes(true);
      const votes = await getThemeVotes();

      // Convert to a record for easier lookup
      const votesRecord = votes.reduce(
        (acc, vote) => {
          acc[vote.theme] = {
            upVotes: vote.upVotes || [],
            downVotes: vote.downVotes || [],
          };
          return acc;
        },
        {} as Record<string, { upVotes: string[]; downVotes: string[] }>,
      );

      // Initialize missing themes with empty votes
      availableThemes.forEach(themeName => {
        if (!votesRecord[themeName]) {
          votesRecord[themeName] = { upVotes: [], downVotes: [] };
        }
      });

      setThemeVotes(votesRecord);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching theme votes:', error);
    } finally {
      setIsLoadingVotes(false);
    }
  }, [availableThemes]);

  // Fetch votes when component mounts
  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  // Listen for theme vote updates
  useEffect(() => {
    if (!socket) return;

    const handleThemeVoteUpdate = (data: {
      theme: string;
      upVotes: string[];
      downVotes: string[];
    }) => {
      setThemeVotes(prev => ({
        ...prev,
        [data.theme]: {
          upVotes: data.upVotes,
          downVotes: data.downVotes,
        },
      }));
    };

    socket.on('themeVoteUpdate', handleThemeVoteUpdate);
    // eslint-disable-next-line consistent-return
    return () => {
      socket.off('themeVoteUpdate', handleThemeVoteUpdate);
    };
  }, [socket]);

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

          <Flex
            sx={{
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}>
            {isLoadingVotes ? (
              <Text>Loading themes...</Text>
            ) : (
              availableThemes.map(themeName => (
                <Flex
                  key={themeName}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    m: 2,
                  }}>
                  <ThemePreviewCard
                    themeName={themeName}
                    isActive={theme === themeName}
                    onSelect={newTheme => {
                      setTheme(newTheme);
                    }}
                    themeVotes={themeVotes}
                    onVoteUpdate={fetchVotes}
                  />
                  {/* Voting component placed outside the card */}
                  <ThemeVoteComponent
                    themeName={themeName}
                    themeVotes={themeVotes}
                    onVoteUpdate={fetchVotes}
                  />
                </Flex>
              ))
            )}
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
