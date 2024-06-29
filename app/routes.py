from __future__ import print_function
import clicksend_client
from clicksend_client import SmsMessage
from clicksend_client.rest import ApiException
from flask import Blueprint, request, redirect, url_for, render_template
import logging
from app.models import Appointment
import urllib.parse
from app import db
from datetime import datetime

logging.basicConfig(level=logging.INFO)

CLICKSEND_USERNAME = 'francescabeauty'
CLICKSEND_API_KEY = '9742328E-0718-0589-1F18-0084E4BB3521'

main_bp = Blueprint('main', __name__)





def send_booking_key(phone, nome, data, ora, trattamento, booking_key):
    formatted_data = datetimeformat(data)
    # client = Client(account_sid, auth_token)
    message = f"""
    Ciao {nome},
    
    La tua prenotazione da Francesca Beauty per {trattamento}, alle ore {ora}, il giorno {formatted_data} è confermata.
    Puoi modificare il tuo appuntamento inserendo questo codice di prenotazione nella sezione 'I MIEI APPUNTAMENTI' del sito: {booking_key}
    
    Grazie,
    Francesca Beauty
    """

    configuration = clicksend_client.Configuration()
    configuration.username = CLICKSEND_USERNAME
    configuration.password = CLICKSEND_API_KEY

    api_instance = clicksend_client.SMSApi(clicksend_client.ApiClient(configuration))
    
    sms_message = SmsMessage(
        source="python",
        body=message,
        to=phone
    )

    sms_messages = clicksend_client.SmsMessageCollection(messages=[sms_message])

    try:
        api_response = api_instance.sms_send_post(sms_messages)
        logging.info(f"SMS sent to {phone} with status {api_response}")
    except ApiException as e:
        logging.error(f"Exception when calling SMSApi->sms_send_post: {e}")
        raise






# Dizionario per la traduzione dei mesi
MONTHS_IT = {
    'January': 'Gennaio', 'February': 'Febbraio', 'March': 'Marzo', 'April': 'Aprile',
    'May': 'Maggio', 'June': 'Giugno', 'July': 'Luglio', 'August': 'Agosto',
    'September': 'Settembre', 'October': 'Ottobre', 'November': 'Novembre', 'December': 'Dicembre'
}

# filtro per formattazione data in frontend
def datetimeformat(value, format='%d %B %Y'):
    if isinstance(value, str):
        value = datetime.strptime(value, '%Y-%m-%d')

    month_name = value.strftime('%B') #mese in inglese
    month_it_name = MONTHS_IT.get(month_name, month_name) #traduci, oppure usa originale

    #sostituisco mese in inglese con traduzione
    formatted_value = value.strftime(format).replace(month_name, month_it_name)

    return formatted_value



@main_bp.route('/')
def homepage():
    return render_template('home.html')


@main_bp.route('/booking')
def bookpage():
    return render_template('prenotazione.html')


@main_bp.route('/adminPage')
def adminpage():
    appointments = Appointment.query.all()
    return render_template('adminPage.html', appointments=appointments)


@main_bp.route('/promozioni')
def trattamenti():
    return render_template('promozioni.html')


@main_bp.route('/contatti')
def contatti():
    return render_template('contatti.html')


@main_bp.route('/calendar')
def calendar():
    trattamento = request.args.get('trattamento', '')
    trattamento = urllib.parse.unquote_plus(trattamento)
    return render_template('calendar.html', trattamento=trattamento)



@main_bp.route('/appuntamenti_cliente')
def clientepage():
    return render_template('appuntamenti_cliente.html')



@main_bp.route('/booking_confirm', methods=['POST'])
def booking_confirm():
    trattamento = request.form.get('trattamento')
    data = request.form.get('data')
    ora = request.form.get('ora')

    # Formatta la data utilizzando la funzione datetimeformat
    formatted_data = datetimeformat(data, '%d %B %Y')

    return render_template('booking_confirm.html', trattamento=trattamento, formatted_data=formatted_data, data=data, ora=ora)



@main_bp.route('/finalizza_prenotazione', methods=['POST'])
def finalizza():
    nome = request.form.get('nome')
    trattamento = request.form.get('trattamento')
    data = request.form.get('data')
    ora = request.form.get('ora')
    phone = request.form.get('phone')

    appointment = Appointment(nome=nome, trattamento=trattamento, data=data, ora=ora, phone=phone)

    try:
        db.session.add(appointment)
        db.session.commit()

        send_booking_key(phone, nome, data, ora, trattamento, appointment.booking_key)

        return redirect(url_for('main.thank_you'))
    except Exception as e:
        db.session.rollback()
        return render_template('error.html', error_message='Si è verificato un errore durante la finalizzazione della prenotazione. Riprova più tardi.'), 500




@main_bp.route('/thank_you')
def thank_you():
    return render_template('thank_you.html')