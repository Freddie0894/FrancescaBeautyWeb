from flask import Blueprint, request, render_template, redirect, url_for
from app.models import Appointment
import urllib.parse
from app import db
from twilio.rest import Client
from datetime import datetime
import locale


main_bp = Blueprint('main', __name__)

# Leggi le credenziali Twilio dalle variabili d'ambiente
account_sid = 'AC7f23b0e7b5d26a1833b1f9885cd0884f'
auth_token = '5ab4cd53f62057f6f84e32bb6995c510'
twilio_phone_number = '+19143689478'


def send_booking_key(phone, nome, formatted_data, ora, trattamento, booking_key):
    client = Client(account_sid, auth_token)
    message = client.messages.create(
        body=f"Ciao {nome}, La tua prenotazione da Francesca Beauty per {trattamento}, alle ore {ora}, il giorno {formatted_data} è confermata. puoi modificare il tuo appuntamento inserendo questo codice di prenotazione nella sezione 'I Tuoi Appuntamenti' del sito: {booking_key}",
        from_=twilio_phone_number,
        to=phone
    )



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


@main_bp.route('/trattamenti')
def trattamenti():
    return render_template('trattamenti.html')


@main_bp.route('/contatti')
def contatti():
    return render_template('contatti.html')


@main_bp.route('/calendar')
def calendar():
    trattamento = request.args.get('trattamento', '')
    trattamento = urllib.parse.unquote_plus(trattamento)
    return render_template('calendar.html', trattamento=trattamento)


@main_bp.route('/booking_confirm', methods=['POST'])
def booking_confirm():
    trattamento = request.form.get('trattamento')
    data = request.form.get('data')
    ora = request.form.get('ora')

    return render_template('booking_confirm.html', trattamento=trattamento, data=data, ora=ora)





@main_bp.route('/finalizza_prenotazione', methods=['POST'])
def finalizza():
    nome = request.form.get('nome')
    trattamento = request.form.get('trattamento')
    data = request.form.get('data')
    ora = request.form.get('ora')
    phone = request.form.get('phone')

    try:

        appointment = Appointment(nome=nome, trattamento=trattamento, data=data, ora=ora, phone=phone)
        db.session.add(appointment)
        db.session.commit()

        send_booking_key(phone, nome, data, ora, trattamento, appointment.booking_key)

        return redirect(url_for('main.thank_you'))
    except Exception as e:
        db.session.rollback()
        return str(e), 500



@main_bp.route('/thank_you')
def thank_you():
    return render_template('thank_you.html')