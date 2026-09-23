import {
  CollegeDoc,
  DocumentChunk,
  Notice,
  AnalyticsStats,
  RAGQueryPayload,
  User,
  UserRole,
} from '../types';

export const api = {
  // Auth
  async login(email?: string, role: UserRole = 'student'): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    return res.json();
  },

  // Documents
  async getDocuments(): Promise<{ success: boolean; documents: CollegeDoc[] }> {
    const res = await fetch('/api/documents');
    return res.json();
  },

  async getDocument(id: string): Promise<{ success: boolean; document: CollegeDoc }> {
    const res = await fetch(`/api/documents/${id}`);
    return res.json();
  },

  async getDocumentChunks(id: string): Promise<{ success: boolean; chunks: DocumentChunk[]; total: number }> {
    const res = await fetch(`/api/documents/${id}/chunks`);
    return res.json();
  },

  async uploadDocument(data: {
    title: string;
    category: string;
    department?: string;
    description?: string;
    content: string;
    author?: string;
    pages?: number;
  }): Promise<{ success: boolean; message: string; document: CollegeDoc }> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteDocument(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // RAG Query
  async queryRAG(payload: RAGQueryPayload): Promise<{
    success: boolean;
    answer: string;
    isUnknownAnswer: boolean;
    citations: any[];
    retrievalMetadata: {
      chunksRetrieved: number;
      topSimilarity: number;
      latencyMs: number;
      modelUsed: string;
    };
  }> {
    const res = await fetch('/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Notices
  async getNotices(params?: { category?: string; search?: string }): Promise<{ success: boolean; notices: Notice[] }> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    const res = await fetch(`/api/notices?${searchParams.toString()}`);
    return res.json();
  },

  async publishNotice(notice: Partial<Notice>): Promise<{ success: boolean; notice: Notice }> {
    const res = await fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notice),
    });
    return res.json();
  },

  // Analytics
  async getAnalytics(): Promise<{ success: boolean; stats: AnalyticsStats; recentQueries: any[] }> {
    const res = await fetch('/api/analytics');
    return res.json();
  },

  // Antigravity & Python Code Exporter
  async getAntigravityExport(): Promise<{
    success: boolean;
    pythonFastAPIMain: string;
    antigravityMasterPrompt: string;
  }> {
    const res = await fetch('/api/antigravity/code');
    return res.json();
  },
};
