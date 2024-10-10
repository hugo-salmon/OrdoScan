// Sélection des éléments de la page
import { GOOGLE_API_KEY } from '../config.js';
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const loader = document.getElementById('loader');
const medicationModal = document.getElementById('medicationModal');
const medicationTable = document.getElementById('medicationTable').querySelector('tbody');
const closeModal = document.getElementById('closeModal');
const addMedication = document.getElementById('addMedication');
const confirmMedications = document.getElementById('confirmMedications');
const selectAllCheckbox = document.getElementById('selectAll');
const deleteSelectedButton = document.getElementById('deleteSelected');
const noMedicationsMessage = document.getElementById('noMedicationsMessage');
const noResultsMessage = document.getElementById('noResultsMessage');
const recapContainer = document.getElementById('recapContainer');
const recapTable = document.getElementById('recapTable').querySelector('tbody');
const previewContainer = document.getElementById('previewContainer'); // Nouveau conteneur pour l'aperçu
const previewImage = document.getElementById('previewImage'); // Image d'aperçu
const previewName = document.getElementById('previewName'); // Nom du fichier sélectionné
const removePreviewButton = document.getElementById('removePreview');
const addNewMedicationButton = document.getElementById('addNewMedicationButton');
const dropdown = document.querySelector('.dropdown');
const dropdownContent = document.querySelector('.dropdown-content');



const notyf = new Notyf({
    duration: 5000,
    position: {
        x: 'right',
        y: 'top',
    }
});

// S'assurer que la modale est cachée au démarrage
medicationModal.hidden = true;
previewContainer.style.display = 'none';

// Liste des médicaments connus pour la reconnaissance
const knownMedications = [
    'COZAAR', 'ASPIRINE CARDIO', 'TIEL DIEM', 'FERAMALT GEL', 'MELIANE',
    'DOLIPRANE', 'IBUPROFENE', 'EFFERALGAN', 'PARACETAMOL', 'ADVIL',
    'XANAX', 'LORAZEPAM', 'VALIUM', 'PROZAC', 'ZYPREXA',
    'AMOXICILLINE', 'AUGMENTIN', 'CEFTRIAXONE', 'DOXYCYCLINE', 'CIPROFLOXACINE',
    'LEVOTHYROX', 'METFORMINE', 'INSULINE', 'GLUCOPHAGE', 'LANTUS',
    'VENTOLINE', 'SERETIDE', 'SPIRIVA', 'SYMBICORT', 'FLIXOTIDE',
    'ATARAX', 'LEXOMIL', 'TEMESTA', 'ZOLPIDEM', 'STILNOX',
    'NEXIUM', 'OMEPRAZOLE', 'PANTOPRAZOLE', 'RANITIDINE', 'GAVISCON',
    'CRESTOR', 'LIPITOR', 'PRAVACHOL', 'ZOCOR', 'TRICOR',
    'LISINOPRIL', 'ENALAPRIL', 'RAMIPRIL', 'PERINDOPRIL', 'COVERSYL',
    'METOPROLOL', 'ATENOLOL', 'BISOPROLOL', 'CARVEDILOL', 'PROPRANOLOL',
    'LOSARTAN', 'VALSARTAN', 'CANDESARTAN', 'IRBESARTAN', 'OLMESARTAN',
    'FUROSEMIDE', 'HYDROCHLOROTHIAZIDE', 'SPIRONOLACTONE', 'LASILIX', 'ALDACTONE',
    'PLAVIX', 'CLOPIDOGREL', 'XARELTO', 'ELIQUIS', 'PRADAXA',
    'MORPHINE', 'TRAMADOL', 'CODEINE', 'FENTANYL', 'OXICODONE',
    'PAROXETINE', 'SERTRALINE', 'CITALOPRAM', 'ESCITALOPRAM', 'FLUOXETINE',
    'ARTHROTEC', 'CELEBREX', 'NAPROXENE', 'KETOPROFENE', 'DICLOFENAC',
    'SALBUTAMOL', 'BROMHEXINE', 'CLARITINE', 'ZYRTEC', 'CELIPROLOL',
    'VIAGRA', 'CIALIS', 'LEVITRA', 'SPEDRA', 'MYCOSTER',
    'INSUMAN', 'NOVORAPID', 'HUMALOG', 'ACTRAPID', 'LANTUS',
    'SINGULAIR', 'MONTELUKAST', 'ZADITEN', 'KETOTIFENE', 'AERIUS',
    'TRIMETHOPRIME', 'COTRIMOXAZOLE', 'FURADANTIN', 'FOSFOMYCINE', 'MACRODANTINE',
    'NIFEDIPINE', 'AMLODIPINE', 'VERAPAMIL', 'DILTIAZEM', 'LOXEN',
    'PREDNISOLONE', 'CORTANCYL', 'SOLUPRED', 'DIPROSONE', 'LOCOID',
    'BIODERMA', 'DUCRAY', 'URIAGE', 'LA ROCHE-POSAY', 'AVENE'
];

