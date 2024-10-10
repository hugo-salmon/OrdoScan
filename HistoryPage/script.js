const dropdown = document.querySelector('.dropdown');
const dropdownContent = document.querySelector('.dropdown-content');

let dropdownTimeout;

dropdown.addEventListener('mouseenter', () => {
  clearTimeout(dropdownTimeout);
  dropdownContent.style.display = 'block';
});

dropdown.addEventListener('mouseleave', () => {
  dropdownTimeout = setTimeout(() => {
    dropdownContent.style.display = 'none';
  }, 300);
});