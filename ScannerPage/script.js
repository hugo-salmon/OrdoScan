// Sélection des éléments de la page
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

// S'assurer que la modale est cachée au démarrage
medicationModal.hidden = true;

// Liste des médicaments connus pour la reconnaissance
const knownMedications = [
    'COZAAR', 'ASPIRINE CARDIO', 'TIEL DIEM', 'FERAMALT GEL', 'MELIANE',
    'DOLIPRANE', 'IBUPROFENE', 'EFFERALGAN', 'PARACETAMOL', 'ADVIL',
];

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
                    <label>Heure(s) de rappel :</label>
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

    fileInfo.textContent = `Fichier sélectionné : ${file.name}`;
    showLoader(true);

    const reader = new FileReader();
    reader.onload = async function() {
        const imageData = reader.result.split(',')[1];
        try {
            const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCR6hxH_BphORge_idpW1cLJLtUBQN1WrA', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    requests: [{
                        image: {
                            content: imageData
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
                    medicationModal.hidden = false;
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
    };
    
    reader.readAsDataURL(file);
}

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
                <label>Heure(s) de rappel :</label>
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

// Mettre à jour la table de récapitulatif
function updateRecapTable(medicationData) {
    recapTable.innerHTML = '';
    medicationData.forEach((med, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" value="${med.name}" class="recapField"></td>
            <td><input type="text" value="${med.dosage}" class="recapField"></td>
            <td>${med.reminderTimes.map(time => `<input type="time" value="${time}" class="recapField">`).join('<br>')}</td>
            <td><input type="date" value="${med.endDate}" class="recapField"></td>
            <td><input type="text" value="${med.notes}" class="recapField"></td>
            <td><button class="deleteRecapRow" data-index="${index}">Supprimer</button></td>
        `;
        recapTable.appendChild(row);

        // Ajoute un écouteur d'événements pour supprimer la ligne spécifique
        row.querySelector('.deleteRecapRow').addEventListener('click', () => {
            row.remove();
            updateRecapContainerVisibility();
        });
    });

    updateRecapContainerVisibility();
}

// Afficher ou masquer la section de récapitulatif
function updateRecapContainerVisibility() {
    const hasRecapData = recapTable.querySelectorAll('tr').length > 0;
    recapContainer.style.display = hasRecapData ? 'block' : 'none';
}
