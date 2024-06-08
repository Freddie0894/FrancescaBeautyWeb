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
        'Manicure': 60,
        'Manicure e Smalto': 60,
        'Manicure e Copertura Gel': 60,
        'Manicure e Semipermanente': 45,
        'Sopracciglia': 15,
        'Braccia': 600
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

    


    /* CALENDARIO */ 

    // funzione x creare calendario a data specifica
    async function createCalendarForDate(selectedDate) {
        return fetch(`/api/prenotazionilist?date=${selectedDate}`)
            .then(response => response.json())
            .then(prenotazioniEsistenti => {
                // rimuovi eventuali contenuti precedenti
                dayGridContainer.innerHTML = '';

                //orario di apertura
                const openingHour = 9;
                const closingHour = 18.5;
                const durata = durataTrattamenti[trattamento];

                let slotDisponibili = false;
                const dayOfWeek = new Date(selectedDate).getDay();

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
            })
            .catch(error => {
                console.error('Errore nel recupero delle prenotazioni:', error);
                return false;
            });
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
