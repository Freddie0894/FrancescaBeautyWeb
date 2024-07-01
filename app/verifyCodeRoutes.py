from __future__ import print_function
import clicksend_client
from clicksend_client import SmsMessage, EmailRecipient, EmailFrom
from clicksend_client.rest import ApiException
from flask import Blueprint, request, jsonify, session
import logging
from app.models import Appointment
import urllib.parse
import random, string
from app import db
from datetime import datetime
from flask import current_app as app


verify_code_bp = Blueprint('verify_code', __name__)


CLICKSEND_USERNAME = 'francescabeauty'
CLICKSEND_API_KEY = '9742328E-0718-0589-1F18-0084E4BB3521'
EMAIL_FROM_ID = '29371'


def send_verification_code(email):
    code = ''.join(random.choices(string.digits, k=6))
    session['verification_code'] = code

    # Configura ClickSend client
    configuration = clicksend_client.Configuration()
    configuration.username = CLICKSEND_USERNAME
    configuration.password = CLICKSEND_API_KEY

    api_instance = clicksend_client.TransactionalEmailApi(clicksend_client.ApiClient(configuration))
    email_recipient = clicksend_client.EmailRecipient(email=email)
    email_from = clicksend_client.EmailFrom(email_address_id=EMAIL_FROM_ID, name='Francesca Beauty')
    email = clicksend_client.Email(
        to=[email_recipient],
        _from=email_from,
        subject="Codice di Verifica",
        body=f"Il tuo codice di verifica è: {code}"
    )

    try:
        api_response = api_instance.email_send_post(email)
        return True
    except ApiException as e:
        print(f"Exception when calling TransactionalEmailApi->email_send_post: {e}\n")
        return False
    



@verify_code_bp.route('/send_verification_code', methods=['POST'])
def send_verification_code_route():
    data = request.json
    email = data.get('email')
    if send_verification_code(email):
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error'}), 500
    



@verify_code_bp.route('/verify_code', methods=['POST'])
def verify_code_route():
    data = request.json
    code = data.get('code')
    if code == session.get('verification_code'):
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error'}), 400
    

    