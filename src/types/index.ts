export type UserRole = 'student' | 'faculty_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  studentId?: string;
  avatarUrl?: string;
}

export interface DocumentSection {
  sectionId: string;
  heading: string;
  page: number;
  content: string;
}

export interface CollegeDoc {
  id: string;
  title: string;
  category: 'handbook' | 'regulations' | 'syllabus' | 'notices' | 'fees' | 'hostel';
  version: string;
  effectiveDate: string;
  department: string;
  author: string;
  pages: number;
  description: string;
  sections: DocumentSection[];
  totalChunks?: number;
  sectionCount?: number;
  isIndexed?: boolean;
  uploadedAt?: string;
}

export interface DocumentChunk {
  chunkId: string;
  docId: string;
  docTitle: string;
  category: string;
  sectionId: string;
  heading: string;
  page: number;
  chunkIndex: number;
  text: string;
  charCount: number;
  wordCount: number;
  embedding?: number[];
  embeddingPreview?: number[];
  similarityScore?: number;
}

export interface Citation {
  id: string;
  docId: string;
  docTitle: string;
  category: string;
  heading: string;
  page: number;
  sectionId: string;
  similarityScore: number;
  excerpt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isUnknownAnswer?: boolean;
  citations?: Citation[];
  retrievalMetadata?: {
    chunksRetrieved: number;
    topSimilarity: number;
    latencyMs: number;
    modelUsed: string;
  };
}

export interface Notice {
  id: string;
  title: string;
  refNo: string;
  date: string;
  department: string;
  category: 'exam' | 'academic' | 'placement' | 'fees' | 'hostel' | 'urgent';
  priority: 'high' | 'normal' | 'urgent';
  summary: string;
  fullText: string;
  page: number;
  docId: string;
}

export interface AnalyticsStats {
  totalQueries: number;
  groundedQueries: number;
  unknownAnswerCount: number;
  groundedAccuracyRate: number;
  avgLatencyMs: number;
  totalDocuments: number;
  totalChunks: number;
  vectorDbStatus: 'connected' | 'indexing' | 'idle';
  collectionName: string;
}

export interface RAGQueryPayload {
  query: string;
  categoryFilter?: string;
  targetDocId?: string;
  topK?: number;
  threshold?: number;
}
