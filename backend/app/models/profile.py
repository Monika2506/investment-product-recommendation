from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from . import db
from ..utils.helpers import format_iso_utc

class FinancialProfile(db.Model):
    __tablename__ = 'financial_profiles'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False, index=True)
    age = Column(Integer, nullable=False)
    monthly_income = Column(Float, nullable=False)
    current_savings = Column(Float, nullable=False)
    planned_investment = Column(Float, nullable=False)
    investment_duration = Column(Integer, nullable=False)  # in years
    risk_tolerance = Column(String(20), nullable=False)    # 'Low', 'Medium', 'High'
    financial_goal = Column(String(50), nullable=False)    # 'Education', 'Emergency Fund', etc.
    employment_category = Column(String(50), nullable=True, default='Salaried')
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'age': self.age,
            'monthly_income': self.monthly_income,
            'current_savings': self.current_savings,
            'planned_investment': self.planned_investment,
            'investment_duration': self.investment_duration,
            'risk_tolerance': self.risk_tolerance,
            'financial_goal': self.financial_goal,
            'employment_category': self.employment_category,
            'updated_at': format_iso_utc(self.updated_at)
        }
