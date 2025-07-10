import psycopg2
import json
from openai import OpenAI
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


# === OpenAI: embed your user query ===
client = OpenAI()
query_text = "Tesla Saudi Arabia tender"
embedding_response = client.embeddings.create(
    model="text-embedding-3-small",
    input=query_text
)
query_embedding = embedding_response.data[0].embedding

print(f"✅ Query embedding dimension: {len(query_embedding)}")

# === Connect to Supabase Postgres directly ===
conn = psycopg2.connect(
    host="aws-0-ap-south-1.pooler.supabase.com",
    dbname="postgres",
    user="postgres.ofnelyqiyzsfzqondyen",
    password="rohit@SPACX",
    port=6543
)

cur = conn.cursor()

# === Run vector similarity search ===
sql = """
SELECT
  article_id,
  embedding <=> %s::vector AS distance
FROM
  article_embeddings
ORDER BY
  distance ASC
LIMIT 5;
"""

# pgvector wants a *list* not JSON string
cur.execute(sql, (query_embedding,))
results = cur.fetchall()

print("✅ Top matches:")
for row in results:
    print(row)

cur.close()
conn.close()
