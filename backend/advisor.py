import os
import json
from extractor import get_client

def generate_recommendations(simulation_results: dict) -> list:
    """
    Uses AI to generate actionable mitigation recommendations
    based on the simulation results.
    """
    model = os.environ.get("OPENROUTER_MODEL", "openai/gpt-oss-120b:free")

    prompt = f"""
    You are a senior fiscal policy advisor. Based on these stress test results, provide exactly 3 actionable recommendations to mitigate fiscal risk.

    Simulation Results:
    - Fiscal Strain Score: {simulation_results.get('fiscal_strain_score', 'N/A')}/100
    - Risk Category: {simulation_results.get('risk_category', 'N/A')}
    - Projected Deficit: ${simulation_results.get('projected_deficit_absolute', 'N/A')}B
    - Reserve Depletion: Year {simulation_results.get('reserve_depletion_year', 'N/A')}
    - Spending Commitment: ${simulation_results.get('breakdown', {}).get('spending_commitment', 'N/A')}B
    - Revenue Impact: {simulation_results.get('breakdown', {}).get('revenue_impact', 'N/A')}%
    - Duration: {simulation_results.get('breakdown', {}).get('duration', 'N/A')} months

    Return JSON array only. Each item must have:
    - "title": short recommendation title (max 8 words)
    - "description": 1-2 sentence explanation
    - "impact": either "high", "medium", or "low"
    - "metric": what metric this improves (e.g. "strain_score", "deficit", "revenue")

    Return ONLY valid JSON array, no markdown.
    """

    try:
        active_client = get_client()
        response = active_client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        parsed = json.loads(content)
        # Handle both {recommendations: [...]} and direct [...]
        if isinstance(parsed, dict):
            return parsed.get("recommendations", list(parsed.values())[0] if parsed else [])
        return parsed
    except Exception as e:
        print(f"AI recommendation failed: {e}")
        # Deterministic fallback based on actual results
        recs = []
        score = simulation_results.get('fiscal_strain_score', 50)
        spending = simulation_results.get('breakdown', {}).get('spending_commitment', 0)
        revenue = simulation_results.get('breakdown', {}).get('revenue_impact', 0)

        if score > 70:
            recs.append({
                "title": "Implement phased spending rollout",
                "description": f"Current spending of ${spending}B creates critical strain. Distributing over 3 phases would reduce peak fiscal load by ~35%.",
                "impact": "high",
                "metric": "strain_score"
            })
        if revenue < -1:
            recs.append({
                "title": "Offset revenue decline with broadened tax base",
                "description": f"The {revenue}% revenue contraction can be partially offset by expanding the tax base to adjacent sectors.",
                "impact": "medium",
                "metric": "revenue"
            })
        recs.append({
            "title": "Establish fiscal circuit breakers",
            "description": "Automatic spending freezes triggered at predefined debt-to-GDP thresholds would prevent runaway deficits.",
            "impact": "high",
            "metric": "deficit"
        })
        return recs[:3]
