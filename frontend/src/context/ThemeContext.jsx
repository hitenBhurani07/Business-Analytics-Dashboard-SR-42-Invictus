import { createContext, useContext } from 'react';

const ThemeContext = createContext();

// Light mode only - no theme switching
export const ThemeProvider = ({ children }) => {
  const value = { isDark: false, toggleTheme: () => {} };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
