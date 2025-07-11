import threading
import json
from flask import Blueprint, jsonify, request
from datetime import datetime, timezone

from database import supabase
from .status import pipeline_status_tracker, status_lock

# Import the processing functions from the other modules
from .scraper import _do_link_scraping, _do_article_scraping
from .embedding import _do_embedding_generation, _do_entity_extraction

pipeline_bp = Blueprint('pipeline', __name__, url_prefix='/api/pipeline')

def _run_full_pipeline(pipeline_id, scraper_names, stop_event):
    """The master orchestrator for the entire ETL pipeline."""
    try:
        with status_lock:
            pipeline_status_tracker["current_stage"] = "Finding Links"
            pipeline_status_tracker["details"]["message"] = "Starting link scraping..."
        
        links_found, scraper_stats = _do_link_scraping(pipeline_id, scraper_names, stop_event)
        supabase.table("pipeline_runs").update({"new_links_found": links_found, "scraper_stats": json.dumps(scraper_stats)}).eq("id", pipeline_id).execute()

        with status_lock:
            pipeline_status_tracker["current_stage"] = "Scraping Articles"
        articles_scraped, _ = _do_article_scraping(pipeline_id, stop_event)
        
        # with status_lock:
        #     pipeline_status_tracker["current_stage"] = "Generating Embeddings"
        # articles_embedded, _ = _do_embedding_generation(pipeline_id, stop_event)
        
        with status_lock:
            pipeline_status_tracker["current_stage"] = "Analyzing Articles"
        articles_analyzed, _ = _do_entity_extraction(pipeline_id, stop_event)

        end_time_iso = datetime.now(timezone.utc).isoformat()
        supabase.table("pipeline_runs").update({"status": "COMPLETED", "end_time": end_time_iso, "details": "All stages completed successfully."}).eq("id", pipeline_id).execute()
        with status_lock:
            pipeline_status_tracker["details"]["message"] = "Pipeline completed successfully."

    except Exception as e:
        error_message = str(e)
        status_code = "STOPPED" if isinstance(e, InterruptedError) else "FAILED"
        print(f"Pipeline failed at stage '{pipeline_status_tracker['current_stage']}': {error_message}")
        end_time_iso = datetime.now(timezone.utc).isoformat()
        supabase.table("pipeline_runs").update({"status": status_code, "end_time": end_time_iso, "details": f"Failed at stage: {pipeline_status_tracker['current_stage']}. Error: {error_message}"}).eq("id", pipeline_id).execute()
        with status_lock:
            pipeline_status_tracker["details"]["message"] = f"Error: {error_message}"
    finally:
        with status_lock:
            pipeline_status_tracker["is_running"] = False
            pipeline_status_tracker["current_stage"] = "Idle"
            pipeline_status_tracker["current_pipeline_id"] = None # Clear the ID on completion

@pipeline_bp.route('/run-full', methods=['POST'])
def run_full_pipeline_endpoint():
    with status_lock:
        if pipeline_status_tracker["is_running"]:
            return jsonify({"error": f"A process is already running: {pipeline_status_tracker['current_stage']}"}), 409
        
        start_time_iso = datetime.now(timezone.utc).isoformat()
        insert_response = supabase.table("pipeline_runs").insert({"start_time": start_time_iso, "status": "RUNNING"}).execute()
        pipeline_id = insert_response.data[0]['id']

        pipeline_status_tracker.update({
            "is_running": True, "current_pipeline_id": pipeline_id, "current_stage": "Initializing", 
            "progress": 0, "total": 0, "details": {"message": "Starting full pipeline..."},
            "stop_event": threading.Event()
        })

    # try:
    scraper_names = request.get_json().get('scrapers')
    thread = threading.Thread(target=_run_full_pipeline, args=(pipeline_id, scraper_names, pipeline_status_tracker["stop_event"]))
    thread.start()
    return jsonify({"message": "Full pipeline process started in the background.", "pipeline_id": pipeline_id}), 202
    # except Exception as e:
    #     with status_lock:
    #         pipeline_status_tracker["is_running"] = False
    #         pipeline_status_tracker["current_stage"] = "Idle"
    #         pipeline_status_tracker["current_pipeline_id"] = None
    #     return jsonify({"error": "Failed to start the pipeline process", "details": str(e)}), 500

# --- Endpoints to fetch pipeline history & status ---

@pipeline_bp.route('/runs', methods=['GET'])
def get_all_pipelines():
    try:
        response = supabase.table("pipeline_runs").select("*").order("start_time", desc=True).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch pipeline runs", "details": str(e)}), 500

@pipeline_bp.route('/runs/<int:pipeline_id>/status', methods=['GET'])
def get_specific_pipeline_status(pipeline_id):
    """
    Gets the status of a specific pipeline run.
    If the pipeline is currently running, it returns the live, in-memory status.
    If the pipeline is not running (i.e., it's a historical run), it fetches the final state from the database.
    """
    with status_lock:
        # Check if the requested ID is the one currently running
        if pipeline_status_tracker["is_running"] and pipeline_status_tracker["current_pipeline_id"] == pipeline_id:
            status_to_return = pipeline_status_tracker.copy()
            status_to_return.pop("stop_event", None)
            status_to_return["last_update"] = datetime.now(timezone.utc).isoformat()
            return jsonify(status_to_return)

    # If not running, fetch the final status from the database
    try:
        response = supabase.table("pipeline_runs").select("*").eq("id", pipeline_id).single().execute()
        return jsonify(response.data), 200
    except Exception:
        return jsonify({"error": "Pipeline run not found"}), 404
