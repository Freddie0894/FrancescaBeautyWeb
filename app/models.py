from . import db

class Appointment(db.Model):
    __tablename__ = 'appuntamenti'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    trattamento = db.Column(db.String(100), nullable=False)
    data = db.Column(db.String(20), nullable=False)
    ora = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20), nullable=False)

    def __init__(self, nome, trattamento, data, ora, phone):
        self.nome = nome
        self.trattamento = trattamento
        self.data = data
        self.ora = ora
        self.phone = phone