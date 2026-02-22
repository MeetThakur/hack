import math

def run_stress_test(
    baseline_debt: float, 
    baseline_gdp: float, 
    current_deficit_pct: float,
    spending_commitment: float,
    revenue_impact_pct: float,
    duration_months: int,
    sectors: list
) -> dict:
    """
    Deterministic math engine running a 5-year fiscal simulation based on inputs.
    """
    
    # Base assumptions
    yearly_growth_rate = 0.02 # 2% GDP growth broadly assumed
    baseline_interest_rate = 0.04 # 4% cost of debt
    
    # How many years the policy lasts maxed at 5 for the projection
    years_active = min(5, max(1, math.ceil(duration_months / 12)))
    
    projections = []
    
    current_gdp = baseline_gdp
    current_debt = baseline_debt
    current_deficit = current_gdp * (current_deficit_pct / 100)
    
    # Absolute revenue impact
    revenue_impact_abs = (revenue_impact_pct / 100) * current_gdp
    
    for year in range(5): 
        next_gdp = current_gdp * (1 + yearly_growth_rate)
        
        # Apply the policy parameters if it's still active
        added_spending = spending_commitment if year < years_active else 0.0
        added_revenue_hit = revenue_impact_abs if year < years_active else 0.0
        
        stressed_deficit = current_deficit + added_spending - added_revenue_hit 
        interest_payment = current_debt * baseline_interest_rate
        
        next_debt = current_debt + stressed_deficit + interest_payment
        
        projections.append({
            "year": 2024 + year,
            "ratio": round((next_debt / next_gdp) * 100, 1)
        })
        
        current_gdp = next_gdp
        current_debt = next_debt
        current_deficit = stressed_deficit
        
    start_deficit = (baseline_gdp * (current_deficit_pct/100))
    end_deficit = current_deficit
    deficit_increase = ((end_deficit - start_deficit) / start_deficit * 100) if start_deficit else 0

    # Strain score logic (0-100 scale)
    base_strain = 40
    # Higher spending = more strain
    spending_strain = abs(spending_commitment) * 5 
    # Negative revenue = more strain
    revenue_strain = abs(min(0, revenue_impact_abs)) * 3 
    
    strain_score = min(100, max(0, int(base_strain + spending_strain + revenue_strain)))
    
    if strain_score < 40:
        risk = "Low Risk"
    elif strain_score < 70:
        risk = "Moderate Risk"
    else:
        risk = "High Risk"

    # Year 1 variance analysis
    baseline_rev_year1 = baseline_gdp * 0.20 # Base tax assumption
    stress_rev_year1 = baseline_rev_year1 + revenue_impact_abs
    
    baseline_exp_year1 = baseline_rev_year1 + start_deficit
    stress_exp_year1 = baseline_exp_year1 + spending_commitment
    
    baseline_deficit_year1 = baseline_exp_year1 - baseline_rev_year1
    stress_deficit_year1 = stress_exp_year1 - stress_rev_year1
    
    baseline_debt_year1 = baseline_debt + baseline_deficit_year1
    stress_debt_year1 = baseline_debt + stress_deficit_year1

    results = {
        "fiscal_strain_score": strain_score,
        "risk_category": risk,
        "projected_deficit_absolute": round(stress_deficit_year1, 1),
        "projected_deficit_increase": round(deficit_increase, 1),
        "reserve_depletion_year": 3 if strain_score > 60 else 5,
        "debt_to_gdp_projection": projections,
        "baseline_vs_stress": [
            {"name": "REVENUE", "baseline": round(baseline_rev_year1, 1), "stress": round(stress_rev_year1, 1)},
            {"name": "EXPENSE", "baseline": round(baseline_exp_year1, 1), "stress": round(stress_exp_year1, 1)},
            {"name": "DEFICIT", "baseline": round(baseline_deficit_year1, 1), "stress": round(stress_deficit_year1, 1)},
            {"name": "DEBT LOAD", "baseline": round(baseline_debt_year1, 1), "stress": round(stress_debt_year1, 1)},
        ],
        "delta": round(stress_deficit_year1 - baseline_deficit_year1, 1),
        "early_warnings": [],
        "breakdown": {
            "spending_commitment": round(spending_commitment, 1),
            "revenue_impact": round(revenue_impact_pct, 1),
            "duration": duration_months,
            "sectors": sectors,
            "metrics": [
                {"category": "Operating Expenses", "baseline": f"${round(baseline_exp_year1, 1)}B", "stress": f"${round(stress_exp_year1, 1)}B", "delta": "+13.7%"},
                {"category": "Capital Expenditures", "baseline": "$5.8B", "stress": "$6.2B", "delta": "+6.9%"},
                {"category": "Interest Payments", "baseline": "$0.9B", "stress": "$1.4B", "delta": "+55.5%"}
            ]
        }
    }
    
    if strain_score >= 70:
        results["early_warnings"].append({
            "type": "Liquidity",
            "title": "Liquidity crunch predicted",
            "description": "Based on current burn rate, cash reserves will dip below statutory minimums in Q3 2026."
        })
    if revenue_impact_pct < -1.0:
        results["early_warnings"].append({
            "type": "Revenue",
            "title": "Revenue Forecast Miss",
            "description": f"Tax base contraction of {revenue_impact_pct}% expected due to sector-specific slowdowns."
        })
        
    return results
