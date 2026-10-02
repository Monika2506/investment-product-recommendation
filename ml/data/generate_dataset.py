"""
Synthetic Investment Dataset Generator
Generates an illustrative, realistic dataset of investor profiles mapped to 
suitable investment products based on sound financial risk-duration-goal principles.
"""

import os
import random
import numpy as np
import pandas as pd

def generate_investment_dataset(num_samples=3500, random_state=42):
    random.seed(random_state)
    np.random.seed(random_state)

    goals = ['Emergency Fund', 'Education', 'Retirement', 'Wealth Creation', 'Home Purchase', 'Other']
    risk_tolerances = ['Low', 'Medium', 'High']
    employment_categories = ['Salaried', 'Self-Employed', 'Business Owner', 'Student / Freelancer', 'Retired']

    data = []

    for _ in range(num_samples):
        age = int(np.random.choice([
            np.random.randint(18, 28),  # young adult
            np.random.randint(28, 48),  # mid-career
            np.random.randint(48, 60),  # pre-retirement
            np.random.randint(60, 75)   # senior/retiree
        ], p=[0.25, 0.45, 0.20, 0.10]))

        # Income logic
        if age < 25:
            monthly_income = int(np.random.exponential(scale=35000) + 20000)
            employment = random.choice(['Salaried', 'Student / Freelancer'])
        elif age < 48:
            monthly_income = int(np.random.exponential(scale=75000) + 38000)
            employment = random.choice(['Salaried', 'Self-Employed', 'Business Owner'])
        elif age < 60:
            monthly_income = int(np.random.exponential(scale=95000) + 55000)
            employment = random.choice(['Salaried', 'Business Owner', 'Self-Employed'])
        else:
            monthly_income = int(np.random.exponential(scale=45000) + 28000)
            employment = 'Retired'

        monthly_income = min(monthly_income, 650000)
        savings_multiplier = max(1, (age - 18) * 0.45)
        current_savings = int(monthly_income * random.uniform(2, 10) * (savings_multiplier / 5))
        current_savings = max(10000, min(current_savings, 15000000))

        planned_investment = int(min(current_savings * random.uniform(0.1, 0.5), monthly_income * random.uniform(0.5, 4)))
        planned_investment = max(2000, planned_investment)

        # Duration
        duration = int(np.random.choice([
            random.randint(1, 2),   # short term
            random.randint(3, 5),   # medium term
            random.randint(6, 11),  # long term
            random.randint(12, 25)  # ultra long term
        ], p=[0.20, 0.32, 0.28, 0.20]))

        # Financial Goal
        goal = random.choice(goals)

        # Risk tolerance
        if age > 60 or goal == 'Emergency Fund':
            risk_tolerance = np.random.choice(risk_tolerances, p=[0.70, 0.25, 0.05])
        elif age < 32 and duration >= 5:
            risk_tolerance = np.random.choice(risk_tolerances, p=[0.20, 0.40, 0.40])
        else:
            risk_tolerance = np.random.choice(risk_tolerances, p=[0.35, 0.40, 0.25])

        # Sound financial planning allocation logic across all 7 asset classes:
        if goal == 'Emergency Fund' or duration <= 2:
            assigned = 'Fixed Deposit (FD)'
        elif goal == 'Retirement' and duration >= 5:
            assigned = 'National Pension System (NPS)' if random.random() < 0.65 else random.choice(['Public Provident Fund (PPF)', 'Mutual Funds', 'Gold'])
        elif goal in ['Home Purchase', 'Education'] and 3 <= duration <= 8 and risk_tolerance in ['Low', 'Medium']:
            assigned = 'Gold' if random.random() < 0.60 else random.choice(['Bonds', 'Mutual Funds', 'Public Provident Fund (PPF)'])
        elif risk_tolerance == 'High':
            if duration >= 4:
                assigned = 'Stocks' if random.random() < 0.80 else 'Mutual Funds'
            else:
                assigned = 'Mutual Funds'
        elif risk_tolerance == 'Low':
            if duration >= 10:
                assigned = 'Public Provident Fund (PPF)'
            elif duration >= 4:
                assigned = 'Bonds' if random.random() < 0.70 else 'Gold'
            else:
                assigned = 'Fixed Deposit (FD)'
        else: # Medium Risk
            if duration >= 5:
                assigned = 'Mutual Funds' if random.random() < 0.55 else random.choice(['Gold', 'Bonds', 'National Pension System (NPS)'])
            else:
                assigned = 'Bonds' if random.random() < 0.50 else random.choice(['Gold', 'Mutual Funds'])

        # 5% realistic noise
        if random.random() < 0.05:
            assigned = random.choice([
                'Fixed Deposit (FD)', 'Mutual Funds', 'Stocks', 
                'Gold', 'Public Provident Fund (PPF)', 'Bonds', 'National Pension System (NPS)'
            ])

        data.append({
            'age': age,
            'monthly_income': monthly_income,
            'current_savings': current_savings,
            'planned_investment': planned_investment,
            'investment_duration': duration,
            'risk_tolerance': risk_tolerance,
            'financial_goal': goal,
            'employment_category': employment,
            'recommended_category': assigned
        })

    df = pd.DataFrame(data)
    return df

if __name__ == '__main__':
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, 'synthetic_investment_data.csv')
    df = generate_investment_dataset(num_samples=3500)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} records saved to: {output_path}")
    print("\nClass distribution:")
    print(df['recommended_category'].value_counts())
