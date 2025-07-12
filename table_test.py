import psycopg2
from pgvector.psycopg2 import register_vector
from database import DB_CONNECTION_STRING
import numpy as np

def insert_company_data(company_name: str, embedding_vector: list):
    conn = None
    try:
        conn = psycopg2.connect(DB_CONNECTION_STRING)
        register_vector(conn)
        with conn.cursor() as cur:
            insert_sql = "INSERT INTO companies (real_name, embedding) VALUES (%s, %s) ON CONFLICT (real_name) DO NOTHING;"
            cur.execute(insert_sql, (company_name, embedding_vector))           
            if cur.rowcount > 0:
                print(f"Successfully inserted data for '{company_name}'.")
            else:
                print(f"Data for '{company_name}' already exists. Insertion skipped.")
        conn.commit()
        print("Transaction committed.")
    except psycopg2.Error as e:
        print(f"Database error: {e}")
    except ImportError:
        print("Error: The 'pgvector' or 'numpy' library is not installed. Please install them using 'pip install pgvector numpy'.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if conn:
            conn.close()
            print("Database connection closed.")
