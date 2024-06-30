function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

document.getElementById("send-verification-code").addEventListener('click', function() {
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');

    console.log('Send Verification Code button clicked');
    console.log('Email input value:', emailInput.value);

    if(!validateEmail(emailInput.value)) {
        emailError.classList.add('visible');
    } else {
        emailError.classList.remove('visible');
        fetch('/send_verification_code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: emailInput.value })
        }).then(response => {
            if(response.ok) {
                console.log('Verification code sent successfully');
                document.getElementById('verification-section').style.display = 'block';
            } else {
                alert('Errore nell\'invio del codice di verifica. Riprova più tardi.');
            }
        });
    }
});

document.getElementById("verify-code").addEventListener('click', function() {
    const verificationCodeInput = document.getElementById('verification-code');

    console.log('Verify Code button clicked');
    console.log('Verification code input value:', verificationCodeInput.value);

    fetch('/verify_code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: verificationCodeInput.value })
    }).then(response => {
        if(response.ok) {
            console.log('Verification successful');
            document.getElementById('confirm-booking').disabled = false;
            alert('Email verificata con successo.');
        } else {
            console.log('Verification failed');
            alert('Codice di verifica non valido. Riprova.');
        }
    });
});
