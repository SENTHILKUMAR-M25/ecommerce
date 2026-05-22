import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkTheme, setDarkTheme] = useState(() => {
    return localStorage.getItem('aura_theme') === 'dark';
  });

  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aura_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aura_theme', 'light');
    }
  }, [darkTheme]);

  const toggleTheme = () => setDarkTheme(prev => !prev);

  return (
    <ThemeContext.Provider value={{ darkTheme, setDarkTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
