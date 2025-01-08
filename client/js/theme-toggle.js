// client/js/theme-toggle.js

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }
  
    // Suppose you have a .theme-toggle button or <i>moon icon in your header
    const themeButton = document.querySelector('.theme-toggle'); 
    if (themeButton) {
      themeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('themeMode', isDark ? 'dark' : 'light');
      });
    }
  });
  