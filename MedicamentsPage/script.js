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
async function fetchMedicaments(query = '') {
  const url = query 
  ? `https://api.fda.gov/drug/label.json?limit=20&search=openfda.manufacturer_name:${query}`
  : 'https://api.fda.gov/drug/label.json?limit=150';
  const response = await fetch(url);
  const data = await response.json();
  const medicamentsDiv = document.getElementById('medicaments');
  medicamentsDiv.innerHTML = ''; 
  
  const seen = new Set(); 
  
  data.results.forEach(med => {
    if (med.openfda && med.openfda.brand_name && med.openfda.product_ndc && med.description) {
      
      const ndc = med.openfda.product_ndc[0]; 
      
      if (!seen.has(ndc)) {
        seen.add(ndc); 
        
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

document.getElementById('search').addEventListener('input', function() {
  const clearIcon = document.getElementById('clearSearch');
  clearIcon.style.display = this.value ? 'inline' : 'none';
  searchMedicaments(); 
});

document.getElementById('clearSearch').addEventListener('click', function() {
  const searchInput = document.getElementById('search');
  searchInput.value = '';
  this.style.display = 'none';
  fetchMedicaments();
});


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
      }
    }, 300); 
  }
  loadMedicaments();
});

