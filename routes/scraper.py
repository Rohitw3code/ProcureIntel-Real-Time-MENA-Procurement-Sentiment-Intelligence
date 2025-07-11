from flask import jsonify, request, Blueprint
from scrapers import scraper_manager
from utils import hash_url
from database import supabase
from collections import defaultdict
import json
import threading
from datetime import datetime, timezone
from .status import pipeline_status_tracker, status_lock

scraper_bp = Blueprint('scraper', __name__, url_prefix='/api')

def _do_link_scraping(scraper_names, pipeline_id, stop_event):
    try:
        scraper_modules = scraper_manager.get_scraper_modules(scraper_names)
        if not scraper_modules:
            raise ValueError("No valid scrapers found for the given names")

        with status_lock:
            pipeline_status_tracker["total"] = len(scraper_modules)
            pipeline_status_tracker["progress"] = 0
            pipeline_status_tracker["details"]["message"] = f"Gathering links from {len(scraper_modules)} sources..."

        all_scraped_urls = []
        for i, module in enumerate(scraper_modules):
            if stop_event.is_set():
                raise InterruptedError("Pipeline stop requested by user.")
            source_name = module.SOURCE_NAME
            with status_lock:
                pipeline_status_tracker["details"]["message"] = f"Running link scraper for: {source_name}"
            urls = module.get_article_urls()
            all_scraped_urls.extend([(url, source_name) for url in urls])
            with status_lock:
                pipeline_status_tracker["progress"] = i + 1
        
        with status_lock:
            pipeline_status_tracker["details"]["message"] = "Filtering for new links..."

        links_to_insert = []
        scraper_stats = defaultdict(int)
        if all_scraped_urls:
            url_hashes = [hash_url(url) for url, source in all_scraped_urls]
            response = supabase.table("article_links").select("id").in_("id", url_hashes).execute()
            existing_hashes = {item['id'] for item in response.data}
            for url, source in all_scraped_urls:
                url_id = hash_url(url)
                if url_id not in existing_hashes:
                    links_to_insert.append({"id": url_id, "url": url, "source": source, "status": "pending"})
                    scraper_stats[source] += 1
        
        if links_to_insert:
            supabase.table("article_links").insert(links_to_insert).execute()

        end_time_iso = datetime.now(timezone.utc).isoformat()
        supabase.table("pipeline_runs").update({
            "status": "COMPLETED", "end_time": end_time_iso,
            "new_links_found": len(links_to_insert), "scraper_stats": json.dumps(scraper_stats)
        }).eq("id", pipeline_id).execute()

        with status_lock:
            pipeline_status_tracker["details"]["message"] = f"Link scraping complete. Found {len(links_to_insert)} new links."
            pipeline_status_tracker["details"]["scraper_stats"] = scraper_stats

    except Exception as e:
        error_message = str(e)
        status_code = "STOPPED" if isinstance(e, InterruptedError) else "FAILED"
        if status_code == "FAILED": print(f"Error during link scraping: {error_message}")
        end_time_iso = datetime.now(timezone.utc).isoformat()
        supabase.table("pipeline_runs").update({
            "status": status_code, "end_time": end_time_iso, "details": error_message
        }).eq("id", pipeline_id).execute()
        with status_lock:
            pipeline_status_tracker["details"]["message"] = f"Error: {error_message}"

    finally:
        with status_lock:
            pipeline_status_tracker["is_running"] = False
            pipeline_status_tracker["current_stage"] = "Idle"

