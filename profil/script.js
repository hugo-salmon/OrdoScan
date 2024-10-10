function toggleEdit() {
    const inputs = document.querySelectorAll('.profile-details input, .profile-details select');
    const button = document.getElementById('editBtn');

    inputs.forEach(input => {
        input.disabled = !input.disabled; // Toggle the disabled state
    });

    // Toggle button text between "Modifier" and "Enregistrer"
    if (button.textContent === "Modifier le profil") {
        button.textContent = "Enregistrer";
    } else {
        button.textContent = "Modifier le profil";
    }
}