from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os


db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__, static_folder='static')
    app.secret_key = 'supersecretkey'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.root_path, 'appointments.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    from .get_prenotazioni import get_prenotazioni_bp
    from .routes import main_bp
    from .verifyCodeRoutes import verify_code_bp
    app.register_blueprint(get_prenotazioni_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(verify_code_bp)


    with app.app_context():
        db.create_all()

    return app
