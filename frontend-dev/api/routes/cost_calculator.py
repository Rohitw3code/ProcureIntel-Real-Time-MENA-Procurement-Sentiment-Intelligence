import json
import tiktoken

# =======================================================================
# PRICING CONFIGURATION
# =======================================================================
# Prices are in USD per 1 million tokens.
PRICING_CONFIG = {
    "openai": {
        "models": {
            "gpt-4o": {"input": 5.00, "output": 15.00},
            "gpt-4-turbo": {"input": 10.00, "output": 30.00},
            "gpt-3.5-turbo": {"input": 0.50, "output": 1.50},
        },
        "embedding": {
            "text-embedding-3-small": {"usage": 0.02}
        }
    },
    "groq": {
        "models": {
            "llama3-8b-8192": {"input": 0.05, "output": 0.05},
            "llama3-70b-8192": {"input": 0.59, "output": 0.79},
            "mixtral-8x7b-32768": {"input": 0.24, "output": 0.24},
            "gemma-7b-it": {"input": 0.07, "output": 0.07},
        }
    }
}

# =======================================================================
# TOKEN COUNTING UTILITIES
# =======================================================================

def num_tokens_from_string(string: str, model_name: str) -> int:
    """Returns the number of tokens in a text string for a given OpenAI model."""
    try:
        encoding = tiktoken.encoding_for_model(model_name)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(string))

def approximate_groq_tokens(string: str) -> int:
    """Approximates token count for Groq models (1 token ~= 4 chars)."""
    return len(string) // 4

# =======================================================================
# PUBLIC COST CALCULATION FUNCTIONS
# =======================================================================

def calculate_analysis_cost(analysis_result, input_text, model_type, model_name):
    """Calculates the cost for a single article analysis."""
    cost = 0
    pricing = PRICING_CONFIG.get(model_type.lower(), {}).get("models", {}).get(model_name)
    if not pricing:
        return 0

    # Input cost
    if model_type.lower() == 'openai':
        input_tokens = num_tokens_from_string(input_text, model_name)
    else:  # groq
        input_tokens = approximate_groq_tokens(input_text)
    cost += (input_tokens / 1_000_000) * pricing['input']

    # Output cost
    output_json = json.dumps(analysis_result.dict())
    if model_type.lower() == 'openai':
        output_tokens = num_tokens_from_string(output_json, model_name)
    else:  # groq
        output_tokens = approximate_groq_tokens(output_json)
    cost += (output_tokens / 1_000_000) * pricing['output']
    
    return cost

def calculate_embedding_cost(text_to_embed, model_name):
    """Calculates the cost for a single article embedding."""
    pricing = PRICING_CONFIG.get("openai", {}).get("embedding", {}).get(model_name)
    if not pricing:
        return 0
    
    tokens = num_tokens_from_string(text_to_embed, model_name)
    cost = (tokens / 1_000_000) * pricing['usage']
    return cost
