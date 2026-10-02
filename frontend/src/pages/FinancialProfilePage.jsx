import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCheck, 
  ShieldCheck, 
  Save, 
  Sparkles, 
  HelpCircle, 
  Wallet, 
  Calendar, 
  Target, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function FinancialProfilePage() {
  const { profile, setProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: 28,
    monthly_income: 60000,
    current_savings: 250000,
    planned_investment: 20000,
    investment_duration: 5,
    risk_tolerance: 'Medium',
    financial_goal: 'Wealth Creation',
    employment_category: 'Salaried'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        age: profile.age || 28,
        monthly_income: profile.monthly_income || 60000,
        current_savings: profile.current_savings || 250000,
        planned_investment: profile.planned_investment || 20000,
        investment_duration: profile.investment_duration || 5,
        risk_tolerance: profile.risk_tolerance || 'Medium',
        financial_goal: profile.financial_goal || 'Wealth Creation',
        employment_category: profile.employment_category || 'Salaried'
      });
    }
  }, [profile]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = async (redirectAfter = false) => {
    setLoading(true);
    setErrors({});
    try {
      const res = await profileService.saveProfile(formData);
      if (res.success) {
        setProfile(res.data);
        toast.success("Financial profile updated successfully.");
        if (redirectAfter) {
          navigate('/recommend');
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to save profile.");
      if (err.errors) setErrors(err.errors);
    } finally {
      setLoading(false);
    }
  };

  const goals = [
    'Emergency Fund',
    'Education',
    'Retirement',
    'Wealth Creation',
    'Home Purchase',
    'Other'
  ];

  const riskOptions = [
    {
      level: 'Low',
      title: 'Conservative (Capital Preservation)',
      desc: 'Prioritizes safety of principal with stable, low-volatility returns (FD, PPF, Sovereign Bonds).'
    },
    {
      level: 'Medium',
      title: 'Balanced (Growth & Income)',
      desc: 'Accepts moderate market fluctuations for higher long-term compounding (Mutual Funds, Hybrid Funds, Gold).'
    },
    {
      level: 'High',
      title: 'Aggressive (Wealth Acceleration)',
      desc: 'Comfortable with significant short-term market volatility for maximum equity upside (Direct Equities, Growth Stocks).'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Financial Profile Management</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Define your financial parameters to enable accurate Random Forest machine learning recommendations.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-xs text-slate-300 font-medium">Zero-Credential Isolation</span>
        </div>
      </div>

      {/* Zero Banking Credentials Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-cyan-300">Strict Data Privacy Assurance:</strong> This platform never asks for bank account numbers, debit/credit cards, UPI PINs, OTPs, or net banking passwords. Only generalized financial profile bands are used to compute machine learning suitability.
        </div>
      </div>

      {/* Main Profile Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Age */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Investor Age: <span className="font-mono text-cyan-400 font-bold">{formData.age} Years</span>
              </label>
            </div>
            <input
              type="range"
              min="18"
              max="80"
              value={formData.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>18 yrs</span>
              <span>50 yrs</span>
              <span>80 yrs</span>
            </div>
            {errors.age && <p className="text-[11px] text-rose-400 mt-1">{errors.age}</p>}
          </div>

          {/* Employment Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Employment Category
            </label>
            <select
              value={formData.employment_category}
              onChange={(e) => handleChange('employment_category', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/60 transition-all"
            >
              <option value="Salaried">Salaried Professional</option>
              <option value="Self-Employed">Self-Employed Professional</option>
              <option value="Business Owner">Business Owner / Enterprise</option>
              <option value="Student / Freelancer">Student / Freelancer</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          {/* Monthly Income */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Monthly Income (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">₹</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.monthly_income}
                onChange={(e) => handleChange('monthly_income', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/60 font-mono"
              />
            </div>
            {errors.monthly_income && <p className="text-[11px] text-rose-400 mt-1">{errors.monthly_income}</p>}
          </div>

          {/* Current Savings */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Current Liquid Savings (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">₹</span>
              <input
                type="number"
                min="0"
                step="5000"
                value={formData.current_savings}
                onChange={(e) => handleChange('current_savings', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/60 font-mono"
              />
            </div>
            {errors.current_savings && <p className="text-[11px] text-rose-400 mt-1">{errors.current_savings}</p>}
          </div>

          {/* Planned Investment Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Planned Investment Commitment (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">₹</span>
              <input
                type="number"
                min="1000"
                step="1000"
                value={formData.planned_investment}
                onChange={(e) => handleChange('planned_investment', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/60 font-mono"
              />
            </div>
            {errors.planned_investment && <p className="text-[11px] text-rose-400 mt-1">{errors.planned_investment}</p>}
          </div>

          {/* Investment Duration (Years) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Investment Duration: <span className="font-mono text-cyan-400 font-bold">{formData.investment_duration} Years</span>
              </label>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={formData.investment_duration}
              onChange={(e) => handleChange('investment_duration', parseInt(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>1 Year (Short)</span>
              <span>15 Years</span>
              <span>30 Years (Ultra-Long)</span>
            </div>
            {errors.investment_duration && <p className="text-[11px] text-rose-400 mt-1">{errors.investment_duration}</p>}
          </div>
        </div>

        {/* Financial Goal Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Primary Financial Goal
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {goals.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleChange('financial_goal', g)}
                className={`p-3 rounded-2xl text-xs font-semibold text-left transition-all border ${
                  formData.financial_goal === g
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          {errors.financial_goal && <p className="text-[11px] text-rose-400 mt-1">{errors.financial_goal}</p>}
        </div>

        {/* Risk Tolerance Selection Cards */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Risk Tolerance Preference
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {riskOptions.map((r) => (
              <div
                key={r.level}
                onClick={() => handleChange('risk_tolerance', r.level)}
                className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                  formData.risk_tolerance === r.level
                    ? 'bg-gradient-to-b from-cyan-500/10 to-violet-500/5 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    r.level === 'Low' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    r.level === 'Medium' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                    'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  }`}>
                    {r.level} Risk
                  </span>
                  {formData.risk_tolerance === r.level && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]"></span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-200 mb-1">{r.title}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">{r.desc}</p>
              </div>
            ))}
          </div>
          {errors.risk_tolerance && <p className="text-[11px] text-rose-400 mt-1">{errors.risk_tolerance}</p>}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Only</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Save & Run AI Recommendation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
