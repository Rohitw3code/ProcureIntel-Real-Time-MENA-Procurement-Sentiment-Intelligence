from flask import jsonify, Blueprint
from database import supabase
from openai import OpenAI
import os
import threading
from collections import defaultdict
from .agent_manager import extraction_chain
from .status import pipeline_status_tracker, status_lock

analysis_bp = Blueprint('analysis', __name__, url_prefix='/api')
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def _do_entity_extraction(stop_event):
    total_processed = 0
    total_failed = 0

    try:
        # 1. Fetch articles that are pending analysis.
        articles_to_analyze_res = supabase.table("scraped_articles").select("id, cleaned_text").eq("analysis_status", "pending").not_.is_("cleaned_text", "null").execute()
        articles_to_analyze = articles_to_analyze_res.data

        with status_lock:
            pipeline_status_tracker["total"] = len(articles_to_analyze)
            pipeline_status_tracker["progress"] = 0
        
        if not articles_to_analyze:
            with status_lock:
                pipeline_status_tracker["details"]["message"] = "No new articles to analyze."
            return

        # 2. Process each article
        for i, article in enumerate(articles_to_analyze):
            if stop_event.is_set():
                raise InterruptedError("Pipeline stop requested by user.")

            with status_lock:
                pipeline_status_tracker["progress"] = i + 1
                pipeline_status_tracker["details"]["message"] = f"Analyzing article {article['id']} ({i+1}/{len(articles_to_analyze)})"
            
            try:
                # Use the imported agent chain to extract structured data
                analysis_result = extraction_chain.invoke({"article_text": article['cleaned_text']})

                if analysis_result.mode == "Ignore":
                    supabase.table("scraped_articles").update({"analysis_status": "success"}).eq("id", article['id']).execute()
                    total_processed += 1
                    continue

                # Insert the main analysis record and get its ID
                analysis_insert_res = supabase.table("article_analysis").insert({
                    "article_id": article['id'],
                    "mode": analysis_result.mode,
                    "countries": analysis_result.countries,
                    "commodities": analysis_result.commodities,
                    "contract_value": analysis_result.contract_value,
                    "deadline": analysis_result.deadline
                }).execute()
                analysis_id = analysis_insert_res.data[0]['id']

                # Insert the company-specific sentiment records
                if analysis_result.company_sentiments:
                    company_records = [
                        {
                            "article_analysis_id": analysis_id,
                            "company_name": sent.company_name,
                            "sentiment": sent.sentiment,
                            "risk_type": sent.risk_type,
                            "reason_for_sentiment": sent.reason_for_sentiment
                        } for sent in analysis_result.company_sentiments
                    ]
                    supabase.table("company_analysis").insert(company_records).execute()

                supabase.table("scraped_articles").update({"analysis_status": "success"}).eq("id", article['id']).execute()
                total_processed += 1

            except Exception as e:
                print(f"Failed to analyze article {article['id']}: {e}")
                supabase.table("scraped_articles").update({"analysis_status": "failed"}).eq("id", article['id']).execute()
                total_failed += 1

        with status_lock:
            pipeline_status_tracker["details"]["message"] = f"Article analysis complete. Processed: {total_processed}, Failed: {total_failed}."

    except Exception as e:
        error_message = str(e)
        print(f"An error occurred during article analysis: {error_message}")
        with status_lock:
            pipeline_status_tracker["details"]["message"] = f"Error: {error_message}"
    
    finally:
        with status_lock:
            pipeline_status_tracker["is_running"] = False
            pipeline_status_tracker["current_stage"] = "Idle"

# --- API Endpoints to Start and Stop Analysis ---
@analysis_bp.route('/analyze-articles', methods=['POST'])
def analyze_articles_endpoint():
    with status_lock:
        if pipeline_status_tracker["is_running"]:
            return jsonify({"error": f"A process is already running: {pipeline_status_tracker['current_stage']}"}), 409
        
        pipeline_status_tracker.update({
            "is_running": True, "current_stage": "Analyzing Articles", "progress": 0, "total": 0,
            "details": {"message": "Initializing..."}, "stop_event": threading.Event()
        })

    try:
        thread = threading.Thread(target=_do_entity_extraction, args=(pipeline_status_tracker["stop_event"],))
        thread.start()
        return jsonify({"message": "Article analysis process started in the background."}), 202
    except Exception as e:
        with status_lock:
            pipeline_status_tracker["is_running"] = False
            pipeline_status_tracker["current_stage"] = "Idle"
        return jsonify({"error": "Failed to start analysis process", "details": str(e)}), 500

