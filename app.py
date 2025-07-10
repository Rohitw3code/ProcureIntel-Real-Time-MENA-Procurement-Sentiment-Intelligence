import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from routes.pipeline import pipeline_bp
from routes.scraper import scraper_bp
from routes.status import status_bp 

load_dotenv()

app = Flask(__name__)
CORS(app)

# Register blueprints with the Flask app
app.register_blueprint(pipeline_bp)
app.register_blueprint(scraper_bp)
app.register_blueprint(status_bp) 

if __name__ == '__main__':
    app.run(debug=True, port=5000)
