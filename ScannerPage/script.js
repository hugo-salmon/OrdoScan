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

// S'assurer que la modale est cachée au démarrage
medicationModal.hidden = true;
previewContainer.style.display = 'none';

// Liste des médicaments connus pour la reconnaissance
const knownMedications = [
    'COZAAR', 'ASPIRINE CARDIO', 'TIEL DIEM', 'FERAMALT GEL', 'MELIANE',
    'DOLIPRANE', 'IBUPROFENE', 'EFFERALGAN', 'PARACETAMOL', 'ADVIL',
];

let zoomLevel = 100;

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
            <td><input type="date" placeholder="Date de fin" class="requiredField"></td>
            <td><input type="text" placeholder="Notes"></td>
        `;
        medicationTable.appendChild(row);

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
function updateConfirmButtonState() {
    const rows = medicationTable.querySelectorAll('tr');
    let allFieldsValid = true;

    rows.forEach(row => {
        const requiredFields = row.querySelectorAll('.requiredField');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                allFieldsValid = false;
            }
        });
    });

    confirmMedications.disabled = !allFieldsValid;
    confirmMedications.style.opacity = allFieldsValid ? '1' : '0.6';
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

// Traitement du fichier
async function handleFile(file) {
    if (!file) {
        fileInfo.textContent = 'Aucun fichier sélectionné.';
        return;
    }

    if (!file.type.match('image.*')) {
        fileInfo.textContent = 'Veuillez sélectionner une image valide.';
        return;
    }

    // Masquer le message de fichier et afficher le conteneur d'aperçu
    fileInfo.style.display = 'none';
    dropzone.style.display = 'none';
    previewContainer.style.display = 'block';
    previewName.textContent = `Fichier sélectionné : ${file.name}`;

    // Créer un aperçu de l'image
    const reader = new FileReader();
    reader.onload = function() {
        previewImage.src = reader.result;

        // Analyser le texte une fois que l'image est chargée
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
    fileInput.value = '';
    dropzone.style.display = 'block';
    previewContainer.style.display = 'none';
    previewImage.src = '';
    previewName.textContent = '';
    fileInfo.style.display = 'block';
    fileInfo.textContent = 'Aucun fichier sélectionné.';

    // Vider le contenu du récapitulatif et masquer le conteneur
    recapTable.innerHTML = '';
    recapContainer.style.display = 'none';

    // Masquer la modale au cas où elle serait ouverte
    medicationModal.hidden = true;
});

// Fermeture de la modale
closeModal.addEventListener('click', () => {
    medicationModal.hidden = true;
});

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

// Confirmation et récapitulatif des médicaments
confirmMedications.addEventListener('click', () => {
    const rows = medicationTable.querySelectorAll('tr');
    const medicationData = [];

    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const reminderTimes = Array.from(row.querySelectorAll('.reminderTimes input')).map(input => input.value);

        const data = {
            name: inputs[1].value,
            dosage: inputs[2].value,
            reminderTimes: reminderTimes,
            endDate: inputs[4].value,
            notes: inputs[5].value
        };
        medicationData.push(data);
    });

    updateRecapTable(medicationData);
    medicationModal.hidden = true;
    fileInput.value = '';
    fileInfo.textContent = 'Aucun fichier sélectionné.';
    updateNoMedicationsMessage();
});

function updateRecapTable(medicationData) {
    recapTable.innerHTML = '';
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
            <td><input type="date" value="${med.endDate}" class="recapField" readonly></td>
            <td><input type="text" value="${med.notes}" class="recapField" readonly></td>
            <td>
                <button class="editRecapRow">Modifier</button>
                <button class="cancelRecapRow" style="display: none;">Annuler</button>
                <button class="saveRecapRow" style="display: none; opacity: 0.6;" disabled>Sauvegarder</button>
                <button class="deleteRecapRow">Supprimer</button>
            </td>
        `;
        recapTable.appendChild(row);

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
                endDate: row.querySelector('td:nth-child(4) input').value,
                notes: row.querySelector('td:nth-child(5) input').value,
                reminderTimes: Array.from(reminderTimesContainer.querySelectorAll('input[type="time"]')).map(input => input.value)
            };
            hasChanges = false;
            updateSaveButtonState();
        }

        // Fonction pour restaurer l'état original
        function restoreOriginalState() {
            if (originalState) {
                row.querySelector('td:nth-child(1) input').value = originalState.name;
                row.querySelector('td:nth-child(2) input').value = originalState.dosage;
                row.querySelector('td:nth-child(4) input').value = originalState.endDate;
                row.querySelector('td:nth-child(5) input').value = originalState.notes;
        
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
                    removeIcon.addEventListener('click', () => {
                        timeContainer.remove();
                        updateNoReminderMessage(reminderTimesContainer, noReminderMessage);
                        detectChanges();
                    });
        
                    timeContainer.appendChild(timeInput);
                    timeContainer.appendChild(removeIcon);
                    reminderTimesContainer.appendChild(timeContainer);
                });
        
                updateNoReminderMessage(reminderTimesContainer, noReminderMessage);
                hasChanges = false;
                updateSaveButtonState();
            }
        }

        // Fonction pour mettre à jour l'état du bouton Sauvegarder
        function updateSaveButtonState() {
            saveButton.disabled = !hasChanges;
            saveButton.style.opacity = hasChanges ? '1' : '0.6';
        }

        // Fonction pour détecter les changements
        function detectChanges() {
            const currentState = {
                name: row.querySelector('td:nth-child(1) input').value,
                dosage: row.querySelector('td:nth-child(2) input').value,
                endDate: row.querySelector('td:nth-child(4) input').value,
                notes: row.querySelector('td:nth-child(5) input').value,
                reminderTimes: Array.from(reminderTimesContainer.querySelectorAll('input[type="time"]')).map(input => input.value)
            };
            hasChanges = JSON.stringify(currentState) !== JSON.stringify(originalState);
            updateSaveButtonState();
        }

        // Gérer le mode édition
        editButton.addEventListener('click', () => {
            saveOriginalState();
            row.querySelectorAll('.recapField').forEach(input => input.readOnly = false);
            addReminderTimeButton.style.display = 'block';
            reminderTimesContainer.querySelectorAll('.removeTimeIcon').forEach(icon => icon.style.display = 'inline-block');
            editButton.style.display = 'none';
            cancelButton.style.display = 'inline-block';
            saveButton.style.display = 'inline-block';
            deleteButton.style.display = 'none';

            row.querySelectorAll('.recapField').forEach(input => {
                input.addEventListener('input', detectChanges);
            });
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
        });

        // Gérer la sauvegarde
        saveButton.addEventListener('click', () => {
            row.querySelectorAll('.recapField').forEach(input => input.readOnly = true);
            addReminderTimeButton.style.display = 'none';
            reminderTimesContainer.querySelectorAll('.removeTimeIcon').forEach(icon => icon.style.display = 'none');
            cancelButton.style.display = 'none';
            saveButton.style.display = 'none';
            editButton.style.display = 'inline-block';
            deleteButton.style.display = 'inline-block';
            saveOriginalState();
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
            updateRecapContainerVisibility();
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
