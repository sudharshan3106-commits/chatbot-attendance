import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  Layers,
  Search,
  BookOpen,
  Calendar,
  Building,
  CheckCircle2,
  X,
  Eye,
  Plus,
  RefreshCw,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { CollegeDoc, DocumentChunk, User } from '../types';
import { api } from '../services/api';

interface DocumentManagerProps {
  currentUser: User | null;
  onRefreshDocs?: () => void;
  selectedDocId?: string | null;
  onAskAboutDocument?: (docId: string, initialQuery?: string) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  currentUser,
  onRefreshDocs,
  selectedDocId,
  onAskAboutDocument,
}) => {
  const [documents, setDocuments] = useState<CollegeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Inspection modal state
  const [activeDocForChunks, setActiveDocForChunks] = useState<CollegeDoc | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  // Full Doc Viewer state
  const [viewingDoc, setViewingDoc] = useState<CollegeDoc | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'handbook' | 'regulations' | 'syllabus' | 'notices' | 'fees' | 'hostel'>('regulations');
  const [uploadDept, setUploadDept] = useState('Academic Affairs');
  const [uploadAuthor, setUploadAuthor] = useState('Faculty Committee');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadPages, setUploadPages] = useState('4');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  const isFaculty = currentUser?.role === 'faculty_admin';

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await api.getDocuments();
      if (res.success) {
        setDocuments(res.documents);
        // If a selectedDocId was passed in props, open its viewer
        if (selectedDocId) {
          const matched = res.documents.find(d => d.id === selectedDocId);
          if (matched) {
            handleViewFullDoc(matched.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [selectedDocId]);

  const handleInspectChunks = async (doc: CollegeDoc) => {
    setActiveDocForChunks(doc);
    setLoadingChunks(true);
    try {
      const res = await api.getDocumentChunks(doc.id);
      if (res.success) {
        setChunks(res.chunks);
      }
    } catch (err) {
      console.error('Failed to fetch chunks:', err);
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleViewFullDoc = async (docId: string) => {
    try {
      const res = await api.getDocument(docId);
      if (res.success) {
        setViewingDoc(res.document);
      }
    } catch (err) {
      console.error('Failed to get doc:', err);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to remove this document and delete its vector index?')) return;
    try {
      await api.deleteDocument(docId);
      loadDocs();
      if (onRefreshDocs) onRefreshDocs();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setUploadContent(content);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    };
    reader.readAsText(file);
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadContent) return;

    setIsSubmitting(true);
    setUploadFeedback(null);
    try {
      const res = await api.uploadDocument({
        title: uploadTitle,
        category: uploadCategory,
        department: uploadDept,
        author: uploadAuthor,
        content: uploadContent,
        pages: Number(uploadPages) || 4,
      });

      if (res.success) {
        setUploadFeedback(res.message);
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadTitle('');
          setUploadContent('');
          setUploadFeedback(null);
          loadDocs();
          if (onRefreshDocs) onRefreshDocs();
        }, 1200);
      }
    } catch (err: any) {
      setUploadFeedback(`Upload failed: ${err.message || 'Error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesCat = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Institutional Document Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative corpus for RAG semantic search, chunk embeddings, and strict grounded citations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDocs}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Reload repository"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isFaculty && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-200 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload College Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search regulations, handbooks, notices..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'regulations', label: 'Regulations' },
            { id: 'handbook', label: 'Handbook' },
            { id: 'syllabus', label: 'Syllabus' },
            { id: 'fees', label: 'Fees & Aid' },
            { id: 'hostel', label: 'Hostel' },
            { id: 'notices', label: 'Notices' },
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

      {/* Document Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold">No college documents match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between p-5 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                    {doc.category}
                  </span>
                  <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Indexed
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug line-clamp-2">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                  {doc.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.department}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {doc.effectiveDate}
                    </span>
                    <span className="font-semibold text-indigo-700">
                      {doc.pages} Pages
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {onAskAboutDocument && (
                    <button
                      onClick={() => onAskAboutDocument(doc.id, `Analyze and summarize the key regulations and requirements in "${doc.title}"`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                      title="Analyze this document and ask questions"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Ask AI</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleViewFullDoc(doc.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    title="Read full document text"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Read</span>
                  </button>

                  <button
                    onClick={() => handleInspectChunks(doc)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    title="Inspect chunks and vector embeddings"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>{doc.totalChunks || doc.sectionCount} Chunks</span>
                  </button>
                </div>

                {isFaculty && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Remove from knowledge base"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chunk & Vector Inspector Modal */}
      {activeDocForChunks && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[88vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <Layers className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    Vector Database Chunk Inspector
                  </span>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {activeDocForChunks.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveDocForChunks(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
                <span>
                  <strong>{chunks.length} Total Chunks</strong> indexed in ChromaDB collection with cosine embeddings.
                </span>
                <span className="text-[11px] font-mono text-indigo-700">
                  Chunk Size: 450 chars | Overlap: 60 chars
                </span>
              </div>

              {loadingChunks ? (
                <div className="p-8 text-center text-slate-400">Loading vector chunks...</div>
              ) : (
                <div className="space-y-3">
                  {chunks.map((chk, i) => (
                    <div
                      key={chk.chunkId || i}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition text-xs space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">Chunk #{chk.chunkIndex || i + 1}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-indigo-700 font-semibold">{chk.heading}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>Page {chk.page}</span>
                          <span>•</span>
                          <span>{chk.wordCount} words ({chk.charCount} chars)</span>
                        </div>
                      </div>

                      <p className="text-slate-700 font-sans leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {chk.text}
                      </p>

                      {/* Vector embedding preview */}
                      {chk.embeddingPreview && chk.embeddingPreview.length > 0 && (
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                          <span className="font-bold text-slate-700">Vector (First 8 dims):</span>
                          <span>[{chk.embeddingPreview.map((v: number) => v.toFixed(3)).join(', ')}, ...]</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActiveDocForChunks(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Document Reader Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Document Reader
                </span>
                <h3 className="text-base font-bold text-slate-900">{viewingDoc.title}</h3>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-slate-400 block">Department</span>
                  <span className="font-semibold text-slate-800">{viewingDoc.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Version</span>
                  <span className="font-semibold text-slate-800">{viewingDoc.version}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Pages</span>
                  <span className="font-semibold text-slate-800">{viewingDoc.pages}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Effective</span>
                  <span className="font-semibold text-slate-800">{viewingDoc.effectiveDate}</span>
                </div>
              </div>

              <div className="space-y-4">
                {viewingDoc.sections.map((sec, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-900 border-b border-slate-100 pb-1.5">
                      <span>{sec.heading}</span>
                      <span className="text-slate-400 font-normal">Page {sec.page}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <div>
                {onAskAboutDocument && (
                  <button
                    onClick={() => {
                      const doc = viewingDoc;
                      setViewingDoc(null);
                      onAskAboutDocument(doc.id, `Analyze and summarize this document "${doc.title}"`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI About This Document</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <Upload className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload & Index College Document</h3>
                  <p className="text-xs text-slate-500">PDF text, academic circulars, syllabus or regulations</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUpload} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master of Science Academic Regulations 2026"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="regulations">Academic Regulations</option>
                    <option value="handbook">Student Handbook</option>
                    <option value="syllabus">Curriculum & Syllabus</option>
                    <option value="fees">Fees & Scholarships</option>
                    <option value="hostel">Hostel & Housing</option>
                    <option value="notices">Campus Notices</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={uploadDept}
                    onChange={e => setUploadDept(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Text File (.txt / .md / .json)
                </label>
                <input
                  type="file"
                  accept=".txt,.md,.json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Content (Markdown / Text) *
                </label>
                <textarea
                  rows={7}
                  required
                  placeholder="Paste official text or extracted PDF content here. Use '# Section Heading' to delineate chapters."
                  value={uploadContent}
                  onChange={e => setUploadContent(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  The RAG pipeline will automatically clean, normalize, and slice this text into 450-character chunks with 60-character sliding overlap.
                </p>
              </div>

              {uploadFeedback && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{uploadFeedback}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !uploadTitle || !uploadContent}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isSubmitting ? 'Chunking & Indexing...' : 'Ingest Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
