from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import math

app = FastAPI(title="Smart Finance Advisor - ML Microservice", version="1.0.0")

# Define Data Structures for Input Validation
class RiskAssessmentInput(BaseModel):
    age: int
    experience_years: int
    knowledge_level: str  # Beginner, Intermediate, Advanced
    risk_comfort: str     # Low, Moderate, High
    savings_ratio: float  # current savings / monthly income
    horizon_years: int

class AllocationInput(BaseModel):
    risk_level: str      # CONSERVATIVE, MODERATE, AGGRESSIVE
    age: int
    horizon_years: int
    investment_goal: str  # Wealth Creation, Retirement, Education, House Purchase, Passive Income

class GrowthProjectionInput(BaseModel):
    current_savings: float
    monthly_contribution: float
    years: int
    risk_level: str

class InvestmentItem(BaseModel):
    investmentType: str  # STOCKS, MUTUAL_FUNDS, ETF, BONDS, CRYPTO, REAL_ESTATE, FIXED_DEPOSIT
    amount: float

class ErraticBehaviorInput(BaseModel):
    risk_level: str
    monthly_income: float
    recent_investments: List[InvestmentItem]

# Global Models and Encoders
model = RandomForestClassifier(n_estimators=50, random_state=42)
knowledge_encoder = LabelEncoder()
comfort_encoder = LabelEncoder()
risk_level_encoder = LabelEncoder()

# Fit encoders initially
knowledge_encoder.fit(["Beginner", "Intermediate", "Advanced"])
comfort_encoder.fit(["Low", "Moderate", "High"])
risk_level_encoder.fit(["CONSERVATIVE", "MODERATE", "AGGRESSIVE"])

def generate_synthetic_data_and_train():
    """Generates a synthetic dataset and fits a Random Forest for risk classification."""
    np.random.seed(42)
    n_samples = 1000
    
    # Generate random features
    ages = np.random.randint(18, 70, n_samples)
    experience = np.random.randint(0, 20, n_samples)
    knowledge = np.random.choice(["Beginner", "Intermediate", "Advanced"], n_samples)
    comfort = np.random.choice(["Low", "Moderate", "High"], n_samples)
    savings = np.random.uniform(0.0, 10.0, n_samples)
    horizon = np.random.randint(1, 30, n_samples)
    
    # Generate labels based on a clear heuristic logic
    risk_levels = []
    risk_scores = []
    
    for i in range(n_samples):
        # Calculate a pseudo risk score (0-100)
        score = 0
        
        # Age effect: younger = higher risk tolerance
        if ages[i] < 35:
            score += 25
        elif ages[i] < 50:
            score += 15
        else:
            score += 5
            
        # Experience effect
        score += min(experience[i] * 3, 20)
        
        # Knowledge level
        if knowledge[i] == "Advanced":
            score += 15
        elif knowledge[i] == "Intermediate":
            score += 10
        else:
            score += 5
            
        # Risk comfort
        if comfort[i] == "High":
            score += 25
        elif comfort[i] == "Moderate":
            score += 15
        else:
            score += 5
            
        # Horizon: longer = higher risk tolerance
        if horizon[i] > 10:
            score += 15
        elif horizon[i] > 5:
            score += 10
        else:
            score += 5
            
        # Savings safety net
        if savings[i] > 3.0:
            score += 10
            
        risk_scores.append(score)
        
        # Classify
        if score < 40:
            risk_levels.append("CONSERVATIVE")
        elif score < 65:
            risk_levels.append("MODERATE")
        else:
            risk_levels.append("AGGRESSIVE")
            
    # Prepare DataFrame
    df = pd.DataFrame({
        "age": ages,
        "experience_years": experience,
        "knowledge_level": knowledge_encoder.transform(knowledge),
        "risk_comfort": comfort_encoder.transform(comfort),
        "savings_ratio": savings,
        "horizon_years": horizon,
        "risk_level": risk_level_encoder.transform(risk_levels)
    })
    
    X = df.drop(columns=["risk_level"])
    y = df["risk_level"]
    
    model.fit(X, y)
    print("FastAPI ML model trained successfully.")

@app.on_event("startup")
def startup_event():
    generate_synthetic_data_and_train()

