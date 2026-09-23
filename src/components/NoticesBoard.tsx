import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Filter,
  Plus,
  AlertCircle,
  Calendar,
  Building,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';
import { Notice, User } from '../types';
import { api } from '../services/api';

interface NoticesBoardProps {
  currentUser: User | null;
  onAskAboutNotice: (query: string) => void;
}

export const NoticesBoard: React.FC<NoticesBoardProps> = ({
  currentUser,
  onAskAboutNotice,
}) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Publish Notice Modal (Faculty/Admin)
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Office of the Registrar');
  const [category, setCategory] = useState<'exam' | 'academic' | 'placement' | 'fees' | 'hostel' | 'urgent'>('exam');
  const [priority, setPriority] = useState<'urgent' | 'high' | 'normal'>('normal');
  const [summary, setSummary] = useState('');
  const [fullText, setFullText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFaculty = currentUser?.role === 'faculty_admin';

  const loadNotices = async () => {
    setLoading(true);
    try {
      const res = await api.getNotices({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: search.trim() || undefined,
      });
      if (res.success) {
        setNotices(res.notices);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, [categoryFilter, search]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary) return;

    setIsSubmitting(true);
    try {
      const res = await api.publishNotice({
        title,
        department,
        category,
        priority,
        summary,
        fullText: fullText || summary,
      });

      if (res.success) {
        setShowPublishModal(false);
        setTitle('');
        setSummary('');
        setFullText('');
        loadNotices();
      }
    } catch (err) {
      console.error('Failed to publish notice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Campus Circulars & Official Notices
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time notifications, exam timetables, placement schedules, and administrative orders.
          </p>
        </div>

        {isFaculty && (
          <button
            onClick={() => setShowPublishModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-200 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Notice</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars, hall tickets, drives..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Notices' },
            { id: 'exam', label: 'Examinations' },
            { id: 'placement', label: 'Placements' },
            { id: 'fees', label: 'Fee Circulars' },
            { id: 'hostel', label: 'Hostel' },
            { id: 'academic', label: 'Academic' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                categoryFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Feed */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold">No notices match your selected filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map(notice => (
            <div
              key={notice.id}
              className={`p-5 rounded-2xl border bg-white shadow-xs transition hover:shadow-md flex flex-col sm:flex-row justify-between gap-4 ${
                notice.priority === 'urgent'
                  ? 'border-amber-300 bg-amber-50/20'
                  : notice.priority === 'high'
                  ? 'border-indigo-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {notice.priority === 'urgent' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200">
                      <AlertCircle className="w-3 h-3 text-red-600" />
                      Urgent Action Required
                    </span>
                  )}
                  {notice.priority === 'high' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      High Priority
                    </span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full capitalize">
                    {notice.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Ref: {notice.refNo}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {notice.summary}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {notice.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {notice.date}
                  </span>
                </div>
              </div>

              {/* Action: Ask AI about this notice */}
              <div className="sm:self-center shrink-0">
                <button
                  onClick={() =>
                    onAskAboutNotice(
                      `What are the full details and deadlines for the official circular "${notice.title}"?`
                    )
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ask CampusIQ</span>
                  <ArrowRight className="w-3 h-3 text-indigo-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Notice Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Publish Campus Notice</h3>
                <p className="text-xs text-slate-500">Official circular broadcast to student body</p>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for End-Semester Laboratory Viva Voce"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="exam">Examination</option>
                    <option value="placement">Placement</option>
                    <option value="fees">Fee Circular</option>
                    <option value="hostel">Hostel</option>
                    <option value="academic">Academic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Summary / Body *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Official notice content, requirements, dates, and instructions..."
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title || !summary}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Broadcasting...' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
