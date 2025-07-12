from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
from CustomSupabaseVectorStore.ArticleVectorStore import ArticleVectorStore
import os

# --- Configuration ---
# Make sure to set your environment variables for database connection and OpenAI API key
DB_CONNECTION_STRING = f"postgresql://postgres:{os.getenv('SUPABASE_DB_PASSWORD')}@{os.getenv('SUPABASE_DB_HOST_CONN')}:{os.getenv('SUPABASE_DB_PORT_CONN')}/postgres"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 1. Initialize the Embedding Model
# Ensure you use the same model that was used to create your initial embeddings
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# 2. Initialize your custom VectorStore
vector_store = ArticleVectorStore(
    db_connection_string=DB_CONNECTION_STRING,
    embedding_function=embeddings
)

# 3. Initialize the Language Model
llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model_name="gpt-3.5-turbo", temperature=0)

# 4. Create the RetrievalQA Chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever()
)

# 5. Ask a question

question = "telecorm industry in ai"
answer = qa_chain.run(question)

print(answer)