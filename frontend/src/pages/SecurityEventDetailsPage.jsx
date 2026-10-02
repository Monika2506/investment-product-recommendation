import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Globe, 
  User, 
  Clock, 
  FileText, 
  Save 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { securityService, adminService } from '../services/api';
import { useToast } from '../context/ToastContext';
import SkeletonLoader from '../components/SkeletonLoader';
import { formatLocalDateTime } from '../utils/dateUtils';

export default function SecurityEventDetailsPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState('ACKNOWLEDGED');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Fetch from events list
        const res = isAdmin 
          ? await adminService.getEvents() 
          : await securityService.getUserEvents();

        if (res.success && res.data) {
          const match = res.data.find((e) => String(e.id) === String(id));
          if (match) {
            setEventData(match);
          } else {
            toast.error("Event record not found.");
          }
        }
      } catch (err) {
        console.error("Failed to load event:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, isAdmin]);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      // Find alert associated if available
      const res = await adminService.investigateAlert(id, {
        admin_notes: adminNotes,
        status: status
      });
      if (res.success) {
        toast.success("Investigation report recorded.");
        navigate('/admin');
      }
    } catch (err) {
      toast.error(err.message || "Failed to update investigation report.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="card" count={2} />;
  }

  if (!eventData) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-200">Security Telemetry Record Not Found</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">The requested event identifier does not exist or has expired.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
        >
          Return to Previous View
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Back Button & Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-cyan-400">TELEMETRY ID: {eventData.id}</span>
            <span className="text-[10px] font-mono text-slate-400">&bull; {formatLocalDateTime(eventData.created_at)}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span>{eventData.event_type}</span>
            {eventData.is_simulated && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-950 text-violet-300 border border-violet-500/30">
                SIMULATED TEST
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Main Payload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Incident Description & Raw Telemetry
            </h3>
            <p className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-200 text-xs leading-relaxed font-sans">
              {eventData.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Severity Level</span>
              <span className={`font-bold uppercase ${
                eventData.severity === 'CRITICAL' ? 'text-rose-400' :
                eventData.severity === 'HIGH' ? 'text-amber-400' : 'text-cyan-400'
              }`}>
                {eventData.severity}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Mitigation Response Action</span>
              <span className="text-emerald-400 font-bold">{eventData.response_action}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Requested Endpoint</span>
              <span className="text-slate-300">{eventData.endpoint || '/api'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">HTTP Method</span>
              <span className="text-slate-300">{eventData.method || 'POST'}</span>
            </div>
          </div>

          {/* Admin Investigation Section */}
          {isAdmin && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>SecOps Incident Triage & Investigation Notes</span>
              </h3>

              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter audit remarks, mitigation verified, or threat analysis observations..."
                rows={3}
                className="w-full p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/60"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400">Mark Status:</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Recording...' : 'Save Audit Record'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Inferred Fingerprints */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Inferred Client Fingerprint</span>
            </h4>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Observed Source IP</span>
                <span className="text-cyan-300 font-bold">{eventData.ip_address || '127.0.0.1'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Inferred Browser</span>
                <span className="text-slate-200">{eventData.browser || 'Google Chrome'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Inferred Platform / OS</span>
                <span className="text-slate-200">{eventData.os || 'Windows 10/11'}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              <strong>Technical Integrity Disclosure:</strong> Browser and OS details are inferred from User-Agent HTTP headers. These strings can be forged by clients and do not guarantee hardware identity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
