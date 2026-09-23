import React, { useState } from 'react';
import {
  FileText,
  FileSearch,
  Scissors,
  Binary,
  Database,
  Search,
  Sparkles,
  Quote,
  CheckCircle2,
  ArrowDown,
  Layers,
  Cpu,
  Info,
} from 'lucide-react';

export const RagPipelineViewer: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 0,
      title: 'DOCUMENTS',
      subtitle: 'Institutional Knowledge Corpus',
      icon: FileText,
      tech: 'PDF, DOCX, TXT, Circulars',
      status: '6 Accredited College Docs',
      details: 'Authoritative student handbooks, academic regulations 2025-2026, CSE syllabus, hostel codes, fee structures, and examination circulars.',
      codeSample: `// Input Document Schema
{
  "title": "Academic Regulations 2025-2026",
  "category": "regulations",
  "effectiveDate": "August 1, 2025",
  "sections": [
    { "heading": "Mandatory Attendance (75%)", "page": 7 },
    { "heading": "10-point CGPA Scale", "page": 11 }
  ]
}`,
    },
    {
      id: 1,
      title: 'PDF Extraction',
      subtitle: 'Document Parsing & OCR',
      icon: FileSearch,
      tech: 'PyMuPDF (fitz), python-docx',
      status: 'High Fidelity Extract',
      details: 'Extracts formatted text, structural metadata, header hierarchy, and page coordinates from university PDFs and Word circulars.',
      codeSample: `# Python PyMuPDF Extraction
import fitz # PyMuPDF

doc = fitz.open("academic_regulations_2025.pdf")
for page_num in range(len(doc)):
    page = doc[page_num]
    raw_text = page.get_text("text")
    metadata = {"page": page_num + 1, "total_pages": len(doc)}`,
    },
    {
      id: 2,
      title: 'Text Cleaning',
      subtitle: 'Normalization & Noise Removal',
      icon: Scissors,
      tech: 'Regex & Unicode Cleaner',
      status: 'Normalized Whitespace',
      details: 'Removes repetitive headers/footers, watermark artifacts, fixes hyphenated line wraps, and standardizes section identifiers.',
      codeSample: `# Normalization Pipeline
clean_text = re.sub(r'\\s+', ' ', raw_text)
clean_text = re.sub(r'Page \\d+ of \\d+', '', clean_text)
clean_text = unicodedata.normalize('NFKD', clean_text)`,
    },
    {
      id: 3,
      title: 'Chunking',
      subtitle: 'Semantic Sliding Window',
      icon: Layers,
      tech: 'LangChain RecursiveCharacterSplitter',
      status: '450 chars / 60 char overlap',
      details: 'Splits long documents into coherent passages respecting sentence and paragraph boundaries with sliding-window overlap to preserve context across boundaries.',
      codeSample: `# LangChain Recursive Splitter
from langchain.text_splitter import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=450,
    chunk_overlap=60,
    separators=["\\n\\n", "\\n", ". ", " "]
)
chunks = text_splitter.create_documents(texts=[clean_text])`,
    },
    {
      id: 4,
      title: 'Embeddings',
      subtitle: 'Vector Representation',
      icon: Binary,
      tech: 'Gemini Embeddings (text-embedding-004)',
      status: 'Dense Vector Embeddings',
      details: 'Converts textual meaning into high-dimensional vector representations capturing semantic concepts (e.g. "attendance condonation" matches "medical leave").',
      codeSample: `# Gemini Embeddings API
import google.generativeai as genai

embedding = genai.embed_content(
    model="models/text-embedding-004",
    content=chunk.page_content,
    task_type="retrieval_document"
)['embedding']
# Result: [0.0241, -0.0512, 0.0883, ... 768 dims]`,
    },
    {
      id: 5,
      title: 'Vector Database',
      subtitle: 'Persistent ChromaDB Store',
      icon: Database,
      tech: 'ChromaDB + SQLite',
      status: 'Cosine Similarity Index',
      details: 'Stores chunk vectors with complete metadata (doc_id, section, page, department) for sub-millisecond approximate nearest neighbor (HNSW) retrieval.',
      codeSample: `# ChromaDB Collection Ingestion
import chromadb

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(
    name="college_handbooks",
    metadata={"hnsw:space": "cosine"}
)
collection.add(
    documents=[chunk.text],
    embeddings=[chunk.vector],
    metadatas=[{"doc_id": "reg-2025", "page": 7}],
    ids=[chunk.id]
)`,
    },
    {
      id: 6,
      title: 'RETRIEVAL',
      subtitle: 'Semantic Search & Thresholding',
      icon: Search,
      tech: 'Cosine Similarity Top-K',
      status: 'Top 4 Chunks (Threshold 0.28)',
      details: 'Calculates cosine similarity between the student query vector and all chunks. If top similarity is below threshold, triggers the Unknown Answer guardrail.',
      codeSample: `# ChromaDB Query with Distance Threshold
results = collection.query(
    query_embeddings=[query_vector],
    n_results=4,
    where={"category": "regulations"}
)
top_distance = results["distances"][0][0]
is_known = (1.0 - top_distance) >= 0.28`,
    },
    {
      id: 7,
      title: 'Relevant Context',
      subtitle: 'Context Assembly & Grounding Block',
      icon: Quote,
      tech: 'Structured Markdown Formatter',
      status: 'Bounded Context Window',
      details: 'Combines retrieved passages with precise source markers ([Source 1: Doc Title | Sec: ... | Page: X]) to prevent model hallucination.',
      codeSample: `context_block = """
[Source 1: Academic Regulations | Sec: 4.1 | Page 7]
Every student is required to maintain a minimum of 75% attendance.
Between 65% and 74.9% may apply for medical condonation ($30 fee).
Below 65% is strictly detained (Grade FA).
"""`,
    },
    {
      id: 8,
      title: 'Gemini / LLM',
      subtitle: 'Grounded Generation',
      icon: Sparkles,
      tech: 'Google Gemini 3.8 Flash',
      status: 'Temperature 0.2 (Fact-Focused)',
      details: 'Gemini 3.8 Flash synthesizes a clear, structured student response strictly bounded by the institutional context, adhering to zero-hallucination constraints.',
      codeSample: `# Gemini 3.8 Flash Generation
response = ai.models.generate_content(
    model="gemini-3.8-flash",
    contents=f"Context:\\n{context_block}\\n\\nQuery: {user_query}",
    config={
        "system_instruction": "Answer strictly using context. Cite [Doc: ..., Page: ...].",
        "temperature": 0.2
    }
)`,
    },
    {
      id: 9,
      title: 'Grounded Answer',
      subtitle: 'Student Ready Output',
      icon: CheckCircle2,
      tech: 'Synthesized Response + Guardrails',
      status: 'Formatted & Validated',
      details: 'Returns direct bullet points, policy details, deadlines, and contact information for human escalation if partially unanswered.',
      codeSample: `Answer Output:
"According to the Academic Regulations (Page 7), you must maintain
at least 75% attendance in all courses. If your attendance falls
between 65% and 74.9%, you may apply for medical condonation
with a $30 fee..."`,
    },
    {
      id: 10,
      title: 'Source Citation',
      subtitle: 'Interactive Page & Section Audit',
      icon: Quote,
      tech: 'Interactive Source Cards',
      status: 'Clickable Source Verification',
      details: 'Interactive citation badges allow the student to inspect the exact original page, paragraph excerpt, and similarity confidence score.',
      codeSample: `Citations:
- [Doc: Academic Regulations 2025-2026, Sec: 4.1, Page 7] (Score: 92%)
- [Doc: Student Code of Conduct 2025, Sec: 2.1, Page 8] (Score: 78%)`,
    },
  ];

  const current = steps[activeStep];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <Cpu className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              RAG Pipeline Architecture & Flow
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete institutional Retrieval-Augmented Generation pipeline from document ingestion to grounded citation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Active & Connected to Gemini 3.8 Flash</span>
        </div>
      </div>

      {/* Main Interactive Diagram Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step Flowchart Column (Left / Top) */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pipeline Stages (Click to Inspect)
            </span>
            <span className="text-[11px] text-indigo-600 font-mono">11 Stages</span>
          </div>

          <div className="space-y-1.5">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeStep === idx;
              return (
                <div key={step.id}>
                  <button
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left p-3 rounded-xl transition cursor-pointer flex items-center justify-between gap-3 border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50/50 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected ? 'bg-indigo-700 text-white' : 'bg-white text-indigo-600 border border-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono">
                            {idx + 1}. {step.title}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] ${
                            isSelected ? 'text-indigo-100' : 'text-slate-500'
                          }`}
                        >
                          {step.subtitle}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                        isSelected
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {step.tech.split(' ')[0]}
                    </span>
                  </button>

                  {/* Flow Arrow */}
                  {idx < steps.length - 1 && (
                    <div className="flex justify-center my-0.5 text-slate-300">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Deep-Dive Inspector (Right) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  Stage {activeStep + 1} Inspector
                </span>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>{current.title}</span>
                  <span className="text-xs font-medium text-slate-400 font-sans">
                    — {current.subtitle}
                  </span>
                </h3>
              </div>
              <span className="text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200">
                {current.status}
              </span>
            </div>

            {/* Description Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Info className="w-4 h-4 text-indigo-600" />
                <span>Operational Responsibility</span>
              </div>
              <p>{current.details}</p>
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">Framework / Dependency:</span>
                <code className="bg-slate-200 px-1.5 py-0.5 rounded text-indigo-800 font-mono">
                  {current.tech}
                </code>
              </div>
            </div>

            {/* Live Code / Spec Snippet */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Production Implementation Spec
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Python / TypeScript</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 text-xs font-mono leading-relaxed overflow-x-auto border border-slate-800 shadow-inner">
                {current.codeSample}
              </pre>
            </div>
          </div>

          {/* Navigation between steps */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              disabled={activeStep === 0}
              onClick={() => setActiveStep(prev => prev - 1)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
            >
              Previous Stage
            </button>
            <span className="text-xs text-slate-500 font-mono">
              Stage {activeStep + 1} of {steps.length}
            </span>
            <button
              disabled={activeStep === steps.length - 1}
              onClick={() => setActiveStep(prev => prev + 1)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 cursor-pointer shadow-xs"
            >
              Next Stage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
