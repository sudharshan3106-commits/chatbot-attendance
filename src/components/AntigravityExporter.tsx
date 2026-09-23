import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  Server,
  Layers,
  FileCode,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  GitBranch,
  Globe,
} from 'lucide-react';

export const AntigravityExporter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'main_py' | 'rag_py' | 'database_py' | 'requirements' | 'postman' | 'deploy'>('prompt');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const ANTIGRAVITY_MASTER_PROMPT = `You are a Senior Principal AI & Full-Stack Architect.
Implement and generate a complete, decoupled 3-tier production project for "CampusIQ - College Knowledge Assistant" with strict separation of concerns:

TIER 1: FRONTEND (React.js + Vite + Tailwind CSS + TypeScript)
- Purpose: Student conversational assistant with instant citation inspection, Document Hub, Notice Board, and Admin Dashboard.
- Features:
  * Strict grounded answer rendering with markdown lists and emphasis.
  * Interactive citation chips linking directly to document title, section heading, and page number.
  * Unknown Answer Guardrail handling: Displays clear institutional escalation paths if similarity score is below threshold.
  * Voice synthesis playback via Web Speech API.
  * Category filtering (Academic Regulations, Handbook, Syllabus, Fees, Hostel, Circulars).
  * Vercel-ready with vercel.json.

TIER 2: BACKEND (Python 3.11 + FastAPI + LangChain + ChromaDB + Google Gemini)
- Purpose: High-performance asynchronous REST API handling PDF extraction, chunking, embedding generation, vector search, and grounded response generation.
- Technology Stack:
  * FastAPI with CORS middleware and Pydantic validation.
  * LangChain RecursiveCharacterTextSplitter (chunk_size=450, chunk_overlap=60).
  * PyMuPDF (fitz) and python-docx for document parsing.
  * ChromaDB PersistentClient for cosine similarity vector storage.
  * Google Gemini (gemini-3.8-flash for generation, text-embedding-004 for embeddings).
  * PyJWT & Passlib for student and faculty authentication.
  * Render-ready Dockerfile and render.yaml.

TIER 3: DATABASE
  * Vector Database: ChromaDB collection "college_handbooks" using cosine distance.
  * Relational Database: SQLite ("college_knowledge.db") for user accounts, document metadata, audit logs, and unknown answer tracking.

TESTING & DEPLOYMENT:
  * Postman collection with automated test scripts.
  * Deployment: Frontend on Vercel, Backend on Render (free tier compatible).

Please output the directory structure and each source file completely with zero placeholders or omissions.`;

  const MAIN_PY_CODE = `"""
CampusIQ - College Knowledge Assistant
FastAPI Backend with ChromaDB, SQLite, and Google Gemini
"""

import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
import google.generativeai as genai
import sqlite3
import jwt
from datetime import datetime

# Environment setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "campusiq-secret-key-321")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(
    title="CampusIQ API",
    version="1.0.0",
    description="RAG-powered Knowledge Assistant for College Handbooks, Regulations & Syllabus"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ChromaDB Vector Client
chroma_client = chromadb.PersistentClient(path="./chroma_data")
knowledge_collection = chroma_client.get_or_create_collection(
    name="college_handbooks",
    metadata={"hnsw:space": "cosine"}
)

# Pydantic Schemas
class QueryRequest(BaseModel):
    query: str
    category_filter: Optional[str] = "all"
    top_k: int = 4
    threshold: float = 0.28

class Citation(BaseModel):
    doc_id: str
    doc_title: str
    category: str
    heading: str
    page: int
    score: float
    excerpt: str

class QueryResponse(BaseModel):
    answer: str
    is_unknown_answer: bool
    citations: List[Citation]
    retrieval_count: int
    latency_ms: int

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CampusIQ Backend",
        "vector_db": "ChromaDB",
        "llm": "Google Gemini 3.8 Flash"
    }

@app.post("/api/rag/query", response_model=QueryResponse)
async def handle_student_query(payload: QueryRequest):
    import time
    start_time = time.time()
    clean_query = payload.query.strip()
    
    if not clean_query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # 1. Embed student query via Gemini text-embedding-004
    try:
        embed_res = genai.embed_content(
            model="models/text-embedding-004",
            content=clean_query,
            task_type="retrieval_query"
        )
        query_vector = embed_res["embedding"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding error: {str(e)}")

    # 2. Vector Search in ChromaDB
    where_filter = {"category": payload.category_filter} if payload.category_filter != "all" else None
    results = knowledge_collection.query(
        query_embeddings=[query_vector],
        n_results=payload.top_k,
        where=where_filter
    )

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    # 3. Check Unknown Answer Threshold
    top_distance = distances[0] if len(distances) > 0 else 1.0
    top_similarity = round(1.0 - top_distance, 3)

    if not documents or top_similarity < payload.threshold:
        latency = int((time.time() - start_time) * 1000)
        return QueryResponse(
            answer=(
                f"I am unable to find verified information regarding '{clean_query}' in current college documents.\\n\\n"
                "Please escalate your query to the Office of the Academic Registrar (registrar@campus.edu) "
                "or consult your Departmental Advisor."
            ),
            is_unknown_answer=True,
            citations=[],
            retrieval_count=0,
            latency_ms=latency
        )

    # 4. Assemble Grounded Context & Citations
    context_chunks = []
    citations = []
    for doc_text, meta, dist in zip(documents, metadatas, distances):
        sim = round(1.0 - dist, 3)
        context_chunks.append(f"[Source: {meta.get('title')} | Sec: {meta.get('heading')} | Page: {meta.get('page')}]\\n{doc_text}")
        citations.append(Citation(
            doc_id=str(meta.get("doc_id", "")),
            doc_title=str(meta.get("title", "")),
            category=str(meta.get("category", "")),
            heading=str(meta.get("heading", "")),
            page=int(meta.get("page", 1)),
            score=sim,
            excerpt=doc_text[:200] + "..."
        ))

    context_str = "\\n\\n---\\n\\n".join(context_chunks)

    # 5. Gemini 3.8 Flash Grounded Answer
    system_prompt = (
        "You are CampusIQ, the official College Knowledge Assistant. "
        "Strictly answer using only the provided institutional context chunks. "
        "Always cite sources in brackets like [Doc: ..., Sec: ..., Page: ...]. "
        "If details are not in the text, explicitly state they are not available."
    )
    
    model = genai.GenerativeModel(
        model_name="models/gemini-3.8-flash",
        system_instruction=system_prompt
    )

    prompt = f"STUDENT QUERY: {clean_query}\\n\\nCOLLEGE CONTEXT:\\n{context_str}\\n\\nGROUNDED ANSWER:"
    gen_response = model.generate_content(prompt)
    latency = int((time.time() - start_time) * 1000)

    return QueryResponse(
        answer=gen_response.text,
        is_unknown_answer=False,
        citations=citations,
        retrieval_count=len(documents),
        latency_ms=latency
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)`;

  const RAG_PY_CODE = `"""
CampusIQ - Document Ingestion & Chunking Pipeline
Using PyMuPDF, python-docx, and LangChain
"""

import fitz  # PyMuPDF
import docx
from langchain.text_splitter import RecursiveCharacterTextSplitter
import google.generativeai as genai

class CollegeDocumentProcessor:
    def __init__(self, chunk_size: int = 450, chunk_overlap: int = 60):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\\n\\n", "\\n", ". ", " "]
        )

    def extract_pdf(self, file_path: str):
        doc = fitz.open(file_path)
        pages_content = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text").strip()
            if text:
                pages_content.append({"page": page_num + 1, "text": text})
        return pages_content

    def extract_docx(self, file_path: str):
        doc = docx.Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text.strip())
        return [{"page": 1, "text": "\\n".join(full_text)}]

    def chunk_and_embed(self, doc_id: str, title: str, category: str, pages_data: list):
        chunks = []
        for page_data in pages_data:
            page_chunks = self.splitter.split_text(page_data["text"])
            for idx, text in enumerate(page_chunks):
                # Generate embedding
                embed_res = genai.embed_content(
                    model="models/text-embedding-004",
                    content=text,
                    task_type="retrieval_document"
                )
                chunks.append({
                    "id": f"{doc_id}-p{page_data['page']}-c{idx}",
                    "text": text,
                    "embedding": embed_res["embedding"],
                    "metadata": {
                        "doc_id": doc_id,
                        "title": title,
                        "category": category,
                        "page": page_data["page"],
                        "heading": f"Section Page {page_data['page']}"
                    }
                })
        return chunks`;

  const DATABASE_PY_CODE = `"""
CampusIQ - SQLite Database Layer
Handles User authentication, Document catalog & Query audit logs
"""

import sqlite3

def init_database(db_path: str = "college_knowledge.db"):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Users Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'faculty_admin')),
        department TEXT,
        student_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Documents Catalog
    cur.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        version TEXT,
        department TEXT,
        pages INTEGER,
        is_indexed BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Query Audit Logs
    cur.execute("""
    CREATE TABLE IF NOT EXISTS query_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        category TEXT,
        is_grounded BOOLEAN,
        top_similarity REAL,
        latency_ms INTEGER,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_database()
    print("SQLite database initialized successfully.")`;

  const REQUIREMENTS_TXT = `fastapi==0.115.0
uvicorn[standard]==0.31.0
google-generativeai==0.8.3
chromadb==0.5.15
langchain==0.3.3
langchain-community==0.3.2
PyMuPDF==1.24.11
python-docx==1.1.2
pyjwt==2.9.0
pydantic==2.9.2
python-dotenv==1.0.1`;

  const POSTMAN_COLLECTION = `{
  "info": {
    "name": "CampusIQ RAG API",
    "description": "Postman test suite for College Knowledge Assistant",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{BASE_URL}}/health"
      }
    },
    {
      "name": "Query RAG (Attendance Rules)",
      "request": {
        "method": "POST",
        "url": "{{BASE_URL}}/api/rag/query",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\\n  \\"query\\": \\"What is the minimum attendance percentage required for exams?\\",\\n  \\"category_filter\\": \\"regulations\\",\\n  \\"top_k\\": 4,\\n  \\"threshold\\": 0.28\\n}"
        }
      }
    },
    {
      "name": "Query RAG (Unknown Guardrail Test)",
      "request": {
        "method": "POST",
        "url": "{{BASE_URL}}/api/rag/query",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\\n  \\"query\\": \\"Can students fly camera drones on campus sports fields?\\",\\n  \\"top_k\\": 4,\\n  \\"threshold\\": 0.35\\n}"
        }
      }
    },
    {
      "name": "Get Documents",
      "request": {
        "method": "GET",
        "url": "{{BASE_URL}}/api/documents"
      }
    },
    {
      "name": "Get Notices",
      "request": {
        "method": "GET",
        "url": "{{BASE_URL}}/api/notices"
      }
    }
  ]
}`;

  const DEPLOY_GUIDE = `# DEPLOYMENT GUIDE: VERCEL (FRONTEND) + RENDER (BACKEND)

### Step 1: Push Code to GitHub
git init
git add .
git commit -m "feat: complete CampusIQ 3-tier education assistant"
git branch -M main
git remote add origin https://github.com/your-username/campus-iq.git
git push -u origin main

---

### Step 2: Deploy Backend on Render
1. Go to https://dashboard.render.com/ and create a New Web Service.
2. Connect your GitHub repository and select the 'backend/' directory (or root if using Dockerfile).
3. Runtime: Python 3.11 (or Docker)
   - Build Command: pip install -r requirements.txt
   - Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
4. Configure Environment Variables in Render:
   - GEMINI_API_KEY = <Your_Gemini_API_Key>
   - JWT_SECRET_KEY = <Secret_String>
   - PYTHON_VERSION = 3.11.9
5. Copy your Render service URL (e.g., https://campus-iq-backend.onrender.com).

---

### Step 3: Deploy Frontend on Vercel
1. Go to https://vercel.com/new and import the GitHub repository.
2. Set Root Directory to 'frontend/' (or '.').
3. Framework Preset: Vite
4. Add Environment Variable:
   - VITE_API_BASE_URL = https://campus-iq-backend.onrender.com
5. Click 'Deploy'. Your student knowledge portal is live!`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Code2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Multi-Tier Code & Antigravity Exporter
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Export standalone Python FastAPI backend, ChromaDB vector store, SQLite database, Postman collection, and Antigravity master prompt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ready to Feed to Antigravity</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'prompt', label: 'Antigravity Master Prompt', icon: Sparkles },
          { id: 'main_py', label: 'backend/main.py', icon: Server },
          { id: 'rag_py', label: 'backend/rag_pipeline.py', icon: Layers },
          { id: 'database_py', label: 'backend/database.py', icon: FileCode },
          { id: 'requirements', label: 'requirements.txt', icon: Terminal },
          { id: 'postman', label: 'Postman Collection', icon: Globe },
          { id: 'deploy', label: 'Vercel + Render Deploy', icon: GitBranch },
        ].map(tab => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                isSel
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Code Viewer Area */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
        {/* Editor Toolbar */}
        <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            <span className="font-mono text-slate-300 ml-2 font-semibold">
              {activeTab === 'prompt' && 'antigravity_master_spec.txt'}
              {activeTab === 'main_py' && 'backend/main.py'}
              {activeTab === 'rag_py' && 'backend/rag_pipeline.py'}
              {activeTab === 'database_py' && 'backend/database.py'}
              {activeTab === 'requirements' && 'backend/requirements.txt'}
              {activeTab === 'postman' && 'campus_iq_postman_collection.json'}
              {activeTab === 'deploy' && 'DEPLOYMENT_GUIDE.md'}
            </span>
          </div>

          <button
            onClick={() => {
              const textMap: Record<string, string> = {
                prompt: ANTIGRAVITY_MASTER_PROMPT,
                main_py: MAIN_PY_CODE,
                rag_py: RAG_PY_CODE,
                database_py: DATABASE_PY_CODE,
                requirements: REQUIREMENTS_TXT,
                postman: POSTMAN_COLLECTION,
                deploy: DEPLOY_GUIDE,
              };
              handleCopy(activeTab, textMap[activeTab]);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            {copied === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy File Contents</span>
              </>
            )}
          </button>
        </div>

        {/* Editor Code Content */}
        <pre className="p-6 text-xs text-slate-200 font-mono leading-relaxed overflow-x-auto max-h-[580px] overflow-y-auto selection:bg-indigo-600 selection:text-white">
          {activeTab === 'prompt' && ANTIGRAVITY_MASTER_PROMPT}
          {activeTab === 'main_py' && MAIN_PY_CODE}
          {activeTab === 'rag_py' && RAG_PY_CODE}
          {activeTab === 'database_py' && DATABASE_PY_CODE}
          {activeTab === 'requirements' && REQUIREMENTS_TXT}
          {activeTab === 'postman' && POSTMAN_COLLECTION}
          {activeTab === 'deploy' && DEPLOY_GUIDE}
        </pre>
      </div>
    </div>
  );
};
