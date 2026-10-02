import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  Lock, 
  Terminal, 
  Play, 
  CheckCircle2, 
  Clock, 
  Globe, 
  Laptop, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { securityService } from '../services/api';
import { useToast } from '../context/ToastContext';
import ThreatMeter from '../components/ThreatMeter';
import SecurityShieldBadge from '../components/SecurityShieldBadge';
import SkeletonLoader from '../components/SkeletonLoader';
import { formatLocalDateTime } from '../utils/dateUtils';

export default function SecurityCenter() {
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const toast = useToast();

  const loadData = async () => {
    try {
      const [sumRes, evtsRes, altsRes] = await Promise.all([
        securityService.getSummary(),
        securityService.getUserEvents(30),
        securityService.getUserAlerts()
      ]);
      if (sumRes.success) setSummary(sumRes.data);
      if (evtsRes.success) setEvents(evtsRes.data);
      if (altsRes.success) setAlerts(altsRes.data);
    } catch (err) {
      console.error("Failed to load security telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcknowledge = async (alertId) => {
    try {
      const res = await securityService.acknowledgeAlert(alertId);
      if (res.success) {
        toast.success("Security alert status updated to ACKNOWLEDGED.");
        loadData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to acknowledge alert.");
    }
  };

  const handleSimulate = async (type) => {
    setSimulating(true);
    try {
      const res = await securityService.simulateEvent(type);
      if (res && res.success) {
        const eventObj = res.data?.event || {};
        const alertObj = res.data?.alert || {};
        const eventType = eventObj.event_type || alertObj.alert_type || type;
        const alertTitle = alertObj.title || eventObj.description || res.message || eventType;
        
        toast.warning(`[SIMULATED DEMO] Triggered: ${alertTitle}`);
        await loadData();
      } else {
        toast.error(res?.message || "Failed to trigger demonstration event.");
      }
    } catch (err) {
      console.error("Simulation request failed:", err);
      const errorMessage = err?.message || err?.data?.message || "Failed to connect to simulation server.";
      toast.error(errorMessage);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="card" count={3} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Cybersecurity Monitoring Center</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time telemetry, session integrity audits, and intrusion detection monitoring.
          </p>
        </div>

        <SecurityShieldBadge status={summary?.security_rating || 'Protected'} size="md" />
      </div>

      {/* Top Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Threat Meter */}
        <ThreatMeter
          score={summary?.security_score || 95}
          rating={summary?.security_rating || 'Excellent'}
        />

        {/* Client Network & Device Telemetry */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Network & Client Fingerprint
              </h4>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Source IP:</span>
                <span className="text-cyan-300 font-bold">{summary?.current_session?.ip_address || '127.0.0.1'}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Inferred Browser:</span>
                <span className="text-slate-200">{summary?.current_session?.browser || 'Chrome'}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Inferred OS:</span>
                <span className="text-slate-200">{summary?.current_session?.os || 'Windows'}</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-3 leading-snug">
            * Browser and OS details are inferred from User-Agent headers. This data cannot definitively identify a physical computer.
          </p>
        </div>

        {/* Demo Simulation Sandbox */}
        <div className="glass-panel p-5 rounded-2xl border border-violet-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-violet-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                SecOps Evaluation Sandbox
              </h4>
            </div>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Trigger simulated cybersecurity alerts to demonstrate intrusion detection and real-time mitigation:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleSimulate('SUSPICIOUS_LOGIN_ATTEMPT')}
                disabled={simulating}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-between border border-slate-700 hover:border-cyan-500/40 transition-all"
              >
                <span>Simulate Brute-Force Alert</span>
                <Play className="w-3 h-3 text-cyan-400" />
              </button>
              <button
                onClick={() => handleSimulate('UNAUTHORIZED_PROFILE_ACCESS')}
                disabled={simulating}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-between border border-slate-700 hover:border-rose-500/40 transition-all"
              >
                <span>Simulate Unauthorized Access</span>
                <Play className="w-3 h-3 text-rose-400" />
              </button>
            </div>
          </div>

          <span className="text-[10px] text-slate-400 font-mono mt-2">
            Simulated events are clearly tagged for academic defense.
          </span>
        </div>
      </div>

      {/* Active Alerts Feed */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Security Alerts Stream</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {alerts.filter((a) => a.status === 'PENDING').length} Action Required
          </span>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all ${
                  alert.status === 'PENDING'
                    ? 'bg-slate-950/70 border-amber-500/40'
                    : 'bg-slate-950/30 border-slate-800/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-sm">{alert.title}</span>
                    {alert.is_simulated && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-violet-950 text-violet-300 border border-violet-500/30">
                        SIMULATED DEMO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      alert.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatLocalDateTime(alert.created_at)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {alert.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-3 text-slate-400 font-mono">
                    <span>In-App: {alert.delivered_in_app ? '✓' : '✗'}</span>
                    <span>
                      Email Dispatch:{' '}
                      <span className={alert.email_dispatch_status === 'SENT_TO_SMTP' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        {alert.email_dispatch_status === 'SENT_TO_SMTP' ? 'Sent to SMTP ✓' :
                         alert.email_dispatch_status === 'SKIPPED_PREFERENCE' ? 'Disabled in Settings' :
                         alert.email_dispatch_status === 'SKIPPED_SIMULATED' ? 'Demo Event (Suppressed)' :
                         alert.email_dispatch_status === 'FAILED' ? 'Delivery Failed ✗' :
                         (alert.delivered_email ? 'Sent ✓' : 'Pending/Logged')}
                      </span>
                    </span>
                  </div>

                  {alert.status === 'PENDING' ? (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold transition-all"
                    >
                      Acknowledge Alert
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acknowledged</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p>No active security threats recorded on your account.</p>
          </div>
        )}
      </div>

      {/* Security Event Telemetry Log Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Account Security Event Log</h3>
            <p className="text-[11px] text-slate-400">Chronological telemetry of authentication and resource access events</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            AUDIT TRAIL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400 font-mono">
              <tr>
                <th className="pb-3 pr-4">Event Type</th>
                <th className="pb-3 px-4">Severity</th>
                <th className="pb-3 px-4">Description</th>
                <th className="pb-3 px-4">Inferred Client</th>
                <th className="pb-3 px-4">Action</th>
                <th className="pb-3 pl-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 pr-4 font-mono font-semibold text-slate-200">
                    {evt.event_type}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      evt.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                      evt.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300' :
                      evt.severity === 'MEDIUM' ? 'bg-cyan-500/20 text-cyan-300' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={evt.description}>
                    {evt.description}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {evt.browser || 'N/A'} • {evt.os || 'N/A'}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      evt.response_action === 'DENIED' || evt.response_action === 'BLOCKED' ? 'text-rose-400 bg-rose-950/40' :
                      evt.response_action === 'ALERT_GENERATED' ? 'text-amber-400 bg-amber-950/40' :
                      'text-emerald-400 bg-emerald-950/40'
                    }`}>
                      {evt.response_action}
                    </span>
                  </td>
                  <td className="py-3 pl-4 text-slate-400 font-mono whitespace-nowrap">
                    {formatLocalDateTime(evt.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
