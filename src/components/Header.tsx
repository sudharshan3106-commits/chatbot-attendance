import React from 'react';
import {
  GraduationCap,
  BookOpen,
  FileText,
  Bell,
  Cpu,
  BarChart3,
  Code2,
  UserCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onSwitchRole: (role: 'student' | 'faculty_admin') => void;
  totalDocs: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchRole,
  totalDocs,
}) => {
  const isFaculty = currentUser?.role === 'faculty_admin';

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top institution alert/indicator bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            RAG Pipeline Online
          </span>
          <span className="hidden md:inline text-slate-400">•</span>
          <span className="hidden md:inline text-slate-300">
            Model: <strong className="text-white">Gemini 3.8 Flash</strong>
          </span>
          <span className="hidden md:inline text-slate-400">•</span>
          <span className="hidden md:inline text-slate-300">
            Vector DB: <strong className="text-white">ChromaDB Store</strong>
          </span>
          <span className="hidden md:inline text-slate-400">•</span>
          <span className="hidden md:inline text-slate-300">
            Indexed Docs: <strong className="text-white">{totalDocs} Official Records</strong>
          </span>
        </div>

        {/* Role Selector Badge */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Logged in as:</span>
          <button
            onClick={() => onSwitchRole(isFaculty ? 'student' : 'faculty_admin')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium transition cursor-pointer ${
              isFaculty
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
            }`}
            title="Click to toggle between Student and Faculty/Admin perspective"
          >
            {isFaculty ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin / Faculty Dean</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Student ({currentUser?.studentId || 'CS2023'})</span>
              </>
            )}
            <span className="text-[10px] underline ml-1 text-slate-400 hover:text-white">Switch</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Crest */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-700 via-indigo-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                Campus<span className="text-indigo-600">IQ</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                Official Knowledge Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Academic Regulations • Student Handbook • Syllabus • Campus Circulars
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Assistant Q&A</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer whitespace-nowrap ${
              activeTab === 'documents'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Document Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>RAG Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer whitespace-nowrap ${
              activeTab === 'notices'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notice Board</span>
          </button>

          {isFaculty && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-300'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('antigravity')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer whitespace-nowrap border ${
              activeTab === 'antigravity'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
            title="Export Backend, Database & Antigravity Master Prompt"
          >
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span>Antigravity / Code Export</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
