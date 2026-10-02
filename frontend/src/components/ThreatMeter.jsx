import React from 'react';
import { Shield } from 'lucide-react';

export default function ThreatMeter({ score = 95, rating = 'Excellent' }) {
  // Score 0 to 100
  let color = '#10b981'; // emerald
  let barColor = 'bg-emerald-500';
  let glowColor = 'shadow-[0_0_15px_rgba(16,185,129,0.3)]';

  if (score < 65) {
    color = '#f43f5e'; // rose
    barColor = 'bg-rose-500';
    glowColor = 'shadow-[0_0_15px_rgba(244,63,94,0.3)]';
  } else if (score < 85) {
    color = '#f59e0b'; // amber
    barColor = 'bg-amber-500';
    glowColor = 'shadow-[0_0_15px_rgba(245,158,11,0.3)]';
  }

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h4 className="text-sm font-semibold text-slate-200">Security Health Score</h4>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${score >= 85 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : (score >= 65 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30')}`}>
          {rating}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-extrabold font-mono text-slate-100">{score}</span>
        <span className="text-xs text-slate-400">/ 100 System Integrity Index</span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor} ${glowColor}`}
          style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
        Real-time telemetry score evaluating failed authentication attempts, rate limiting, and profile isolation.
      </p>
    </div>
  );
}
