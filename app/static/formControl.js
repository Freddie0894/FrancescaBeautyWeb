function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

const lastConfirmButton = document.getElementById('confirm-booking');
lastConfirmButton.classList.add('grey');


document.getElementById("send-verification-code").addEventListener('click', function() {
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const codeSentMessage = document.getElementById('code-sent-message');
    const resendSection = document.getElementById('resend-section');
    const resendTimer = document.getElementById('resend-timer');
    const emailVerified = document.getElementById('email-verified');
    const loadingSpinner = document.getElementById('loading-spinner');
    const verificationCodeInput = document.getElementById('verification-code');

    console.log('Send Verification Code button clicked');
    console.log('Email input value:', emailInput.value);

    if(!validateEmail(emailInput.value)) {
        emailError.classList.add('visible');
    } else {
        emailError.classList.remove('visible');
        loadingSpinner.style.display = 'block';
        fetch('/send_verification_code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: emailInput.value })
        }).then(response => {
            loadingSpinner.style.display = 'none';

            if(response.ok) {
                console.log('Verification code sent successfully');
                document.getElementById('verification-section').style.display = 'block';
                codeSentMessage.style.display = 'block';
                resendSection.classList.remove('enabled');
                emailVerified.style.display = 'none';
                verificationCodeInput.value = '';

                // contatore 30s
                let timer = 60;
                resendTimer.textContent = timer;
                const interval = setInterval(() => {
                    timer--;
                    resendTimer.textContent = timer;
                    if (timer <= 0) {
                        clearInterval(interval);
                        resendSection.classList.add('enabled');
                        resendSection.style.cursor = 'pointer';
                    }
                }, 1000);
            } else {
                alert('Errore nell\'invio del codice di verifica. Riprova più tardi.');
                loadingSpinner.style.display = 'none';
            }
        }).catch(error => {
            loadingSpinner.style.display = 'none';
            console.error('Error:', error);
        });
    }
});



document.getElementById("verify-code").addEventListener('click', function() {
    const verificationCodeInput = document.getElementById('verification-code');
    const emailVerified = document.getElementById('email-verified');
    const codeSentMessage = document.getElementById('code-sent-message');
    const loadingSpinner2 = document.getElementById('loading-spinner2');

    console.log('Verify Code button clicked');
    console.log('Verification code input value:', verificationCodeInput.value);

    loadingSpinner2.style.display = 'block';
    fetch('/verify_code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: verificationCodeInput.value })
    }).then(response => {
        loadingSpinner2.style.display = 'none';

        if(response.ok) {
            console.log('Verification successful');
            document.getElementById('confirm-booking').disabled = false;
            document.getElementById('send-verification-code').style.display = 'none';
            document.getElementById('verification-section').style.display = 'none';
            emailVerified.style.display = 'inline';
            document.getElementById('confirm-booking').classList.remove('grey');
            codeSentMessage.style.display = 'none';
            loadingSpinner2.style.display = 'none';

        } else {
            console.log('Verification failed');
            alert('Codice di verifica non valido. Riprova.');
            emailVerified.style.display = 'none';
            loadingSpinner2.style.display = 'none';
        }
    }).catch(error => {
        loadingSpinner2.style.display = 'none';
        console.error('Error:', error);
    });
});


// ripetuto per pulsante di re-invio codice verifica
document.getElementById('resend-section').addEventListener('click', function() {
    if (this.classList.contains('enabled')) {
        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('email-error');
        const resendTimer = document.getElementById('resend-timer');
        const loadingSpinner2 = document.getElementById('loading-spinner2');
        loadingSpinner2.style.display = 'block';

        if (validateEmail(emailInput.value)) {
            emailError.classList.remove('visible');

            fetch('/send_verification_code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: emailInput.value })
            }).then(response => {
                loadingSpinner2.style.display = 'none';

                if (response.ok) {
                    console.log('Verification code sent successfully');
                    this.classList.remove('enabled');
                    loadingSpinner2.style.display = 'none';

                    // Inizia un nuovo contatore di 30 secondi
                    let timer = 60;
                    resendTimer.textContent = timer;
                    const interval = setInterval(() => {
                        timer--;
                        resendTimer.textContent = timer;
                        if (timer <= 0) {
                            clearInterval(interval);
                            this.classList.add('enabled');
                        }
                    }, 1000);
                } else {
                    alert('Errore nell\'invio del codice di verifica. Riprova più tardi.');
                    loadingSpinner2.style.display = 'none';
                }
            }).catch(error => {
                console.error('Error:', error);
                loadingSpinner2.style.display = 'none';
            });
        } else {
            emailError.classList.add('visible');
            loadingSpinner2.style.display = 'none';
        }
    }
});

document.getElementById("confirm-booking").addEventListener('click', function() {
    const loadingSpinner3 = document.getElementById('loading-spinner3');
        loadingSpinner3.style.display = 'block';
});

