// components/DarkModeToggle.js
import React, { useState } from 'react';

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark'); // Toggle dark mode class on the root HTML element
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-full ${
        darkMode ? 'translate-x-full bg-gray-600' : 'translate-x-0'
      } transition-transform duration-300 ease-in-out`}
    >
      {darkMode ? 'Dark Mode' : 'Light Mode'}
    </button>
  );
};

export default DarkModeToggle;
