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
    """
    A model to hold the sentiment and risk analysis for a single company mentioned in an article.
    """

    company_name: str = Field(
        ...,
        description="The exact name of the company or entity that is being analyzed in this article."
    )

    sentiment: Literal["Positive", "Negative", "Neutral"] = Field(
        ...,
        description=(
            "The overall sentiment towards this specific company in the context of the article: "
            "'Positive' means the news is likely favorable for the company (growth, deal, partnership); "
            "'Negative' means the news harms the company’s reputation, operations, or finances; "
            "'Neutral' means the news is factual or balanced with no clear positive or negative impact."
        )
    )

    risk_type: Optional[
        Literal[
            "Trade Barrier",
            "Supply Disruption",
            "Compliance",
            "Financial",
            "Reputational"
        ]
    ] = Field(
        None,
        description=(
            "If the sentiment is 'Negative', specify the type of risk this news poses: "
            "'Trade Barrier' (tariffs, export bans, sanctions), "
            "'Supply Disruption' (logistics delays, natural disasters, strikes), "
            "'Compliance' (legal investigation, fraud, bribery), "
            "'Financial' (debt crisis, bankruptcy, missed earnings), "
            "or 'Reputational' (public backlash, scandal, poor product quality). "
            "Leave this empty if there is no clear risk type or sentiment is not negative."
        )
    )

    reason_for_sentiment: str = Field(
        ...,
        description=(
            "A short, clear one-sentence explanation that justifies why this sentiment and risk classification "
            "was chosen for this company in the context of the article."
        )
    )

class ArticleAnalysis(BaseModel):
    """
    A class to hold the overall structured analysis of a news article for supply chain and procurement intelligence.
    It distinguishes between Tender/Contract news and general Sentiment news.
    """
    mode: Literal["Tender", "Sentiment", "Ignore"] = Field(
        ...,
        description=(
            "Classify the main focus of the article into one of three categories: "
            "'Tender' for news about procurement contracts, bids, awards, or RFPs; "
            "'Sentiment' for general market news that affects a company’s reputation, stock price, or public perception "
            "(such as earnings, deals, expansions, legal issues); "
            "or 'Ignore' if the article does not provide relevant business or procurement information "
            "and should be skipped from further analysis."
        )    
    )
    company_sentiments: Optional[List[CompanySentimentAnalysis]] = Field(
        None,
        description=(
            "A list of sentiment analyses, one for each company clearly mentioned in the news article. "
            "Include this list **only when the mode is 'Sentiment'**. "
            "If no relevant company is found, leave this empty."
        )
    )

    countries: Optional[List[str]] = Field(
        None,
        description=(
            "A list of countries, regions, or territories that are directly affected, involved, or referenced "
            "in the context of the news article. Extract only if the country is explicitly mentioned "
            "and clearly relevant to the event or topic discussed."
        )
    )

    commodities: Optional[List[str]] = Field(
        None,
        description=(
            "A list of specific commodities, raw materials, or industrial sectors directly related to the news. "
            "Examples: ['Oil', 'Copper', 'Lithium', 'Semiconductors', 'Renewable Energy']. "
            "Extract only if the commodity or sector is clearly mentioned and relevant to the article’s topic."
        )
    )

    contract_value: Optional[str] = Field(
        None,
        description=(
            "The total monetary value of the procurement contract, bid, or tender described in the news article. "
            "This should include the currency and amount if available. "
            "ONLY extract this field if the mode is 'Tender'. If no value is stated, leave this empty."
        )
    )

    deadline: Optional[str] = Field(
        None,
        description=(
            "The official deadline for bid submissions or the expected end date for the contract or project, "
            "as clearly stated in the article. This is only relevant if the mode is 'Tender'. "
            "Use the exact date format provided in the article. If no date is mentioned, leave this empty."
        )
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

