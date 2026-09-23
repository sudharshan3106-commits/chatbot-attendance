import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Database,
  Cpu,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { AnalyticsStats, User } from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  currentUser: User | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [recentQueries, setRecentQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      if (res.success) {
        setStats(res.stats);
        setRecentQueries(res.recentQueries || []);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Administrative & RAG System Telemetry
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time query metrics, grounding accuracy, vector similarity distributions, and knowledge gap audits.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Grounded Accuracy Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Grounded Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats ? `${stats.groundedAccuracyRate}%` : '--'}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            Strict zero-hallucination constraint
          </p>
        </div>

        {/* Avg Retrieval Latency */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Avg Query Latency</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats ? `${stats.avgLatencyMs}ms` : '--'}
          </div>
          <p className="text-[11px] text-slate-500">
            Vector search + Gemini 3.8 Flash
          </p>
        </div>

        {/* Indexed Chunks */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Vector Store Chunks</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats ? stats.totalChunks : '--'}
          </div>
          <p className="text-[11px] text-slate-500">
            Across {stats?.totalDocuments || 6} official documents
          </p>
        </div>

        {/* Unknown Answer Escalations */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Escalated Inquiries</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats ? stats.unknownAnswerCount : '0'}
          </div>
          <p className="text-[11px] text-amber-700">
            Identifies documentation gaps
          </p>
        </div>
      </div>

      {/* System Infrastructure Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <span>Active RAG Stack Configuration</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[11px]">Primary LLM</span>
            <span className="font-bold text-slate-800">Google Gemini 3.8 Flash</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">High factual fidelity</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[11px]">Vector Database</span>
            <span className="font-bold text-slate-800">ChromaDB Persistent Store</span>
            <span className="text-[10px] text-indigo-600 block mt-0.5">HNSW Cosine Index</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[11px]">Metadata Storage</span>
            <span className="font-bold text-slate-800">SQLite Database</span>
            <span className="text-[10px] text-slate-600 block mt-0.5">Users & Audit logs</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[11px]">Guardrail Threshold</span>
            <span className="font-bold text-slate-800">Cosine &gt;= 0.28</span>
            <span className="text-[10px] text-amber-700 block mt-0.5">Auto-flags unknown query</span>
          </div>
        </div>
      </div>

      {/* Query Audit Trail */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Recent Student Inquiries & Grounding Audit</span>
          </h3>
          <span className="text-xs text-slate-400">Latest 15 interactions</span>
        </div>

        {recentQueries.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No queries processed in this session yet. Ask a question in the Assistant Q&A tab to populate telemetry!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Student Query</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Top Similarity</th>
                  <th className="py-2.5 px-3">Grounding Status</th>
                  <th className="py-2.5 px-3">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentQueries.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-medium text-slate-800 max-w-xs truncate">
                      {log.query}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 capitalize">
                      {log.category || 'all'}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {Math.round(log.topScore * 100)}%
                    </td>
                    <td className="py-2.5 px-3">
                      {log.isGrounded ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Grounded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Unknown Escalated
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">
                      {log.latencyMs}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
