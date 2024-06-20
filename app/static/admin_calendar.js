function calculateEndTime(date, time, duration) {
    const dateTimeString = `${date}T${time}`;
    const start = new Date(dateTimeString);
    start.setMinutes(start.getMinutes() + duration);
    console.log("start:",start);
    return start;
}

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('admin-calendar');

    // durata trattamenti
    const durataTrattamenti = {
        'Manicure': 30,
        'Manicure e Smalto': 30,
        'Manicure e Semipermanente': 45,
        'Manicure e Semipermanente con Rimozione': 60,
        'Rimozione Semipermanente Mani': 15,
        'Rimozione Semipermanente Piedi': 15,
        'Manicure e Ricostruzione Unghie': 120,
        'Manicure e Copertura Gel': 60,
        'Manicure e Refill Gel': 60,
        'Pedicure Estetico e Smalto': 30,
        'Pedicure Curativo e Smalto': 45,
        'Pedicure Estetico e Semipermanente': 45,
        'Pedicure Curativo e Semipermanente':60,
        'Rimozione Callo': 15,
        'Applicazione Smalto': 15,

        'Pulizia Viso': 60,
        'Trattamento Viso Anti Age': 60,
        'Trattamento Viso Illuminante': 45,
        'Trattamento Viso Idratante': 45,
        'Trattamento Viso Purificante': 45,
        'Trattamento Viso Pelli Sensibili': 45,
        'Radiofrequenza Viso': 45,

        'Gamba Intera': 30,
        'Gamba Intera e Inguine Parziale': 45,
        'Gamba Intera e Inguine Totale': 45,
        'Mezza Gamba': 15,
        'Mezza Gamba e Inguine Parziale': 30,
        'Mezza Gamba e Inguine Totale': 30,
        'Inguine Parziale': 15,
        'Inguine Totale': 15,
        'Braccia': 15,
        'Ascelle': 15,
        'Baffetto': 15,
        'Sopracciglia': 15,

        'Massaggio Anticellulite': 30, 
        'Massaggio Drenante': 30, 
        'Massaggio Schiena Decontratturante': 30, 
        'Massaggio Gravidanza': 30, 
        'Massaggio Rilassante 30 Min': 30, 
        'Massaggio Rilassante 60 Min': 60, 

        'Laminazione Ciglia': 60,
        'Laminazione Sopracciglia': 45,
        
        'Radiofrequenza Corpo': 45,
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
            let selectedDate = fetchInfo.startStr.split('T')[0];
            let url = `/api/prenotazioniget?date=${selectedDate}`;

            fetch(url)
            .then(response => response.json())
            .then(data => {

                let events = data.map(prenotazione => {
                    if (!prenotazione.data  || !prenotazione.ora || !prenotazione.trattamento) {
                        console.error('Invalid prenotazione:', prenotazione);
                        return null;
                    }

                    const durata = durataTrattamenti[prenotazione.trattamento];
                    const startTime = `${prenotazione.data}T${prenotazione.ora}`;
                    const endTime = calculateEndTime(prenotazione.data, prenotazione.ora, durata);
                    
                    const event = {
                        title: `${prenotazione.nome} - ${prenotazione.trattamento}`,
                        start: startTime,
                        end: endTime,
                        extendedProps: {
                            prenotazione: prenotazione
                        }
                    };
                    console.log(event);
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
        
            if (calendar.view.type === 'dayGridMonth') {
                return { html: '<div class="booking-event">' + '</div>' };
            }
            return { 
                html: `<div class="fc-timegrid-event" style="height:${altezzaEvento}px">${title}</div>` 
            };
        }
    });
    calendar.render();
});