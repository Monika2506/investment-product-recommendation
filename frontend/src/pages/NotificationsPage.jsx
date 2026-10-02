import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, CheckCircle2, Clock, Filter, AlertTriangle, Eye } from 'lucide-react';
import { securityService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatLocalDateTime } from '../utils/dateUtils';
import SkeletonLoader from '../components/SkeletonLoader';
import Modal from '../components/Modal';

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'PENDING', 'ACKNOWLEDGED'
  const [selectedAlert, setSelectedAlert] = useState(null);
  const toast = useToast();

  const fetchAlerts = async () => {
    try {
      const res = await securityService.getUserAlerts();
      if (res.success && res.data) {
        setAlerts(res.data);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (alertId) => {
    try {
      const res = await securityService.acknowledgeAlert(alertId);
      if (res.success) {
        toast.success("Security alert marked as acknowledged.");
        fetchAlerts();
        if (selectedAlert && selectedAlert.id === alertId) {
          setSelectedAlert((prev) => ({ ...prev, status: 'ACKNOWLEDGED' }));
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to acknowledge alert.");
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (activeTab === 'PENDING') return a.status === 'PENDING';
    if (activeTab === 'ACKNOWLEDGED') return a.status === 'ACKNOWLEDGED';
    return true;
  });

  const pendingCount = alerts.filter((a) => a.status === 'PENDING').length;

  if (loading) {
    return <SkeletonLoader type="card" count={4} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Security & System Notifications</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time security telemetry dispatches and alert acknowledgments.
          </p>
        </div>

        {pendingCount > 0 && (
          <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono">
            {pendingCount} Pending Alert{pendingCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { key: 'ALL', label: `All Alerts (${alerts.length})` },
          { key: 'PENDING', label: `Pending Action (${pendingCount})` },
          { key: 'ACKNOWLEDGED', label: 'Archived' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification Items */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all ${
                alert.status === 'PENDING'
                  ? 'bg-slate-950/80 border-amber-500/40 shadow-lg shadow-amber-950/10'
                  : 'bg-slate-950/30 border-slate-800/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    alert.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400' :
                    alert.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-cyan-500/10 text-cyan-400'
                  }`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{alert.title}</h4>
                      {alert.is_simulated && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-violet-950/60 text-violet-300 border border-violet-500/30">
                          SIMULATED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {alert.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-slate-400 font-mono">
                      <span>Type: {alert.alert_type}</span>
                      <span>•</span>
                      <span>Dispatched: {formatLocalDateTime(alert.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    alert.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {alert.severity}
                  </span>

                  {alert.status === 'PENDING' ? (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acknowledged</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center">
          <Bell className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-200">No Notifications</h3>
          <p className="text-xs text-slate-400 mt-1">
            You are completely caught up with your security alerts.
          </p>
        </div>
      )}
    </div>
  );
}
