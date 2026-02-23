import os
import uuid
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional

from extractor import extract_policy_data
from simulation import run_stress_test
from advisor import generate_recommendations
from fastapi.responses import Response

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

# Initialize Supabase Client (optional)
supabase = None
try:
    from supabase import create_client
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    if supabase_url and supabase_key:
        supabase = create_client(supabase_url, supabase_key)
        print("Supabase connected.")
except Exception as e:
    print(f"Supabase not available: {e}")

# In-memory store for when Supabase is unavailable
_memory_store: dict = {}  # policy_id -> { "extracted": {...}, "results": {...} }

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
    # 1. Read and parse file content
    contents = await file.read()
    text_content = ""
    try:
        if file.filename.lower().endswith('.pdf'):
            import io
            from pypdf import PdfReader
            pdf = PdfReader(io.BytesIO(contents))
            for page in pdf.pages:
                text_content += page.extract_text() + "\n"
        else:
            text_content = contents.decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error reading file: {e}")
        text_content = contents.decode('utf-8', errors='ignore')

    text_content = text_content[:5000]

    # 2. Extract data via AI
    extracted_data = extract_policy_data(text_content)

    # 3. Persist (Supabase if available, else in-memory)
    policy_id = str(uuid.uuid4())
    if supabase:
        try:
            policy_res = supabase.table("policies").insert({"name": file.filename}).execute()
            if policy_res.data:
                policy_id = policy_res.data[0]["id"]
            supabase.table("structured_inputs").insert({
                "policy_id": policy_id,
                "data": extracted_data
            }).execute()
        except Exception as e:
            print(f"Supabase insert failed, using memory: {e}")
            _memory_store[policy_id] = {"extracted": extracted_data}
    else:
        _memory_store[policy_id] = {"extracted": extracted_data}

    return {
        "message": "Policy analyzed successfully",
        "policy_id": policy_id,
        "extracted_data": extracted_data
    }

@app.post("/run-simulation")
def run_simulation(request: SimulationRequest):
    # 1. Fetch extracted data
    extracted_data = {}
    retrieved = False

    if supabase:
        try:
            res = supabase.table("structured_inputs").select("data").eq("policy_id", request.policy_id).execute()
            if res.data:
                extracted_data = res.data[0]["data"]
                retrieved = True
        except Exception:
            pass

    if not retrieved:
        mem = _memory_store.get(request.policy_id, {})
        extracted_data = mem.get("extracted", {})

    # 2. Run math engine
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

    # 3. Persist results
    if supabase:
        try:
            supabase.table("simulation_results").insert({
                "policy_id": request.policy_id,
                "results": results
            }).execute()
        except Exception as e:
            print(f"Supabase results save failed, using memory: {e}")
            if request.policy_id in _memory_store:
                _memory_store[request.policy_id]["results"] = results
            else:
                _memory_store[request.policy_id] = {"results": results}
    else:
        if request.policy_id in _memory_store:
            _memory_store[request.policy_id]["results"] = results
        else:
            _memory_store[request.policy_id] = {"results": results}

    return results

@app.get("/results/{policy_id}")
def get_results(policy_id: str):
    # Try Supabase first
    if supabase:
        try:
            response = supabase.table("simulation_results").select("results").eq("policy_id", policy_id).execute()
            if response.data:
                return response.data[0]["results"]
        except Exception:
            pass

    # Fallback to in-memory
    mem = _memory_store.get(policy_id, {})
    if "results" in mem:
        return mem["results"]

    # Final fallback: run with defaults so dashboard always loads
    results = run_stress_test(
        baseline_debt=24500.0,
        baseline_gdp=18200.0,
        current_deficit_pct=5.4,
        spending_commitment=4.2,
        revenue_impact_pct=-1.5,
        duration_months=60,
        sectors=["Social Welfare", "Treasury"]
    )
    results["policy_id"] = policy_id
    return results

@app.get("/recommendations/{policy_id}")
def get_recommendations(policy_id: str):
    """Generate AI-powered mitigation recommendations."""
    # Get simulation results first
    results = None
    mem = _memory_store.get(policy_id, {})
    if "results" in mem:
        results = mem["results"]
    
    if not results:
        return []
    
    recs = generate_recommendations(results)
    return recs

