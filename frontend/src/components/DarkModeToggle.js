import React, { useState, useEffect } from 'react';
import './DarkModeToggle.css';

function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Leer del localStorage si existe, o usar la preferencia del sistema
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) return savedMode === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Aplicar el modo al body y guardar preferencia
    document.body.className = isDarkMode ? 'dark-mode' : 'light-mode';
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button 
      className={`dark-mode-toggle ${isDarkMode ? 'dark' : 'light'}`}
      onClick={toggleMode}
      aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <span className="toggle-icon">
        {isDarkMode ? '🌙' : '☀️'}
      </span>
      <span className="toggle-text">
        {isDarkMode ? 'Modo Noche' : 'Modo Día'}
      </span>
    </button>
  );
}

export default DarkModeToggle;