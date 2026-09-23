import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Filter,
  ExternalLink,
  Info,
  Paperclip,
  Upload,
  X,
  FileText,
} from 'lucide-react';
import { ChatMessage, Citation, User, CollegeDoc } from '../types';
import { api } from '../services/api';

interface ChatAssistantProps {
  currentUser: User | null;
  onSelectCitation: (citation: Citation) => void;
  onNavigateToDocument: (docId: string) => void;
  initialDocId?: string | null;
  prefilledQuery?: string | null;
  onClearPrefill?: () => void;
  onDocumentAdded?: () => void;
}

const SUGGESTED_QUERIES = [
  {
    category: 'regulations',
    title: 'Minimum Attendance Requirement',
    query: 'What is the minimum attendance percentage required to sit for semester exams, and how does medical condonation work?',
  },
  {
    category: 'regulations',
    title: 'Re-evaluation & Script Inspection',
    query: 'What are the rules, deadlines, and fees for answer script photocopy inspection and re-evaluation?',
  },
  {
    category: 'notices',
    title: 'Mid-Sem Exam Dates & Hall Tickets',
    query: 'When do the Spring 2026 mid-semester exams begin, and what are the requirements to download the hall ticket?',
  },
  {
    category: 'syllabus',
    title: 'CS201 Data Structures Syllabus',
    query: 'What is the course code, credit weightage, and syllabus modules for Data Structures and Algorithms?',
  },
  {
    category: 'fees',
    title: 'Dean’s Merit Scholarship & Late Fees',
    query: 'What is the CGPA eligibility for the Dean’s Merit Scholarship, and what is the late fine for tuition payment?',
  },
  {
    category: 'hostel',
    title: 'Hostel Curfew & Prohibited Items',
    query: 'What are the hostel entry curfew timings and which electrical appliances are strictly prohibited?',
  },
  {
    category: 'unknown_test',
    title: 'Test Unknown Answer Guardrail',
    query: 'Can students fly recreational camera drones on the campus sports ground on weekends?',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Documents' },
  { id: 'regulations', label: 'Academic Regulations' },
  { id: 'handbook', label: 'Student Handbook' },
  { id: 'syllabus', label: 'Curriculum & Syllabus' },
  { id: 'fees', label: 'Fees & Scholarships' },
  { id: 'hostel', label: 'Hostel & Housing' },
  { id: 'notices', label: 'Campus Notices' },
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  currentUser,
  onSelectCitation,
  onNavigateToDocument,
  initialDocId,
  prefilledQuery,
  onClearPrefill,
  onDocumentAdded,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Welcome to **CampusIQ**, your official College Knowledge Assistant! 🎓\n\nI am connected directly to your university's verified **Handbooks, Academic Regulations, Syllabus, Fee Circulars, and Official Notices**.\n\n✨ **Document Analysis Feature:**\nYou can give or upload any document (course guide, syllabus, lab manual, policy) using the **Upload & Analyze Document** button or paperclip below. You can also pick a specific document from the **Document Focus** dropdown to ask focused questions!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availableDocs, setAvailableDocs] = useState<CollegeDoc[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(initialDocId || null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Document upload modal state
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [docUploadTitle, setDocUploadTitle] = useState('');
  const [docUploadCategory, setDocUploadCategory] = useState<string>('regulations');
  const [docUploadContent, setDocUploadContent] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents list for the document picker
  const fetchDocList = async () => {
    try {
      const res = await api.getDocuments();
      if (res.success && res.documents) {
        setAvailableDocs(res.documents);
      }
    } catch (err) {
      console.error('Failed to fetch doc list for selector:', err);
    }
  };

  useEffect(() => {
    fetchDocList();
  }, []);

  // Sync initialDocId if prop changes
  useEffect(() => {
    if (initialDocId) {
      setSelectedDocId(initialDocId);
    }
  }, [initialDocId]);

  // Handle prefilled query
  useEffect(() => {
    if (prefilledQuery) {
      setInputQuery(prefilledQuery);
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefilledQuery, onClearPrefill]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await api.queryRAG({
        query: textToSend.trim(),
        categoryFilter: selectedCategory !== 'all' ? selectedCategory : undefined,
        targetDocId: selectedDocId || undefined,
        topK: 4,
        threshold: 0.28,
      });

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUnknownAnswer: response.isUnknownAnswer,
        citations: response.citations || [],
        retrievalMetadata: response.retrievalMetadata,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Failed to get answer:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ An error occurred while retrieving college documents: ${err.message || 'Server timeout'}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUnknownAnswer: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload a document directly from the chat interface
  const handleUploadAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docUploadTitle.trim() || !docUploadContent.trim()) {
      setUploadError('Title and text content are required.');
      return;
    }

    setIsUploadingDoc(true);
    setUploadError(null);

    try {
      const res = await api.uploadDocument({
        title: docUploadTitle.trim(),
        category: docUploadCategory,
        content: docUploadContent.trim(),
        department: currentUser?.department || 'Academic Affairs',
        description: `Uploaded document analyzed by ${currentUser?.name || 'Student'}`,
      });

      if (res.success && res.document) {
        setShowDocUploadModal(false);
        const newDoc = res.document;
        setSelectedDocId(newDoc.id);
        await fetchDocList();
        if (onDocumentAdded) onDocumentAdded();

        // Add an announcement message
        const confirmMsg: ChatMessage = {
          id: `doc-announcement-${Date.now()}`,
          role: 'assistant',
          content: `📄 **Document Uploaded & Indexed:** "${newDoc.title}"\n\nI have parsed and embedded the document into **${newDoc.totalChunks || 1} semantic chunks**. Active focus is now set to this document.\n\nAsk me any question about this document, or click below for an immediate summary!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, confirmMsg]);

        // Reset form
        setDocUploadTitle('');
        setDocUploadContent('');

        // Trigger immediate analysis summary
        handleSend(`Provide an analysis and summary of the key points in "${newDoc.title}".`);
      } else {
        setUploadError('Upload failed. Please check the document format.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading document.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Handle local file selection
  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!docUploadTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setDocUploadTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        setDocUploadContent(content);
        setShowDocUploadModal(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/\[Doc:[^\]]+\]/g, '').replace(/[*#]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    }
  };

  const handleClearHistory = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        content: 'Chat session refreshed. Select a suggested topic below or type your question about college regulations and handbooks.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-115px)] max-w-7xl mx-auto px-2 sm:px-4 py-3">
      {/* Scope and Document Focus Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Document Focus Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-semibold text-slate-600 shrink-0">Document Focus:</span>
            <select
              value={selectedDocId || 'all'}
              onChange={e => {
                const val = e.target.value;
                setSelectedDocId(val === 'all' ? null : val);
              }}
              className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">🔍 Entire Repository (All Docs)</option>
              {availableDocs.map(d => (
                <option key={d.id} value={d.id}>
                  📄 {d.title}
                </option>
              ))}
            </select>

            {selectedDocId && (
              <button
                onClick={() => setSelectedDocId(null)}
                className="ml-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Clear document focus to search all"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick upload document button */}
          <button
            onClick={() => setShowDocUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document to Analyze</span>
          </button>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {/* Category scope pills if searching all */}
          {!selectedDocId && (
            <div className="hidden lg:flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
              <Filter className="w-3 h-3 text-slate-400 shrink-0" />
              {CATEGORIES.slice(0, 4).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleClearHistory}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition cursor-pointer shrink-0"
            title="Clear current session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Active Document Banner if focused */}
      {selectedDocId && availableDocs.find(d => d.id === selectedDocId) && (() => {
        const targetedDoc = availableDocs.find(d => d.id === selectedDocId)!;
        return (
          <div className="mt-2 p-2.5 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center justify-between gap-3 text-xs text-indigo-900 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="p-1 rounded-md bg-indigo-600 text-white shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </span>
              <div className="truncate">
                <span className="font-semibold">Active Document: </span>
                <span className="font-bold underline cursor-pointer" onClick={() => onNavigateToDocument(targetedDoc.id)}>
                  {targetedDoc.title}
                </span>
                <span className="text-indigo-600 ml-2">({targetedDoc.department} • {targetedDoc.totalChunks || 1} chunks indexed)</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleSend(`Analyze and summarize the key regulations and requirements in "${targetedDoc.title}"`)}
                className="px-2 py-0.5 rounded-md bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-medium text-[11px] transition cursor-pointer"
              >
                Analyze Summary
              </button>
              <button
                onClick={() => setSelectedDocId(null)}
                className="p-1 text-indigo-400 hover:text-indigo-700 rounded transition cursor-pointer"
                title="Return to searching all documents"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-5 px-1 sm:px-2">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-4xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-amber-300'
              }`}
            >
              {msg.role === 'user' ? (
                <UserIcon className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            {/* Bubble */}
            <div className={`space-y-2 max-w-[88%] sm:max-w-[82%]`}>
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : msg.isUnknownAnswer
                    ? 'bg-amber-50/90 border border-amber-200 text-slate-800 rounded-tl-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                {/* Unknown Guardrail Banner if applicable */}
                {msg.isUnknownAnswer && msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 pb-2 mb-2 border-b border-amber-200 text-amber-800 font-semibold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Official Document Guardrail: Information Not Found</span>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed">
                  {msg.content}
                </div>

                {/* Citations Row (if assistant and has citations) */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Grounded Sources ({msg.citations.length})
                      </span>
                      <span className="text-[10px] text-slate-400">Click card to inspect</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((cite, i) => (
                        <div
                          key={cite.id || i}
                          onClick={() => onSelectCitation(cite)}
                          className="group p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50/70 hover:border-indigo-300 transition cursor-pointer text-left relative"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-900 line-clamp-1">
                              {cite.docTitle}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-sm shrink-0">
                              Page {cite.page}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                            {cite.heading}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                            <span>Score: {Math.round(cite.similarityScore * 100)}%</span>
                            <span className="inline-flex items-center gap-0.5 text-indigo-600 font-medium group-hover:underline">
                              Inspect <ArrowRight className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom message actions & metadata */}
              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>{msg.timestamp}</span>
                    {msg.retrievalMetadata && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        <span>RAG: {msg.retrievalMetadata.latencyMs}ms</span>
                        <span>•</span>
                        <span>{msg.retrievalMetadata.chunksRetrieved} chunks</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-sm transition cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {'speechSynthesis' in window && (
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.content)}
                        className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-sm transition cursor-pointer"
                        title={speakingId === msg.id ? 'Stop reading' : 'Read answer aloud'}
                      >
                        {speakingId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-indigo-600" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto animate-in fade-in duration-150">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Searching vector store & generating grounded citations with Gemini 3.8 Flash...</span>
              </div>
              <div className="flex gap-1.5 py-1">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.15s]"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.3s]"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Grid (shown when history is small) */}
      {messages.length <= 2 && (
        <div className="py-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
            Suggested Student Inquiries
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            {SUGGESTED_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q.query)}
                className="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition cursor-pointer text-xs group shadow-2xs"
              >
                <div className="flex items-center justify-between text-slate-800 font-semibold group-hover:text-indigo-700">
                  <span>{q.title}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{q.query}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Bar */}
      <div className="pt-2">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl p-1.5 shadow-sm focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition"
        >
          {/* File picker button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.json"
            onChange={handleFilePicked}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => setShowDocUploadModal(true)}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
            title="Give/Upload document to analyze and ask questions"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder={
              selectedDocId && availableDocs.find(d => d.id === selectedDocId)
                ? `Ask questions about "${availableDocs.find(d => d.id === selectedDocId)?.title}"...`
                : "Ask about attendance rules, syllabus, fees, or upload a document to analyze..."
            }
            className="flex-1 px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className={`p-2.5 rounded-lg text-white font-medium transition cursor-pointer ${
              inputQuery.trim() && !isLoading
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-xs'
                : 'bg-slate-300 cursor-not-allowed text-slate-500'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400 mt-1.5">
          {selectedDocId && availableDocs.find(d => d.id === selectedDocId)
            ? `Answering strictly from "${availableDocs.find(d => d.id === selectedDocId)?.title}" with verified section citations`
            : 'CampusIQ checks institutional regulations • Answers are strictly sourced from accredited documents'}
        </p>
      </div>

      {/* Give Document to Analyze Modal */}
      {showDocUploadModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <Upload className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Give Document for AI Analysis</h3>
                  <p className="text-xs text-slate-500">Provide document text or select a file to analyze & ask questions</p>
                </div>
              </div>
              <button
                onClick={() => setShowDocUploadModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUploadAndAnalyze} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Physics Lab Regulations, Course Project Guidelines, Circular #204"
                  value={docUploadTitle}
                  onChange={e => setDocUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={docUploadCategory}
                    onChange={e => setDocUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="regulations">Academic Regulations</option>
                    <option value="handbook">Student Handbook</option>
                    <option value="syllabus">Curriculum & Syllabus</option>
                    <option value="notices">Campus Notices</option>
                    <option value="fees">Fees & Aid</option>
                    <option value="hostel">Hostel & Housing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Or Pick File (.txt / .md)
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-3 border border-slate-300 border-dashed rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Select Text File</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Content (Markdown / Text) *
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Paste the document text, guidelines, policies, or syllabus here..."
                  value={docUploadContent}
                  onChange={e => setDocUploadContent(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  The document will be automatically chunked into overlapping segments, vector-embedded, and made available for immediate AI questioning.
                </p>
              </div>

              {uploadError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDocUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingDoc || !docUploadTitle.trim() || !docUploadContent.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isUploadingDoc ? 'Analyzing & Indexing...' : 'Index & Start Analyzing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
