import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from '../components/theme/ThemeProvider';
import Header from '../components/header';
import { FakeSOSocket } from '../types/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock user context
const MockUserContext = {
  user: {
    username: 'testuser',
    dateJoined: new Date().toISOString(),
  },
  socket: {} as FakeSOSocket,
};

jest.mock('../hooks/useUserContext', () => ({
  __esModule: true,
  default: () => MockUserContext,
}));

// Mock useHeader hook
jest.mock('../hooks/useHeader', () => ({
  __esModule: true,
  default: () => ({
    val: '',
    handleInputChange: jest.fn(),
    handleKeyDown: jest.fn(),
    handleSignOut: jest.fn(),
  }),
}));

describe('Theme Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.removeAttribute('data-theme');
    localStorageMock.clear();
  });

  test('Theme toggle button changes theme and updates localStorage', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </BrowserRouter>,
    );

    // Check initial theme
    expect(document.body.getAttribute('data-theme')).toBe('light');

    // Find and click theme toggle button
    const toggleButton = screen.getByRole('button', { name: /dark/i });
    fireEvent.click(toggleButton);

    // Check if theme was changed
    expect(document.body.getAttribute('data-theme')).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');

    // Toggle back to light theme
    const lightToggleButton = screen.getByRole('button', { name: /light/i });
    fireEvent.click(lightToggleButton);

    // Check if theme was changed back
    expect(document.body.getAttribute('data-theme')).toBe('light');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  test('Theme persists across component remounts', () => {
    // Set initial theme in localStorage
    localStorageMock.getItem.mockReturnValueOnce('dark');

    const { unmount } = render(
      <BrowserRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </BrowserRouter>,
    );

    // Check if initial theme was loaded from localStorage
    expect(document.body.getAttribute('data-theme')).toBe('dark');

    // Unmount and remount to simulate page refresh
    unmount();

    localStorageMock.getItem.mockReturnValueOnce('dark');

    render(
      <BrowserRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </BrowserRouter>,
    );

    // Check if theme was persisted
    expect(document.body.getAttribute('data-theme')).toBe('dark');
  });

  test('Theme is applied across multiple components', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <div className='app'>
            <Header />
            <div className='content'>Content</div>
          </div>
        </ThemeProvider>
      </BrowserRouter>,
    );

    // Toggle to dark theme
    const toggleButton = screen.getByRole('button', { name: /dark/i });
    fireEvent.click(toggleButton);

    // Check if theme attribute was applied to body
    expect(document.body.getAttribute('data-theme')).toBe('dark');
  });

  test('Theme defaults to light when no localStorage value exists', () => {
    // Ensure localStorage is empty
    localStorageMock.getItem.mockReturnValueOnce(null);

    render(
      <BrowserRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </BrowserRouter>,
    );

    // Check default theme is light
    expect(document.body.getAttribute('data-theme')).toBe('light');
  });

  test('Theme handles localStorage errors gracefully', () => {
    // Mock localStorage.getItem to throw an error
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error('Storage error');
    });

    // Should not crash
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </BrowserRouter>,
    );

    // Should default to light theme
    expect(document.body.getAttribute('data-theme')).toBe('light');
  });
});
