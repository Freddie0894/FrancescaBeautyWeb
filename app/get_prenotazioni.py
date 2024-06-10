from flask import Blueprint, request, jsonify
from .models import Appointment
from . import db

get_prenotazioni_bp = Blueprint('get_prenotazioni', __name__)

@get_prenotazioni_bp.route('/api/prenotazioniget', methods=['GET'])
def get_prenotazioni():

    trattamento = request.args.get('trattamento', None)
    date = request.args.get('date', None)

    query = Appointment.query
    if trattamento:
        query = query.filter_by(trattamento=trattamento)
    if date:
        query = query.filter(Appointment.data == date)

    appointments = query.all()
    appointments_list = [{
        'id': appointment.id,
        'nome': appointment.nome,
        'trattamento': appointment.trattamento,
        'data': appointment.data,
        'ora': appointment.ora,
        'phone': appointment.phone
    } for appointment in appointments]
    return jsonify(appointments_list)



@get_prenotazioni_bp.route('/api/prenotazionilist', methods=['POST'])
def add_prenotazione():
    if not request.is_json:
        return jsonify({"error": "invalid input"}), 400
    
    data = request.get_json()
    if data is None:
        return jsonify({"error": "Invalid input"}), 400
    
    name = data.get('nome')
    service = data.get('trattamento')
    date = data.get('data')
    time = data.get('ora')
    phone = data.get('phone')

    
    if not all([name, service, date, time]):
        return jsonify({"error": "Missing data"}), 400

    new_appointment = Appointment(
        nome=name,
        trattamento=service,
        data=date,
        ora=time,
        phone=phone
    )

    db.session.add(new_appointment)
    db.session.commit()
    return jsonify({
        'id': new_appointment.id,
        'nome': new_appointment.nome,
        'trattamento': new_appointment.trattamento,
        'data': new_appointment.data,
        'ora': new_appointment.ora,
        'phone': new_appointment.phone
    }), 201
