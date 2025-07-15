import psycopg2
from pgvector.psycopg2 import register_vector
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
from openai import OpenAI
import os
import numpy as np
from database import DB_CONNECTION_STRING
from CustomSupabaseVectorStore.CompanyNameVectorStore import CompanyNameVectorStore

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
embedding_model = "text-embedding-3-small"
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
llm = ChatOpenAI(temperature=0, model_name="gpt-4o-mini")
vector_store = CompanyNameVectorStore(db_connection_string=DB_CONNECTION_STRING, embedding_function=embeddings)

prompt_template = """
You are an expert in entity recognition. Your task is to determine if two entities mentioned in the user's question refer to the same thing.

Analyze the following question:
"{question}"

Respond with only a single character:
- '1' if they are the same.
- '0' if they are not the same or if you cannot determine it from the question.
"""
prompt = ChatPromptTemplate.from_template(prompt_template)
output_parser = StrOutputParser()
chain = ({"question": RunnablePassthrough()} | prompt | llm | output_parser)

def check_entities_with_ai(user_question: str) -> int:
    print(f"\n-> Analyzing question: \"{user_question}\"")
    response = chain.invoke(user_question)
    return int(response.strip())

def insert_company_data(company_name: str, embedding_vector: list):
    conn = psycopg2.connect(DB_CONNECTION_STRING)
    register_vector(conn)
    with conn.cursor() as cur:
        # Try to insert, return id if inserted
        insert_sql = """
        INSERT INTO companies (real_name, embedding)
        VALUES (%s, %s)
        ON CONFLICT (real_name) DO UPDATE
          SET embedding = EXCLUDED.embedding
        RETURNING id;
        """
        cur.execute(insert_sql, (company_name, embedding_vector))
        inserted_id = cur.fetchone()[0]  # Get the returned id
        conn.commit()
    conn.close()
    return inserted_id
        
def check_name_exists(name: str) -> bool:
    similar_companies = vector_store.similarity_search(query=name, k=1, score_threshold=0.35)
    doc = similar_companies[0] if similar_companies else None
    if doc:
        company_name = doc.page_content
        id_ = doc.metadata.get('id', 'N/A')
        print(f"VectorFound Company Name: {company_name} | ID: {id_}")
        return {"company_name": company_name, "id": id_, "status": True}
    print(f"No similar company found for '{name}'.")
    return {"status": False}

def decide(company_name: str):
    res = check_name_exists(company_name)
    
    if res['status']:
        s_company_name = res['company_name']
        id_ = res['id']
        ai_res = check_entities_with_ai(f"is the company '{company_name}' the same as '{s_company_name}'?")
        print(f"AI Response: {ai_res}")
        if ai_res == 1:
            return {"status": "exists", "id": id_}
    embedding_response = client.embeddings.create(model=embedding_model, input=company_name)
    embedding = embedding_response.data[0].embedding
    print(f"Interting company '{company_name}'")
    id_ = insert_company_data(company_name, embedding_vector=embedding)
    print(f"Inserted company with ID: {id_}")
    return {"status": "created", "id": id_}

