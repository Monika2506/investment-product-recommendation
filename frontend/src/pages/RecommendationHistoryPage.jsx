import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  Search, 
  Filter, 
  ArrowRight,
  Clock,
  Eye
} from 'lucide-react';
import { recommendService } from '../services/api';
import Modal from '../components/Modal';
import SkeletonLoader from '../components/SkeletonLoader';
import { formatLocalDate, formatLocalDateTime } from '../utils/dateUtils';

export default function RecommendationHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await recommendService.getHistory();
        if (res.success && res.data) {
          setHistory(res.data);
        }
      } catch (err) {
        console.error("Failed to load recommendation history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = 
      item.recommended_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.explanation && item.explanation.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter ? item.recommended_category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(history.map((h) => h.recommended_category)));

  if (loading) {
    return <SkeletonLoader type="table" count={6} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Recommendation Archive & Audit Log</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Review previous AI-generated financial allocations and audit historical decision snapshots.
          </p>
        </div>

        <Link
          to="/recommend"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Recommendation</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search allocations or rationale..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
          >
            <option value="">All Categories ({history.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* History Table / Cards */}
      {filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHistory.map((rec) => (
            <div
              key={rec.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono text-cyan-400">REC-#{rec.id}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatLocalDate(rec.created_at)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {rec.recommended_category}
                </h3>

                <div className="flex items-center gap-2 mt-2 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {rec.confidence_score}% Match
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    {rec.risk_category}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {rec.explanation}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Horizon: {rec.duration_summary?.split(' ')[0]}
                </span>
                <button
                  onClick={() => setSelectedRec(rec)}
                  className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Audit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center">
          <History className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-200">No Historical Records Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || categoryFilter
              ? "No records matched your search query or filter."
              : "You haven't run any AI investment recommendations yet."}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedRec}
        onClose={() => setSelectedRec(null)}
        title={`Recommendation Snapshot Audit (ID: #${selectedRec?.id})`}
        maxWidth="max-w-2xl"
      >
        {selectedRec && (
          <div className="space-y-5 text-xs text-slate-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Recommended Asset Class
                </span>
                <h2 className="text-2xl font-bold text-slate-100 mt-0.5">{selectedRec.recommended_category}</h2>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 block mb-1">
                  {selectedRec.confidence_score}% Confidence
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatLocalDateTime(selectedRec.created_at)}
                </span>
              </div>
            </div>

            {/* Profile Snapshot At That Time */}
            {selectedRec.profile_snapshot && (
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Investor Profile Parameters at Execution
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                  <div><span className="text-slate-400">Age:</span> {selectedRec.profile_snapshot.age} yrs</div>
                  <div><span className="text-slate-400">Income:</span> ₹{Number(selectedRec.profile_snapshot.monthly_income).toLocaleString()}</div>
                  <div><span className="text-slate-400">Planned:</span> ₹{Number(selectedRec.profile_snapshot.planned_investment).toLocaleString()}</div>
                  <div><span className="text-slate-400">Duration:</span> {selectedRec.profile_snapshot.investment_duration} yrs</div>
                  <div><span className="text-slate-400">Risk:</span> {selectedRec.profile_snapshot.risk_tolerance}</div>
                  <div><span className="text-slate-400">Goal:</span> {selectedRec.profile_snapshot.financial_goal}</div>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                AI Suitability Rationale
              </h4>
              <p className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 leading-relaxed text-slate-200">
                {selectedRec.explanation}
              </p>
            </div>

            {/* Key Considerations */}
            {selectedRec.key_considerations && selectedRec.key_considerations.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Guidance & Rules
                </h4>
                <ul className="space-y-1.5">
                  {selectedRec.key_considerations.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/50 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRec(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Audit View
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
