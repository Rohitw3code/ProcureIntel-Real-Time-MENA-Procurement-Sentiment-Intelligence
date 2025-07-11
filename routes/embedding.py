from flask import jsonify, Blueprint
from openai import OpenAI
import os
import threading
from datetime import datetime, timezone

from database import supabase
from .agent_manager import extraction_chain
from .status import pipeline_status_tracker, status_lock

analysis_bp = Blueprint('analysis', __name__, url_prefix='/api/analysis')
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# (Worker functions _do_entity_extraction and _do_embedding_generation remain the same)
def _do_entity_extraction(pipeline_id, stop_event):
    total_processed, total_failed = 0, 0
    articles_res = supabase.table("scraped_articles").select("id, cleaned_text").eq("analysis_status", "pending").not_.is_("cleaned_text", "null").execute()
    articles_to_analyze = articles_res.data
    with status_lock:
        pipeline_status_tracker["total"] = len(articles_to_analyze)
        pipeline_status_tracker["progress"] = 0
    if not articles_to_analyze:
        with status_lock:
            pipeline_status_tracker["details"]["message"] = "No new articles to analyze."
        return 0, 0
    for i, article in enumerate(articles_to_analyze):
        if stop_event.is_set(): raise InterruptedError("Stop requested")
        with status_lock:
            pipeline_status_tracker["progress"] = i + 1
            pipeline_status_tracker["details"]["message"] = f"Analyzing {i+1}/{len(articles_to_analyze)}"
        try:
            analysis_result = extraction_chain.invoke({"article_text": article['cleaned_text']})
            if analysis_result.mode == "Ignore":
                supabase.table("scraped_articles").update({"analysis_status": "success"}).eq("id", article['id']).execute()
            else:
                analysis_insert_res = supabase.table("article_analysis").insert({"article_id": article['id'], **analysis_result.dict(exclude={"company_sentiments"})}).execute()
                analysis_id = analysis_insert_res.data[0]['id']
                if analysis_result.company_sentiments:
                    company_records = [{"article_analysis_id": analysis_id, **sent.dict()} for sent in analysis_result.company_sentiments]
                    supabase.table("company_analysis").insert(company_records).execute()
                supabase.table("scraped_articles").update({"analysis_status": "success"}).eq("id", article['id']).execute()
            
            total_processed += 1
            # Increment the counter in the database by reading and then writing the new value
            run_res = supabase.table("pipeline_runs").select("articles_analyzed").eq("id", pipeline_id).single().execute()
            current_count = run_res.data.get("articles_analyzed", 0) or 0 # Handle null value
            supabase.table("pipeline_runs").update({"articles_analyzed": current_count + 1}).eq("id", pipeline_id).execute()

        except Exception as e:
            print(f"Failed to analyze article {article['id']}: {e}")
            supabase.table("scraped_articles").update({"analysis_status": "failed"}).eq("id", article['id']).execute()
            total_failed += 1
    return total_processed, total_failed

def _do_embedding_generation(pipeline_id, stop_event):
    total_processed, total_failed = 0, 0
    embedding_model = "text-embedding-3-small"
    articles_res = supabase.table("scraped_articles").select("id, source, publication_date, cleaned_text").eq("embedding_status", "pending").not_.is_("cleaned_text", "null").execute()
    articles_to_process = articles_res.data
    with status_lock:
        pipeline_status_tracker["total"] = len(articles_to_process)
        pipeline_status_tracker["progress"] = 0
    if not articles_to_process:
        with status_lock:
            pipeline_status_tracker["details"]["message"] = "No new articles for embeddings."
        return 0, 0
    for i, article in enumerate(articles_to_process):
        if stop_event.is_set(): raise InterruptedError("Stop requested")
        with status_lock:
            pipeline_status_tracker["progress"] = i + 1
            pipeline_status_tracker["details"]["message"] = f"Embedding {i+1}/{len(articles_to_process)}"
        try:
            embedding_response = client.embeddings.create(model=embedding_model, input=article['cleaned_text'])
            embedding = embedding_response.data[0].embedding
            supabase.table("article_embeddings").insert({"article_id": article['id'], "source": article.get('source'), "publication_date": article.get('publication_date'), "embedding": embedding, "model": embedding_model}).execute()
            supabase.table("scraped_articles").update({"embedding_status": "success"}).eq("id", article['id']).execute()
            
            total_processed += 1
            # Increment the counter in the database by reading and then writing the new value
            run_res = supabase.table("pipeline_runs").select("articles_embedded").eq("id", pipeline_id).single().execute()
            current_count = run_res.data.get("articles_embedded", 0) or 0 # Handle null value
            supabase.table("pipeline_runs").update({"articles_embedded": current_count + 1}).eq("id", pipeline_id).execute()

        except Exception as e:
            print(f"Failed to process article {article['id']}: {e}")
            supabase.table("scraped_articles").update({"embedding_status": "failed"}).eq("id", article['id']).execute()
            total_failed += 1
    return total_processed, total_failed

def _run_single_stage(task_function, stage_name):
    """A generic runner for starting a single pipeline stage as a standalone process."""
    with status_lock:
        if pipeline_status_tracker["is_running"]:
            return jsonify({"error": f"A process is already running: {pipeline_status_tracker['current_stage']}"}), 409
        
        start_time_iso = datetime.now(timezone.utc).isoformat()
        insert_response = supabase.table("pipeline_runs").insert({"start_time": start_time_iso, "status": "RUNNING", "details": f"Running standalone stage: {stage_name}"}).execute()
        pipeline_id = insert_response.data[0]['id']
        
        pipeline_status_tracker.update({
            "is_running": True, "current_pipeline_id": pipeline_id, "current_stage": stage_name, 
            "progress": 0, "total": 0, "details": {"message": "Initializing..."}, 
            "stop_event": threading.Event()
        })

    try:
        thread = threading.Thread(target=lambda: _finalize_single_stage_run(pipeline_id, task_function(pipeline_id, pipeline_status_tracker["stop_event"]), stage_name))
        thread.start()
        return jsonify({"message": f"{stage_name} process started.", "pipeline_id": pipeline_id}), 202
    except Exception as e:
        with status_lock:
            pipeline_status_tracker.update({"is_running": False, "current_stage": "Idle", "current_pipeline_id": None})
        return jsonify({"error": f"Failed to start {stage_name}", "details": str(e)}), 500

def _finalize_single_stage_run(pipeline_id, results, stage_name):
    """Updates the pipeline_runs record upon completion."""
    processed, failed = results
    end_time_iso = datetime.now(timezone.utc).isoformat()
    details = f"Standalone '{stage_name}' completed. Processed: {processed}, Failed: {failed}."
    supabase.table("pipeline_runs").update({"status": "COMPLETED", "end_time": end_time_iso, "details": details}).eq("id", pipeline_id).execute()
    with status_lock:
        pipeline_status_tracker.update({"is_running": False, "current_stage": "Idle", "current_pipeline_id": None, "details": {"message": details}})

@analysis_bp.route('/run-embeddings', methods=['POST'])
def run_embeddings_only_endpoint():
    return _run_single_stage(task_function=_do_embedding_generation, stage_name="Generating Embeddings")

@analysis_bp.route('/run-analysis', methods=['POST'])
def run_analysis_only_endpoint():
    return _run_single_stage(task_function=_do_entity_extraction, stage_name="Analyzing Articles")
