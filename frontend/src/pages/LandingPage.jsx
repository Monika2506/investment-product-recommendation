import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Sparkles, 
  Lock, 
  Cpu, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert,
  AlertTriangle,
  User,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role) => {
    const res = await demoLogin(role);
    if (res.success) {
      if (role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-cyan-400 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Shield className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <span className="font-extrabold text-lg tracking-tight font-mono">
            INVEST<span className="text-cyan-400">IQ</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 ml-2">
            Midnight Finance Intelligence
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 transition-all text-xs font-semibold"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-8 border-b border-slate-800/80">
        {/* Glow ambient background orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AI & Cybersecurity Integrated Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.15] mb-6">
            Intelligent Investment Recommendations,{' '}
            <span className="cyber-gradient-text block mt-2">
              Fortified with Active SecOps.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 mb-8 leading-relaxed">
            Harness Scikit-Learn Random Forest intelligence to match your financial profile with optimal asset classes—shielded by automated suspicious activity detection, brute-force defenses, and real-time security alerting.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link
              to="/register"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-sm transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)]"
            >
              <span>Build Financial Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl glass-panel text-slate-200 hover:text-white hover:border-cyan-500/40 text-sm font-semibold transition-all"
            >
              Sign In to Your Vault
            </Link>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="glass-panel p-4 rounded-2xl max-w-xl mx-auto border border-cyan-500/20">
            <p className="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Hackathon / Evaluation Demo Access</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => handleQuickDemo('user')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:border-cyan-500/40"
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span>One-Click Investor Demo</span>
              </button>
              <button
                onClick={() => handleQuickDemo('admin')}
                className="flex-1 px-4 py-2.5 rounded-xl bg-violet-950/40 hover:bg-violet-900/50 border border-violet-500/30 text-violet-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:border-violet-500/60"
              >
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                <span>One-Click SecOps Admin Demo</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">
              Pre-loaded demo accounts with telemetry events and profiles.
            </p>
          </div>
        </div>
      </section>

      {/* Zero Credential Guarantee Alert Box */}
      <section className="px-4 sm:px-8 py-8 bg-slate-950/50 border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto flex items-start gap-4 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 mb-1">
              Zero Banking Credential Guarantee & Strict Data Privacy
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              InvestIQ operates strictly on generalized financial profile parameters (age, income bracket, horizon, and risk tolerance). 
              Our architecture <strong className="text-cyan-300">never requests or stores bank account numbers, credit/debit card numbers, CVVs, UPI PINs, OTPs, or banking passwords</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Pillar Cards */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Engineered for Academic Rigor & Practical Security
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Four foundational systems harmonized in a single full-stack architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="glass-card-glow p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Random Forest AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trained Scikit-Learn ensemble model mapping complex investor attributes to 7 asset categories with 90%+ benchmark accuracy.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] font-mono text-cyan-400">
              7 Asset Classes Covered
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="glass-card-glow p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Active Cybersecurity</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comprehensive telemetry tracking failed logins, brute-force patterns, malformed payloads, and cross-tenant unauthorized queries.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] font-mono text-violet-400">
              Automated Alert Dispatch
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="glass-card-glow p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Explainable Advice</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clear plain-language justification synthesized for every recommendation, including liquidity, lock-in, and alternative portfolios.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] font-mono text-emerald-400">
              Transparent Decision Trees
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="glass-card-glow p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">SecOps Console</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated administrator dashboard with incident triage, alert acknowledgments, audit notes, and anonymous metrics.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] font-mono text-amber-400">
              Role-Based Access Control
            </div>
          </div>
        </div>
      </section>

      {/* 7 Asset Classes Overview */}
      <section className="py-12 px-4 sm:px-8 bg-slate-950/40 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-center text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">
            Evaluated Investment Asset Classes
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              'Fixed Deposit (FD)',
              'Mutual Funds',
              'Stocks',
              'Gold',
              'Public Provident Fund (PPF)',
              'Bonds',
              'National Pension System (NPS)'
            ].map((cat) => (
              <span
                key={cat}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold transition-all shadow-sm"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-200">Investment Product Recommendation System</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Final Year B.Tech AI & Data Science Project • Midnight Finance Intelligence
            </p>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-cyan-400 transition-colors">Login</Link>
            <Link to="/register" className="hover:text-cyan-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