@app.post("/api/v1/ml/predict-risk")
def predict_risk(data: RiskAssessmentInput):
    try:
        # Encode inputs
        k_val = knowledge_encoder.transform([data.knowledge_level])[0]
        c_val = comfort_encoder.transform([data.risk_comfort])[0]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid parameter values: {str(e)}")
        
    features = np.array([[
        data.age,
        data.experience_years,
        k_val,
        c_val,
        data.savings_ratio,
        data.horizon_years
    ]])
    
    # Predict probabilities & class
    pred_class_encoded = model.predict(features)[0]
    pred_class = risk_level_encoder.inverse_transform([pred_class_encoded])[0]
    
    # Heuristic dynamic score calculation to match user inputs
    score = 0
    if data.age < 35: score += 25
    elif data.age < 50: score += 15
    else: score += 5
    score += min(data.experience_years * 3, 20)
    
    k_bonus = {"Beginner": 5, "Intermediate": 10, "Advanced": 15}
    score += k_bonus.get(data.knowledge_level, 5)
    
    c_bonus = {"Low": 5, "Moderate": 15, "High": 25}
    score += c_bonus.get(data.risk_comfort, 5)
    
    if data.horizon_years > 10: score += 15
    elif data.horizon_years > 5: score += 10
    else: score += 5
    
    if data.savings_ratio > 3.0: score += 10
    
    # Bound score between 0 and 100
    score = max(0, min(100, score))
    
    # Re-align class with score for edge cases
    if score < 40:
        pred_class = "CONSERVATIVE"
    elif score < 65:
        pred_class = "MODERATE"
    else:
        pred_class = "AGGRESSIVE"

    # Compute additional scores:
    # Literacy score based on knowledge + experience
    literacy = 30
    if data.knowledge_level == "Intermediate": literacy += 30
    elif data.knowledge_level == "Advanced": literacy += 50
    literacy += min(data.experience_years * 4, 20)
    literacy = min(100, literacy)
    
    # Stability score based on savings ratio and age
    stability = min(100, int(data.savings_ratio * 15) + 30)
    if data.experience_years > 3: stability += 10
    stability = min(100, stability)
    
    return {
        "risk_score": score,
        "risk_level": pred_class,
        "literacy_score": literacy,
        "stability_score": stability
    }

@app.post("/api/v1/ml/suggest-allocation")
def suggest_allocation(data: AllocationInput):
    # Static mappings for suggestions framed as models
    # Conservative: 60% Mutual Funds / 20% Bonds / 20% Fixed Deposits
    # Moderate: 50% Stocks / 30% Mutual Funds / 20% Bonds
    # Aggressive: 70% Stocks / 20% ETFs / 10% High-Risk Assets
    
    # Adjust based on Age and Goal
    allocations = {}
    
    if data.risk_level == "CONSERVATIVE":
        allocations = {
            "MUTUAL_FUNDS": 50.0,
            "BONDS": 30.0,
            "FIXED_DEPOSIT": 20.0
        }
        explanation = "A conservative allocation prioritizes wealth preservation. With a major focus on fixed deposits and high-grade debt instruments (bonds), this portfolio cushions against market volatility while yielding steady, predictable returns."
    elif data.risk_level == "AGGRESSIVE":
        allocations = {
            "STOCKS": 60.0,
            "ETF": 20.0,
            "MUTUAL_FUNDS": 10.0,
            "CRYPTO": 10.0
        }
        explanation = "An aggressive portfolio is built for long-term growth. Capital is heavily oriented towards public equities and high-risk assets like cryptocurrency. This accepts higher short-term fluctuations to outpace inflation and compound wealth aggressively over long horizons."
    else: # MODERATE
        allocations = {
            "STOCKS": 40.0,
            "MUTUAL_FUNDS": 35.0,
            "BONDS": 20.0,
            "ETF": 5.0
        }
        explanation = "A moderate allocation targets a balanced compromise. By blending equity markets (stocks & mutual funds) with bonds, it harvests equity premiums while remaining anchored by fixed-income cushions during stock market downturns."
        
    # Apply minor adjustments based on age
    if data.age > 50 and "STOCKS" in allocations:
        # Reduce stocks slightly for older age, transfer to bonds
        stock_reduction = min(allocations["STOCKS"], 15.0)
        allocations["STOCKS"] -= stock_reduction
        allocations["BONDS"] = allocations.get("BONDS", 0.0) + stock_reduction
        explanation += " Note: Your stock allocation has been adjusted downward slightly based on typical age-related retirement timelines."
        
    return {
        "allocation": allocations,
        "explanation": explanation,
        "risk_level": data.risk_level
    }

