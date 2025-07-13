from flask import jsonify, Blueprint, request
from scrapers import scraper_manager
from utils.utils import hash_url
from database import supabase
from collections import defaultdict
import threading
from datetime import datetime, timezone
import json

# --- Local Imports ---
from .status import pipeline_status_tracker, status_lock

# Blueprint is updated for better namespacing
scraper_bp = Blueprint('scraper', __name__, url_prefix='/api/scraper')

# =======================================================================
# CORE WORKER FUNCTIONS
# =======================================================================

def _do_link_scraping(pipeline_id, scraper_names, stop_event):
    """
    Finds new article links from specified scrapers and saves them immediately.
    """
    total_new_links_found = 0
    scraper_stats = defaultdict(int)
    
    scraper_modules = scraper_manager.get_scraper_modules(scraper_names)
    if not scraper_modules:
        raise ValueError("No valid scrapers found for the given names")

    with status_lock:
        pipeline_status_tracker["total"] = len(scraper_modules)
        pipeline_status_tracker["progress"] = 0

    for i, module in enumerate(scraper_modules):
        if stop_event.is_set():
            raise InterruptedError("Pipeline stop requested by user.")
        
        source_name = module.SOURCE_NAME
        with status_lock:
            pipeline_status_tracker["progress"] = i + 1
            pipeline_status_tracker["details"]["message"] = f"Running link scraper for: {source_name}"
        
        try:
            urls = module.get_article_urls()
            if not urls:
                continue

            url_hashes = [hash_url(url) for url in urls]
            response = supabase.table("article_links").select("id").in_("id", url_hashes).execute()
            existing_hashes = {item['id'] for item in response.data}
            
            new_links_for_source = [{"id": hash_url(url), "url": url, "source": source_name, "status": "pending"} for url in urls if hash_url(url) not in existing_hashes]
            
            if new_links_for_source:
                print("Source:", source_name, "Found new links:", len(new_links_for_source))
                supabase.table("article_links").insert(new_links_for_source).execute()
                num_found = len(new_links_for_source)
                total_new_links_found += num_found
                scraper_stats[source_name] += num_found
                
                # Increment the counter by reading and then writing the new value
                run_res = supabase.table("pipeline_runs").select("new_links_found").eq("id", pipeline_id).single().execute()
                current_count = run_res.data.get("new_links_found", 0) or 0
                supabase.table("pipeline_runs").update({"new_links_found": current_count + num_found}).eq("id", pipeline_id).execute()

        except Exception as e:
            print(f"Warning: Scraper for '{source_name}' failed and will be skipped. Error: {e}")
            continue

    return total_new_links_found, dict(scraper_stats)


def _do_article_scraping(pipeline_id, stop_event):
    """
    Scrapes content for pending article links one by one.
    """
    total_scraped = 0
    total_failed = 0
    
    response = supabase.table("article_links").select("id, url, source").eq("status", "pending").execute()
    links_to_scrape = response.data
    
    with status_lock:
        pipeline_status_tracker["total"] = len(links_to_scrape)
        pipeline_status_tracker["progress"] = 0
    
    if not links_to_scrape:
        with status_lock:
            pipeline_status_tracker["details"]["message"] = "No new articles to scrape."
        return 0, 0

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
            supabase.table("scraped_articles").insert({
                "link_id": link['id'], "source": link['source'], "url": content_data.get('url'), "title": content_data.get('title'), 
                "author": content_data.get('author'), "publication_date": content_data.get('publication_date'),
                "raw_text": content_data.get('raw_text'), "cleaned_text": content_data.get('cleaned_text'),
                "embedding_status": "pending", "analysis_status": "pending" 
            }).execute()
            supabase.table("article_links").update({"status": "success"}).eq("id", link['id']).execute()
            
            total_scraped += 1
            # Increment the counter by reading and then writing the new value
            run_res = supabase.table("pipeline_runs").select("articles_scraped").eq("id", pipeline_id).single().execute()
            current_count = run_res.data.get("articles_scraped", 0) or 0
            supabase.table("pipeline_runs").update({"articles_scraped": current_count + 1}).eq("id", pipeline_id).execute()

        except Exception as e:
            print(f"Failed to scrape {link['url']}: {e}")
            supabase.table("article_links").update({"status": "failed"}).eq("id", link['id']).execute()
            total_failed += 1

    return total_scraped, total_failed

