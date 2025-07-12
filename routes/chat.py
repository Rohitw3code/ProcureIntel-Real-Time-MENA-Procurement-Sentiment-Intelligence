from flask import Blueprint, request, jsonify
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain_groq import ChatGroq  # Optional: if using Groq
from CustomSupabaseVectorStore.ArticleVectorStore import ArticleVectorStore
import os

chat_bp = Blueprint('chat',__name__, url_prefix='/api/chat')

# --- Global state ---
STATE = {
    "initialized": False,
    "embeddings": None,
    "vector_store": None,
    "llm": None,
    "qa_chain": None
}

DB_CONNECTION_STRING = f"postgresql://postgres:{os.getenv('SUPABASE_DB_PASSWORD')}@{os.getenv('SUPABASE_DB_HOST_CONN')}:{os.getenv('SUPABASE_DB_PORT_CONN')}/postgres"


@chat_bp.route('/initialize', methods=['POST'])
def initialize():
    """
    POST /api/chat/initialize
    {
        "provider": "openai" | "groq",
        "model_name": "...",
        "temperature": 0.0
    }
    """
    data = request.json
    if not data:
        return jsonify({"error": "Missing JSON payload"}), 400

    provider = data.get("provider", "openai")
    model_name = data.get("model_name", "gpt-4o")
    temperature = data.get("temperature", 0.0)

    try:
        # (Re)build components
        embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

        vector_store = ArticleVectorStore(
            db_connection_string=DB_CONNECTION_STRING,
            embedding_function=embeddings
        )

        if provider.lower() == "openai":
            llm = ChatOpenAI(
                openai_api_key=os.getenv("OPENAI_API_KEY"),
                model_name=model_name,
                temperature=temperature
            )
        elif provider.lower() == "groq":
            llm = ChatGroq(
                api_key=os.getenv("GROQ_API_KEY"),
                model_name=model_name,
                temperature=temperature
            )
        else:
            return jsonify({"error": f"Unknown provider: {provider}"}), 400

        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vector_store.as_retriever()
        )

        # Save to global state
        STATE["initialized"] = True
        STATE["embeddings"] = embeddings
        STATE["vector_store"] = vector_store
        STATE["llm"] = llm
        STATE["qa_chain"] = qa_chain

        return jsonify({"message": f"Initialized with {provider} model {model_name}."}), 200

    except Exception as e:
        STATE["initialized"] = False
        return jsonify({"error": str(e)}), 500


@chat_bp.route('/query', methods=['POST'])
def query_chat():
    if not STATE["initialized"]:
        return jsonify({"error": "Service not initialized. Call /initialize first."}), 400

    data = request.json
    if not data or 'query' not in data:
        return jsonify({"error": "Missing 'query' in request body"}), 400

    query = data['query']

    try:
        answer = STATE["qa_chain"].run(query)
        response = {
            "query": query,
            "response": answer
        }
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
