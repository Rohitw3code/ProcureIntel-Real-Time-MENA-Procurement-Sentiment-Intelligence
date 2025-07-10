from openai import OpenAI
from supabase import create_client, Client
import os

# === 1️⃣ Configure your keys ===
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# === 2️⃣ Initialize clients ===
# OpenAI
client = OpenAI(api_key=OPENAI_API_KEY)

# Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# === 3️⃣ Get your clean text & article ID ===
# You'd usually fetch this from your scraped_articles table!
article_id = 1  # <-- Use your actual scraped_articles.id
clean_text = """
Tesla has secured a $1 billion contract from the Saudi government
to expand electric vehicle infrastructure as part of Vision 2030.
"""

# === 4️⃣ Generate the embedding ===
embedding_response = client.embeddings.create(
    model="text-embedding-3-small",
    input=clean_text
)
embedding = embedding_response.data[0].embedding

print(f"Embedding generated, dimension: {len(embedding)}")

# === 5️⃣ Insert into Supabase article_embeddings table ===
response = supabase.table("article_embeddings").insert({
    "article_id": article_id,
    "embedding": embedding,  # JSON array is fine for pgvector
    "model": "text-embedding-3-large"
}).execute()

print(" Inserted embedding into Supabase:", response)
