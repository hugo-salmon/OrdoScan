const dropdown = document.querySelector('.dropdown');
const dropdownContent = document.querySelector('.dropdown-content');

// Variable pour gérer le délai avant la fermeture
let dropdownTimeout;

// Afficher le menu lorsque la souris survole le bouton ou le contenu
dropdown.addEventListener('mouseenter', () => {
  clearTimeout(dropdownTimeout); // Annule le délai de fermeture
  dropdownContent.style.display = 'block';
});

// Masquer le menu après un délai lorsque la souris quitte le bouton ou le contenu
dropdown.addEventListener('mouseleave', () => {
  dropdownTimeout = setTimeout(() => {
    dropdownContent.style.display = 'none';
  }, 300); // Délai de 300 ms avant de masquer le menu
});