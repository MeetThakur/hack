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
    You are an expert fiscal analyst. Your task is to analyze the following document and extract key economic parameters.
    
    STEP 1: Document Validation
    Determine if this text is a policy document, economic proposal, government budget plan, or related to fiscal spending. 
    - Examples of VALID documents: Universal Basic Income proposals, infrastructure spending bills, tax reform plans.
    - Examples of INVALID documents: Personal diaries, recipes, fiction stories, class notes, random code snippets.
    
    If it is INVALID, set "is_policy_document" to false, and set all numeric fields to 0 and arrays to empty.
    If it is VALID, set "is_policy_document" to true, and proceed to Step 2.

    STEP 2: Parameter Extraction
    Extract the following data. If a value is not explicitly stated, you must use the DEFAULT values provided below. DO NOT invent or estimate numbers.
    - spending_commitment: Total cost of the policy in USD Billions.
    - revenue_impact: Impact on revenue as a percentage (e.g., -1.5 for a tax cut, 2.0 for a tax increase).
    - duration_months: How long the policy lasts in months (e.g., 60 for 5 years).
    - primary_sectors: Array of sectors affected (e.g., ["Social Welfare", "Treasury"]).
    
    STEP 3: Macroeconomic Baselines
    If baseline_debt, baseline_gdp, or current_deficit are NOT explicitly written in the text, you MUST return EXACTLY these default values:
    - "baseline_debt": 24500.0
    - "baseline_gdp": 18200.0
    - "current_deficit": 5.4

    STEP 4: Output Format
    Return ONLY valid JSON. Do not write any markdown, explanations, or text outside the JSON block.
    
    Expected JSON Structure:
    {{
        "is_policy_document": boolean,
        "spending_commitment": float,
        "revenue_impact": float,
        "duration_months": integer,
        "primary_sectors": list of strings,
        "baseline_debt": float,
        "baseline_gdp": float,
        "current_deficit": float
    }}

    Document Text:
    {text}
    """
    
    try:
        active_client = get_client()
        response = active_client.chat.completions.create(
          model=model,
          messages=[
            {"role": "user", "content": prompt}
          ],
          response_format={"type": "json_object"},
          extra_body={"reasoning": {"enabled": True}}
        )
        
        content = response.choices[0].message.content
        
        # Clean markdown wrappers if any
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
            
        return json.loads(content.strip())
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error extracting data: {e}")
        return {
            "is_policy_document": False
        }
