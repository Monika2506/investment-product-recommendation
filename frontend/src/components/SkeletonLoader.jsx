import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl animate-pulse space-y-3">
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
            <div className="h-8 bg-slate-800 rounded w-3/4"></div>
            <div className="h-3 bg-slate-800 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="glass-panel rounded-2xl p-4 animate-pulse space-y-3">
        <div className="h-6 bg-slate-800 rounded w-1/4 mb-4"></div>
        {items.map((i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="h-4 bg-slate-800 rounded w-1/6"></div>
            <div className="h-4 bg-slate-800 rounded w-2/6"></div>
            <div className="h-4 bg-slate-800 rounded w-1/6"></div>
            <div className="h-4 bg-slate-800 rounded w-2/6"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-slate-800 rounded w-1/3"></div>
      <div className="h-32 bg-slate-800 rounded w-full"></div>
    </div>
  );
}
