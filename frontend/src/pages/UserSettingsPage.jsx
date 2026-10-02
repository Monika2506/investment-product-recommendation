import React, { useState, useEffect } from 'react';
import { Settings, Lock, Bell, Shield, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService, securityService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function UserSettingsPage() {
  const { user } = useAuth();
  const toast = useToast();

  // Notification Preferences
  const [preferences, setPreferences] = useState({
    email_alerts_enabled: true,
    in_app_alerts_enabled: true,
    alert_severity_threshold: 'LOW',
  });
  const [prefLoading, setPrefLoading] = useState(false);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await securityService.getPreferences();
        if (res.success && res.data) {
          setPreferences(res.data);
        }
      } catch (err) {
        console.error("Failed to load preferences:", err);
      }
    };
    fetchPrefs();
  }, []);

  const handleUpdatePreferences = async () => {
    setPrefLoading(true);
    try {
      const res = await securityService.updatePreferences(preferences);
      if (res.success) {
        toast.success("Security notification preferences saved.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update preferences.");
    } finally {
      setPrefLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }
    setPwdLoading(true);
    try {
      const res = await authService.changePassword(passwordData);
      if (res.success) {
        toast.success("Password updated successfully.");
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      }
    } catch (err) {
      toast.error(err.message || "Password change failed.");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Account & Security Preferences</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure security alert delivery channels and update authentication credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notification Preferences */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200">Alert Dispatch Settings</h3>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-200 block">In-App Security Alerts</span>
                <span className="text-[11px] text-slate-400">Display immediate banner notifications for threat detections</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.in_app_alerts_enabled}
                onChange={(e) => setPreferences({ ...preferences, in_app_alerts_enabled: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-200 block">Email Security Notifications</span>
                <span className="text-[11px] text-slate-400">Dispatch critical alerts via configured SMTP</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.email_alerts_enabled}
                onChange={(e) => setPreferences({ ...preferences, email_alerts_enabled: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </label>

            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Minimum Alert Severity Threshold
              </label>
              <select
                value={preferences.alert_severity_threshold}
                onChange={(e) => setPreferences({ ...preferences, alert_severity_threshold: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500/60 text-xs"
              >
                <option value="LOW">LOW (All security and authentication events)</option>
                <option value="MEDIUM">MEDIUM (Throttling, failed logins)</option>
                <option value="HIGH">HIGH (Brute-force and unauthorized access attempts only)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleUpdatePreferences}
            disabled={prefLoading}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:border-cyan-500/40"
          >
            <Save className="w-4 h-4" />
            <span>Save Notification Preferences</span>
          </button>
        </div>

        {/* Change Password Form */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200">Update Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                required
                placeholder="Min 8 chars, 1 upper, 1 digit, 1 symbol"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
              </button>

              <button
                type="submit"
                disabled={pwdLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {pwdLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
