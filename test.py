import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from CustomSupabaseVectorStore.CompanyNameVectorStore import CompanyNameVectorStore
from database import DB_CONNECTION_STRING

# Load environment variables from .env file
load_dotenv()

if not DB_CONNECTION_STRING:
    raise ValueError("SUPABASE_DB_URL not found in .env file.")

# 1. Initialize the Embedding Model
# Ensure you use the same model that was used to create your initial embeddings
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# 2. Initialize your custom VectorStore
vector_store = CompanyNameVectorStore(
    db_connection_string=DB_CONNECTION_STRING,
    embedding_function=embeddings
)

# 3. Define the company name to search for
query = "dubai"
# Set a distance threshold. Lower is more similar.
# This will find all companies with a distance score < 0.5
similarity_threshold = 0.5 

print(f"Searching for companies similar to '{query}' with a distance threshold of < {similarity_threshold}...\n")

# 4. Perform the similarity search
# This will now return all companies that meet the threshold
similar_companies = vector_store.similarity_search(
    query=query,
    k = 4  # Optional: specify k if you want a limit, otherwise it will return all that meet the threshold
)

# 5. Print the results
if similar_companies:
    print("--- Found Similar Companies ---")
    for doc in similar_companies:
        # The company name is in 'page_content'
        # The distance score is in the metadata
        print("doc : ",doc)
        company_name = doc.page_content
        distance = doc.metadata.get('distance', 'N/A')
        print(f"- Name: {company_name:<30} | Distance: {distance:.4f}")
    print("-----------------------------")
else:
    print("No similar companies found matching the criteria.")

