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
          api_key=os.environ.get("OPENAI_API_KEY"),
        )
    return client

def extract_policy_data(text: str) -> dict:
    """
    Extracts key fiscal parameters from a raw policy document text
    using the specified LLM.
    """
    model = os.environ.get("OPENROUTER_MODEL", "openai/gpt-oss-120b:free")
    prompt = f"""
    You are an expert fiscal analyst. Extract the following from the policy document text.
    Return JSON format only, matching this exact structure:
    {{
        "spending_commitment": float (in USD Billions, positive number),
        "revenue_impact": float (Percentage points, negative for contraction, positive for expansion),
        "duration_months": integer,
        "primary_sectors": list of strings
    }}

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
        # Return fallback mock if AI extraction fails
        return {
            "spending_commitment": 4.2,
            "revenue_impact": -1.5,
            "duration_months": 60,
            "primary_sectors": ["Social Welfare", "Treasury"]
        }
