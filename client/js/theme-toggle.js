
 // DOM ачаалсны дараа theme-ийг тохируулах
 document.addEventListener('DOMContentLoaded', () => {
  // Өмнөх theme-ийг localStorage-оос авах
  const savedTheme = localStorage.getItem('themeMode');
  if (savedTheme === 'dark') {
      // Dark mode-г тохируулах
      document.body.classList.add('dark-mode');
  }

  // Header доторх .theme-toggle товч эсвэл moon icon-ийг хайх
  const themeButton = document.querySelector('.theme-toggle'); 
  if (themeButton) {
      // Theme солих товчинд сонсогч нэмэх
      themeButton.addEventListener('click', () => {
          // Dark mode-г toggle хийх
          document.body.classList.toggle('dark-mode');

          // Dark эсэхийг шалгах ба localStorage-д хадгалах
          const isDark = document.body.classList.contains('dark-mode');
          localStorage.setItem('themeMode', isDark ? 'dark' : 'light');
      });
  }
});