@app.get("/export/{policy_id}")
def export_report(policy_id: str):
    """Generate a PDF report of simulation results."""
    from fpdf import FPDF
    import io
    
    mem = _memory_store.get(policy_id, {})
    results = mem.get("results", {})
    extracted = mem.get("extracted", {})
    
    pdf = FPDF()
    pdf.add_page()
    
    # Title
    pdf.set_font('helvetica', 'B', 20)
    pdf.cell(0, 12, 'Fiscal Stress Test Report', new_x='LMARGIN', new_y='NEXT', align='C')
    pdf.ln(4)
    
    pdf.set_font('helvetica', '', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 8, f'Policy ID: {policy_id}', new_x='LMARGIN', new_y='NEXT', align='C')
    pdf.ln(8)
    
    # KPIs
    pdf.set_text_color(0, 0, 0)
    pdf.set_font('helvetica', 'B', 14)
    pdf.cell(0, 10, 'Key Performance Indicators', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(2)
    
    pdf.set_font('helvetica', '', 11)
    score = results.get('fiscal_strain_score', 'N/A')
    risk = results.get('risk_category', 'N/A')
    deficit = results.get('projected_deficit_absolute', 'N/A')
    depletion = results.get('reserve_depletion_year', 'N/A')
    
    pdf.cell(95, 8, f'Fiscal Strain Score: {score}/100', border=1)
    pdf.cell(95, 8, f'Risk Category: {risk}', border=1, new_x='LMARGIN', new_y='NEXT')
    pdf.cell(95, 8, f'Projected Deficit: ${deficit}B', border=1)
    pdf.cell(95, 8, f'Reserve Depletion: Year {depletion}', border=1, new_x='LMARGIN', new_y='NEXT')
    pdf.ln(8)
    
    # Extracted Parameters
    breakdown = results.get('breakdown', {})
    pdf.set_font('helvetica', 'B', 14)
    pdf.cell(0, 10, 'Extracted Policy Parameters', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(2)
    pdf.set_font('helvetica', '', 11)
    pdf.cell(0, 8, f'Spending Commitment: ${breakdown.get("spending_commitment", "N/A")}B per annum', new_x='LMARGIN', new_y='NEXT')
    pdf.cell(0, 8, f'Revenue Impact: {breakdown.get("revenue_impact", "N/A")}%', new_x='LMARGIN', new_y='NEXT')
    pdf.cell(0, 8, f'Duration: {breakdown.get("duration", "N/A")} months', new_x='LMARGIN', new_y='NEXT')
    pdf.cell(0, 8, f'Sectors: {", ".join(breakdown.get("sectors", []))}', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(8)
    
    # Projections
    projections = results.get('debt_to_gdp_projection', [])
    if projections:
        pdf.set_font('helvetica', 'B', 14)
        pdf.cell(0, 10, '5-Year Debt-to-GDP Projection', new_x='LMARGIN', new_y='NEXT')
        pdf.ln(2)
        pdf.set_font('helvetica', 'B', 10)
        pdf.cell(95, 8, 'Year', border=1)
        pdf.cell(95, 8, 'Debt-to-GDP Ratio (%)', border=1, new_x='LMARGIN', new_y='NEXT')
        pdf.set_font('helvetica', '', 10)
        for p in projections:
            pdf.cell(95, 8, str(p.get('year', '')), border=1)
            pdf.cell(95, 8, str(p.get('ratio', '')), border=1, new_x='LMARGIN', new_y='NEXT')
    pdf.ln(8)
    
    # Warnings
    warnings = results.get('early_warnings', [])
    if warnings:
        pdf.set_font('helvetica', 'B', 14)
        pdf.cell(0, 10, 'Early Warning Signals', new_x='LMARGIN', new_y='NEXT')
        pdf.ln(2)
        pdf.set_font('helvetica', '', 11)
        for w in warnings:
            pdf.set_font('helvetica', 'B', 11)
            pdf.cell(0, 8, f'{w.get("title", "")}', new_x='LMARGIN', new_y='NEXT')
            pdf.set_font('helvetica', '', 10)
            pdf.cell(0, 7, f'{w.get("description", "")}', new_x='LMARGIN', new_y='NEXT')
            pdf.ln(2)
    
    buf = io.BytesIO()
    pdf.output(buf)
    buf.seek(0)
    
    return Response(
        content=buf.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=stress_test_{policy_id[:8]}.pdf"}
    )
