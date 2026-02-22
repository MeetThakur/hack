import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional, Dict, Any

from extractor import extract_policy_data
from simulation import run_stress_test
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional, Dict, Any

# Load environment variables
load_dotenv()

app = FastAPI(title="Policy Stress Testing Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase Client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if supabase_url and supabase_key:
    supabase: Client = create_client(supabase_url, supabase_key)
else:
    supabase = None

class SimulationRequest(BaseModel):
    policy_id: str
    baseline_debt: float = 24500.0
    baseline_gdp: float = 18200.0
    current_deficit: float = 5.4

@app.get("/")
def read_root():
    return {"message": "Policy Stress Testing Engine API is running"}

@app.post("/analyze-policy")
async def analyze_policy(file: UploadFile = File(...)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    # 1. Read file
    contents = await file.read()
    text_content = contents.decode('utf-8')[:5000] # Limit size for prompt
    
    # 2. Extract data via AI
    extracted_data = extract_policy_data(text_content)
    
    # 3. Save to DB
    policy_id = "mock-policy-123" # In real app, uuid logic
    try:
        policy_res = supabase.table("policies").insert({"name": file.filename}).execute()
        if policy_res.data:
            policy_id = policy_res.data[0]["id"]
            
        supabase.table("structured_inputs").insert({
            "policy_id": policy_id,
            "data": extracted_data
        }).execute()
    except Exception as e:
        print(f"Failed to insert data: {e}")
        
    return {
        "message": "Policy analyzed successfully",
        "policy_id": policy_id,
        "extracted_data": extracted_data
    }

@app.post("/run-simulation")
def run_simulation(request: SimulationRequest):
    # Fetch structured inputs
    extracted_data = {}
    if supabase:
        try:
            res = supabase.table("structured_inputs").select("data").eq("policy_id", request.policy_id).execute()
            if res.data:
                extracted_data = res.data[0]["data"]
        except Exception:
            pass
            
    # Run math engine
    results = run_stress_test(
        baseline_debt=request.baseline_debt,
        baseline_gdp=request.baseline_gdp,
        current_deficit_pct=request.current_deficit,
        spending_commitment=extracted_data.get("spending_commitment", 4.2),
        revenue_impact_pct=extracted_data.get("revenue_impact", -1.5),
        duration_months=extracted_data.get("duration_months", 60),
        sectors=extracted_data.get("primary_sectors", ["Social Welfare"])
    )
    results["policy_id"] = request.policy_id
    
    if supabase:
        try:
            supabase.table("simulation_results").insert({
                "policy_id": request.policy_id,
                "results": results
            }).execute()
        except Exception as e:
            print(f"Failed saving results: {e}")
            
    return results

@app.get("/results/{policy_id}")
def get_results(policy_id: str):
    if supabase:
        try:
            response = supabase.table("simulation_results").select("results").eq("policy_id", policy_id).execute()
            if response.data:
                return response.data[0]["results"]
        except Exception:
            pass
            
    # Mock fallback, returning the generic mock if DB fails or doesn't have it
    return {
        "mock_disclaimer": "This is mock data due to missing DB connection",
        "policy_id": policy_id,
        "fiscal_strain_score": 72,
        # ... rest of mock data structure
        "risk_category": "High Risk"
    }
