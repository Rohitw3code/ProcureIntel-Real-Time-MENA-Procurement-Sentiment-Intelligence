from flask import Flask, jsonify, request,Blueprint
from scrapers import scraper_manager
from utils import hash_url
from datetime import datetime, timezone
from database import supabase

scraper_bp = Blueprint('scraper', __name__, url_prefix='/api')



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

@scraper_bp.route('/run-link-scrapers', methods=['POST'])
def run_link_scrapers():
    """
    Ensures no other pipeline is running, then starts a new run.
    It runs scrapers, filters out links that already exist in the DB,
    and saves only the new ones.
    """
    pipeline_id = None
    try:
        # 1. Check for and fail any existing 'RUNNING' pipelines
        running_pipelines = supabase.table("pipeline_runs").select("id").eq("status", "RUNNING").execute()
        for p_run in running_pipelines.data:
            supabase.table("pipeline_runs").update({
                "status": "FAILED",
                "end_time": datetime.now(timezone.utc).isoformat(),
                "details": "New pipeline run started, superseding this one."
            }).eq("id", p_run['id']).execute()

        # 2. Create a new pipeline run record and get its ID
        start_time_iso = datetime.now(timezone.utc).isoformat()
        insert_response = supabase.table("pipeline_runs").insert({
            "start_time": start_time_iso,
            "status": "RUNNING",
            "new_links_found": 0,
            "articles_scraped": 0,
            "entities_analyzed": 0
        }).execute()

        if not insert_response.data:
            raise Exception("Failed to create pipeline run record.")
            
        pipeline_id = insert_response.data[0]['id']

        json_data = request.get_json()
        scraper_names_to_run = json_data.get('scrapers') if json_data else None

        scraper_modules = scraper_manager.get_scraper_modules(scraper_names_to_run)
        if not scraper_modules:
            raise ValueError("No valid scrapers found for the given names")

        # 3. Gather all URLs from the selected scrapers
        all_scraped_urls = []
        for module in scraper_modules:
            source_name = module.SOURCE_NAME
            print(f"--- Running link scraper for: {source_name} ---")
            urls = module.get_article_urls()
            # Associate each URL with its source for later use
            all_scraped_urls.extend([(url, source_name) for url in urls])

        links_to_insert = []
        if all_scraped_urls:
            # 4. Check which links already exist in the database
            url_hashes = [hash_url(url) for url, source in all_scraped_urls]
            response = supabase.table("article_links").select("id").in_("id", url_hashes).execute()
            existing_hashes = {item['id'] for item in response.data}
            
            # 5. Filter out existing links and prepare the new ones for insertion
            for url, source in all_scraped_urls:
                url_id = hash_url(url)
                if url_id not in existing_hashes:
                    links_to_insert.append({
                        "id": url_id,
                        "url": url,
                        "source": source,
                        "status": "new"
                    })

        # 6. Insert only the new links into the database
        if links_to_insert:
            supabase.table("article_links").insert(links_to_insert).execute()

        # 7. Update pipeline run to COMPLETED
        end_time_iso = datetime.now(timezone.utc).isoformat()
        supabase.table("pipeline_runs").update({
            "status": "COMPLETED",
            "end_time": end_time_iso,
            "new_links_found": len(links_to_insert)
        }).eq("id", pipeline_id).execute()

        return jsonify({
            "message": "Link scraping complete.",
            "pipeline_id": pipeline_id,
            "links_found": len(links_to_insert)
        }), 200

    except Exception as e:
        # 8. If an error occurs, update pipeline run to FAILED
        if pipeline_id:
            end_time_iso = datetime.now(timezone.utc).isoformat()
            supabase.table("pipeline_runs").update({
                "status": "FAILED",
                "end_time": end_time_iso,
                "details": str(e)
            }).eq("id", pipeline_id).execute()
        
        return jsonify({
            "error": "An error occurred during link scraping", 
            "details": str(e),
            "pipeline_id": pipeline_id
        }), 500



@scraper_bp.route('/new-links', methods=['GET'])
def get_new_links():
    """
    Fetches all links from the database that have the status 'new'.
    """
    try:
        response = supabase.table("article_links").select("url, source").eq("status", "new").execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch new links", "details": str(e)}), 500