# =======================================================================
# STANDALONE TASK RUNNER
# =======================================================================

def _run_single_stage(task_function, stage_name, task_args=None):
    """A generic runner for starting a single pipeline stage as a standalone process."""
    if task_args is None:
        task_args = {}

    with status_lock:
        if pipeline_status_tracker["is_running"]:
            return jsonify({"error": f"A process is already running: {pipeline_status_tracker['current_stage']}"}), 409
        
        start_time_iso = datetime.now(timezone.utc).isoformat()
        insert_response = supabase.table("pipeline_runs").insert({"start_time": start_time_iso, "status": "RUNNING", "details": f"Running standalone stage: {stage_name}"}).execute()
        pipeline_id = insert_response.data[0]['id']

        pipeline_status_tracker.update({"is_running": True, "current_pipeline_id": pipeline_id, "current_stage": stage_name, "progress": 0, "total": 0, "details": {"message": "Initializing..."}, "stop_event": threading.Event()})

    try:
        full_task_args = {'pipeline_id': pipeline_id, 'stop_event': pipeline_status_tracker["stop_event"], **task_args}
        thread = threading.Thread(target=lambda: _finalize_single_stage_run(pipeline_id, task_function(**full_task_args), stage_name))
        thread.start()
        
        return jsonify({"message": f"{stage_name} process started in the background.", "pipeline_id": pipeline_id}), 202
    except Exception as e:
        with status_lock:
            pipeline_status_tracker["is_running"] = False
            pipeline_status_tracker["current_stage"] = "Idle"
            pipeline_status_tracker["current_pipeline_id"] = None
        return jsonify({"error": f"Failed to start {stage_name} process", "details": str(e)}), 500

def _finalize_single_stage_run(pipeline_id, results, stage_name):
    """Updates the pipeline_runs record upon completion of a single-stage task."""
    end_time_iso = datetime.now(timezone.utc).isoformat()
    
    if stage_name == "Finding Links":
        processed, stats_dict = results
        details = f"Standalone stage '{stage_name}' completed. Found: {processed} new links. Stats: {json.dumps(stats_dict)}"
        supabase.table("pipeline_runs").update({"scraper_stats": json.dumps(stats_dict)}).eq("id", pipeline_id).execute()
    else:
        processed, failed = results
        details = f"Standalone stage '{stage_name}' completed. Scraped: {processed}, Failed: {failed}."
    
    supabase.table("pipeline_runs").update({"status": "COMPLETED", "end_time": end_time_iso, "details": details}).eq("id", pipeline_id).execute()

    with status_lock:
        pipeline_status_tracker["is_running"] = False
        pipeline_status_tracker["current_stage"] = "Idle"
        pipeline_status_tracker["current_pipeline_id"] = None
        pipeline_status_tracker["details"]["message"] = details

# =======================================================================
# API ENDPOINTS
# =======================================================================

@scraper_bp.route('/run-link-finder', methods=['POST'])
def run_link_finder_only_endpoint():
    """
    Runs ONLY the link finding stage for selected scrapers.
    Expects a JSON body with a 'scrapers' key: `{"scrapers": ["gulfnews", "zawya"]}`
    """
    scraper_names = request.get_json().get('scrapers')
    if not scraper_names:
        return jsonify({"error": "A list of scraper names must be provided in the 'scrapers' key."}), 400
    return _run_single_stage(task_function=_do_link_scraping, stage_name="Finding Links", task_args={'scraper_names': scraper_names})

@scraper_bp.route('/run-article-scraper', methods=['POST'])
def run_article_scraper_only_endpoint():
    """
    Runs ONLY the article scraping stage for all links with 'pending' status.
    """
    return _run_single_stage(task_function=_do_article_scraping, stage_name="Scraping Articles")

@scraper_bp.route('/scraper-names', methods=['GET'])
def get_scraper_names():
    """Returns a list of all available scraper source names."""
    try:
        scraper_names = scraper_manager.get_all_scraper_names()
        return jsonify(scraper_names), 200
    except Exception as e:
        return jsonify({"error": "Failed to discover scrapers", "details": str(e)}), 500
