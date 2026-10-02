import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 selection:bg-cyan-500/20 selection:text-cyan-300">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 max-w-lg w-full text-center space-y-5 shadow-2xl relative">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-4xl sm:text-5xl font-extrabold font-mono text-cyan-400">404</span>
          <h2 className="text-xl font-bold text-slate-100 mt-2">Security Perimeter Maintained</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The requested resource, route, or telemetry artifact does not exist within the current security boundary.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard Vault</span>
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
          >
            Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
