import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  Wallet, 
  Calendar, 
  Target, 
  Activity, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { profileService, recommendService, securityService } from '../services/api';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';
import SecurityShieldBadge from '../components/SecurityShieldBadge';
import SkeletonLoader from '../components/SkeletonLoader';
import { formatLocalDateTime, formatLocalDate, formatLocalTime } from '../utils/dateUtils';

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [latestRec, setLatestRec] = useState(null);
  const [securitySummary, setSecuritySummary] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const [historyRes, secRes, alertsRes] = await Promise.all([
          recommendService.getHistory().catch(() => ({ success: false, data: [] })),
          securityService.getSummary().catch(() => ({ success: false, data: null })),
          securityService.getUserAlerts().catch(() => ({ success: false, data: [] }))
        ]);

        if (isMounted) {
          if (historyRes.success && historyRes.data && historyRes.data.length > 0) {
            setLatestRec(historyRes.data[0]);
          }
          if (secRes.success && secRes.data) {
            setSecuritySummary(secRes.data);
          }
          if (alertsRes.success && alertsRes.data) {
            setRecentAlerts(alertsRes.data.slice(0, 3));
          }
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      const res = await securityService.acknowledgeAlert(alertId);
      if (res.success) {
        toast.success("Security alert acknowledged.");
        setRecentAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a))
        );
      }
    } catch (err) {
      toast.error(err.message || "Failed to acknowledge alert.");
    }
  };

  // Illustrative category risk/return comparison data for chart
  const comparisonData = [
    { name: 'FD', expectedReturn: 7.2, riskScore: 2, color: '#06b6d4' },
    { name: 'PPF', expectedReturn: 7.1, riskScore: 1, color: '#10b981' },
    { name: 'Bonds', expectedReturn: 8.5, riskScore: 3, color: '#3b82f6' },
    { name: 'Gold', expectedReturn: 9.0, riskScore: 4, color: '#f59e0b' },
    { name: 'NPS', expectedReturn: 10.5, riskScore: 4, color: '#8b5cf6' },
    { name: 'Mutual Funds', expectedReturn: 12.5, riskScore: 6, color: '#00f2fe' },
    { name: 'Stocks', expectedReturn: 15.0, riskScore: 8, color: '#ec4899' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="card" count={4} />
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/10 via-violet-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <SecurityShieldBadge status="Protected" size="sm" />
            <span className="text-xs font-mono text-cyan-400">SESSION ID: #{user?.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Welcome back, <span className="cyber-gradient-text">{user?.full_name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Financial profile evaluated with active cybersecurity telemetry and ML recommendation models.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/recommend"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Recommendation</span>
          </Link>
          <Link
            to="/profile"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Recommendation"
          value={latestRec?.recommended_category || 'Pending'}
          subtitle={latestRec ? `${latestRec.confidence_score}% Algorithm Match` : 'Profile Required'}
          icon={Sparkles}
          color="cyan"
          trend={latestRec ? { text: latestRec.risk_category, label: '' } : null}
        />
        <StatCard
          title="Monthly Income"
          value={profile?.monthly_income ? `₹${Number(profile.monthly_income).toLocaleString('en-IN')}` : 'Not Set'}
          subtitle={profile?.employment_category || 'Profile incomplete'}
          icon={Wallet}
          color="emerald"
        />
        <StatCard
          title="Investment Horizon"
          value={profile?.investment_duration ? `${profile.investment_duration} Years` : 'Not Set'}
          subtitle={profile?.financial_goal ? `Target: ${profile.financial_goal}` : 'Set horizon'}
          icon={Calendar}
          color="violet"
        />
        <StatCard
          title="Security Health Score"
          value={`${securitySummary?.security_score ?? 95}/100`}
          subtitle={securitySummary?.security_rating || 'Protected'}
          icon={ShieldCheck}
          color={(securitySummary?.security_score ?? 95) < 75 ? 'rose' : 'emerald'}
          trend={{ text: `${securitySummary?.pending_alerts || 0} Alerts`, label: 'pending' }}
        />
      </div>

      {/* Main Grid: Recommended Asset & Category Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Primary Recommendation Details */}
        <div className="lg:col-span-2 space-y-6">
          {latestRec ? (
            <div className="glass-card-glow p-6 sm:p-8 rounded-3xl border border-cyan-500/20 shadow-2xl relative">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800/80 mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                    Primary AI Asset Recommendation
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1 flex items-center gap-2">
                    <span>{latestRec.recommended_category}</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                    {latestRec.confidence_score}% Confidence
                  </span>
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-violet-500/10 border border-violet-500/30 text-violet-300">
                    {latestRec.risk_category}
                  </span>
                </div>
              </div>

              {/* Explanation Quote */}
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Suitability Analysis
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {latestRec.explanation}
                </p>
              </div>

              {/* Key Considerations Grid */}
              {latestRec.key_considerations && latestRec.key_considerations.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Product Considerations & Rules
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {latestRec.key_considerations.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs text-slate-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions & Alternatives CTA */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Generated: {formatLocalDate(latestRec.created_at)}</span>
                </span>
                <Link
                  to="/recommend"
                  className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Explore Alternatives & Re-simulate</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">No Recommendation Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                Complete your basic financial profile (income, duration, risk tolerance) to let our Random Forest AI model determine your optimal investment asset class.
              </p>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-105 transition-all"
              >
                <span>Set Up Financial Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Asset Classes Expected Yield Benchmark Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Asset Class Yield Benchmarks (p.a.)</h3>
                <p className="text-[11px] text-slate-400">Historical illustrative annualized yield comparison</p>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                BENCHMARK DATA
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} unit="%" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#f8fafc'
                    }}
                    formatter={(val) => [`${val}% p.a.`, 'Benchmark Return']}
                  />
                  <Bar dataKey="expectedReturn" radius={[6, 6, 0, 0]}>
                    {comparisonData.map((entry, index) => {
                      const isMatch = Boolean(
                        latestRec?.recommended_category &&
                        latestRec.recommended_category.toLowerCase().includes(entry.name.toLowerCase())
                      );
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={isMatch ? '#00f2fe' : entry.color}
                          opacity={isMatch ? 1 : 0.65}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Security Center Telemetry & Recent Alerts */}
        <div className="space-y-6">
          {/* Security Telemetry Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-200">Security Telemetry</h3>
              </div>
              <Link to="/security" className="text-xs text-cyan-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Observed Client IP:</span>
                <span className="font-mono text-cyan-400 font-semibold">{securitySummary?.current_session?.ip_address || '127.0.0.1'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Inferred Browser:</span>
                <span>{securitySummary?.current_session?.browser || 'Browser'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Inferred OS:</span>
                <span>{securitySummary?.current_session?.os || 'OS'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Protection Shield:</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              * Client browser and OS details are inferred from standard User-Agent headers for intrusion monitoring.
            </p>
          </div>

          {/* Recent Security Alerts Widget */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-200">Recent Security Alerts</h3>
              </div>
              <Link to="/notifications" className="text-xs text-slate-400 hover:text-slate-200">
                Inbox
              </Link>
            </div>

            {recentAlerts.length > 0 ? (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-2xl border text-xs transition-all ${
                      alert.status === 'PENDING'
                        ? 'bg-slate-950/80 border-amber-500/30'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-200">{alert.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mb-2">
                      {alert.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{formatLocalTime(alert.created_at)}</span>
                      {alert.status === 'PENDING' ? (
                        <button
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-semibold transition-colors"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-medium">Acknowledged</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p>No active security threats flagged on your account.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
