import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'cyan', // 'cyan', 'violet', 'emerald', 'rose', 'amber'
  trend,
  className = ''
}) {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      bgGlow: 'from-cyan-500/10 via-transparent to-transparent',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
    },
    violet: {
      border: 'border-violet-500/20 hover:border-violet-500/40',
      bgGlow: 'from-violet-500/10 via-transparent to-transparent',
      text: 'text-violet-400',
      badge: 'bg-violet-500/10 text-violet-300 border-violet-500/30'
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      bgGlow: 'from-emerald-500/10 via-transparent to-transparent',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      bgGlow: 'from-rose-500/10 via-transparent to-transparent',
      text: 'text-rose-400',
      badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      bgGlow: 'from-amber-500/10 via-transparent to-transparent',
      text: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    }
  }[color] || {
    border: 'border-slate-800 hover:border-slate-700',
    bgGlow: 'from-slate-800/10 via-transparent to-transparent',
    text: 'text-slate-400',
    badge: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 border bg-slate-900/60 backdrop-blur-md transition-all duration-200 shadow-lg ${colorMap.border} ${className}`}>
      {/* Subtle background radial glow */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${colorMap.bgGlow} blur-2xl pointer-events-none`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1 font-mono tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 ${colorMap.text} shadow-inner`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs">
          <span className={`px-1.5 py-0.5 rounded border text-[11px] font-medium ${colorMap.badge}`}>
            {trend.text}
          </span>
          {trend.label && <span className="text-slate-400">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}
