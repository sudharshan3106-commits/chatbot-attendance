import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatAssistant } from './components/ChatAssistant';
import { DocumentManager } from './components/DocumentManager';
import { RagPipelineViewer } from './components/RagPipelineViewer';
import { NoticesBoard } from './components/NoticesBoard';
import { AdminDashboard } from './components/AdminDashboard';
import { AntigravityExporter } from './components/AntigravityExporter';
import { CitationDrawer } from './components/CitationDrawer';
import { User, Citation, UserRole } from './types';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr-stud-108',
    name: 'Sudharshan Raman (Student)',
    email: 'sudharshan.cs@campus.edu',
    role: 'student',
    department: 'Computer Science & Engineering',
    studentId: 'CS2023-BTECH-084',
  });
  const [totalDocs, setTotalDocs] = useState<number>(6);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [targetDocId, setTargetDocId] = useState<string | null>(null);
  const [prefilledQuery, setPrefilledQuery] = useState<string | null>(null);

  // Load documents count on startup
  useEffect(() => {
    api.getDocuments().then(res => {
      if (res.success && res.documents) {
        setTotalDocs(res.documents.length);
      }
    }).catch(err => console.error('Failed to get initial docs:', err));
  }, []);

  const handleSwitchRole = (newRole: UserRole) => {
    api.login(
      newRole === 'faculty_admin' ? 'admin.registrar@campus.edu' : 'sudharshan.cs@campus.edu',
      newRole
    ).then(res => {
      if (res.success) {
        setCurrentUser(res.user);
      }
    });
  };

  const handleOpenDocumentFromCitation = (docId: string) => {
    setTargetDocId(docId);
    setActiveTab('documents');
  };

  const handleAskAboutNotice = (query: string) => {
    setPrefilledQuery(query);
    setActiveTab('chat');
  };

  const handleAskAboutDoc = (docId: string, initialQuery?: string) => {
    setTargetDocId(docId);
    if (initialQuery) {
      setPrefilledQuery(initialQuery);
    }
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        totalDocs={totalDocs}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'chat' && (
          <ChatAssistant
            currentUser={currentUser}
            onSelectCitation={citation => setSelectedCitation(citation)}
            onNavigateToDocument={handleOpenDocumentFromCitation}
            initialDocId={targetDocId}
            prefilledQuery={prefilledQuery}
            onClearPrefill={() => {
              setPrefilledQuery(null);
            }}
            onDocumentAdded={() => {
              api.getDocuments().then(res => {
                if (res.success) setTotalDocs(res.documents.length);
              });
            }}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentManager
            currentUser={currentUser}
            onRefreshDocs={() => {
              api.getDocuments().then(res => {
                if (res.success) setTotalDocs(res.documents.length);
              });
            }}
            selectedDocId={targetDocId}
            onAskAboutDocument={handleAskAboutDoc}
          />
        )}

        {activeTab === 'pipeline' && <RagPipelineViewer />}

        {activeTab === 'notices' && (
          <NoticesBoard
            currentUser={currentUser}
            onAskAboutNotice={handleAskAboutNotice}
          />
        )}

        {activeTab === 'admin' && <AdminDashboard currentUser={currentUser} />}

        {activeTab === 'antigravity' && <AntigravityExporter />}
      </main>

      {/* Slide-over Citation Inspector */}
      <CitationDrawer
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
        onOpenDocument={handleOpenDocumentFromCitation}
      />
    </div>
  );
}