const ORDONNANCE_KEY = 'ordonnanceData';
const RECAP_KEY = 'recapData';
let zoomLevel = 100;

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

document.addEventListener('DOMContentLoaded', () => {
    loadOrdonnance();
    loadRecap();
});

document.getElementById('zoomIn').addEventListener('click', () => {
    if (zoomLevel < 200) { // Limite de zoom maximale (par exemple, 200%)
        zoomLevel += 10;
        updateZoom();
    }
});

document.getElementById('zoomOut').addEventListener('click', () => {
    if (zoomLevel > 50) { // Limite de zoom minimale (par exemple, 50%)
        zoomLevel -= 10;
        updateZoom();
    }
});

document.getElementById('resetZoom').addEventListener('click', () => {
    zoomLevel = 100; // Réinitialiser à 100%
    updateZoom();
});

function updateZoom() {
    const previewImage = document.getElementById('previewImage');
    previewImage.style.transform = `scale(${zoomLevel / 100})`;
    document.getElementById('zoomLevel').textContent = `${zoomLevel}%`;
}

function loadOrdonnance() {
    const savedData = JSON.parse(localStorage.getItem(ORDONNANCE_KEY));
    if (savedData && savedData.previewSrc) {
        previewImage.src = savedData.previewSrc;
        
        // Vérifier que previewName et fileInfo existent avant de modifier leur texte
        if (previewName) {
            previewName.textContent = savedData.fileName;
        }
        if (fileInfo) {
            fileInfo.textContent = `Fichier sélectionné : ${savedData.fileName}`;
        }
        
        fileInput.style.display = 'none';
        dropzone.style.display = 'none';
        previewContainer.style.display = 'block';
    } else if (fileInfo) {
        fileInfo.textContent = 'Aucun fichier sélectionné.';
    }
}



function saveOrdonnance(file, src) {
    const data = {
        fileName: file.name,
        previewSrc: src,
    };
    localStorage.setItem(ORDONNANCE_KEY, JSON.stringify(data));
}

function clearStorage() {
    localStorage.removeItem(ORDONNANCE_KEY);
    localStorage.removeItem(RECAP_KEY);
    fileInfo.textContent = 'Aucun fichier sélectionné.';
}

// Fonction pour charger le récapitulatif à partir du localStorage
function loadRecap() {
    const savedData = JSON.parse(localStorage.getItem(RECAP_KEY));
    if (savedData) {
        updateRecapTable(savedData);
        recapContainer.style.display = 'block';
    }
}
function saveRecap(data) {
    localStorage.setItem(RECAP_KEY, JSON.stringify(data));
    sendEmailWithICSLink(data); // Envoi de l'email avec les nouvelles données
}






// Gestion des événements pour la zone de dépôt
dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.style.backgroundColor = '#cde6ff';
});
dropzone.addEventListener('dragleave', () => {
    dropzone.style.backgroundColor = '#e6f2ff';
});
dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.style.backgroundColor = '#e6f2ff';
    const file = event.dataTransfer.files[0];
    handleFile(file);
});
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    handleFile(file);
});

// Affichage ou masquage du loader
function showLoader(show) {
    loader.hidden = !show;
    dropzone.style.opacity = show ? '0.5' : '1';
}

// Extraction des médicaments reconnus
function extractRecognizedMedications(text) {
    const upperText = text.toUpperCase();
    return knownMedications.filter(med => upperText.includes(med.toUpperCase()));
}

// Mise à jour du message "Aucun médicament présent"
function updateNoMedicationsMessage() {
    const hasMedications = medicationTable.querySelectorAll('tr').length > 0;
    noMedicationsMessage.style.display = hasMedications ? 'none' : 'block';
    noResultsMessage.style.display = hasMedications ? 'none' : 'block';
    updateConfirmButtonState();
}

function updateNoReminderMessage(reminderTimesContainer, noReminderMessage) {
    const hasReminderTimes = reminderTimesContainer.querySelectorAll('.reminderTimeItem').length > 0;
    noReminderMessage.style.display = hasReminderTimes ? 'none' : 'block';
}

