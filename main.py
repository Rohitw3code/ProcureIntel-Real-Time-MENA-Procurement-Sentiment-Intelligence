from supabase import create_client, Client
from dotenv import load_dotenv
import os
import hashlib

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL or SUPABASE_KEY not found. Did you forget your .env?")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def hash_url(url):
    return hashlib.sha256(url.encode('utf-8')).hexdigest()

url_to_insert = "https://example.com/article-1"
url_hash = hash_url(url_to_insert)
source = "Example Website"

response = supabase.table("article_links").insert({
    "id": url_hash,
    "url": url_to_insert,
    "source": source,
    "status": "new"
}).execute()

print("Response:", response)
