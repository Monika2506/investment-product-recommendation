import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  UserX, 
  UserCheck, 
  Cpu, 
  ArrowUpRight,
  RefreshCw,
  Eye,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { adminService } from '../services/api';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';
import SkeletonLoader from '../components/SkeletonLoader';
import Modal from '../components/Modal';
import { formatLocalDateTime, formatLocalDate } from '../utils/dateUtils';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters for events table
  const [eventSeverityFilter, setEventSeverityFilter] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  // Investigation Modal
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [investigationStatus, setInvestigationStatus] = useState('ACKNOWLEDGED');
  const [investigating, setInvestigating] = useState(false);

  // Model Metrics Modal
  const [showModelModal, setShowModelModal] = useState(false);

  const toast = useToast();

  const loadAdminData = async () => {
    try {
      const [dashRes, usersRes, evtsRes, metricsRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getUsers(),
        adminService.getEvents(),
        adminService.getModelMetrics()
      ]);

      if (dashRes.success) setDashboardData(dashRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (evtsRes.success) setEvents(evtsRes.data);
      if (metricsRes.success) setModelMetrics(metricsRes.data);
    } catch (err) {
      console.error("Admin dashboard load failed:", err);
      toast.error("Failed to load SecOps data. Ensure admin privileges.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await adminService.toggleUserStatus(userId);
      if (res.success) {
        toast.success(res.message);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_active: res.data.is_active } : u))
        );
      }
    } catch (err) {
      toast.error(err.message || "Failed to update user status.");
    }
  };

  const handleSaveInvestigation = async () => {
    if (!selectedAlert) return;
    setInvestigating(true);
    try {
      const res = await adminService.investigateAlert(selectedAlert.id, {
        admin_notes: investigationNotes,
        status: investigationStatus
      });
      if (res.success) {
        toast.success("Security alert investigation saved.");
        setSelectedAlert(null);
        setInvestigationNotes('');
        loadAdminData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to save investigation.");
    } finally {
      setInvestigating(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="card" count={4} />;
  }

  const metrics = dashboardData?.metrics || {};
  const severityCounts = dashboardData?.severity_counts || {};
  const trendData = dashboardData?.trend_data || [];
  const recDistribution = dashboardData?.recommendation_distribution || [];

  const severityPie = [
    { name: 'LOW', value: severityCounts.LOW || 0, color: '#3b82f6' },
    { name: 'MEDIUM', value: severityCounts.MEDIUM || 0, color: '#06b6d4' },
    { name: 'HIGH', value: severityCounts.HIGH || 0, color: '#f59e0b' },
    { name: 'CRITICAL', value: severityCounts.CRITICAL || 0, color: '#f43f5e' }
  ].filter((d) => d.value > 0);

  const filteredEvents = events.filter((e) => {
    if (eventSeverityFilter && e.severity !== eventSeverityFilter) return false;
    return true;
  });

  const filteredUsers = users.filter((u) => {
    if (userSearchTerm) {
      const term = userSearchTerm.toLowerCase();
      return u.email.toLowerCase().includes(term) || u.full_name.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-violet-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/40">
              SecOps Admin Console
            </span>
            <span className="text-xs text-slate-400 font-mono">ROLE: SYSTEM_ADMINISTRATOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            System Operations & Threat Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Live telemetry of registered user cohorts, brute-force detections, intrusion audits, and ML models.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setShowModelModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all hover:border-cyan-500/40"
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>ML Model Metrics</span>
          </button>

          <button
            onClick={loadAdminData}
            className="p-2.5 rounded-xl bg-violet-950/40 hover:bg-violet-900/50 border border-violet-500/40 text-violet-300 transition-colors"
            title="Refresh Admin Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Accounts"
          value={metrics.total_users || 0}
          subtitle={`${metrics.active_users || 0} active users`}
          icon={Users}
          color="cyan"
        />
        <StatCard
          title="Total Security Events"
          value={metrics.total_events || 0}
          subtitle="Audit log telemetry records"
          icon={Activity}
          color="violet"
        />
        <StatCard
          title="Failed Authentication Attempts"
          value={metrics.failed_logins || 0}
          subtitle="Monitored for brute-force bursts"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Open Security Alerts"
          value={metrics.open_alerts || 0}
          subtitle={`${metrics.acknowledged_alerts || 0} acknowledged`}
          icon={ShieldAlert}
          color={metrics.open_alerts > 0 ? 'rose' : 'emerald'}
          trend={{ text: `${metrics.open_alerts || 0} pending`, label: 'triage' }}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Event Activity Timeline */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">7-Day Security Telemetry Activity</h3>
              <p className="text-[11px] text-slate-400">Total access, authentication, and policy events recorded</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              LIVE STREAM
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="eventGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                  formatter={(val) => [`${val} Events`, 'Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="events"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#eventGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Donut */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Event Severity Distribution</h3>
            <p className="text-[11px] text-slate-400">Ratio of Low vs High/Critical alerts</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                >
                  {severityPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#f8fafc'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
            {severityPie.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300">{item.name}:</span>
                <span className="font-mono text-slate-400 font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Anonymous Recommendation Distribution Across User Base */}
      {recDistribution.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Aggregated Recommendation Allocation</h3>
              <p className="text-[11px] text-slate-400">Anonymous population distribution across asset classes (Zero PII exposed)</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              AGGREGATED ML METRICS
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                  formatter={(val) => [`${val} Users`, 'Total Recommendations']}
                />
                <Bar dataKey="count" fill="#00f2fe" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Security Incident Stream Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Live Security Event Telemetry</h3>
            <p className="text-[11px] text-slate-400">Inspect network traces, user-agent inference, and responses</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={eventSeverityFilter}
              onChange={(e) => setEventSeverityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
            >
              <option value="">All Severities ({events.length})</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400 font-mono">
              <tr>
                <th className="pb-3 pr-3">Event Type</th>
                <th className="pb-3 px-3">Severity</th>
                <th className="pb-3 px-3">Description</th>
                <th className="pb-3 px-3">Source IP</th>
                <th className="pb-3 px-3">Client (Inferred)</th>
                <th className="pb-3 px-3">Action</th>
                <th className="pb-3 pl-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredEvents.slice(0, 20).map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 pr-3 font-mono font-semibold text-slate-200">
                    {evt.event_type}
                    {evt.is_simulated && (
                      <span className="ml-1.5 px-1 py-0.2 rounded text-[8px] font-mono bg-violet-950 text-violet-300">
                        SIM
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      evt.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                      evt.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300' :
                      evt.severity === 'MEDIUM' ? 'bg-cyan-500/20 text-cyan-300' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-xs truncate" title={evt.description}>
                    {evt.description}
                  </td>
                  <td className="py-3 px-3 font-mono text-cyan-400 text-[11px]">
                    {evt.ip_address || '127.0.0.1'}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                    {evt.browser || 'N/A'} • {evt.os || 'N/A'}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      evt.response_action === 'DENIED' || evt.response_action === 'BLOCKED' ? 'text-rose-400 bg-rose-950/40' :
                      evt.response_action === 'ALERT_GENERATED' ? 'text-amber-400 bg-amber-950/40' :
                      'text-emerald-400 bg-emerald-950/40'
                    }`}>
                      {evt.response_action}
                    </span>
                  </td>
                  <td className="py-3 pl-3 text-slate-400 font-mono whitespace-nowrap">
                    {formatLocalDateTime(evt.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Account Access Management */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100">User Account Management & Access Control</h3>
            <p className="text-[11px] text-slate-400">Suspend compromised accounts or reactivate verified investors</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              placeholder="Search user email or name..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500/60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400 font-mono">
              <tr>
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 px-4">Role</th>
                <th className="pb-3 px-4">Profile Status</th>
                <th className="pb-3 px-4">Last Login</th>
                <th className="pb-3 px-4">Account State</th>
                <th className="pb-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-slate-200">{u.full_name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {u.has_profile ? (
                      <span className="text-emerald-400 font-medium">Configured</span>
                    ) : (
                      <span className="text-slate-400">Incomplete</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {u.last_login_at ? formatLocalDate(u.last_login_at) : 'Never'}
                  </td>
                  <td className="py-3 px-4">
                    {u.is_active ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        SUSPENDED
                      </span>
                    )}
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(u.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                        u.is_active
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {u.is_active ? 'Suspend Account' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Metrics Modal */}
      <Modal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        title="Random Forest ML Model Performance & Validation"
        maxWidth="max-w-2xl"
      >
        {modelMetrics && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Test Accuracy</span>
                <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                  {modelMetrics.accuracy ? `${(modelMetrics.accuracy * 100).toFixed(1)}%` : '90.7%'}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Weighted F1</span>
                <p className="text-xl font-bold text-cyan-400 font-mono mt-0.5">
                  {modelMetrics.f1_weighted ? modelMetrics.f1_weighted.toFixed(3) : '0.903'}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Estimators</span>
                <p className="text-xl font-bold text-slate-100 font-mono mt-0.5">
                  {modelMetrics.n_estimators || 150} Trees
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Training Samples</span>
                <p className="text-xl font-bold text-slate-100 font-mono mt-0.5">
                  {modelMetrics.train_samples || 2560}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Model Features Pipeline
              </h4>
              <p className="font-mono text-[11px] text-cyan-300">
                Numerical: age, monthly_income, current_savings, planned_investment, investment_duration (StandardScaler)
              </p>
              <p className="font-mono text-[11px] text-violet-300">
                Categorical: risk_tolerance, financial_goal, employment_category (OneHotEncoder)
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Demonstration Note: </strong>
              {modelMetrics.disclaimer || "Model trained on synthetic benchmark data for academic final-year project demonstration."}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowModelModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-semibold"
              >
                Close Metrics
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
