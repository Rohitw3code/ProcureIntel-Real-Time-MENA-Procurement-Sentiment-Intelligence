from flask import Flask, jsonify, request,Blueprint
from database import supabase

pipeline_bp = Blueprint('api', __name__, url_prefix='/api')

@pipeline_bp.route('/pipelines', methods=['GET'])
def get_all_pipelines():
    """
    Fetches all pipeline runs, ordered by most recent first.
    Each run will include the scraper_stats JSON object if it exists.
    """
    try:
        response = supabase.table("pipeline_runs").select("*").order("start_time", desc=True).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch pipeline runs", "details": str(e)}), 500

@pipeline_bp.route('/pipelines/latest', methods=['GET'])
def get_latest_pipeline():
    """
    Fetches the most recently started pipeline run, regardless of status.
    This will include the scraper_stats JSON object if it exists.
    """
    try:
        response = supabase.table("pipeline_runs").select("*").order("start_time", desc=True).limit(1).single().execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch the latest pipeline run", "details": str(e)}), 404

@pipeline_bp.route('/pipelines/running', methods=['GET'])
def get_running_pipeline():
    """Fetches the currently running pipeline, if one exists."""
    try:
        response = supabase.table("pipeline_runs").select("*").eq("status", "RUNNING").limit(1).single().execute()
        return jsonify(response.data), 200
    except Exception as e:
        # Supabase throws an error if .single() finds no record, which is expected here.
        return jsonify({"message": "No pipeline is currently running."}), 200


@pipeline_bp.route('/pipelines/<int:pipeline_id>', methods=['GET'])
def get_pipeline_by_id(pipeline_id):
    """
    Fetches a specific pipeline run by its ID.
    This will include the scraper_stats JSON object if it exists.
    """
    try:
        response = supabase.table("pipeline_runs").select("*").eq("id", pipeline_id).single().execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch pipeline status", "details": str(e)}), 404