def _do_article_scraping(stop_event):
    total_scraped = 0
    total_failed = 0
    scraper_stats = defaultdict(int)
    
    try:
        response = supabase.table("article_links").select("id, url, source").eq("status", "pending").execute()
        links_to_scrape = response.data
        
        with status_lock:
            pipeline_status_tracker["total"] = len(links_to_scrape)
            pipeline_status_tracker["progress"] = 0
        
        if not links_to_scrape:
            with status_lock:
                pipeline_status_tracker["details"]["message"] = "No new articles to scrape."
            return

        scraper_modules = scraper_manager.discover_scrapers()

        for i, link in enumerate(links_to_scrape):
            if stop_event.is_set():
                raise InterruptedError("Pipeline stop requested by user.")

            with status_lock:
                pipeline_status_tracker["progress"] = i + 1
                pipeline_status_tracker["details"]["message"] = f"Scraping article {i+1}/{len(links_to_scrape)}: {link['url']}"

            scraper_module = scraper_modules.get(link['source'])
            if not scraper_module:
                supabase.table("article_links").update({"status": "failed"}).eq("id", link['id']).execute()
                total_failed += 1
                continue
            
            try:
                content_data = scraper_module.scrape_article_content(link['url'])
                
                # Insert the single scraped article immediately with 'pending' status for embedding and analysis
                supabase.table("scraped_articles").insert({
                    "link_id": link['id'], 
                    "source": link['source'], 
                    "url": content_data.get('url'),
                    "title": content_data.get('title'), 
                    "author": content_data.get('author'),
                    "publication_date": content_data.get('publication_date'),
                    "raw_text": content_data.get('raw_text'), 
                    "cleaned_text": content_data.get('cleaned_text'),
                    "embedding_status": "pending",
                    "analysis_status": "pending" 
                }).execute()

                supabase.table("article_links").update({"status": "success"}).eq("id", link['id']).execute()
                
                scraper_stats[link['source']] += 1
                total_scraped += 1

            except Exception as e:
                print(f"Failed to scrape {link['url']}: {e}")
                supabase.table("article_links").update({"status": "failed"}).eq("id", link['id']).execute()
                total_failed += 1

        with status_lock:
            pipeline_status_tracker["details"]["message"] = f"Article scraping complete. Scraped: {total_scraped}, Failed: {total_failed}."
            pipeline_status_tracker["details"]["scraper_stats"] = scraper_stats

    except Exception as e:
        error_message = str(e)
        print(f"Error during article scraping: {error_message}")
        with status_lock:
            pipeline_status_tracker["details"]["message"] = f"Error: {error_message}"
    
    finally:
        with status_lock:
            pipeline_status_tracker["is_running"] = False
            pipeline_status_tracker["current_stage"] = "Idle"

# --- API Endpoints ---
@scraper_bp.route('/run-link-scrapers', methods=['POST'])
def run_link_scrapers():
    with status_lock:
        if pipeline_status_tracker["is_running"]:
            return jsonify({"error": f"A process is already running: {pipeline_status_tracker['current_stage']}"}), 409
        pipeline_status_tracker.update({
            "is_running": True, "current_stage": "Finding Links", "progress": 0, "total": 0,
            "details": {"message": "Initializing...", "scraper_stats": {}},
            "stop_event": threading.Event()
        })
    try:
        insert_response = supabase.table("pipeline_runs").insert({"start_time": datetime.now(timezone.utc).isoformat(), "status": "RUNNING"}).execute()
        pipeline_id = insert_response.data[0]['id']
        scraper_names = request.get_json().get('scrapers')
        thread = threading.Thread(target=_do_link_scraping, args=(scraper_names, pipeline_id, pipeline_status_tracker["stop_event"]))
        thread.start()
        return jsonify({"message": "Link scraping process started in the background.", "pipeline_id": pipeline_id}), 202
    except Exception as e:
        with status_lock:
            pipeline_status_tracker["is_running"] = False
            pipeline_status_tracker["current_stage"] = "Idle"
        return jsonify({"error": "Failed to start link scraping process", "details": str(e)}), 500

@scraper_bp.route('/scrape-articles', methods=['POST'])
def scrape_articles_endpoint():
    with status_lock:
        if pipeline_status_tracker["is_running"]:
            return jsonify({"error": f"A process is already running: {pipeline_status_tracker['current_stage']}"}), 409
        pipeline_status_tracker.update({
            "is_running": True, "current_stage": "Scraping Articles", "progress": 0, "total": 0,
            "details": {"message": "Initializing...", "scraper_stats": {}},
            "stop_event": threading.Event()
        })
    try:
        thread = threading.Thread(target=_do_article_scraping, args=(pipeline_status_tracker["stop_event"],))
        thread.start()
        return jsonify({"message": "Article scraping process started in the background."}), 202
    except Exception as e:
        with status_lock:
            pipeline_status_tracker["is_running"] = False
            pipeline_status_tracker["current_stage"] = "Idle"
        return jsonify({"error": "Failed to start article scraping process", "details": str(e)}), 500

@scraper_bp.route('/scraper-names', methods=['GET'])
def get_scraper_names():
    """
    Returns a list of all available scraper source names.
    """
    try:
        scraper_names = scraper_manager.get_all_scraper_names()
        return jsonify(scraper_names), 200
    except Exception as e:
        return jsonify({"error": "Failed to discover scrapers", "details": str(e)}), 500

@scraper_bp.route('/stop-scrape-articles', methods=['POST'])
def stop_scrape_articles_endpoint():
    """
    Signals the currently running article scraping process to stop gracefully.
    """
    with status_lock:
        if not pipeline_status_tracker["is_running"] or pipeline_status_tracker["current_stage"] != "Scraping Articles":
            return jsonify({"message": "No article scraping process is currently running to stop."}), 404
        
        if pipeline_status_tracker["stop_event"]:
            pipeline_status_tracker["stop_event"].set()
            pipeline_status_tracker["details"]["message"] = "Stop signal received for article scraping. Shutting down gracefully..."
        
    return jsonify({"message": "Article scraping stop signal sent."}), 200
