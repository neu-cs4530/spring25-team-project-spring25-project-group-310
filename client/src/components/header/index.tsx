import React from 'react';
import { useNavigate } from 'react-router-dom';
import useHeader from '../../hooks/useHeader';
import './index.css';
import useUserContext from '../../hooks/useUserContext';
import { Box, Flex, Text, Input, Button } from 'theme-ui';
import ThemeSelector from '../theme/ThemeSelector'; // Update this path

/**
 * Header component that renders the main title and a search bar.
 * The search bar allows the user to input a query and navigate to the search results page
 * when they press Enter.
 * Includes a theme selector for switching between available themes.
 */
const Header = () => {
  const { val, handleInputChange, handleKeyDown, handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();

  return (
    <Flex as="header" sx={{ alignItems: 'center', justifyContent: 'space-around', height: '10%', width: '100%', bg: 'headerBg' }}>
      <Box></Box>
      <Text sx={{ fontSize: '32px', fontWeight: '800' }}>Semicolon</Text>
      <Input
        placeholder='Search ...'
        value={val}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        sx={{ bg: 'inputBg', color: 'text' }}
      />
      <ThemeSelector />
      <Button
        onClick={handleSignOut}
        sx={{ bg: 'buttonBg', color: 'buttonText', '&:hover': { bg: 'buttonHover' } }}
      >
        Log out
      </Button>
      <Button
        onClick={() => navigate(`/user/${currentUser.username}`)}
        sx={{ bg: 'buttonBg', color: 'buttonText', ml: 2, '&:hover': { bg: 'buttonHover' } }}
      >
        View Profile
      </Button>
    </Flex>
  );
};

export default Header;