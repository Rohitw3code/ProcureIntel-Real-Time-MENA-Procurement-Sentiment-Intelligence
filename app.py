import os
import hashlib
from datetime import datetime, timezone
from flask import Flask, jsonify, request,blueprints
from flask_cors import CORS
from dotenv import load_dotenv
from scrapers import scraper_manager
from routes.pipeline import pipeline_bp
from routes.scraper import scraper_bp


load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(pipeline_bp)
app.register_blueprint(scraper_bp)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
