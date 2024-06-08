document.addEventListener('DOMContentLoaded', function() {
    const formPrenotazione = document.getElementById('bookingForm');
    const calendarEl = document.getElementById('calendar');

    // durata trattamenti
    const durataTrattamenti = {
        'Manicure': 60,
        'Manicure e Smalto': 60,
        'Manicure e Copertura Gel': 60,
        'Manicure e Semipermanente': 45,
        'Sopracciglia': 15,
        'Braccia': 30
    };

    let prenotazioniEsistenti = [];

    function addPrenotazioneToList(prenotazione) {
        prenotazioniEsistenti.push(prenotazione);
    }


    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev today next',
            center: 'title',
            right: 'dayGridMonth,timeGridDay'
        },
        buttonText: {
            today: 'Oggi'
        },
        slotMinTime: '09:00:00',
        slotMaxTime: '18:00:00',
        slotDuration: '00:15:00',
        slotLabelInterval: '01:00',
        allDaySlot: false,
        slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        },
        dateClick: function(info) {
            calendar.changeView('timeGridDay', info.dateStr);
        },
        events: function(fetchInfo, successCallback, failureCallback) {
            fetch('/api/prenotazionilist')
            .then(response => response.json())
            .then(data => {

                let events = data.map(prenotazione => {
                    if (!prenotazione.data  || !prenotazione.ora || !durataTrattamenti[prenotazione.trattamento]) {
                        console.error('Invalid prenotazione:', prenotazione);
                        return null;
                    }

                    const durata = durataTrattamenti[prenotazione.trattamento];
                    const startTime = `${prenotazione.data}T${prenotazione.ora}`;
                    const endTime = calculateEndTime(prenotazione.data, prenotazione.ora, durata);
                    
                    const event = {
                        title: 'Prenotato',
                        start: startTime,
                        end: endTime,
                        extendedProps: {
                            prenotazione: prenotazione
                        }
                    };
                    return event;

                }).filter(event => event !== null);

                successCallback(events);
            })
            .catch(error => failureCallback(error));
        },
        
        eventContent: function(arg) {
            const title = arg.event.title;
            const prenotazione = arg.event.extendedProps.prenotazione;
            const secondaTitle = prenotazione ? `${prenotazione.nome} - ${prenotazione.trattamento}` : '';
        
            // Ottieni la durata del trattamento dalla lista durataTrattamenti
            const durataTrattamento = durataTrattamenti[prenotazione.trattamento];
        
            // Calcola l'altezza dell'evento basata sulla durata del trattamento
            const altezzaEvento = durataTrattamento * 2; // Ogni minuto equivale a 2 pixel di altezza
            //console.log('altezza:', altezzaEvento);
        
            if (calendar.view.type === 'dayGridMonth') {
                return { html: '<div class="booking-event">' + '</div>' };
            }
            return { 
                html: `<div class="fc-timegrid-event" style="height:${altezzaEvento}px">${title}</div>` 
            };
        },
        // escludo giorni dove il centro è chiuso
        businessHours: [
            {
                daysOfWeek: [0, 1], //domenica, lunedi
                startTime: '00:00',
                endTime: '23:59'
            },
            {
                daysOfWeek: [3], //mercoledi
                startTime: '00:00',
                endTime: '12:00'
            },
            {
                daysOfWeek: [2, 4, 5, 6], //martedi, giovedi, venerdi, sabato
                startTime: '09:00',
                endTime: '18:00'
            }
        ]
    });

    calendar.render();

    function calculateEndTime(date, time, durataInMinuti) {
        const dateTimeString = `${date}T${time}`;
        //console.log('DateTime String:', dateTimeString);

        const start = new Date(dateTimeString);
        //console.log('Start Date (Original):', start);

        start.setMinutes(start.getMinutes() + durataInMinuti);
        //console.log('End Date (After Adding Duration):', start);

        // estraggo componenti data locale
        const year = start.getFullYear();
        const month = String(start.getMonth() + 1).padStart(2, '0');
        const day = String(start.getDate()).padStart(2, '0');
        const hours = String(start.getHours()).padStart(2, '0');
        const minutes = String(start.getMinutes()).padStart(2, '0');
        const seconds = String(start.getSeconds()).padStart(2, '0');

        const localDateTimeStr = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        //console.log('Result:', localDateTimeStr);

        return localDateTimeStr;
    }
        
    function isOverlapping(newStart, newEnd) {
        //console.log('Checking overlap for new booking from', newStart, 'to', newEnd);

        for (let prenotazione of prenotazioniEsistenti) {
            const start = new Date(`${prenotazione.data}T${prenotazione.ora}`);
            const end = new Date(calculateEndTime(prenotazione.data, prenotazione.ora, durataTrattamenti[prenotazione.trattamento]));

            //console.log(`Existing booking from ${start} to ${end}`);

            if (newStart < end && newEnd > start) {
                //console.log('Overlap detected with existing booking');

                return true;
            }
        }
        //console.log('No overlap detected');

        return false;
    }
    



    // funzione per scrittura su db da form prenotazione
    formPrenotazione.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const service = document.getElementById('service').value;

        const durata = durataTrattamenti[service];
        const startTime = new Date(`${date}T${time}`);
        const endTime = new Date(calculateEndTime(date, time, durata));

        //console.log(`New booking from ${startTime} to ${endTime}`);

        const blockedDay = getBlockedDay(startTime);
        if (blockedDay) {
            alert(blockedDay.message);
            return;
        }

        if (isOverlapping(startTime, endTime)) {
            alert('Errore: l\'orario selezionato è già occupato.');
            return;
        }

        const prenotazione = {
            service: service,
            name: name,
            date: date,
            time: time
        };

        fetch('/api/prenotazionilist', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(prenotazione)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Errore durante la prenotazione. Riprova.');
            }
            return response.json();
        })
        .then(data => {
            addPrenotazioneToList(data);
            calendar.refetchEvents();
            formPrenotazione.reset();
            alert('Prenotazione effettuata con successo!');
        })
        .catch(error => {
            console.error('Errore:', error);
            alert('Errore durante la prenotazione. Riprova.');
        });
    });

function getBlockedDay(dateTime) {
    const dayOfWeek = dateTime.getDay();
    const hours = dateTime.getHours();

    if (dayOfWeek === 1 || dayOfWeek === 0) {
        return { day: 'Lunedì, Domenica', message: 'Errore: Il Centro è chiuso Domenica è Lunedi. Riprova a prenotare un\'altro giorno della settimana'}
    } else if (dayOfWeek === 3) {
        if (hours < 12) {
            return { day: 'Mercoledì', message: 'Errore: Mercoledì puoi prenotare a partire dalle ore 12:00'}
        }
    }
    return null;
}

    
    fetch('/api/prenotazionilist')
        .then(response => response.json())
        .then(data => {
            prenotazioniEsistenti = data;
            data.forEach(prenotazione => addPrenotazioneToList(prenotazione));
        });
});
