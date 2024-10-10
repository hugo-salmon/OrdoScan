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
async function fetchMedicaments(query = '') {
  const url = query 
  ? `https://api.fda.gov/drug/label.json?limit=20&search=openfda.manufacturer_name:${query}`
  : 'https://api.fda.gov/drug/label.json?limit=300';
  const response = await fetch(url);
  const data = await response.json();
  const medicamentsDiv = document.getElementById('medicaments');
  medicamentsDiv.innerHTML = ''; 
  
  const seen = new Set(); // Pour stocker les NDCs déjà vus
  
  data.results.forEach(med => {
    if (med.openfda && med.openfda.brand_name && med.openfda.product_ndc && med.description) {
      
      const ndc = med.openfda.product_ndc[0]; // Utiliser le premier NDC
      
      // Si ce NDC n'a pas encore été vu, on l'ajoute et on l'affiche
      if (!seen.has(ndc)) {
        seen.add(ndc); // Marquer ce NDC comme déjà vu
        
        const medDiv = document.createElement('div');
        medDiv.classList.add('medicament');
        
        const name = med.openfda.manufacturer_name[0] || 'Nom non disponible';
        const usage = med.openfda.product_type[0] || 'Usage non disponible';
        const description = med.description ? med.description.toString() + '...' : 'Description non disponible';
        
        medDiv.innerHTML = `
        <div id ="médicament-collumn">
        <h2>${name}</h2><br>
        <p><strong>Usage:</strong> ${usage}</p>
        </div>
        <p class="description"><strong>Description:</strong> ${description}</p>
        `;
        
        medicamentsDiv.appendChild(medDiv);
      }
    }
  });
}

function searchMedicaments() {
  const query = document.getElementById('search').value;
  fetchMedicaments(query);
}

fetchMedicaments();

document.addEventListener('DOMContentLoaded', function () {
  const progressBar = document.getElementById('progress-bar');
  const progressContainer = document.getElementById('progress-container');
  
  function loadMedicaments() {
    progressContainer.style.visibility = 'visible'; 
    let progressValue = 0;
    
    const interval = setInterval(() => {
      if (progressValue < 100) {
        progressValue += 10; 
        progressBar.value = progressValue;
      } else {
        clearInterval(interval);
        progressContainer.style.visibility = 'hidden'; 
        displayMedicaments(); 
      }
    }, 1080); 
  }
  
  function displayMedicaments() {
    
    //document.getElementById('medicaments').innerHTML = '<p>Médicaments chargés !</p>';
  }
  loadMedicaments();
});

