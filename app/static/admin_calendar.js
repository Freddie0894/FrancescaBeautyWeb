document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('admin-calendar');

    // durata trattamenti
    const durataTrattamenti = {
        'Manicure': 60,
        'Manicure e Smalto': 60,
        'Manicure e Copertura Gel': 60,
        'Manicure e Semipermanente': 45,
        'Sopracciglia': 15,
        'Braccia': 30
    };

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridDay',
        buttonText: {
            today: 'Oggi'
        },
        slotMinTime: '09:00:00',
        slotMaxTime: '18:30:00',
        slotDuration: '00:15:00',
        slotLabelInterval: '01:00',
        allDaySlot: false,
        slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        },
        events: function(fetchInfo, successCallback, failureCallback) {
            fetch('/api/prenotazionilist')
            .then(response => response.json())
            .then(data => {

                let events = data.map(prenotazione => {
                    if (!prenotazione.data  || !prenotazione.ora) {
                        console.error('Invalid prenotazione:', prenotazione);
                        return null;
                    }

                    const durata = durataTrattamenti[prenotazione.trattamento];
                    const startTime = `${prenotazione.data}T${prenotazione.ora}`;
                    console.log('Start time1:', startTime);
                    const endTime = calculateEndTime(prenotazione.data, prenotazione.ora, durata);
                    console.log('End time1:', endTime);
                    const event = {
                        title: `${prenotazione.nome} - ${prenotazione.trattamento}`,
                        start: `${prenotazione.data}T${prenotazione.ora}`,
                        end: calculateEndTime(prenotazione.data, prenotazione.ora),
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
        
            // Ottieni la durata del trattamento dalla lista durataTrattamenti
            const durataTrattamento = durataTrattamenti[prenotazione.trattamento];
        
            // Calcola l'altezza dell'evento basata sulla durata del trattamento
            const altezzaEvento = durataTrattamento * 2; // Ogni minuto equivale a 2 pixel di altezza
            console.log('altezza:', altezzaEvento);
        
            if (calendar.view.type === 'dayGridMonth') {
                return { html: '<div class="booking-event">' + '</div>' };
            }
            return { 
                html: `<div class="fc-timegrid-event" style="height:${altezzaEvento}px">${title}</div>` 
            };
        }
    });
    calendar.render();

    function calculateEndTime(date, time) {
    let end = new Date(date);
    if (end.getMinutes() >= 60) {
        const [hours, minutes] = time.split(':').map(Number);
        end.setHours(hours + 1);
        end.setMinutes(end.getMinutes() - 60);
    }
    const [hours, minutes] = time.split(':').map(Number);
    end.setHours(hours);
    end.setMinutes(minutes + 30);
    return end.toISOString().slice(0, 19);
}
});