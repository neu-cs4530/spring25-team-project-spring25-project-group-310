import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Input, Button } from 'theme-ui';
import { useNavigate } from 'react-router-dom';
import useHeader from '../../hooks/useHeader';
import './index.css';
import useUserContext from '../../hooks/useUserContext';

const Header = () => {
  const { val, handleInputChange, handleKeyDown, handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Add scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Flex
      as='header'
      className={isScrolled ? 'scrolled' : ''}
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        height: ['60px', '60px', '10%'], // Responsive height
        width: '100%',
        bg: 'headerBg',
        padding: ['0 1rem', '0 1.5rem', '0 2rem'], // Responsive padding
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
      {/* Logo and name section */}
      <Flex
        sx={{
          'alignItems': 'center',
          'cursor': 'pointer',
          'transition': 'transform 0.2s ease',
          '&:hover': { transform: 'translateY(-2px)' },
          'width': ['auto', 'auto', '15%'], // Responsive width
        }}
        onClick={() => navigate('/home')}>
        {/* Brand name */}
        <Text
          sx={{
            fontSize: ['22px', '24px', '28px'], // Responsive font size
            fontWeight: '800',
            color: 'buttonBg',
            letterSpacing: '-0.5px',
            display: 'flex',
          }}>
          Semicolon;
        </Text>
      </Flex>

      {/* Mobile menu toggle */}
      <Button
        className='mobile-menu-toggle'
        sx={{
          display: ['flex', 'flex', 'none'], // Only show on mobile
          alignItems: 'center',
          justifyContent: 'center',
          bg: 'transparent',
          color: 'buttonBg',
          padding: '8px',
          width: '40px',
          height: '40px',
          border: 'none',
        }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'>
          {isMobileMenuOpen ? (
            <path d='M18 6L6 18M6 6l12 12' />
          ) : (
            <>
              <line x1='3' y1='12' x2='21' y2='12' />
              <line x1='3' y1='6' x2='21' y2='6' />
              <line x1='3' y1='18' x2='21' y2='18' />
            </>
          )}
        </svg>
      </Button>

      {/* Search bar - Hide on smallest screens */}
      <Box
        sx={{
          width: ['50%', '50%', '60%'],
          maxWidth: '800px',
          position: 'relative',
          mx: 'auto',
          display: ['none', 'block', 'block'], // Hide on smallest screens
        }}>
        <Input
          placeholder='Search for questions...'
          value={val}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          sx={{
            'bg': 'white',
            'color': 'text',
            'width': '100%',
            'padding': ['10px 16px', '12px 18px', '14px 20px'], // Responsive padding
            'fontSize': ['14px', '15px', '16px'], // Responsive font size
            'borderRadius': '24px',
            'border': 'none',
            'boxShadow': '0 3px 8px rgba(0,0,0,0.1)',
            '&:focus': {
              outline: 'none',
              boxShadow: '0 0 0 2px rgba(0, 120, 255, 0.3), 0 3px 8px rgba(0,0,0,0.1)',
            },
            '&::placeholder': {
              color: 'rgba(0, 0, 0, 0.4)',
            },
          }}
        />
        {/* Search icon */}
        <Box
          sx={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'secondary',
            pointerEvents: 'none',
          }}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <circle cx='11' cy='11' r='8'></circle>
            <line x1='21' y1='21' x2='16.65' y2='16.65'></line>
          </svg>
        </Box>
      </Box>

      {/* Icon buttons section - Hide on mobile */}
      <Flex
        sx={{
          gap: '15px',
          width: ['auto', 'auto', '15%'],
          justifyContent: 'flex-end',
          display: ['none', 'none', 'flex'], // Hide on mobile
        }}>
        {/* Settings button */}
        <Button
          onClick={() => navigate('/settings')}
          aria-label='Settings'
          title='Settings'
          sx={{
            'bg': 'buttonBg',
            'color': 'buttonText',
            'padding': '10px',
            'borderRadius': '50%',
            'width': '40px',
            'height': '40px',
            'display': 'flex',
            'alignItems': 'center',
            'justifyContent': 'center',
            'boxShadow': '0 2px 5px rgba(0, 0, 0, 0.1)',
            'transition': 'all 0.2s ease',
            '&:hover': {
              bg: 'buttonHover',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
            },
          }}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <circle cx='12' cy='12' r='3'></circle>
            <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'></path>
          </svg>
        </Button>

        {/* Profile button */}
        <Button
          onClick={() => navigate(`/user/${currentUser.username}`)}
          aria-label='Profile'
          title='Profile'
          sx={{
            'bg': 'buttonBg',
            'color': 'buttonText',
            'padding': '10px',
            'borderRadius': '50%',
            'width': '40px',
            'height': '40px',
            'display': 'flex',
            'alignItems': 'center',
            'justifyContent': 'center',
            'boxShadow': '0 2px 5px rgba(0, 0, 0, 0.1)',
            'transition': 'all 0.2s ease',
            '&:hover': {
              bg: 'buttonHover',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
            },
          }}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'></path>
            <circle cx='12' cy='7' r='4'></circle>
          </svg>
        </Button>

        {/* Logout button */}
        <Button
          onClick={handleSignOut}
          aria-label='Log out'
          title='Log out'
          sx={{
            'bg': 'transparent',
            'color': 'white',
            'padding': '10px',
            'borderRadius': '50%',
            'width': '40px',
            'height': '40px',
            'display': 'flex',
            'alignItems': 'center',
            'justifyContent': 'center',
            'border': '1px solid rgba(255, 255, 255, 0.2)',
            'transition': 'all 0.2s ease',
            '&:hover': {
              bg: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              transform: 'translateY(-2px)',
            },
          }}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'></path>
            <polyline points='16 17 21 12 16 7'></polyline>
            <line x1='21' y1='12' x2='9' y2='12'></line>
          </svg>
        </Button>
      </Flex>

      {/* Mobile Menu - Slide down panel */}
      {isMobileMenuOpen && (
        <Box
          sx={{
            position: 'absolute',
            top: '60px', // Match header height
            left: 0,
            right: 0,
            bg: 'headerBg',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            zIndex: 99,
            padding: '1rem',
            display: ['block', 'block', 'none'], // Only show on mobile
            animation: 'slideDown 0.3s ease-out',
          }}
          className='mobile-menu'>
          {/* Mobile Search */}
          <Box sx={{ mb: 3 }}>
            <Input
              placeholder='Search for questions...'
              value={val}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              sx={{
                'bg': 'white',
                'color': 'text',
                'width': '100%',
                'padding': '10px 16px',
                'fontSize': '14px',
                'borderRadius': '24px',
                'border': 'none',
                'boxShadow': '0 3px 8px rgba(0,0,0,0.1)',
                '&:focus': {
                  outline: 'none',
                  boxShadow: '0 0 0 2px rgba(0, 120, 255, 0.3), 0 3px 8px rgba(0,0,0,0.1)',
                },
                '&::placeholder': {
                  color: 'rgba(0, 0, 0, 0.4)',
                },
              }}
            />
          </Box>

          {/* Mobile Navigation */}
          <Flex sx={{ flexDirection: 'column', gap: '10px' }}>
            <Button
              onClick={() => {
                navigate('/settings');
                setIsMobileMenuOpen(false);
              }}
              sx={{
                bg: 'buttonBg',
                color: 'buttonText',
                padding: '10px',
                borderRadius: '8px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '10px',
              }}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <circle cx='12' cy='12' r='3'></circle>
                <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'></path>
              </svg>
              Settings
            </Button>

            <Button
              onClick={() => {
                navigate(`/user/${currentUser.username}`);
                setIsMobileMenuOpen(false);
              }}
              sx={{
                bg: 'buttonBg',
                color: 'buttonText',
                padding: '10px',
                borderRadius: '8px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '10px',
              }}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'></path>
                <circle cx='12' cy='7' r='4'></circle>
              </svg>
              Profile
            </Button>

            <Button
              onClick={handleSignOut}
              sx={{
                bg: 'transparent',
                color: 'white',
                padding: '10px',
                borderRadius: '8px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'></path>
                <polyline points='16 17 21 12 16 7'></polyline>
                <line x1='21' y1='12' x2='9' y2='12'></line>
              </svg>
              Log out
            </Button>
          </Flex>
        </Box>
      )}
    </Flex>
  );
};

export default Header;
