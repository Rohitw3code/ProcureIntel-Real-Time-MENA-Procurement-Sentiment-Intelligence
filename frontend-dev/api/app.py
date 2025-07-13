import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from routes.pipeline import pipeline_bp
from routes.scraper import scraper_bp
from routes.status import status_bp
from routes.embedding import analysis_bp
from routes.agent_manager import agent_bp
from routes.chat import chat_bp
from routes.stats import stats_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(pipeline_bp)
app.register_blueprint(scraper_bp)
app.register_blueprint(status_bp)
app.register_blueprint(analysis_bp)
app.register_blueprint(agent_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(stats_bp)

if __name__ == '__main__':
    app.run(debug=True, port=5000)