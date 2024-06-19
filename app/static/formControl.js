function validatePhoneNumber(phoneNumber) {
    // regex n. tel internazionali e italiani
    const phonePattern = /^(\+?\d{1,4}[\s-]?)?((\d{3}[\s-]?){2}\d{4}|\d{10})$/;

    return phonePattern.test(phoneNumber);
}

document.getElementById("confirmation-form").addEventListener('submit', function(event) {
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phone-error');

    // aggiungo prefisso italia +39
    let phoneValue = phoneInput.value.trim();
    if (!phoneValue.startsWith('+')) {
        phoneValue = '+39' + phoneValue;
    }
    phoneInput.value = phoneValue;

    if(!validatePhoneNumber(phoneInput.value)) {
        event.preventDefault();
        phoneError.classList.add('visible');
    } else {
        phoneError.classList.remove('visible');
    }
});