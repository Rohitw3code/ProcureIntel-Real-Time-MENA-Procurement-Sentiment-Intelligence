import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from CustomSupabaseVectorStore.CompanyNameVectorStore import CompanyNameVectorStore
from database import DB_CONNECTION_STRING

# Load environment variables from .env file
load_dotenv()

if not DB_CONNECTION_STRING:
    raise ValueError("SUPABASE_DB_URL not found in .env file.")

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

vector_store = CompanyNameVectorStore(
    db_connection_string=DB_CONNECTION_STRING,
    embedding_function=embeddings
)


def search_similar_companies(query: str, similarity_threshold: float = 0.5, k: int = 4):
    print(f"Searching for companies similar to '{query}' with a distance threshold of < {similarity_threshold}...\n")

    # Perform the similarity search
    similar_companies = vector_store.similarity_search(
        query=query,
        k=k  
    )

    #sort the result based on distance less to hight
    similar_companies = sorted(similar_companies, key=lambda x: x.metadata.get('distance', float('inf')))
    print("similar_companies : ", similar_companies)
    company_ids = [doc.metadata.get('id', 'N/A') for doc in similar_companies]
    print(f"Found {company_ids} similar companies.")
    return company_ids





