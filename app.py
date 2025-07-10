import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Import blueprints
from routes.pipeline import pipeline_bp
from routes.scraper import scraper_bp
from routes.status import status_bp
from routes.analysis import analysis_bp # <-- Import the new analysis blueprint

load_dotenv()

app = Flask(__name__)
CORS(app)

# Register blueprints with the Flask app
app.register_blueprint(pipeline_bp)
app.register_blueprint(scraper_bp)
app.register_blueprint(status_bp)
app.register_blueprint(analysis_bp) # <-- Register the new analysis blueprint

if __name__ == '__main__':
    app.run(debug=True, port=5000)