@analysis_bp.route('/stop-analyze-articles', methods=['POST'])
def stop_analyze_articles_endpoint():
    """
    Signals the currently running article analysis process to stop gracefully.
    """
    with status_lock:
        if not pipeline_status_tracker["is_running"] or pipeline_status_tracker["current_stage"] != "Analyzing Articles":
            return jsonify({"message": "No article analysis process is currently running to stop."}), 404
        
        if pipeline_status_tracker["stop_event"]:
            pipeline_status_tracker["stop_event"].set()
            pipeline_status_tracker["details"]["message"] = "Stop signal received for article analysis. Shutting down gracefully..."
        
    return jsonify({"message": "Article analysis stop signal sent."}), 200


def _do_embedding_generation(stop_event):
    total_processed = 0
    total_failed = 0
    embedding_model = "text-embedding-3-small"
    try:
        articles_to_process_res = supabase.table("scraped_articles").select("id, source, publication_date, cleaned_text").eq("embedding_status", "pending").not_.is_("cleaned_text", "null").execute()
        articles_to_process = articles_to_process_res.data
        with status_lock:
            pipeline_status_tracker["total"] = len(articles_to_process)
            pipeline_status_tracker["progress"] = 0
        if not articles_to_process:
            with status_lock:
                pipeline_status_tracker["details"]["message"] = "No new articles to process."
            return
        for i, article in enumerate(articles_to_process):
            if stop_event.is_set():
                raise InterruptedError("Pipeline stop requested by user.")
            with status_lock:
                pipeline_status_tracker["progress"] = i + 1
                pipeline_status_tracker["details"]["message"] = f"Generating embedding for article {article['id']} ({i+1}/{len(articles_to_process)})"
            try:
                embedding_response = client.embeddings.create(model=embedding_model, input=article['cleaned_text'])
                embedding = embedding_response.data[0].embedding
                supabase.table("article_embeddings").insert({"article_id": article['id'], "source": article.get('source'), "publication_date": article.get('publication_date'), "embedding": embedding, "model": embedding_model}).execute()
                supabase.table("scraped_articles").update({"embedding_status": "success"}).eq("id", article['id']).execute()
                total_processed += 1
            except Exception as e:
                print(f"Failed to process article {article['id']}: {e}")
                supabase.table("scraped_articles").update({"embedding_status": "failed"}).eq("id", article['id']).execute()
                total_failed += 1
        with status_lock:
            pipeline_status_tracker["details"]["message"] = f"Embedding generation complete. Processed: {total_processed}, Failed: {total_failed}."
    except Exception as e:
        error_message = str(e)
        print(f"An error occurred during embedding generation: {error_message}")
        with status_lock:
            pipeline_status_tracker["details"]["message"] = f"Error: {error_message}"
    finally:
        with status_lock:
            pipeline_status_tracker["is_running"] = False
            pipeline_status_tracker["current_stage"] = "Idle"

@analysis_bp.route('/generate-embeddings', methods=['POST'])
def generate_embeddings_endpoint():
    with status_lock:
        if pipeline_status_tracker["is_running"]:
            return jsonify({"error": f"A process is already running: {pipeline_status_tracker['current_stage']}"}), 409
        pipeline_status_tracker.update({
            "is_running": True, "current_stage": "Generating Embeddings", "progress": 0, "total": 0,
            "details": {"message": "Initializing..."}, "stop_event": threading.Event()
        })
    try:
        thread = threading.Thread(target=_do_embedding_generation, args=(pipeline_status_tracker["stop_event"],))
        thread.start()
        return jsonify({"message": "Embedding generation process started in the background."}), 202
    except Exception as e:
        with status_lock:
            pipeline_status_tracker["is_running"] = False
            pipeline_status_tracker["current_stage"] = "Idle"
        return jsonify({"error": "Failed to start embedding generation process", "details": str(e)}), 500
