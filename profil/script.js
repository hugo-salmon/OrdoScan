// Initialize Notyf instance
const notyf = new Notyf({
    duration: 3000, // Notification will disappear after 3 seconds
    position: {
        x: 'center', // Centered horizontally
        y: 'top', // Positioned at the top of the screen
    }
});

// Function to save form data to local storage
function saveFormData() {
    const inputs = document.querySelectorAll('.profile-details input, .profile-details select');
    const phonePrefix = document.getElementById('phonePrefix').value; // Get selected prefix
    const phoneNumber = document.querySelector('input[name="telephone"]').value;

    // Store the full phone number (prefix + number)
    localStorage.setItem('telephone', phonePrefix + phoneNumber);

    inputs.forEach(input => {
        if (input.name !== 'telephone') {
            localStorage.setItem(input.name, input.value); // Store other fields normally
        }
    });

    notyf.success('Données enregistrées avec succès!'); // Show success notification

    // After saving, revert to view mode
    const editButton = document.getElementById('editBtn');
    const saveButton = document.getElementById('saveBtn');
    const cancelButton = document.getElementById('cancelBtn');

    inputs.forEach(input => {
        input.disabled = true; // Disable fields after saving
    });

    editButton.style.display = "inline-block"; // Show "Modifier" button again
    saveButton.style.display = "none"; // Hide "Enregistrer" button
    cancelButton.style.display = "none"; // Hide "Annuler" button
}

// Function to load form data from local storage
function loadFormData() {
    const inputs = document.querySelectorAll('.profile-details input, .profile-details select');
    const storedPhoneNumber = localStorage.getItem('telephone');
    if (storedPhoneNumber) {
        const phonePrefix = storedPhoneNumber.slice(0, storedPhoneNumber.indexOf(' ')); // Extract prefix
        const phoneNumber = storedPhoneNumber.slice(storedPhoneNumber.indexOf(' ') + 1); // Extract phone number

        document.getElementById('phonePrefix').value = phonePrefix; // Set the selected prefix
        document.querySelector('input[name="telephone"]').value = phoneNumber; // Set the phone number
    }

    inputs.forEach(input => {
        if (localStorage.getItem(input.name) && input.name !== 'telephone') {
            input.value = localStorage.getItem(input.name); // Set the field value from local storage
        }
    });
}

// Call the function to load data from local storage when the page loads
window.onload = function() {
    loadFormData();
};

// Edit Button: Enable fields for editing
document.getElementById('editBtn').addEventListener('click', function() {
    const inputs = document.querySelectorAll('.profile-details input, .profile-details select');
    const editButton = document.getElementById('editBtn');
    const saveButton = document.getElementById('saveBtn');
    const cancelButton = document.getElementById('cancelBtn');

    inputs.forEach(input => {
        input.disabled = false; // Enable the fields
    });

    editButton.style.display = "none";
    saveButton.style.display = "inline-block";
    cancelButton.style.display = "inline-block";
});

// Cancel Button: Revert changes and disable fields
document.getElementById('cancelBtn').addEventListener('click', function() {
    const inputs = document.querySelectorAll('.profile-details input, .profile-details select');
    const editButton = document.getElementById('editBtn');
    const saveButton = document.getElementById('saveBtn');
    const cancelButton = document.getElementById('cancelBtn');

    loadFormData(); // Revert to saved data from local storage
    inputs.forEach(input => {
        input.disabled = true; // Disable all fields
    });

    // Show "Modifier" button again, hide "Enregistrer" and "Annuler"
    editButton.style.display = "inline-block";
    saveButton.style.display = "none";
    cancelButton.style.display = "none";

    notyf.error("Modifications annulées."); // Show cancellation notification
});

// Save Button: Validate and save the data
document.getElementById('profileForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    const inputs = document.querySelectorAll('.profile-details input, .profile-details select');
    const phonePrefix = document.getElementById('phonePrefix').value;
    const phoneInput = document.querySelector('input[name="telephone"]');
    const phoneRegex = /^\d{9,10}$/; // Validate only the phone number without prefix
    let allValid = true;

    inputs.forEach(input => {
        if (input.value === "" || input.value == null) {
            allValid = false;
            input.style.border = "1px solid red"; // Highlight the missing fields
        } else {
            input.style.border = ""; // Remove the highlight if filled
        }
    });

    // Check if the phone number is valid (without prefix)
    if (!phoneRegex.test(phoneInput.value)) {
        allValid = false;
        phoneInput.style.border = "1px solid red"; // Highlight invalid phone number
        notyf.error("Le numéro de téléphone est invalide. Veuillez entrer un numéro valide.");
    }

    if (allValid) {
        saveFormData(); // Save the data to local storage
    } else {
        notyf.error("Veuillez remplir tous les champs avant d'enregistrer."); // Show error notification
    }
});
