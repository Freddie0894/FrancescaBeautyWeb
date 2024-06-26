from . import db
import random
import string

class Appointment(db.Model):
    __tablename__ = 'appuntamenti'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    trattamento = db.Column(db.String(100), nullable=False)
    data = db.Column(db.String(20), nullable=False)
    ora = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    booking_key = db.Column(db.String(6), nullable=False)

    def __init__(self, nome, trattamento, data, ora, email):
        self.nome = nome
        self.trattamento = trattamento
        self.data = data
        self.ora = ora
        self.email = email
        self.booking_key = self.get_or_generate_booking_key(email)

    @staticmethod
    def get_or_generate_booking_key(email):
        existing_appointment = Appointment.query.filter_by(email=email).first()
        if existing_appointment:
            return existing_appointment.booking_key
        else:
            return Appointment.generate_unique_booking_key()

    @staticmethod
    def generate_unique_booking_key():
        while True:
            booking_key = ''.join(random.choices(string.ascii_uppercase, k=6))
            if not Appointment.query.filter_by(booking_key=booking_key).first():
                return booking_key
