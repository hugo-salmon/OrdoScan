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

const notyf = new Notyf({
    duration: 3000,
    position: {
        x: 'right',
        y: 'top',
    }
});

// Function to save form data to local storage
function saveFormData() {
    const inputs = document.querySelectorAll('.profile-details input, .profile-details select');
    const phoneNumber = document.querySelector('input[name="telephone"]').value;
    
    // Store the phone number
    localStorage.setItem('telephone', phoneNumber);
    
    inputs.forEach(input => {
        localStorage.setItem(input.name, input.value);
    });
    
    notyf.success('Données enregistrées avec succès!');
    toggleEditMode(false);
}

// Function to load form data from local storage
function loadFormData() {
    const inputs = document.querySelectorAll('.profile-details input, .profile-details select');
    
    document.querySelector('input[name="telephone"]').value = localStorage.getItem('telephone') || '';
    
    inputs.forEach(input => {
        if (localStorage.getItem(input.name)) {
            input.value = localStorage.getItem(input.name);
        }
    });
}

// Function to toggle between edit and view modes
function toggleEditMode(isEditing) {
    const inputs = document.querySelectorAll('.profile-details input, .profile-details select');
    const editButton = document.getElementById('editBtn');
    const saveButton = document.getElementById('saveBtn');
    const cancelButton = document.getElementById('cancelBtn');
    
    inputs.forEach(input => {
        input.disabled = !isEditing;
    });
    
    editButton.style.display = isEditing ? 'none' : 'inline-block';
    saveButton.style.display = isEditing ? 'inline-block' : 'none';
    cancelButton.style.display = isEditing ? 'inline-block' : 'none';
}

// Edit Button: Enable fields for editing
document.getElementById('editBtn').addEventListener('click', () => toggleEditMode(true));

// Cancel Button: Revert changes and disable fields
document.getElementById('cancelBtn').addEventListener('click', () => {
    loadFormData();
    toggleEditMode(false);
    notyf.success('Modifications annulées.');
});

// Save Button: Validate and save the data
document.getElementById('profileForm').addEventListener('submit', function (event) {
    event.preventDefault();
    if (validateForm()) {
        saveFormData();
    }
});

// Function to validate the form
function validateForm() {
    const inputs = document.querySelectorAll('.profile-details input, .profile-details select');
    const phoneInput = document.querySelector('input[name="telephone"]');
    const dobInput = document.querySelector('input[name="dob"]');
    const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/; // Valid French phone number
    const today = new Date();
    const dob = new Date(dobInput.value);
    let allValid = true;
    
    inputs.forEach(input => {
        const isValid = validateField(input);
        allValid = allValid && isValid;
    });
    
    if (!phoneRegex.test(phoneInput.value)) {
        setFieldError(phoneInput, 'Veuillez entrer un numéro de téléphone français valide.');
        allValid = false;
    } else {
        clearFieldError(phoneInput);
    }
    
    if (dob >= today) {
        setFieldError(dobInput, 'La date de naissance doit être antérieure à aujourd\'hui.');
        allValid = false;
    } else {
        clearFieldError(dobInput);
    }
    
    return allValid;
}

// Function to validate individual fields
function validateField(field) {
    if (!field.value.trim()) {
        setFieldError(field, 'Ce champ est requis.');
        return false;
    } else if (field.type === 'email' && !validateEmail(field.value)) {
        setFieldError(field, 'Veuillez entrer une adresse e-mail valide.');
        return false;
    } else {
        clearFieldError(field);
        return true;
    }
}

// Function to validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to set error on a field
function setFieldError(field, message) {
    field.style.border = '1px solid red';
    const errorMessage = document.createElement('span');
    errorMessage.className = 'error-message';
    errorMessage.style.color = 'red';
    errorMessage.style.fontSize = '0.9rem';
    errorMessage.textContent = message;
    
    clearFieldError(field);
    field.parentNode.appendChild(errorMessage);
    notyf.error(message);
}

// Function to clear error from a field
function clearFieldError(field) {
    field.style.border = '';
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

// Load data when the page loads
window.onload = loadFormData;
