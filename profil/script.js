// Function to save form data to local storage
function saveFormData() {
    const inputs = document.querySelectorAll('.profile-details input, .profile-details select');
    inputs.forEach(input => {
        localStorage.setItem(input.name, input.value); // Store each field's value in local storage
    });
}

// Function to load form data from local storage
function loadFormData() {
    const inputs = document.querySelectorAll('.profile-details input, .profile-details select');
    inputs.forEach(input => {
        if (localStorage.getItem(input.name)) {
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

    editButton.style.display = "inline-block";
    saveButton.style.display = "none";
    cancelButton.style.display = "none";
});

// Save Button: Validate and save the data
document.getElementById('profileForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    const inputs = document.querySelectorAll('.profile-details input, .profile-details select');
    let allValid = true;

    inputs.forEach(input => {
        if (input.value === "" || input.value == null) {
            allValid = false;
            input.style.border = "1px solid red"; // Highlight the missing fields
        } else {
            input.style.border = ""; // Remove the highlight if filled
        }
    });

    if (allValid) {
        saveFormData(); // Save the data to local storage
        alert("Données enregistrées avec succès!");

        const editButton = document.getElementById('editBtn');
        const saveButton = document.getElementById('saveBtn');
        const cancelButton = document.getElementById('cancelBtn');

        inputs.forEach(input => {
            input.disabled = true; // Disable all fields after saving
        });

        editButton.style.display = "inline-block";
        saveButton.style.display = "none";
        cancelButton.style.display = "none";
    } else {
        alert("Veuillez remplir tous les champs avant d'enregistrer.");
    }
});
