import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  ChevronDown, 
  Menu, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { securityService } from '../services/api';
import SecurityShieldBadge from './SecurityShieldBadge';

export default function Navbar({ onToggleSidebar, isSidebarCollapsed }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchAlertCount = async () => {
      if (!user) return;
      try {
        const res = await securityService.getUserAlerts();
        if (res.success && res.data && isMounted) {
          const pending = res.data.filter((a) => a.status === 'PENDING').length;
          setUnreadAlerts(pending);
        }
      } catch (_) {}
    };

    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-slate-400 font-medium border-l border-slate-800 pl-3">
            Midnight Finance Intelligence
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Security Pulse Status */}
        <div className="hidden md:block">
          <SecurityShieldBadge status="Protected" size="sm" />
        </div>

        {/* Notifications Button */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors"
          title="Security Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadAlerts > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]">
              {unreadAlerts > 9 ? '9+' : unreadAlerts}
            </span>
          )}
        </Link>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-cyan-950/40">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-tight">
                {user?.full_name || 'User'}
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {isAdmin ? 'SEC_ADMIN' : 'INVESTOR'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-800/80">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-cyan-400 border border-cyan-500/20">
                    {user?.role}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>Financial Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Account & Security Settings</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-violet-300 hover:text-violet-200 hover:bg-violet-950/30 transition-colors border-t border-slate-800/60"
                    >
                      <Shield className="w-4 h-4 text-violet-400" />
                      <span>Administrator Console</span>
                    </Link>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-800/80">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
