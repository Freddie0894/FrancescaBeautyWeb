document.getElementById('cercaCodiceForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var codice = document.getElementById('codice').value;

    // richiesta post al server
    fetch('/cercaConCodice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ codice: codice })
    })
    .then(response => response.json())
    .then(data => {
        // mostra risultato
        var risultatoDiv = document.getElementById('risultatoCodice');
        risultatoDiv.innerHTML = ''; // pulisco eventuali risultati precedenti

        if (data.success) {
            // mostra appuntamenti trovati
            var appuntamenti = data.appuntamenti;

            if (Array.isArray(appuntamenti)) {
                appuntamenti.forEach(function(appuntamento) {
                    var appuntamentoDiv = document.createElement('div');
                    appuntamentoDiv.id = `appuntamento-${appuntamento.id}`; // ID Univoco
                    appuntamentoDiv.classList.add('appuntamento');
                    appuntamentoDiv.innerHTML = `
                        <span class="trattamento">${appuntamento.trattamento}</span><br>
                        <span class="data">${appuntamento.data}</span><br>
                        <span class="ora">${appuntamento.ora}</span><br>
                        <button class="delete-btn" onclick="cancellaAppuntamento(${appuntamento.id})">Cancella</button>
                    `;
                    risultatoDiv.appendChild(appuntamentoDiv);
                });
            }
        } else {
            // messaggio di errore
            risultatoDiv.innerHTML = 'Nessun appuntamento trovato.';
        }
    })
    .catch(error => {
        console.error('Errore durante la richiesta:', error);

        // errori di rete o server
        var risultatoDiv = document.getElementById('risultatoCodice');
        risultatoDiv.innerHTML = 'Si è verificato un errore durante la verifica del codice.';
    });
});

function cancellaAppuntamento(appuntamento_id) {
    var confirmDelete = confirm('Sei sicuro di voler cancellare questo appuntamento?');
    if (confirmDelete) {
        fetch(`/cancellaAppuntamento/${appuntamento_id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Errore durante la cancellazione');
            }
            return response.json();
        })
        .then(data => {
            var message = data[0].message;
            if (data[0].success) {
                // Rimuovi l'appuntamento dalla UI anziché ricaricare la pagina
                var appuntamentoDiv = document.getElementById(`appuntamento-${appuntamento_id}`);
                if (appuntamentoDiv) {
                    appuntamentoDiv.remove();
                    alert(message);
                } else {
                    alert('errore durante la cancellazione dell\'appuntamento.');
                }
            } else {
                alert('Errore durante la cancellazione dell\'appuntamento.');
            }
            console.log(data);
        })
        .catch(error => {
            console.error('Errore durante la richiesta:', error);
            alert('Si è verificato un\' errore durante la cancellazione dell\'appuntamento.');
        });
    }
}