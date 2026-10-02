import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  Sparkles, 
  History, 
  ShieldCheck, 
  Bell, 
  Settings, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isCollapsed, onToggle }) {
  const { isAdmin, user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/profile', label: 'Financial Profile', icon: UserCheck },
    { to: '/recommend', label: 'AI Recommendation', icon: Sparkles, highlight: true },
    { to: '/history', label: 'History & Archive', icon: History },
    { to: '/security', label: 'Security Center', icon: ShieldAlert },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-800/80 bg-[#090d16]/95 backdrop-blur-2xl transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-cyan-400 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] shrink-0">
            <Shield className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 font-mono">
                INVEST<span className="text-cyan-400">IQ</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                Intelligence Engine
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggle}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="px-3 pb-2">
          {!isCollapsed && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Platform Features
            </p>
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                } ${item.highlight && !isCollapsed ? 'relative' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {item.highlight && !isCollapsed && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      AI
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Administrator Section */}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t border-slate-800/80">
            <div className="px-3 pb-2">
              {!isCollapsed && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                  SecOps Admin
                </p>
              )}
            </div>

            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/10 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                    : 'text-slate-400 hover:text-violet-300 hover:bg-violet-950/20'
                }`
              }
              title={isCollapsed ? 'Admin Console' : undefined}
            >
              {({ isActive }) => (
                <>
                  <ShieldCheck
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-violet-300'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate flex-1">Admin Dashboard</span>
                  )}
                  {!isCollapsed && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Ops
                    </span>
                  )}
                </>
              )}
            </NavLink>
          </div>
        )}
      </div>

      {/* Sidebar Footer Security Status */}
      <div className="p-3 border-t border-slate-800/80">
        {!isCollapsed ? (
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span className="font-semibold text-[11px] text-cyan-400">Secured Node</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              ID: {user?.id ? `USR-${String(user.id).padStart(4, '0')}` : 'GUEST'}
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title="Secured Node Active">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
        )}
      </div>
    </aside>
  );
}
