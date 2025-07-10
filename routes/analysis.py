from flask import jsonify, Blueprint
from database import supabase
from openai import OpenAI
import os
import threading
from collections import defaultdict
from .status import pipeline_status_tracker, status_lock

# --- Initialization ---
analysis_bp = Blueprint('analysis', __name__, url_prefix='/api')
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --- Background Task for Generating Embeddings ---
def _do_embedding_generation(stop_event):
    total_processed = 0
    total_failed = 0
    embedding_model = "text-embedding-3-small"

    try:
        # 1. Find which articles already have embeddings
        existing_embeddings_res = supabase.table("article_embeddings").select("article_id").execute()
        processed_article_ids = {item['article_id'] for item in existing_embeddings_res.data}

        # 2. Fetch articles that have been scraped but not yet vectorized
        articles_to_process_res = supabase.table("scraped_articles").select("id, source, publication_date, cleaned_text").limit(5).execute()
        
        articles_to_process = [
            article for article in articles_to_process_res.data 
            if article['id'] not in processed_article_ids and article.get('cleaned_text')
        ]

        with status_lock:
            pipeline_status_tracker["total"] = len(articles_to_process)
            pipeline_status_tracker["progress"] = 0
        
        if not articles_to_process:
            with status_lock:
                pipeline_status_tracker["details"]["message"] = "No new articles to process."
            return

        # 3. Process each article
        for i, article in enumerate(articles_to_process):
            if stop_event.is_set():
                raise InterruptedError("Pipeline stop requested by user.")

            with status_lock:
                pipeline_status_tracker["progress"] = i + 1
                pipeline_status_tracker["details"]["message"] = f"Generating embedding for article {article['id']} ({i+1}/{len(articles_to_process)})"
            
            try:
                # Generate embedding
                embedding_response = client.embeddings.create(
                    model=embedding_model,
                    input=article['cleaned_text']
                )
                embedding = embedding_response.data[0].embedding

                # Insert into Supabase
                supabase.table("article_embeddings").insert({
                    "article_id": article['id'],
                    "source": article.get('source'),
                    "publication_date": article.get('publication_date'),
                    "embedding": embedding,
                    "model": embedding_model
                }).execute()
                total_processed += 1

            except Exception as e:
                print(f"Failed to process article {article['id']}: {e}")
                total_failed += 1

        with status_lock:
            pipeline_status_tracker["details"]["message"] = f"Embedding generation complete. Processed: {total_processed}, Failed: {total_failed}."

    except Exception as e:
        error_message = str(e)
        print(f"An error occurred during embedding generation: {error_message}")
        with status_lock:
            pipeline_status_tracker["details"]["message"] = f"Error: {error_message}"
    
    finally:
        # Reset the global status tracker
        with status_lock:
            pipeline_status_tracker["is_running"] = False
            pipeline_status_tracker["current_stage"] = "Idle"

# --- API Endpoint to Start the Process ---
@analysis_bp.route('/generate-embeddings', methods=['POST'])
def generate_embeddings_endpoint():
    """
    Starts the background process to generate vector embeddings for new articles.
    """
    with status_lock:
        if pipeline_status_tracker["is_running"]:
            return jsonify({"error": f"A process is already running: {pipeline_status_tracker['current_stage']}"}), 409
        
        # Set the status for the new process
        pipeline_status_tracker.update({
            "is_running": True,
            "current_stage": "Generating Embeddings",
            "progress": 0,
            "total": 0,
            "details": {"message": "Initializing...", "scraper_stats": {}},
            "stop_event": threading.Event()
        })

    try:
        # Start the background thread
        thread = threading.Thread(target=_do_embedding_generation, args=(pipeline_status_tracker["stop_event"],))
        thread.start()
        return jsonify({"message": "Embedding generation process started in the background."}), 202
    except Exception as e:
        with status_lock:
            pipeline_status_tracker["is_running"] = False
            pipeline_status_tracker["current_stage"] = "Idle"
        return jsonify({"error": "Failed to start embedding generation process", "details": str(e)}), 500