function createMedicationSuggestionsInput(inputElement) {
    const datalistId = 'medicationSuggestions';
    let datalist = document.getElementById(datalistId);
    
    // Créer le datalist s'il n'existe pas encore
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = datalistId;
        document.body.appendChild(datalist);
    }
    
    // Mettre à jour le datalist avec les noms des médicaments connus
    datalist.innerHTML = '';
    knownMedications.forEach(med => {
        const option = document.createElement('option');
        option.value = med;
        datalist.appendChild(option);
    });
    
    // Associer le datalist au champ input
    inputElement.setAttribute('list', datalistId);
    
    // Ajouter un événement pour remplir le champ avec la suggestion choisie
    inputElement.addEventListener('input', () => {
        if (knownMedications.includes(inputElement.value.toUpperCase())) {
            inputElement.value = inputElement.value.toUpperCase();
        }
    });
}
// Remplissage du tableau des médicaments
function populateMedicationTable(medications) {
    medicationTable.innerHTML = '';
    medications.forEach(med => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td><input type="checkbox" class="rowCheckbox" /></td>
        <td><input type="text" value="${med}" placeholder="Nom du médicament" class="requiredField"></td>
        <td><input type="text" placeholder="Dosage (g, mg...)" class="requiredField"></td>
        <td>
        <div class="recurrence">
        <p class="noReminderMessage" style="display: none; color: #666; font-size: 12px;">Pas d'heure de rappel</p>
        <div class="reminderTimes"></div>
        <button type="button" class="addReminderTime">Ajouter une heure</button>
        </div>
        </td>
        <td><input type="number" placeholder="Récurrence (jours)" class="requiredField" min="1" value="1"></td>
        <td><input type="date" placeholder="Date de fin" class="requiredField"></td>
        <td><input type="text" placeholder="Notes"></td>
        `;
        medicationTable.appendChild(row);
        
        const nameInput = row.querySelector('td:nth-child(2) input');
        createMedicationSuggestionsInput(nameInput);
        
        const recurrenceInput = row.querySelector('input[type="number"]');
        
        recurrenceInput.addEventListener('input', () => {
            updateConfirmButtonState();
        });
        
        row.querySelectorAll('.requiredField').forEach(input => {
            input.addEventListener('input', updateConfirmButtonState);
        });
        
        const addReminderTimeButton = row.querySelector('.addReminderTime');
        const reminderTimesContainer = row.querySelector('.reminderTimes');
        const noReminderMessage = row.querySelector('.noReminderMessage');
        
        addReminderTimeButton.addEventListener('click', () => {
            const timeContainer = document.createElement('div');
            timeContainer.classList.add('reminderTimeItem');
            
            const timeInput = document.createElement('input');
            timeInput.type = 'time';
            timeInput.classList.add('requiredField');
            
            const removeIcon = document.createElement('i');
            removeIcon.classList.add('fas', 'fa-times', 'removeTimeIcon');
            removeIcon.addEventListener('click', () => {
                timeContainer.remove();
                updateNoReminderMessage(reminderTimesContainer, noReminderMessage);
                updateConfirmButtonState();
            });
            
            timeContainer.appendChild(timeInput);
            timeContainer.appendChild(removeIcon);
            reminderTimesContainer.appendChild(timeContainer);
            
            timeInput.addEventListener('input', updateConfirmButtonState);
            updateNoReminderMessage(reminderTimesContainer, noReminderMessage);
        });
        
        // Vérifier le message au chargement initial
        updateNoReminderMessage(reminderTimesContainer, noReminderMessage);
        
        row.querySelectorAll('.requiredField').forEach(input => {
            input.addEventListener('input', updateConfirmButtonState);
        });
    });
    updateNoMedicationsMessage();
    toggleDeleteButtonVisibility();
}


// Validation des champs pour activer le bouton "Confirmer"
// Validation des champs pour activer le bouton "Confirmer"
function updateConfirmButtonState() {
    const rows = medicationTable.querySelectorAll('tr');
    let allFieldsValid = true;
    
    rows.forEach(row => {
        const requiredFields = row.querySelectorAll('.requiredField:not([placeholder="Notes"])'); // Exclure le champ "Notes"
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                allFieldsValid = false;
            }
        });
        
        const recurrence = row.querySelector('input[type="number"]');
        if (!recurrence.value || parseInt(recurrence.value, 10) <= 0) {
            allFieldsValid = false;
        }
    });
    
    confirmMedications.disabled = !allFieldsValid;
    confirmMedications.style.opacity = allFieldsValid ? '1' : '0.6';
}



function getCurrentRecapData() {
    const rows = recapTable.querySelectorAll('tr');
    const medicationData = [];
    
    rows.forEach(row => {
        const name = row.querySelector('td:nth-child(1) input').value;
        const dosage = row.querySelector('td:nth-child(2) input').value;
        const endDate = row.querySelector('td:nth-child(5) input').value;
        const notes = row.querySelector('td:nth-child(6) input').value;
        const recurrence = row.querySelector('td:nth-child(4) input').value;
        const reminderTimes = Array.from(row.querySelectorAll('.reminderTimes input[type="time"]')).map(input => input.value);
        
        medicationData.push({
            name,
            dosage,
            endDate,
            notes,
            reminderTimes,
            recurrence: parseInt(recurrence, 10) || 1 
        });
    });
    
    return medicationData;
}

// Sélectionner ou désélectionner toutes les cases à cocher
selectAllCheckbox.addEventListener('change', () => {
    const checkboxes = medicationTable.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    toggleDeleteButtonVisibility();
});

// Afficher ou masquer le bouton "Supprimer les sélectionnés"
function toggleDeleteButtonVisibility() {
    const checkboxes = medicationTable.querySelectorAll('input[type="checkbox"]:checked');
    deleteSelectedButton.style.display = checkboxes.length > 0 ? 'block' : 'none';
}

// Suppression des lignes sélectionnées
deleteSelectedButton.addEventListener('click', () => {
    const checkboxes = medicationTable.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        if (row) {
            row.remove();
        }
    });
    selectAllCheckbox.checked = false;
    updateNoMedicationsMessage();
    toggleDeleteButtonVisibility();
});

// Gérer les changements de sélection des cases à cocher
medicationTable.addEventListener('change', (event) => {
    if (event.target.classList.contains('rowCheckbox')) {
        toggleDeleteButtonVisibility();
    }
});

// Ajout d'un médicament
addNewMedicationButton.addEventListener('click', () => {
    const newMedData = {
        name: '',
        dosage: '',
        reminderTimes: [],
        endDate: '',
        notes: ''
    };
    
    const updatedRecapData = [...JSON.parse(localStorage.getItem(RECAP_KEY) || '[]'), newMedData];
    
    updateRecapTable(updatedRecapData);
    
    // Afficher une notification immédiatement pour indiquer l'ajout
    notyf.success('Médicament ajouté au récapitulatif.');
    
    // Attendre un peu avant de sauvegarder les données dans le localStorage
    setTimeout(() => {
        saveRecap(updatedRecapData); // Sauvegarde les données et envoie le mail avec les nouvelles données
    }, 1000); // Délai de 300 ms
});


// Traitement du fichier
async function handleFile(file) {
    if (!file) {
        fileInfo.textContent = 'Aucun fichier sélectionné.';
        notyf.error('Aucun fichier sélectionné.');
        return;
    }
    
    if (!file.type.match('image.*')) {
        fileInfo.textContent = 'Veuillez sélectionner une image valide.';
        notyf.error('Veuillez sélectionner une image valide.');
        return;
    }
    
    // Masquer le message de fichier et afficher le conteneur d'aperçu
    fileInfo.textContent = `Fichier sélectionné : ${file.name}`;
    dropzone.style.display = 'none';
    previewContainer.style.display = 'block';
    notyf.success('Fichier ajouté avec succès.');
    
    // Créer un aperçu de l'image
    const reader = new FileReader();
    reader.onload = function() {
        previewImage.src = reader.result;
        saveOrdonnance(file, reader.result);
        analyzeImage(reader.result);
    };
    reader.readAsDataURL(file);
}

// Analyser l'image en utilisant l'API Google Vision
async function analyzeImage(imageData) {
    showLoader(true);
    const imageContent = imageData.split(',')[1];
    
    try {
        const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            requests: [{
                image: {
                    content: imageContent
                },
                features: [{ type: 'TEXT_DETECTION' }]
            }]
        })
    });
    
    const result = await response.json();
    
    if (result.responses[0].textAnnotations) {
        const extractedText = result.responses[0].textAnnotations[0].description;
        const recognizedMedications = extractRecognizedMedications(extractedText);
        
        if (recognizedMedications.length > 0) {
            populateMedicationTable(recognizedMedications);
            medicationModal.hidden = false; // Afficher la modale après l'analyse
        } else {
            alert('Aucun médicament reconnu dans l\'image.');
        }
    } else {
        alert('Aucun texte trouvé dans l\'image.');
    }
} catch (error) {
    console.error('Erreur:', error);
    alert('Une erreur est survenue lors du traitement de l\'image.');
} finally {
    showLoader(false);
}
}

// Réafficher la dropzone et masquer le conteneur d'aperçu si l'utilisateur souhaite annuler
removePreviewButton.addEventListener('click', () => {
    // Afficher une notification immédiatement pour indiquer la suppression
    notyf.success('Ordonnance et récapitulatif supprimés avec succès.');
    
    // Attendre un peu avant de procéder à la suppression et à la réinitialisation de l'affichage
    setTimeout(() => {
        // Effacer le stockage local pour l'ordonnance et le récapitulatif
        clearStorage();
        
        // Vider le contenu du récapitulatif, masquer le conteneur et réinitialiser l'affichage
        recapTable.innerHTML = '';
        updateRecapContainerVisibility(); // Masquer le conteneur si aucune donnée n'est présente
        
        // Réinitialiser les éléments de l'interface utilisateur
        fileInput.value = ''; // Réinitialiser l'input file pour permettre une nouvelle sélection
        dropzone.style.display = 'block'; // Afficher la zone de dépôt
        previewContainer.style.display = 'none'; // Masquer le conteneur d'aperçu
        previewImage.src = ''; // Réinitialiser l'image d'aperçu
        previewName.textContent = 'Aucun fichier sélectionné.'; // Vider le nom de l'aperçu
        fileInfo.textContent = 'Aucun fichier sélectionné.'; // Mettre à jour le message pour indiquer qu'il n'y a pas de fichier sélectionné
        
        // Masquer la modale au cas où elle serait ouverte
        medicationModal.hidden = true;
    }, 1000); // Délai de 300 ms
});









// Fermeture de la modale
closeModal.addEventListener('click', () => {
    medicationModal.hidden = true;
});

// Ajout d'un médicament
// Ajout d'un médicament
addMedication.addEventListener('click', () => {
    const row = document.createElement('tr');
    row.innerHTML = `
    <td><input type="checkbox" class="rowCheckbox" /></td>
    <td><input type="text" placeholder="Nom du médicament" class="requiredField"></td>
    <td><input type="text" placeholder="Dosage (g, mg...)" class="requiredField"></td>
    <td>
    <div class="recurrence">
    <div class="reminderTimes"></div>
    <button type="button" class="addReminderTime">Ajouter une heure</button>
    </div>
    </td>
    <td><input type="date" placeholder="Date de fin" class="requiredField"></td>
    <td><input type="text" placeholder="Notes"></td>
    `;
    medicationTable.appendChild(row);
    updateNoMedicationsMessage();
    toggleDeleteButtonVisibility();
    
    const nameInput = row.querySelector('td:nth-child(2) input');
    createMedicationSuggestionsInput(nameInput); // Ajouter les suggestions pour le nom du médicament
    
    const addReminderTimeButton = row.querySelector('.addReminderTime');
    const reminderTimesContainer = row.querySelector('.reminderTimes');
    
    addReminderTimeButton.addEventListener('click', () => {
        const timeContainer = document.createElement('div');
        timeContainer.classList.add('reminderTimeItem');
        
        const timeInput = document.createElement('input');
        timeInput.type = 'time';
        timeInput.classList.add('requiredField');
        
        const removeIcon = document.createElement('i');
        removeIcon.classList.add('fas', 'fa-times', 'removeTimeIcon');
        removeIcon.addEventListener('click', () => {
            timeContainer.remove();
            updateConfirmButtonState();
        });
        
        timeContainer.appendChild(timeInput);
        timeContainer.appendChild(removeIcon);
        reminderTimesContainer.appendChild(timeContainer);
        
        timeInput.addEventListener('input', updateConfirmButtonState);
    });
    
    row.querySelectorAll('.requiredField').forEach(input => {
        input.addEventListener('input', updateConfirmButtonState);
    });
    updateConfirmButtonState();
});

function sendEmailWithICSLink(medicationData) {
    fetch('http://localhost:3001/create-ics', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        medicationData: medicationData,
        recipientEmail: 'salmon.hugo69330@gmail.com', // Remplacez par l'adresse email de destination
    }),
})
.then(response => response.json())
.then(data => {
    if (data.message) {
        notyf.success('Email avec le lien ICS envoyé avec succès.');
    } else {
        notyf.error('Erreur lors de l\'envoi de l\'email avec le lien ICS.');
    }
})
.catch(error => console.error('Erreur lors de l\'envoi de l\'email avec le lien ICS :', error));
}


// Confirmation et récapitulatif des médicaments
// Correction de la récupération de la date de fin
confirmMedications.addEventListener('click', () => {
    const rows = medicationTable.querySelectorAll('tr');
    const medicationData = [];
    const today = new Date().toISOString().split('T')[0];
    let hasInvalidDate = false;
    
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const reminderTimes = Array.from(row.querySelectorAll('.reminderTimes input')).map(input => input.value);
        
        // Récupération de la date de fin depuis l'input de type date
        const endDateInput = row.querySelector('input[type="date"]');
        const endDate = endDateInput ? endDateInput.value : ''; 
        
        // Vérifier que la date de fin est supérieure ou égale à aujourd'hui
        if (endDate && endDate < today) {
            hasInvalidDate = true;
        }
        
        // Récupération des notes depuis leur champ dédié
        const notesInput = row.querySelector('input[placeholder="Notes"]');
        const notes = notesInput ? notesInput.value : ''; 
        
        // Récupération de la récursivité
        const recurrenceInput = row.querySelector('input[type="number"]');
        const recurrence = recurrenceInput ? parseInt(recurrenceInput.value, 10) || 1 : 1;
        
        const data = {
            name: inputs[1].value,
            dosage: inputs[2].value,
            reminderTimes: reminderTimes,
            endDate: endDate,
            notes: notes,
            recurrence: recurrence
        };
        
        medicationData.push(data);
    });
    
    if (hasInvalidDate) {
        notyf.error('La date de fin doit être supérieure ou égale à aujourd\'hui.');
        return; // Arrêter la sauvegarde si une date est invalide
    }
    
    // Afficher la notification de succès immédiatement avant la sauvegarde
    notyf.success('Médicaments ajoutés au récapitulatif avec succès.');
    
    // Sauvegarder les données et mettre à jour le récapitulatif après un léger délai de 500 ms
    setTimeout(() => {
        saveRecap(medicationData);
        updateRecapTable(medicationData);
        
        // Masquer la modale après la confirmation
        medicationModal.hidden = true;
        updateNoMedicationsMessage();
        sendEmailWithICSLink(medicationData);
    }, 500); // Délai de 500 ms pour laisser le temps à la notification de s'afficher
});




function updateRecapTable(medicationData) {
    recapTable.innerHTML = '';
    const isSingleMedication = medicationData.length === 1;
    medicationData.forEach((med, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td><input type="text" value="${med.name}" class="recapField" readonly></td>
        <td><input type="text" value="${med.dosage}" class="recapField" readonly></td>
        <td>
        <div class="recurrence">
        <p class="noReminderMessage" style="display: none; color: #666; font-size: 12px;">Pas d'heure de rappel</p>
        <div class="reminderTimes">
        ${med.reminderTimes.map(time => `
        <div class="reminderTimeItem">
        <input type="time" value="${time}" class="recapField" readonly>
        <i class="fas fa-times removeTimeIcon" style="display: none;"></i>
        </div>`).join('')}
        </div>
        <button type="button" class="addReminderTime" style="display: none;">Ajouter une heure</button>
        </div>
        </td>
        <td><input type="number" value="${med.recurrence}" class="recapField" readonly min="1"></td>
        <td><input type="date" value="${med.endDate}" class="recapField" readonly></td>
        <td><input type="text" value="${med.notes}" class="recapField" readonly></td>
        <td>
        <button class="editRecapRow">Modifier</button>
        <button class="cancelRecapRow" style="display: none;">Annuler</button>
        <button class="saveRecapRow" style="display: none; opacity: 0.6;" disabled>Sauvegarder</button>
        <button class="deleteRecapRow" ${isSingleMedication ? 'disabled' : ''}>
        Supprimer
        ${isSingleMedication ? '<i class="tooltip-icon" title="Impossible de supprimer le seul médicament.">i</i>' : ''}
        </button>
        </td>
        `;
        recapTable.appendChild(row);
        
        const nameInput = row.querySelector('td:nth-child(1) input');
        createMedicationSuggestionsInput(nameInput); // Ajouter les suggestions pour le nom du médicament
        
        const editButton = row.querySelector('.editRecapRow');
        const cancelButton = row.querySelector('.cancelRecapRow');
        const saveButton = row.querySelector('.saveRecapRow');
        const deleteButton = row.querySelector('.deleteRecapRow');
        const addReminderTimeButton = row.querySelector('.addReminderTime');
        const reminderTimesContainer = row.querySelector('.reminderTimes');
        const noReminderMessage = row.querySelector('.noReminderMessage');
        const removeTimeIcons = row.querySelectorAll('.removeTimeIcon');
        
        // Variable pour stocker l'état original et suivre les changements
        let originalState = null;
        let hasChanges = false;
        
        // Fonction pour sauvegarder l'état actuel
        function saveOriginalState() {
            originalState = {
                name: row.querySelector('td:nth-child(1) input').value,
                dosage: row.querySelector('td:nth-child(2) input').value,
                endDate: row.querySelector('td:nth-child(5) input').value,
                notes: row.querySelector('td:nth-child(6) input').value, // Inclure les notes ici
                reminderTimes: Array.from(reminderTimesContainer.querySelectorAll('input[type="time"]')).map(input => input.value),
                recurrence: row.querySelector('td:nth-child(4) input').value
            };
            hasChanges = false;
            updateSaveButtonState();
        }
        
        // Fonction pour restaurer l'état original
        function restoreOriginalState() {
            if (originalState) {
                // Restaurer les valeurs des champs principaux
                row.querySelector('td:nth-child(1) input').value = originalState.name;
                row.querySelector('td:nth-child(2) input').value = originalState.dosage;
                row.querySelector('td:nth-child(5) input').value = originalState.endDate;
                row.querySelector('td:nth-child(6) input').value = originalState.notes;
                row.querySelector('td:nth-child(4) input').value = originalState.recurrence;
                
                // Restaurer les heures de rappel
                reminderTimesContainer.innerHTML = '';
                originalState.reminderTimes.forEach(time => {
                    const timeContainer = document.createElement('div');
                    timeContainer.classList.add('reminderTimeItem');
                    
                    const timeInput = document.createElement('input');
                    timeInput.type = 'time';
                    timeInput.value = time;
                    timeInput.classList.add('recapField');
                    timeInput.readOnly = true;
                    
                    const removeIcon = document.createElement('i');
                    removeIcon.classList.add('fas', 'fa-times', 'removeTimeIcon');
                    removeIcon.style.display = 'none';
                    
                    timeContainer.appendChild(timeInput);
                    timeContainer.appendChild(removeIcon);
                    reminderTimesContainer.appendChild(timeContainer);
                });
                
                // Rétablir l'affichage des boutons et l'état des champs
                updateNoReminderMessage(reminderTimesContainer, noReminderMessage);
                hasChanges = false;
                updateSaveButtonState();
            }
        }
        
        // Fonction pour mettre à jour l'état du bouton Sauvegarder
        // Fonction pour mettre à jour l'état du bouton Sauvegarder
        function updateSaveButtonState() {
            const nameInput = row.querySelector('td:nth-child(1) input');
            const dosageInput = row.querySelector('td:nth-child(2) input');
            const endDateInput = row.querySelector('td:nth-child(5) input');
            const reminderInputs = row.querySelectorAll('.reminderTimes input[type="time"]');
            const recurrenceInput = row.querySelector('td:nth-child(4) input');
            
            // Vérifier que tous les champs requis sont remplis
            let allFieldsValid = true;
            
            if (!nameInput.value.trim() || 
            !dosageInput.value.trim() || 
            !endDateInput.value.trim() || 
            !recurrenceInput.value || 
            parseInt(recurrenceInput.value, 10) <= 0 || 
            reminderInputs.length === 0) {
                allFieldsValid = false;
            }
            
            // Vérifier que toutes les heures de rappel sont remplies
            reminderInputs.forEach(input => {
                if (!input.value) {
                    allFieldsValid = false;
                }
            });
            
            // Activer le bouton seulement si tous les champs sont valides ET s'il y a eu des changements
            saveButton.disabled = !hasChanges || !allFieldsValid;
            saveButton.style.opacity = (hasChanges && allFieldsValid) ? '1' : '0.6';
        }
        
        
        
        
        // Fonction pour détecter les changements
        // Fonction pour détecter les changements
        function detectChanges() {
            if (!originalState) return;
            
            const currentState = {
                name: row.querySelector('td:nth-child(1) input').value,
                dosage: row.querySelector('td:nth-child(2) input').value,
                endDate: row.querySelector('td:nth-child(5) input').value,
                notes: row.querySelector('td:nth-child(6) input').value,
                reminderTimes: Array.from(row.querySelectorAll('.reminderTimes input[type="time"]')).map(input => input.value),
                recurrence: row.querySelector('td:nth-child(4) input').value
            };
            
            // Vérifier si au moins un champ a été modifié
            hasChanges = (
                currentState.name !== originalState.name ||
                currentState.dosage !== originalState.dosage ||
                currentState.endDate !== originalState.endDate ||
                currentState.notes !== originalState.notes ||
                currentState.recurrence !== originalState.recurrence ||
                JSON.stringify(currentState.reminderTimes) !== JSON.stringify(originalState.reminderTimes)
                );
                
                updateSaveButtonState();
            }
            
            
            
            // Gérer le mode édition
            editButton.addEventListener('click', () => {
                saveOriginalState();
                
                // Rendre les champs éditables
                row.querySelectorAll('.recapField').forEach(input => {
                    input.readOnly = false;
                    
                    // Ajouter les écouteurs d'événements pour détecter les changements
                    input.addEventListener('input', detectChanges);
                    input.addEventListener('change', detectChanges);
                });
                
                // Afficher les contrôles d'édition
                addReminderTimeButton.style.display = 'block';
                reminderTimesContainer.querySelectorAll('.removeTimeIcon').forEach(icon => {
                    icon.style.display = 'inline-block';
                    icon.addEventListener('click', detectChanges);
                });
                
                editButton.style.display = 'none';
                cancelButton.style.display = 'inline-block';
                saveButton.style.display = 'inline-block';
                deleteButton.style.display = 'none';
            });
            
            // Gérer l'annulation
            cancelButton.addEventListener('click', () => {
                restoreOriginalState();
                row.querySelectorAll('.recapField').forEach(input => input.readOnly = true);
                addReminderTimeButton.style.display = 'none';
                removeTimeIcons.forEach(icon => icon.style.display = 'none');
                cancelButton.style.display = 'none';
                saveButton.style.display = 'none';
                editButton.style.display = 'inline-block';
                deleteButton.style.display = 'inline-block';
                notyf.success('Modifications annulées.');
            });
            
            // Gérer la sauvegarde
            // Gérer la sauvegarde
            saveButton.addEventListener('click', () => {
                const today = new Date().toISOString().split('T')[0];
                const endDateInput = row.querySelector('td:nth-child(5) input'); // Assurez-vous que le bon champ est sélectionné
                if (endDateInput && endDateInput.value && endDateInput.value < today) {
                    notyf.error('La date de fin doit être supérieure ou égale à aujourd\'hui.');
                    return; // Arrêter la sauvegarde si la date est invalide
                }
                
                // Marquer les champs comme readonly à nouveau
                row.querySelectorAll('.recapField').forEach(input => input.readOnly = true);
                addReminderTimeButton.style.display = 'none';
                reminderTimesContainer.querySelectorAll('.removeTimeIcon').forEach(icon => icon.style.display = 'none');
                cancelButton.style.display = 'none';
                saveButton.style.display = 'none';
                editButton.style.display = 'inline-block';
                deleteButton.style.display = 'inline-block';
                saveOriginalState();
                
                const updatedData = getCurrentRecapData();
                
                // Afficher une notification de succès
                notyf.success('Médicament modifié avec succès.');
                
                // Sauvegarder les données après un délai pour permettre l'affichage de la notification
                setTimeout(() => {
                    saveRecap(updatedData);
                }, 1000); // Délai de 500 ms
            });
            
            
            
            
            // Gérer l'ajout d'heures de rappel
            addReminderTimeButton.addEventListener('click', () => {
                const timeContainer = document.createElement('div');
                timeContainer.classList.add('reminderTimeItem');
                const timeInput = document.createElement('input');
                timeInput.type = 'time';
                timeInput.classList.add('recapField');
                
                const removeIcon = document.createElement('i');
                removeIcon.classList.add('fas', 'fa-times', 'removeTimeIcon');
                removeIcon.style.display = 'inline-block';
                removeIcon.addEventListener('click', () => {
                    timeContainer.remove();
                    updateNoReminderMessage(reminderTimesContainer, noReminderMessage);
                    detectChanges();
                });
                
                timeContainer.appendChild(timeInput);
                timeContainer.appendChild(removeIcon);
                reminderTimesContainer.appendChild(timeContainer);
                
                timeInput.addEventListener('input', detectChanges);
                updateNoReminderMessage(reminderTimesContainer, noReminderMessage);
            });
            
            // Gérer la suppression de la ligne
            deleteButton.addEventListener('click', () => {
                row.remove();
                
                // Afficher une notification immédiatement pour indiquer la suppression
                notyf.success('Médicament supprimé du récapitulatif.');
                
                // Attendre un peu avant de sauvegarder les données dans le localStorage
                setTimeout(() => {
                    saveRecap(getCurrentRecapData());
                    updateRecapContainerVisibility();
                }, 1000); // Délai de 300 ms
            });
            
            updateNoReminderMessage(reminderTimesContainer, noReminderMessage);
        });
        
        updateRecapContainerVisibility();
    }
    
    
    
    
    // Afficher ou masquer la section de récapitulatif
    function updateRecapContainerVisibility() {
        const hasRecapData = recapTable.querySelectorAll('tr').length > 0;
        recapContainer.style.display = hasRecapData ? 'block' : 'none';
    }
