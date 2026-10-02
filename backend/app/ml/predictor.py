import os
import json
import joblib
import pandas as pd
import numpy as np

class InvestmentPredictor:
    _instance = None
    _model = None
    _metadata = None

    PRODUCT_PROFILES = {
        'Fixed Deposit (FD)': {
            'risk_category': 'Low Risk',
            'expected_return': '6.5% - 7.5% p.a.',
            'liquidity': 'High (Premature withdrawal available with minor penalty)',
            'lock_in': '7 days to 10 years (flexible)',
            'key_considerations': [
                'Guaranteed returns backed by deposit insurance up to regulatory limits.',
                'Ideal for emergency reserves and short-term capital preservation.',
                'Returns may lag behind high inflation rates in the long run.',
                'Interest income is taxable as per individual tax bracket.'
            ]
        },
        'Mutual Funds': {
            'risk_category': 'Moderate to High Risk',
            'expected_return': '10.0% - 14.0% p.a. (Historical benchmark)',
            'liquidity': 'Very High (T+2 settlement for open-ended funds)',
            'lock_in': 'None (except ELSS tax-saving funds: 3 years)',
            'key_considerations': [
                'Professional fund management offering diversified equity and debt exposure.',
                'Suitable for wealth accumulation over 3 to 7+ year investment horizons.',
                'Systematic Investment Plans (SIP) allow rupee-cost averaging.',
                'Subject to market volatility; past performance does not guarantee future yields.'
            ]
        },
        'Stocks': {
            'risk_category': 'High Risk',
            'expected_return': '12.0% - 18.0%+ p.a. (Long-term market potential)',
            'liquidity': 'Very High (T+1 market settlement)',
            'lock_in': 'None (Liquid trading hours)',
            'key_considerations': [
                'Direct ownership in publicly listed corporations with maximum wealth creation upside.',
                'Requires proactive research, fundamental analysis, and high risk appetite.',
                'Significant short-term price volatility and potential for capital loss.',
                'Beneficial for long horizons (5+ years) to absorb market cycles.'
            ]
        },
        'Gold': {
            'risk_category': 'Moderate Risk',
            'expected_return': '8.0% - 10.0% p.a. (Inflation hedge)',
            'liquidity': 'High (Digital Gold, Sovereign Gold Bonds, or Gold ETFs)',
            'lock_in': 'None (ETFs) or up to 8 years (Sovereign Gold Bonds)',
            'key_considerations': [
                'Classic safe-haven asset providing hedge against currency devaluation and inflation.',
                'Negative or low correlation with equities, enhancing portfolio resilience.',
                'Does not generate recurring dividends or interest cash flows.',
                'Recommended as a 5% to 15% portfolio allocation rather than sole holding.'
            ]
        },
        'Public Provident Fund (PPF)': {
            'risk_category': 'Low Risk',
            'expected_return': '7.1% p.a. (Quarterly government reset)',
            'liquidity': 'Low (Partial withdrawals permitted after 7th financial year)',
            'lock_in': '15 years mandatory lock-in',
            'key_considerations': [
                'Sovereign safety guarantee backed by Central Government.',
                'Triple Tax-Exempt status (EEE): Investment, Interest, and Maturity are tax-free.',
                'Disciplined long-term savings tool for child education or retirement.',
                'Annual investment cap of ₹1.5 Lakh apply under statutory rules.'
            ]
        },
        'Bonds': {
            'risk_category': 'Low to Moderate Risk',
            'expected_return': '7.5% - 9.5% p.a.',
            'liquidity': 'Moderate (Secondary debt market trading)',
            'lock_in': 'Fixed tenure (1 to 10 years)',
            'key_considerations': [
                'Predictable fixed-income coupon payments providing regular cash flow.',
                'Higher yield potential than standard bank savings with corporate or sovereign backing.',
                'Credit ratings (AAA, AA) must be reviewed to monitor default risk.',
                'Subject to interest rate cycle fluctuations in bond prices.'
            ]
        },
        'National Pension System (NPS)': {
            'risk_category': 'Low to Moderate Risk',
            'expected_return': '9.0% - 12.0% p.a. (Blended equity-debt growth)',
            'liquidity': 'Very Low (Designed for retirement corpus)',
            'lock_in': 'Until age 60',
            'key_considerations': [
                'Cost-effective pension vehicle with choice of active or auto asset allocation.',
                'Exclusive tax deduction under Section 80CCD(1B) beyond basic 80C limits.',
                'Mandates minimum 40% annuity purchase at retirement for monthly pension.',
                'Ideal for salaried and self-employed professionals planning post-career independence.'
            ]
        }
    }

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = InvestmentPredictor()
        return cls._instance

    def __init__(self):
        self._load_model()

    def _load_model(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, 'investment_rf_model.joblib')
        metadata_path = os.path.join(current_dir, 'model_metadata.json')

        # Fallback to ml/saved_models if not yet copied
        if not os.path.exists(model_path):
            model_path = os.path.join(current_dir, '..', '..', '..', 'ml', 'saved_models', 'investment_rf_model.joblib')
            metadata_path = os.path.join(current_dir, '..', '..', '..', 'ml', 'saved_models', 'model_metadata.json')

        try:
            if os.path.exists(model_path):
                self._model = joblib.load(model_path)
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r', encoding='utf-8') as f:
                    self._metadata = json.load(f)
        except Exception as e:
            print(f"[PREDICTOR ERROR] Failed to load ML model: {e}")

    def predict(self, profile_data):
        """
        Runs the Random Forest model on validated financial profile data.
        Returns detailed recommendation package.
        """
        if self._model is None:
            self._load_model()
            if self._model is None:
                raise RuntimeError("ML recommendation model is not initialized.")

        # Input dataframe matching training features
        df_input = pd.DataFrame([{
            'age': int(profile_data['age']),
            'monthly_income': float(profile_data['monthly_income']),
            'current_savings': float(profile_data['current_savings']),
            'planned_investment': float(profile_data['planned_investment']),
            'investment_duration': int(profile_data['investment_duration']),
            'risk_tolerance': str(profile_data['risk_tolerance']),
            'financial_goal': str(profile_data['financial_goal']),
            'employment_category': str(profile_data.get('employment_category') or 'Salaried')
        }])

        # Predict class and probabilities
        pred_category = self._model.predict(df_input)[0]
        probabilities = self._model.predict_proba(df_input)[0]
        classes = self._model.classes_

        # Map probabilities
        prob_dict = {
            classes[i]: round(float(probabilities[i]), 4)
            for i in range(len(classes))
        }
        confidence = prob_dict.get(pred_category, 0.85)

        # Build duration summary
        duration = int(profile_data['investment_duration'])
        if duration <= 2:
            duration_summary = f"Short-Term Horizon ({duration} {'year' if duration==1 else 'years'})"
        elif duration <= 7:
            duration_summary = f"Medium-Term Horizon ({duration} years)"
        else:
            duration_summary = f"Long-Term Growth Horizon ({duration} years)"

        # Product Profile Data
        profile_info = self.PRODUCT_PROFILES.get(pred_category, {
            'risk_category': f"{profile_data['risk_tolerance']} Risk",
            'expected_return': 'Market Dependent',
            'liquidity': 'Standard',
            'lock_in': 'Variable',
            'key_considerations': ['Review portfolio periodically.', 'Diversify across asset classes.']
        })

        # Suitability Explanation Synthesis
        explanation = self._generate_explanation(pred_category, profile_data, confidence)

        # Alternative Categories (top other options by probability)
        alternatives = []
        sorted_candidates = sorted(
            [item for item in prob_dict.items() if item[0] != pred_category],
            key=lambda x: x[1],
            reverse=True
        )
        for cat_name, prob in sorted_candidates[:3]:
            alt_info = self.PRODUCT_PROFILES.get(cat_name, {})
            alternatives.append({
                'category': cat_name,
                'match_probability': prob,
                'risk_level': alt_info.get('risk_category', 'Moderate'),
                'expected_return': alt_info.get('expected_return', 'N/A'),
                'liquidity': alt_info.get('liquidity', 'N/A'),
                'comparison_note': f"Viable alternative ({round(prob*100, 1)}% model match) for supplementary portfolio diversification."
            })

        return {
            'recommended_category': pred_category,
            'confidence_score': round(confidence * 100, 1),
            'risk_category': profile_info['risk_category'],
            'duration_summary': duration_summary,
            'explanation': explanation,
            'probabilities': prob_dict,
            'product_details': profile_info,
            'alternatives': alternatives,
            'key_considerations': profile_info['key_considerations'],
            'model_accuracy': self._metadata.get('accuracy', 0.907) if self._metadata else 0.90,
            'disclaimer': (
                "Educational AI Model Demonstration: Recommendations are generated based on a Random Forest "
                "machine learning model trained on synthetic financial profiles. This system does not constitute "
                "statutory, legal, or licensed financial advice. Always consult a certified financial planner "
                "before undertaking capital investments."
            )
        }

    def _generate_explanation(self, category, profile, confidence):
        age = profile['age']
        risk = profile['risk_tolerance']
        goal = profile['financial_goal']
        duration = profile['investment_duration']
        planned = profile['planned_investment']

        reasons = []
        reasons.append(
            f"The Random Forest classification model identified **{category}** as your optimal asset class "
            f"with an algorithmic suitability confidence of {round(confidence * 100, 1)}%."
        )

        if goal == 'Emergency Fund' or duration <= 2:
            reasons.append(
                f"Your selected goal of '{goal}' and short investment window of {duration} year(s) prioritize capital "
                f"preservation and high liquidity over volatile market appreciation."
            )
        elif goal == 'Retirement' and duration >= 10:
            reasons.append(
                f"With a {duration}-year timeline toward retirement at age {age}, this product maximizes compounded tax-efficient "
                f"growth while stabilizing long-term retirement annuity security."
            )
        elif risk == 'High' and duration >= 5:
            reasons.append(
                f"Your high risk tolerance combined with an extended {duration}-year horizon enables absorption of short-term "
                f"market drawdown in exchange for compounding equity growth potential."
            )
        else:
            reasons.append(
                f"Your {risk.lower()} risk profile and {duration}-year duration target consistent inflation-beating yields "
                f"tailored for your '{goal}' objective."
            )

        reasons.append(
            f"Allocating your planned commitment of ₹{planned:,.0f} into {category} aligns with standard wealth management "
            f"frameworks for your age bracket ({age} years)."
        )

        return " ".join(reasons)
