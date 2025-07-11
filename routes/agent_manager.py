import os
from typing import List, Literal, Optional

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from flask import Blueprint, jsonify
from langchain_groq import ChatGroq


agent_bp = Blueprint('agent', __name__, url_prefix='/api')
# This section defines the exact data structure the AI agent should extract.

class CompanySentimentAnalysis(BaseModel):
    """A model to hold the sentiment and risk analysis for a single company mentioned in an article."""
    company_name: str = Field(..., description="The specific name of the company being analyzed.")
    sentiment: Literal["Positive", "Negative", "Neutral"] = Field(
        ...,
        description="The sentiment towards this specific company based on the article's context."
    )
    risk_type: Optional[Literal["Trade Barrier", "Supply Disruption", "Compliance", "Financial", "Reputational"]] = Field(
        None,
        description="If sentiment is Negative, classify the type of supply chain risk. Choose from 'Trade Barrier' (tariffs, sanctions), 'Supply Disruption' (factory fire, flood, strike), 'Compliance' (investigation, fraud), 'Financial' (bankruptcy, debt), or 'Reputational' (scandal, poor quality)."
    )
    reason_for_sentiment: str = Field(
        ..., 
        description="A brief, one-sentence justification for the sentiment and risk assigned to this company."
    )

class ArticleAnalysis(BaseModel):
    """
    A class to hold the overall structured analysis of a news article for supply chain and procurement intelligence.
    It distinguishes between Tender/Contract news and general Sentiment news.
    """
    mode: Literal["Tender", "Sentiment", "Ignore"] = Field(
        ...,
        description="First, classify the article's primary theme. Is it a 'Tender'/'Contract' announcement, general business 'Sentiment' news, or should it be 'Ignore'd as irrelevant?"
    )
    company_sentiments: Optional[List[CompanySentimentAnalysis]] = Field(
        None,
        description="A list of sentiment analyses for each individual company mentioned in the article. This should be the focus when the mode is 'Sentiment'."
    )
    countries: Optional[List[str]] = Field(
        None, 
        description="List of countries or regions directly impacted or involved."
    )
    commodities: Optional[List[str]] = Field(
        None, 
        description="List of specific commodities or industrial sectors involved (e.g., ['Lithium', 'Semiconductors', 'Renewable Energy'])."
    )
    contract_value: Optional[str] = Field(
        None, 
        description="The total monetary value of the contract or tender. ONLY extract this if the mode is 'Tender'."
    )
    deadline: Optional[str] = Field(
        None,
        description="The deadline for bids or the project end date. ONLY extract this if the mode is 'Tender'."
    )

prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are an expert AI analyst for a global supply chain team. Your task is to meticulously analyze a news article and extract structured data.

        **Your process must be:**
        1.  **Classify the `mode`**: First, determine if the article is about a 'Tender' (contracts, bids, deals), general business 'Sentiment' (earnings, disruptions, partnerships, competition), or 'Ignore' (irrelevant).
        
        2.  **Perform Conditional Extraction based on the `mode`**:
            * **If `mode` is 'Sentiment'**: Your primary goal is to populate the `company_sentiments` list. Identify every company mentioned. For each one, create an object with its name, the sentiment (Positive, Negative, Neutral) towards it in this context, and a concise reason.
            * **If `mode` is 'Tender'**: Your primary goal is to extract `contract_value` and `deadline`. You should also identify the key companies involved in the tender (e.g., the buyer, the winner) and list them in the `company_sentiments` with appropriate sentiment (e.g., Positive for the winner).
        
        3.  **Always Extract General Info**: Regardless of the mode, always try to extract the `countries` and `commodities` involved.
        """
    ),
    ("human", "{article_text}")
])


def get_extraction_chain(model_type: str, model_name: str):
    """
    Creates and returns a LangChain extraction chain with a dynamically specified provider and model.
    """
    model_type = model_type.lower()
    llm = None
    
    if model_type == 'openai':
        llm = ChatOpenAI(model=model_name, temperature=0, api_key=os.getenv("OPENAI_API_KEY"))
    elif model_type == 'groq':
        llm = ChatGroq(model_name=model_name, temperature=0, groq_api_key=os.getenv("GROQ_API_KEY"))
    else:
        raise ValueError(f"Unsupported model type: '{model_type}'. Supported types are 'openai', 'groq'.")
    
    structured_llm = llm.with_structured_output(ArticleAnalysis)
    return prompt | structured_llm

@agent_bp.route('/models', methods=['GET'])
def get_available_models():
    """
    Provides a list of available model providers and models for analysis.
    """
    available_models = {
        "openai": [
            "gpt-4o",
            "gpt-4-turbo",
            "gpt-3.5-turbo"
        ],
        "groq": [
            "llama3-8b-8192",
            "llama3-70b-8192",
            "mixtral-8x7b-32768",
            "gemma-7b-it"
        ]
    }
    return jsonify(available_models)

