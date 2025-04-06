// In components/Header.tsx
import React from 'react';
import { Box, Flex, Text, Input, Button } from 'theme-ui';
import { useNavigate } from 'react-router-dom';
import useHeader from '../../hooks/useHeader';
import './index.css';
import useUserContext from '../../hooks/useUserContext';

const Header = () => {
  const { val, handleInputChange, handleKeyDown, handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();

  return (
    <Flex
      as='header'
      sx={{
        alignItems: 'center',
        justifyContent: 'space-around',
        height: '10%',
        width: '100%',
        bg: 'headerBg',
      }}>
      <Box></Box>
      <Text sx={{ fontSize: '32px', fontWeight: '800' }}>Semicolon</Text>
      <Input
        placeholder='Search ...'
        value={val}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        sx={{ bg: 'inputBg', color: 'text' }}
      />
      {/* Replace ThemeSelector with Settings button */}
      <Button
        onClick={() => navigate('/settings')}
        sx={{ 'bg': 'buttonBg', 'color': 'buttonText', '&:hover': { bg: 'buttonHover' } }}>
        Settings
      </Button>
      <Button
        onClick={handleSignOut}
        sx={{ 'bg': 'buttonBg', 'color': 'buttonText', '&:hover': { bg: 'buttonHover' } }}>
        Log out
      </Button>
      <Button
        onClick={() => navigate(`/user/${currentUser.username}`)}
        sx={{ 'bg': 'buttonBg', 'color': 'buttonText', 'ml': 2, '&:hover': { bg: 'buttonHover' } }}>
        View Profile
      </Button>
    </Flex>
  );
};

export default Header;
