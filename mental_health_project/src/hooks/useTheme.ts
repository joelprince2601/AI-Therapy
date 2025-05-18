import { useState, useEffect } from 'react';

interface UseThemeReturn {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

/**
 * Custom hook for managing theme (dark/light mode)
 */
export const useTheme = (): UseThemeReturn => {
  const [darkMode, setDarkMode] = useState(false);

  // Load saved theme preference from localStorage on initial render
  // or use system preference as fallback
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('journal-dark-mode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Update document class and save preference whenever darkMode changes
  useEffect(() => {
    localStorage.setItem('journal-dark-mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return {
    darkMode,
    toggleDarkMode,
    setDarkMode
  };
}; 