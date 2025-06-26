import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isSystemPreference, setIsSystemPreference] = useState(true);

  useEffect(() => {
    // Check for saved theme preference or default to system
    const savedTheme = localStorage.getItem('theme');
    const savedSystemPref = localStorage.getItem('useSystemTheme');
    
    if (savedSystemPref === 'false') {
      setIsSystemPreference(false);
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } else {
      // Use system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Update meta theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#ffffff');
    }
  }, [theme]);

  useEffect(() => {
    if (isSystemPreference) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        setTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [isSystemPreference]);

  const toggleTheme = () => {
    if (isSystemPreference) {
      setIsSystemPreference(false);
      localStorage.setItem('useSystemTheme', 'false');
    }
    
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setSystemPreference = () => {
    setIsSystemPreference(true);
    localStorage.setItem('useSystemTheme', 'true');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(systemTheme);
  };

  const setLightTheme = () => {
    setIsSystemPreference(false);
    setTheme('light');
    localStorage.setItem('theme', 'light');
    localStorage.setItem('useSystemTheme', 'false');
  };

  const setDarkTheme = () => {
    setIsSystemPreference(false);
    setTheme('dark');
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('useSystemTheme', 'false');
  };

  const value = {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemPreference,
    isSystemPreference,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};