from flask import Blueprint, jsonify
import threading
from datetime import datetime, timezone

# --- Global State for Pipeline Tracking ---
# This dictionary will be shared across requests to track the pipeline's state.
# A lock is used to prevent race conditions when updating the state from different threads.
pipeline_status_tracker = {
    "is_running": False,
    "current_stage": "Idle", # Can be "Finding Links", "Scraping Articles", etc.
    "progress": 0,
    "total": 0,
    "last_update": None,
    "details": {
        "message": "No process is currently running.",
        "scraper_stats": {}
    },
    "stop_event": None, # Used to signal a graceful shutdown to the running thread
}
status_lock = threading.Lock()

status_bp = Blueprint('status', __name__, url_prefix='/api')

@status_bp.route('/status', methods=['GET'])
def get_pipeline_status():
    """
    Returns the current real-time status of the scraping pipeline.
    """
    with status_lock:
        # Create a copy of the tracker to avoid sending the non-serializable Event object
        status_to_return = pipeline_status_tracker.copy()
        status_to_return.pop("stop_event", None)  # Remove the event object before sending

        # Add the current timestamp to the response for freshness
        status_to_return["last_update"] = datetime.now(timezone.utc).isoformat()
        return jsonify(status_to_return)

@status_bp.route('/stop-pipeline', methods=['POST'])
def stop_pipeline():
    """
    Signals the currently running pipeline to stop gracefully.
    """
    with status_lock:
        if not pipeline_status_tracker["is_running"] or not pipeline_status_tracker["stop_event"]:
            return jsonify({"message": "No pipeline is currently running to stop."}), 404
        
        # Signal the event to stop the background thread
        pipeline_status_tracker["stop_event"].set()
        pipeline_status_tracker["details"]["message"] = "Stop signal received. Shutting down gracefully..."

    return jsonify({"message": "Pipeline stop signal sent."}), 200
