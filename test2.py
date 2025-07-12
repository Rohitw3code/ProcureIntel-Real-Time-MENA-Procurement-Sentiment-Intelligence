import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from CustomSupabaseVectorStore.CompanyNameVectorStore import CompanyNameVectorStore
from database import DB_CONNECTION_STRING


llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo")

prompt_template = """
You are an expert in entity recognition. Your task is to determine if two entities mentioned in the user's question refer to the same thing.

Analyze the following question:
"{question}"

Based on your knowledge, do "Philippine Atomic Energy Regulatory Authority" and "PhilATOM" refer to the same organization?

Respond with only a single character:
- '1' if they are the same.
- '0' if they are not the same or if you cannot determine it from the question.
"""

prompt = ChatPromptTemplate.from_template(prompt_template)
output_parser = StrOutputParser()

chain = (
    {"question": RunnablePassthrough()}
    | prompt
    | llm
    | output_parser
)

def check_entities_with_ai(user_question: str) -> int:
    print(f"\n-> Analyzing question: \"{user_question}\"")
    try:
        # 'invoke' runs the chain with the given input
        response = chain.invoke(user_question)
        print(f"   LLM Raw Output: '{response}'")
        # Safely convert the response to an integer
        return int(response.strip())
    except Exception as e:
        print(f"An error occurred: {e}")
        return 0