@app.post("/api/v1/ml/predict-growth")
def predict_growth(data: GrowthProjectionInput):
    # Set CAGR based on risk level
    rates = {
        "CONSERVATIVE": {"expected": 0.07, "conservative": 0.05, "optimistic": 0.09},
        "MODERATE": {"expected": 0.10, "conservative": 0.07, "optimistic": 0.13},
        "AGGRESSIVE": {"expected": 0.14, "conservative": 0.09, "optimistic": 0.18}
    }
    
    rate = rates.get(data.risk_level, rates["MODERATE"])
    
    projections = []
    
    current_expected = data.current_savings
    current_con = data.current_savings
    current_opt = data.current_savings
    
    annual_contrib = data.monthly_contribution * 12
    
    # Calculate yearly values
    for year in range(1, data.years + 1):
        # Compound formula: end_val = start_val * (1+r) + contribution * (((1+r)^t - 1)/r) for each year
        current_expected = current_expected * (1 + rate["expected"]) + annual_contrib
        current_con = current_con * (1 + rate["conservative"]) + annual_contrib
        current_opt = current_opt * (1 + rate["optimistic"]) + annual_contrib
        
        projections.append({
            "year": year,
            "expected": round(current_expected, 2),
            "conservative": round(current_con, 2),
            "optimistic": round(current_opt, 2),
            "contributions": round(data.current_savings + (annual_contrib * year), 2)
        })
        
    return {
        "projections": projections,
        "annual_return_assumptions": {
            "expected_cagr": rate["expected"],
            "conservative_cagr": rate["conservative"],
            "optimistic_cagr": rate["optimistic"]
        }
    }

@app.post("/api/v1/ml/detect-erratic-behavior")
def detect_erratic_behavior(data: ErraticBehaviorInput):
    warnings = []
    is_erratic = False
    
    total_monthly_investment = sum(item.amount for item in data.recent_investments)
    
    # Rule 1: High crypto allocation for Conservative profiles
    crypto_investment = sum(item.amount for item in data.recent_investments if item.investmentType == "CRYPTO")
    crypto_ratio = crypto_investment / total_monthly_investment if total_monthly_investment > 0 else 0
    
    if data.risk_level == "CONSERVATIVE" and crypto_ratio > 0.05:
        warnings.append(f"High risk concentration: You have a Conservative profile, but {crypto_ratio * 100:.1f}% of your investments are in Cryptocurrency, which is highly volatile.")
        is_erratic = True
        
    # Rule 2: Investing more than income
    if total_monthly_investment > data.monthly_income:
        warnings.append(f"Leverage Risk: Your total monthly investments (₹{total_monthly_investment:,.2f}) exceed your monthly income (₹{data.monthly_income:,.2f}). This may indicate unsustainable debt leverage.")
        is_erratic = True
        
    # Rule 3: Single asset class concentration
    for item in data.recent_investments:
        ratio = item.amount / total_monthly_investment if total_monthly_investment > 0 else 0
        if ratio > 0.8 and total_monthly_investment > 5000:
            warnings.append(f"Diversification warning: {ratio * 100:.1f}% of your investment capital is concentrated in {item.investmentType}. Consider diversifying across other categories to reduce risk.")
            is_erratic = True

    return {
        "is_erratic": is_erratic,
        "warnings": warnings
    }

@app.post("/api/v1/ml/similarity-suggestions")
def similarity_suggestions(user_profile: Dict[str, Any]):
    # Matches the user against archetype templates and suggests portfolio tweaks
    category = user_profile.get("risk_level", "MODERATE")
    
    archetypes = {
        "CONSERVATIVE": [
            "Consider holding a sovereign gold bond (SGB) to hedge inflation.",
            "Assess high-yield fixed deposits with verified AA+ credit ratings."
        ],
        "MODERATE": [
            "Integrate a multi-asset allocation fund to capture commodity cycles.",
            "Examine large-cap equity index ETFs for low-cost market access."
        ],
        "AGGRESSIVE": [
            "Review dynamic small-cap mutual fund SIPs for compounding returns.",
            "Explore global index funds (e.g., Nasdaq 100) to diversify currency risk."
        ]
    }
    
    suggestions = archetypes.get(category, archetypes["MODERATE"])
    return {
        "personalized_suggestions": suggestions
    }
