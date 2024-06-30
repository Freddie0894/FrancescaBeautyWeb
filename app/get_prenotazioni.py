from flask import Blueprint, request, jsonify
from .models import Appointment
from . import db
from .routes import datetimeformat



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
        'email': appointment.email,
        'booking_key': appointment.booking_key
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
    email = data.get('email')

    
    if not all([name, service, date, time]):
        return jsonify({"error": "Missing data"}), 400

    new_appointment = Appointment(
        nome=name,
        trattamento=service,
        data=date,
        ora=time,
        email=email
    )

    db.session.add(new_appointment)
    db.session.commit()

    print(f"Appuntamento aggiunto al database: ID {new_appointment.id}")


    return jsonify({
        'id': new_appointment.id,
        'nome': new_appointment.nome,
        'trattamento': new_appointment.trattamento,
        'data': new_appointment.data,
        'ora': new_appointment.ora,
        'email': new_appointment.email,
        'booking_key': new_appointment.booking_key
    }), 201




@get_prenotazioni_bp.route('/cercaConCodice', methods=['POST'])
def cercaConCodice():
    codice = request.form.get('codice')

    # cerca appuntamenti corrispondenti a codice SMS
    appuntamentiTrovati = Appointment.query.filter_by(booking_key=codice).all()

    if not appuntamentiTrovati:
        return jsonify({'success': False, 'message': 'Codice non valido. Riprova.'}), 404
    
    # preparo lista appuntamenti trovati
    appuntamenti = []
    for appuntamento in appuntamentiTrovati:
        appuntamenti.append({
            'id': appuntamento.id,
            'nome': appuntamento.nome,
            'trattamento': appuntamento.trattamento,
            'data': datetimeformat(appuntamento.data),
            'ora': appuntamento.ora,
            'email': appuntamento.email,
            'booking_key': appuntamento.booking_key
        })

    return jsonify({'success': True, 'appuntamenti': appuntamenti}), 200




@get_prenotazioni_bp.route('/cancellaAppuntamento/<int:appuntamento_id>', methods=['DELETE'])
def cancella_appuntamento(appuntamento_id):
    appuntamento = Appointment.query.get(appuntamento_id)
    if appuntamento is None:
        return jsonify({'success': False, 'message': 'Appuntamento non trovato.'}), 404
    
    db.session.delete(appuntamento)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Appuntamento cancellato con successo.'}, 200)




