import json
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey
from . import db
from ..utils.helpers import format_iso_utc

class Recommendation(db.Model):
    __tablename__ = 'recommendations'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    recommended_category = Column(String(50), nullable=False)
    confidence_score = Column(Float, nullable=False)
    risk_category = Column(String(20), nullable=False)
    duration_summary = Column(String(100), nullable=False)
    explanation = Column(Text, nullable=False)
    
    # JSON-encoded structures
    _profile_snapshot = Column('profile_snapshot', Text, nullable=False)
    _alternatives = Column('alternatives', Text, nullable=False)
    _key_considerations = Column('key_considerations', Text, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    @property
    def profile_snapshot(self):
        return json.loads(self._profile_snapshot) if self._profile_snapshot else {}

    @profile_snapshot.setter
    def profile_snapshot(self, value):
        self._profile_snapshot = json.dumps(value)

    @property
    def alternatives(self):
        return json.loads(self._alternatives) if self._alternatives else []

    @alternatives.setter
    def alternatives(self, value):
        self._alternatives = json.dumps(value)

    @property
    def key_considerations(self):
        return json.loads(self._key_considerations) if self._key_considerations else []

    @key_considerations.setter
    def key_considerations(self, value):
        self._key_considerations = json.dumps(value)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'recommended_category': self.recommended_category,
            'confidence_score': self.confidence_score,
            'risk_category': self.risk_category,
            'duration_summary': self.duration_summary,
            'explanation': self.explanation,
            'profile_snapshot': self.profile_snapshot,
            'alternatives': self.alternatives,
            'key_considerations': self.key_considerations,
            'created_at': format_iso_utc(self.created_at)
        }
