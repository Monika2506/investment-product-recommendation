import React from 'react';
import { Shield, Sparkles, AlertCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/70 py-6 px-4 sm:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Attribution & Year */}
        <div className="flex items-center gap-2 text-slate-300">
          <div className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-200">InvestIQ</span>
          <span className="text-slate-400">|</span>
          <span>B.Tech AI & Data Science Capstone Project</span>
        </div>

        {/* Mandatory Educational Disclaimer */}
        <div className="flex items-center gap-2 text-slate-400 text-center md:text-right max-w-xl">
          <AlertCircle className="w-4 h-4 text-cyan-500 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-slate-300">Academic Demonstration:</strong> Simulated AI recommendations generated via Random Forest algorithm on benchmark data. Not certified financial advice. No bank credentials, cards, or PINs are ever collected.
          </p>
        </div>
      </div>
    </footer>
  );
}
