from app.ml.predictor import InvestmentPredictor

p = InvestmentPredictor.get_instance()

test_cases = [
    ('Low risk, 1 yr, Emergency', {'age': 30, 'monthly_income': 50000, 'current_savings': 100000, 'planned_investment': 10000, 'investment_duration': 1, 'risk_tolerance': 'Low', 'financial_goal': 'Emergency Fund', 'employment_category': 'Salaried'}),
    ('High risk, 10 yrs, Wealth', {'age': 25, 'monthly_income': 100000, 'current_savings': 500000, 'planned_investment': 40000, 'investment_duration': 10, 'risk_tolerance': 'High', 'financial_goal': 'Wealth Creation', 'employment_category': 'Salaried'}),
    ('Low risk, 15 yrs, Retirement', {'age': 40, 'monthly_income': 80000, 'current_savings': 1000000, 'planned_investment': 20000, 'investment_duration': 15, 'risk_tolerance': 'Low', 'financial_goal': 'Retirement', 'employment_category': 'Salaried'}),
    ('Med risk, 5 yrs, Home', {'age': 32, 'monthly_income': 90000, 'current_savings': 600000, 'planned_investment': 30000, 'investment_duration': 5, 'risk_tolerance': 'Medium', 'financial_goal': 'Home Purchase', 'employment_category': 'Salaried'}),
    ('High risk, 3 yrs, Other', {'age': 22, 'monthly_income': 30000, 'current_savings': 50000, 'planned_investment': 5000, 'investment_duration': 3, 'risk_tolerance': 'High', 'financial_goal': 'Other', 'employment_category': 'Student'}),
    ('Low risk, 7 yrs, Bonds', {'age': 55, 'monthly_income': 120000, 'current_savings': 2000000, 'planned_investment': 50000, 'investment_duration': 7, 'risk_tolerance': 'Low', 'financial_goal': 'Wealth Creation', 'employment_category': 'Retired'}),
    ('Med risk, 20 yrs, NPS', {'age': 35, 'monthly_income': 150000, 'current_savings': 1500000, 'planned_investment': 50000, 'investment_duration': 20, 'risk_tolerance': 'Medium', 'financial_goal': 'Retirement', 'employment_category': 'Business'})
]

for name, data in test_cases:
    res = p.predict(data)
    print(f"{name:32} -> {res['recommended_category']:28} (Conf: {res['confidence_score']}%)")
