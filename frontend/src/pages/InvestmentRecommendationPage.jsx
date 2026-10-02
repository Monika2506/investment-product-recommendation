import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Sliders, 
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { recommendService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function InvestmentRecommendationPage() {
  const { profile } = useAuth();
  const toast = useToast();

  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzingStage, setAnalyzingStage] = useState(0);

  // Form parameters that can be simulated
  const [params, setParams] = useState({
    age: 28,
    monthly_income: 60000,
    current_savings: 250000,
    planned_investment: 25000,
    investment_duration: 5,
    risk_tolerance: 'Medium',
    financial_goal: 'Wealth Creation',
    employment_category: 'Salaried'
  });

  useEffect(() => {
    if (profile) {
      setParams({
        age: profile.age,
        monthly_income: profile.monthly_income,
        current_savings: profile.current_savings,
        planned_investment: profile.planned_investment,
        investment_duration: profile.investment_duration,
        risk_tolerance: profile.risk_tolerance,
        financial_goal: profile.financial_goal,
        employment_category: profile.employment_category || 'Salaried'
      });
    }
  }, [profile]);

  const runPrediction = async () => {
    setLoading(true);
    setAnalyzingStage(1);

    const stageTimer1 = setTimeout(() => setAnalyzingStage(2), 500);
    const stageTimer2 = setTimeout(() => setAnalyzingStage(3), 1100);

    try {
      const res = await recommendService.generateRecommendation(params);
      if (res.success && res.data) {
        setRecommendation(res.data);
        toast.success("AI Investment Recommendation synthesized.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to generate recommendation.");
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setLoading(false);
      setAnalyzingStage(0);
    }
  };

  useEffect(() => {
    // Automatically trigger initial prediction if profile exists and no rec yet
    if (profile && !recommendation) {
      runPrediction();
    }
  }, [profile]);

  // Color palette for category probabilities
  const chartColors = ['#00f2fe', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6'];
  const pieData = recommendation?.probabilities
    ? Object.entries(recommendation.probabilities)
        .map(([name, prob]) => ({ name, value: Math.round(prob * 100) }))
        .filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">AI Investment Recommendation Engine</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Powered by Random Forest classification pipeline across 7 distinct asset classes.
          </p>
        </div>

        <button
          onClick={runPrediction}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Synthesizing...' : 'Run Simulation'}</span>
        </button>
      </div>

      {/* Loading Animation Box */}
      {loading && (
        <div className="glass-panel p-12 rounded-3xl border border-cyan-500/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            {analyzingStage === 1 && "Preprocessing numerical & categorical inputs..."}
            {analyzingStage === 2 && "Traversing 150 Random Forest Decision Trees..."}
            {analyzingStage === 3 && "Synthesizing suitability explanation & metrics..."}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Evaluating risk boundaries, horizon constraints, and expected returns across 7 asset categories.
          </p>
        </div>
      )}

      {/* Main Results View */}
      {recommendation && !loading && (
        <div className="space-y-6">
          {/* Primary Recommendation Hero Card */}
          <div className="glass-card-glow p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  Optimal Matched Asset Class
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-1 cyber-gradient-text">
                  {recommendation.recommended_category}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                    {recommendation.confidence_score}% Match Confidence
                  </span>
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-violet-500/10 border border-violet-500/30 text-violet-300">
                    {recommendation.risk_category}
                  </span>
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300">
                    {recommendation.duration_summary}
                  </span>
                </div>
              </div>

              {/* Product Metric Badges */}
              {recommendation.product_details && (
                <div className="grid grid-cols-2 gap-3 shrink-0 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Expected Return</p>
                    <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                      {recommendation.product_details.expected_return}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Liquidity Level</p>
                    <p className="text-sm font-bold text-cyan-400 font-mono mt-0.5 truncate max-w-[120px]" title={recommendation.product_details.liquidity}>
                      {recommendation.product_details.liquidity.split(' ')[0]}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Suitability Explanation */}
            <div className="my-6 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Explainable AI Suitability Rationalization</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {recommendation.explanation}
              </p>
            </div>

            {/* Key Considerations */}
            {recommendation.key_considerations && (
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Strategic Considerations & Risk Factors
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendation.key_considerations.map((point, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Probabilities & Alternative Categories Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 1 Col: Algorithm Match Probabilities Distribution */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Class Probability Distribution</h3>
              <p className="text-[11px] text-slate-400">Softmax confidence spread across candidate asset classes</p>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#f8fafc'
                      }}
                      formatter={(val) => [`${val}%`, 'Match Score']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                {pieData.map((item, idx) => (
                  <div key={item.name} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: chartColors[idx % chartColors.length] }}
                      />
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-mono text-slate-400">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 2 Cols: Alternative Asset Categories for Comparison */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Alternative Asset Categories for Diversification</h3>
                  <p className="text-[11px] text-slate-400">Secondary candidate options identified by the ML pipeline</p>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  TOP ALTERNATIVES
                </span>
              </div>

              <div className="space-y-3">
                {recommendation.alternatives && recommendation.alternatives.map((alt) => (
                  <div
                    key={alt.category}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-200">{alt.category}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {alt.risk_level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-snug">{alt.comparison_note}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Expected Return</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{alt.expected_return}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {Math.round(alt.match_probability * 100)}% Match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mandatory Academic Disclaimer Banner */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Academic & Final-Year Evaluation Disclaimer: </strong>
              {recommendation.disclaimer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
