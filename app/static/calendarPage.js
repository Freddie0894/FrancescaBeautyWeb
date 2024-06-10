document.addEventListener('DOMContentLoaded', function() {
    // seleziono elementi HTML da DOM
    var calendarContainer = document.getElementById('calendar-container');
    var prevWeekButton = document.getElementById('prev-week');
    var nextWeekButton = document.getElementById('next-week');
    var weekDaysContainer = document.getElementById('week-days');
    var dayGridContainer = document.getElementById('day-grid');

    var currentDate = new Date();
    var currentDayIndex = currentDate.getDay();
    var currentWeekStart = new Date(currentDate);


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


    function calculateEndTime(date, time, durataInMinuti) {
        const dateTimeString = `${date}T${time}`;
        //console.log('DateTime String:', dateTimeString);

        const start = new Date(dateTimeString);
        //console.log('Start Date (Original):', start);

        start.setMinutes(start.getMinutes() + durataInMinuti);
        //console.log('End Date (After Adding Duration):', start);

        return start;
    }


    function isOverlapping(newStart, newEnd, prenotazioni) {
        for (let prenotazione of prenotazioni) {
            const start = new Date(`${prenotazione.data}T${prenotazione.ora}`);
            const end = calculateEndTime(prenotazione.data, prenotazione.ora, durataTrattamenti[prenotazione.trattamento]);
            if (newStart < end && newEnd > start) {
                return true;
            }
        }
        return false;
    }

    // Funzione per impostare lo stato attivo del bottone cliccato
    function setActiveButton(button) {
        // Rimuove la classe 'active' da tutti i bottoni dei giorni
        document.querySelectorAll('.day-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Aggiunge la classe 'active' solo al bottone cliccato
        button.classList.add('active');
    }

    function setActiveTimeSlot(button) {

        document.querySelectorAll('.time-slot-button').forEach(btn => {
            btn.classList.remove('active');
        });

        button.classList.add('active');
    }

        // funzione x gestire click bottone
        function ButtonClick_PrevWeek() {
            currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            generateWeekDayButtons();
        }
    
        // funzione x gestire click bottone
        function ButtonClick_NextWeek() {
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            generateWeekDayButtons();
        }
    
        // funzione x click su un giorno della settimana
        function ButtonClick_Day(event) {
            var selectedDate = event.target.getAttribute('data-date');
            createCalendarForDate(selectedDate);
        }
    
    /* CALENDARIO */ 

    // funzione x creare calendario a data specifica
    async function createCalendarForDate(selectedDate, prenotazione = null) {
        let url = `/api/prenotazioniget?date=${selectedDate}`;
        if (prenotazione) {
            url += `&trattamento=${prenotazione}`;
        }
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const prenotazioniEsistenti = await response.json();
            console.log('Prenotazioni esistenti:', prenotazioniEsistenti);

            // Reset dei campi del modulo per data e orario quando viene cliccato un nuovo giorno
            document.getElementById('selected-date').value = '';
            document.getElementById('selected-time').value = '';
            document.getElementById('form-appuntamento').style.display = 'none';
            
            // rimuovi eventuali contenuti precedenti
            dayGridContainer.innerHTML = '';

            //orario di apertura
            const openingHour = 9;
            const closingHour = 18.5;
            const durata = durataTrattamenti[trattamento];

            let slotDisponibili = false;
            const dayOfWeek = new Date(selectedDate).getDay();

            console.log(dayOfWeek);

            // messaggio full
            for (let hour = openingHour; hour <= closingHour; hour += 0.25) {
                let startTime = new Date(selectedDate);
                startTime.setHours(Math.floor(hour));
                startTime.setMinutes((hour % 1) * 60);

                let endTimeString = calculateEndTime(selectedDate, startTime.toTimeString().slice(0, 5), durata);
                let endTime = new Date(endTimeString);

                if (dayOfWeek === 3 && startTime.getHours() < 12) {
                    continue;
                }

                if (startTime >= endTime || endTime.getHours() > 19 || (endTime.getHours() == 19 && endTime.getMinutes() > 30) || isOverlapping(startTime, endTime, prenotazioniEsistenti)) {
                    continue; // salta gli slot che superano l'orario chiusura
                } else {
                    slotDisponibili = true;
                    let timeString = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    let button = document.createElement('button');
                    button.classList.add('time-slot-button');
                    button.textContent = timeString;
                    button.setAttribute('data-time', timeString);

                    button.addEventListener('click', function() {
                        date = document.getElementById('selected-date').value = selectedDate; 
                        time = document.getElementById('selected-time').value = timeString;
                        document.getElementById('form-appuntamento').style.display = 'block';
                        setActiveTimeSlot(this);
                    });

                    dayGridContainer.appendChild(button);
                }
            }

            if (!slotDisponibili) {
                let fullMessage = document.createElement('p');
                fullMessage.classList.add('message-full');
                fullMessage.innerHTML = "Nessun orario disponibile<br>per questo giorno.";
                dayGridContainer.appendChild(fullMessage);
            }
            return slotDisponibili;
                
        }catch(error) {
            console.error('Errore nel recupero delle prenotazioni:', error);
            return false;
        }
    }



// Funzione per generare i bottoni dei giorni della settimana
async function generateWeekDayButtons() {
    var days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    var buttonsHTML = '';

    var weekStart = new Date(currentWeekStart);
    var today = new Date();
    today.setHours(0, 0, 0, 0);// resetto l'ora a mezzanotte

    var daysToCheck = [];

    for (var i = 0; i < 7; i++) {
        var date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        var dateString = date.toISOString().slice(0, 10);
        var dayName = days[date.getDay()];
        var dayNumber = date.getDate();

        var isPastDay = date < today;
        var isMondayOrSunday = date.getDay() === 0 || date.getDay() === 1;
        var isDisabled = (isPastDay || isMondayOrSunday ? 'disabled' : '');


        buttonsHTML += '<div class="day-container">' +
            '<div class="day-name">' + dayName + '</div>' +
            '<button class="day-button" data-date="' + dateString + '"' + isDisabled + '>' + dayNumber  + '</button>' +
            '</div>';

        if (!isPastDay && !isMondayOrSunday) {
            daysToCheck.push(dateString);
        }
    }

    weekDaysContainer.innerHTML = buttonsHTML;

    // Aggiungi eventi di click sui bottoni dei giorni
    document.querySelectorAll('.day-button').forEach(button => {
        button.addEventListener('click', function(event) {
            if (!this.disabled) {
                setActiveButton(this);
                ButtonClick_Day(event);
            }
        });
    });

    // clicca auto il primo giorno disponibile
    const firstAvailableDay = await findFirstAvailableDay(daysToCheck);
        if (firstAvailableDay) {
            var firstAvailableButton = document.querySelector(`.day-button[data-date="${firstAvailableDay}"]`);
            if (firstAvailableButton) {
                firstAvailableButton.click();
            }
        }
    }

    // Trova il primo giorno disponibile con slot
    async function findFirstAvailableDay(daysToCheck) {
        for (const day of daysToCheck) {
            const slotDisponibili = await createCalendarForDate(day);
            if (slotDisponibili) {
                return day;
            }
        }
        return null;
    }

    // funzione x gestire submit form a prenotazione
    function bookingForSubmit(event) {
        event.preventDefault();

        
        var selectedDate = document.getElementById('selected-date').value;
        var selectedTime = document.getElementById('selected-time').value;
        

        if (!selectedDate || !selectedTime) {
            alert('Per favore, seleziona una data e un orario per il trattamento.');
            return;
        }
        event.target.submit();
    }

    // aggiungo eventi di click su bottone
    prevWeekButton.addEventListener('click', ButtonClick_PrevWeek);
    nextWeekButton.addEventListener('click', ButtonClick_NextWeek);
    document.getElementById('form-appuntamento').addEventListener('submit', bookingForSubmit);

    // genero bottoni dei giorni della settimana al caricamento della pagina
    generateWeekDayButtons();
});
