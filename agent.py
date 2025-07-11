import os
from typing import List, Literal, Optional

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field


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
The Ministry of Energy and Infrastructure, represented by the Sheikh Zayed Housing Programme, announced the launch of an initiative to ensure the financing of housing support decisions for citizens benefiting from housing loans, with a particular focus on senior citizens.
As part of the Year of Community initiatives and with the aim of providing comprehensive insurance coverage, the initiative aims to provide life insurance coverage that fully secures the value of the housing loan. It addresses previous challenges faced by this group, where the maximum loan coverage age was limited to 70 years, leading to the rejection of some financing applications.
The insurance coverage has been designed to be unified, fair, and offered at a low cost, ensuring that all eligible citizens benefit from current and future housing loans. The insurance covers cases of death or total permanent disability, whether due to an accident or other causes, with extended coverage up to the age of 95, providing long-term financial protection for Emirati families.
The Ministry indicated that the initiative is being implemented in collaboration with the Central Bank of the UAE, financing partners, and Takaful service providers, along with a wide range of national insurance companies, including Sukoon Takaful, and Abu Dhabi National Insurance Company (ADNIC).
Suhail Mohamed Al Mazrouei, Minister of Energy and Infrastructure, affirmed that the initiative aligns with the leadership's directives to enhance the stability of Emirati families and ensure a decent life for all segments of society.
He said, "Our wise leadership places the comfort and happiness of citizens at the forefront of its priorities. This initiative reflects the UAE's firm commitment to providing adequate housing as a cornerstone of comprehensive development. It represents a significant step in supporting senior citizens, as it is designed to address the challenges related to housing finance for this group, thereby improving their quality of life and contributing to family stability."
Al Mazrouei added that collaboration with the banking sector and national insurance companies reflects the UAE's strategic vision of building sustainable partnerships that support social and economic development. He praised the ongoing efforts to develop the housing system in the UAE into a global model.
Mohamed Al Mansouri, Director-General of Sheikh Zayed Housing Programme, affirmed that the initiative embodies the leadership's forward-looking vision to empower Emirati families and strengthen their social stability.
He explained that through this initiative, the program aims to provide flexible financing solutions that meet the needs of senior citizens, while ensuring comprehensive insurance coverage to protect them from financial risks.
Al Mansouri pointed out that raising the maximum loan coverage age to 95 years marks a qualitative shift in housing policy, as it opens broader opportunities to benefit from housing support, enhancing social equity and reducing rejection rates caused by insurance or financing constraints.
In line with the initiative, the Central Bank of the UAE has issued a new regulatory notice allowing banks and financing companies to adopt more flexible financing models. The notice also permits financing for citizens with existing mortgages, provided that the new property serves as their primary and actual place of residence.
Citizens benefiting from the national loan programme are included after verifying their repayment capability, which enhances the inclusiveness of the initiative and ensures fairness in the distribution of housing support.
This initiative is part of a series of achievements by the Sheikh Zayed Housing Programme, reflecting the UAE's commitment to enhancing the quality of life for its citizens. In recent years, the programme has undergone strategic developments that accelerated the housing support process, improved customer satisfaction, and expanded partnerships with the banking and financial sectors.
In support of the initiative to provide housing for senior citizens and special insurance protection for housing loans, the Ministry of Energy and Infrastructure, represented by the Sheikh Zayed Housing Programme, and Takaful service providers signed a partnership agreement with both Abu Dhabi National Insurance Company (ADNIC) a
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