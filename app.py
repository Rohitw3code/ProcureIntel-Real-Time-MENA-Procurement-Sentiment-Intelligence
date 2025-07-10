import os
import hashlib
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
from scrapers import scraper_manager

# --- App & DB Initialization ---
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# --- Helper Function ---
def hash_url(url: str) -> str:
    """Creates a unique, consistent SHA256 hash for a given URL."""
    return hashlib.sha256(url.encode('utf-8')).hexdigest()


# --- API Endpoints ---

@app.route('/scraper-names', methods=['GET'])
def get_scraper_names():
    """
    Returns a list of all available scraper source names.
    """
    try:
        scraper_names = scraper_manager.get_all_scraper_names()
        return jsonify(scraper_names), 200
    except Exception as e:
        return jsonify({"error": "Failed to discover scrapers", "details": str(e)}), 500

@app.route('/run-link-scrapers', methods=['POST'])
def run_link_scrapers():
    """
    Runs the 'get_article_urls' function for specified scrapers
    and saves the discovered links to the database with 'new' status.
    Accepts a JSON body with an optional 'scrapers' key (list of names).
    If 'scrapers' is not provided, it runs all available scrapers.
    """
    json_data = request.get_json()
    scraper_names_to_run = json_data.get('scrapers') if json_data else None

    try:
        scraper_modules = scraper_manager.get_scraper_modules(scraper_names_to_run)
        if not scraper_modules:
            return jsonify({"error": "No valid scrapers found for the given names"}), 404

        links_to_insert = []
        for module in scraper_modules:
            source_name = module.SOURCE_NAME
            print(f"--- Running link scraper for: {source_name} ---")
            urls = module.get_article_urls()
            for url in urls:
                links_to_insert.append({
                    "id": hash_url(url),
                    "url": url,
                    "source": source_name,
                    "status": "new"
                })

        if not links_to_insert:
            return jsonify({"message": "No new article links were found."}), 200

        # Use upsert to add new links without causing errors for existing ones
        response = supabase.table("article_links").upsert(links_to_insert).execute()
        
        if hasattr(response, 'error') and response.error:
            raise Exception(response.error)

        return jsonify({
            "message": "Link scraping complete.",
            "links_found": len(links_to_insert)
        }), 200

    except Exception as e:
        return jsonify({"error": "An error occurred during link scraping", "details": str(e)}), 500

@app.route('/new-links', methods=['GET'])
def get_new_links():
    """
    Fetches all links from the database that have the status 'new'.
    """
    try:
        response = supabase.table("article_links").select("url, source").eq("status", "new").execute()
        
        if hasattr(response, 'error') and response.error:
            raise Exception(response.error)

        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch new links", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
