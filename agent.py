import os
from typing import List, Literal, Optional

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field

# --- 1. Define the NESTED Structured Data Schema using Pydantic ---


class CompanySentimentAnalysis(BaseModel):
    """A model to hold the sentiment and risk analysis for a single company mentioned in an article."""
    company_name: str = Field(..., description="The specific name of the company being analyzed.")
    sentiment: Literal["Positive", "Negative", "Neutral"] = Field(
        ...,
        description="The sentiment towards this specific company based on the article's context."
    )
    # ADDED a risk_type field for more granular analysis
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
    # This is now a list of the nested model above
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
    
# --- 2. Set up the Language Model and the Extraction Chain ---

llm = ChatOpenAI(model="gpt-4o", temperature=0)
# Bind the Pydantic model to the LLM to enforce structured output
structured_llm = llm.with_structured_output(ArticleAnalysis)

# --- 3. Create the Enhanced Prompt ---

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

extraction_chain = prompt | structured_llm

# --- 4. Define Diverse Example Articles and Run the Extraction ---

# Example 3: Single-company sentiment (negative disruption)
sentiment_article_disruption = """
3 open tenders: $500M metro in Egypt, $200M oil storage in UAE, $150M data center in KSA — all closing by July 31.
"""

# print("--- Analyzing Tender Article ---")
# result_1 = extraction_chain.invoke({"article_text": tender_article})
# print(result_1.json(indent=2))

# print("\n\n--- Analyzing Multi-Company Sentiment Article ---")
# result_2 = extraction_chain.invoke({"article_text": sentiment_article_competition})
# print(result_2.json(indent=2))

print("\n\n--- Analyzing Single-Company Disruption Article ---")
result_3 = extraction_chain.invoke({"article_text": sentiment_article_disruption})
print(result_3.json(indent=2))