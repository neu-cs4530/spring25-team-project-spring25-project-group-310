import React, { useState, useEffect } from 'react';
import './index.css';
import { NavLink, useLocation } from 'react-router-dom';

/**
 * The SideBarNav component with improved responsive design.
 * It adapts to different screen sizes and provides better navigation on mobile.
 */
const SideBarNav = () => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const location = useLocation();

  // Track window size for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const isActiveOption = (path: string) =>
    location.pathname === path ? 'message-option-selected ' : '';

  // Close mobile menu after navigation on very small screens
  const handleNavClick = () => {
    if (windowWidth <= 480) {
      setShowMobileMenu(false);
    }
  };

  return (
    <>
      {windowWidth <= 480 && (
        <button className='mobile-menu-toggle' onClick={toggleMobileMenu}>
          Menu
          <span className={`toggle-icon ${showMobileMenu ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      )}

      <div id='sideBarNav' className={`sideBarNav ${showMobileMenu ? 'mobile-expanded' : ''}`}>
        <NavLink
          to='/home'
          id='menu_questions'
          className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
          onClick={handleNavClick}>
          <span className='menu-icon'>
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <circle cx='12' cy='12' r='10'></circle>
              <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'></path>
              <line x1='12' y1='17' x2='12.01' y2='17'></line>
            </svg>
          </span>
          <span className='menu-text'>Questions</span>
        </NavLink>
        <NavLink
          to='/tags'
          id='menu_tag'
          className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
          onClick={handleNavClick}>
          <span className='menu-icon'>
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <path d='M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z'></path>
              <line x1='7' y1='7' x2='7.01' y2='7'></line>
            </svg>
          </span>
          <span className='menu-text'>Tags</span>
        </NavLink>
        <NavLink
          to='/bookmarks'
          className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
          onClick={handleNavClick}>
          <span className='menu-icon'>
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <path d='M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'></path>
            </svg>
          </span>
          <span className='menu-text'>Bookmarks</span>
        </NavLink>
        <NavLink
          to='/messaging'
          id='menu_messaging'
          className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
          onClick={e => {
            if (windowWidth <= 768) {
              toggleOptions(); // Just toggle dropdown on all mobile sizes
              e.preventDefault();
            } else {
              toggleOptions(); // On desktop, toggle dropdown and navigate
              handleNavClick();
            }
          }}>
          <span className='menu-icon'>
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'></path>
            </svg>
          </span>
          <span className='menu-text'>Messaging</span>
          <span className={`dropdown-arrow ${showOptions ? 'open' : ''}`}>▼</span>
        </NavLink>

        {showOptions && (
          <div className='additional-options'>
            <NavLink
              to='/messaging'
              className={`menu_button message-options ${isActiveOption('/messaging')}`}
              onClick={handleNavClick}>
              <span className='menu-icon small'>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'>
                  <circle cx='12' cy='12' r='10'></circle>
                  <line x1='2' y1='12' x2='22' y2='12'></line>
                  <path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'></path>
                </svg>
              </span>
              <span className='menu-text'>Global Messages</span>
            </NavLink>
            <NavLink
              to='/messaging/direct-message'
              className={`menu_button message-options ${isActiveOption('/messaging/direct-message')}`}
              onClick={handleNavClick}>
              <span className='menu-icon small'>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'>
                  <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'></path>
                  <polyline points='22,6 12,13 2,6'></polyline>
                </svg>
              </span>
              <span className='menu-text'>Direct Messages</span>
            </NavLink>
          </div>
        )}
        <NavLink
          to='/users'
          id='menu_users'
          className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
          onClick={handleNavClick}>
          <span className='menu-icon'>
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'></path>
              <circle cx='9' cy='7' r='4'></circle>
              <path d='M23 21v-2a4 4 0 0 0-3-3.87'></path>
              <path d='M16 3.13a4 4 0 0 1 0 7.75'></path>
            </svg>
          </span>
          <span className='menu-text'>Users</span>
        </NavLink>
        <NavLink
          to='/games'
          id='menu_games'
          className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
          onClick={handleNavClick}>
          <span className='menu-icon'>
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <rect x='2' y='6' width='20' height='12' rx='2'></rect>
              <line x1='12' y1='12' x2='12' y2='12'></line>
              <line x1='6' y1='12' x2='6' y2='12'></line>
              <line x1='18' y1='12' x2='18' y2='12'></line>
            </svg>
          </span>
          <span className='menu-text'>Games</span>
        </NavLink>
      </div>
    </>
  );
};

export default SideBarNav;
