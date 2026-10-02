import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

export default function SecurityShieldBadge({ status = 'Protected', size = 'md' }) {
  const isProtected = status === 'Protected' || status === 'Excellent';
  const isWarning = status === 'Warning' || status === 'Moderate';

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size] || 'w-4 h-4';

  const textSizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5'
  }[size] || 'text-xs px-2.5 py-1';

  if (isProtected) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 ${textSizes}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <ShieldCheck className={iconSizes} />
        <span>{status}</span>
      </span>
    );
  }

  if (isWarning) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400 ${textSizes}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <ShieldAlert className={iconSizes} />
        <span>{status}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-rose-500/10 border border-rose-500/30 text-rose-400 ${textSizes}`}>
      <span className="relative flex h-2 w-2">
        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
      </span>
      <ShieldX className={iconSizes} />
      <span>{status}</span>
    </span>
  );
}
