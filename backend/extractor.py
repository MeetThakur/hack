import os
import json
from openai import OpenAI

# OpenAI client will be initialized inside the function to wait for dotenv
client = None

def get_client():
    global client
    if client is None:
        client = OpenAI(
          base_url="https://openrouter.ai/api/v1",
          api_key=os.environ.get("OPENROUTER_API_KEY"),
        )
    return client

def extract_policy_data(text: str) -> dict:
    """
    Extracts key fiscal parameters AND economic assumptions from a raw
    policy document text using the specified LLM.
    """
    model = os.environ.get("OPENROUTER_MODEL", "arcee-ai/trinity-large-preview:free")
    prompt = f"""
    You are an expert fiscal analyst. Extract the following from the policy document text.
    Return JSON format only, matching this exact structure:
    {{
        "spending_commitment": float (in USD Billions, positive number),
        "revenue_impact": float (Percentage points, negative for contraction, positive for expansion),
        "duration_months": integer,
        "primary_sectors": list of strings,
        "baseline_debt": float (total national/government debt in USD Billions, estimate if not explicit),
        "baseline_gdp": float (GDP in USD Billions, estimate if not explicit),
        "current_deficit": float (current deficit as percentage of GDP, estimate if not explicit)
    }}

    If baseline_debt, baseline_gdp, or current_deficit are not explicitly stated in the document,
    you MUST return exactly these default values (do not estimate):
    "baseline_debt": 24500.0,
    "baseline_gdp": 18200.0,
    "current_deficit": 5.4

    Text:
    {text}
    """
    
    try:
        active_client = get_client()
        response = active_client.chat.completions.create(
          model=model,
          messages=[
            {"role": "user", "content": prompt}
          ],
          response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Error extracting data: {e}")
        return {
            "spending_commitment": 4.2,
            "revenue_impact": -1.5,
            "duration_months": 60,
            "primary_sectors": ["Social Welfare", "Treasury"],
            "baseline_debt": 24500.0,
            "baseline_gdp": 18200.0,
            "current_deficit": 5.4
        }
