from flask import Blueprint, request, render_template, redirect, url_for
from app.models import Appointment
import urllib.parse
from app import db

main_bp = Blueprint('main', __name__)


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
    trattamento = request.form.get('trattamento')
    data = request.form.get('data')
    ora = request.form.get('ora')
    nome = request.form.get('nome')
    phone = request.form.get('phone')

    appointment = Appointment(nome=nome, trattamento=trattamento, data=data, ora=ora, phone=phone)
    db.session.add(appointment)
    db.session.commit()

    return redirect(url_for('main.thank_you'))

@main_bp.route('/thank_you')
def thank_you():
    return render_template('thank_you.html')