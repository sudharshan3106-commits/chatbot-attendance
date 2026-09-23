export interface CollegeDocument {
  id: string;
  title: string;
  category: 'handbook' | 'regulations' | 'syllabus' | 'notices' | 'fees' | 'hostel';
  version: string;
  effectiveDate: string;
  department: string;
  author: string;
  pages: number;
  description: string;
  sections: {
    sectionId: string;
    heading: string;
    page: number;
    content: string;
  }[];
}

export const SEED_COLLEGE_DOCUMENTS: CollegeDocument[] = [
  {
    id: 'doc-reg-2025',
    title: 'Academic Regulations & Examination Policy 2025-2026',
    category: 'regulations',
    version: 'v4.2',
    effectiveDate: 'August 1, 2025',
    department: 'Office of the Academic Registrar',
    author: 'Dean of Academic Affairs',
    pages: 36,
    description: 'Core institutional rules governing attendance requirements, grading scale (10-point CGPA), examination rules, re-evaluation, and graduation criteria.',
    sections: [
      {
        sectionId: 'sec-4.1',
        heading: 'Mandatory Minimum Attendance Requirements',
        page: 7,
        content: `Every registered student is required to maintain a minimum of 75% physical attendance in each registered theory and laboratory course. Students having attendance between 65% and 74.9% may apply for attendance condonation strictly on valid medical grounds or verified institutional representation in sports/cultural events, accompanied by a fee of $30 per course and hospital discharge summaries approved by the Chief Medical Officer. Students with attendance below 65% are strictly detained (Grade FA - Failure due to Attendance) and must re-register for the course in subsequent summer or regular semesters. No exemption is granted under any circumstances below 65%.`
      },
      {
        sectionId: 'sec-4.2',
        heading: 'Grading Scale and CGPA Calculation',
        page: 11,
        content: `The institution operates on a 10-point relative and absolute grading scale:
O (Outstanding): 10 grade points (Marks >= 90%)
A+ (Excellent): 9 grade points (Marks 80-89%)
A (Very Good): 8 grade points (Marks 70-79%)
B+ (Good): 7 grade points (Marks 60-69%)
B (Above Average): 6 grade points (Marks 50-59%)
C (Average): 5 grade points (Marks 45-49%)
P (Pass): 4 grade points (Marks 40-44%)
F (Fail): 0 grade points (Marks < 40%)
FA: Failure due to lack of attendance (0 points).
Cumulative Grade Point Average (CGPA) = Sum of (Course Credits × Grade Points) / Total Earned Credits across all completed semesters.`
      },
      {
        sectionId: 'sec-4.3',
        heading: 'Internal Assessment and Evaluation Weightage',
        page: 14,
        content: `Continuous Internal Assessment (CIA) accounts for 40% of the total course weightage, comprising two mid-semester tests (20%), continuous quizzes/assignments (10%), and lab work/mini-projects (10%). The End-Semester University Examination accounts for the remaining 60%. A student must secure at least 40% in the End-Semester Examination and an aggregate of 40% across CIA and End-Semester combined to successfully pass the course.`
      },
      {
        sectionId: 'sec-4.4',
        heading: 'Re-evaluation, Script Inspection & Supplementary Exams',
        page: 18,
        content: `Students dissatisfied with their end-semester theory grades may apply for Answer Script Photocopy Inspection within 7 business days of result declaration with a non-refundable fee of $20 per course. Formal re-evaluation may be requested within 14 days of photocopy delivery at $45 per subject. If the re-evaluated mark deviates by 15% or more from the original score, the answer script is routed to a third independent examiner, and the average of the two closest marks becomes final. Supplementary/Arrear examinations are conducted twice annually, during January and July inter-semester breaks.`
      },
      {
        sectionId: 'sec-4.5',
        heading: 'Graduation Requirements & Honors Degree Criteria',
        page: 24,
        content: `To be eligible for the award of Bachelor of Technology (B.Tech) degree, a candidate must earn a minimum of 160 academic credits within a maximum duration of 6 academic years (12 semesters). To qualify for B.Tech (Honors) or B.Tech with Minor, students must maintain a minimum CGPA of 8.25 with zero backlogs/arrears and complete an additional 18-20 credits in specialized or interdisciplinary courses by the 8th semester.`
      }
    ]
  },
  {
    id: 'doc-handbook-2025',
    title: 'Student Code of Conduct & Campus Handbook 2025',
    category: 'handbook',
    version: 'v5.0',
    effectiveDate: 'July 15, 2025',
    department: 'Student Affairs & Welfare',
    author: 'Chief Proctor & Dean of Student Life',
    pages: 42,
    description: 'Code of conduct, campus disciplinary guidelines, zero-tolerance anti-ragging policies, ID card rules, library privileges, and student grievance redressal.',
    sections: [
      {
        sectionId: 'sec-1.2',
        heading: 'Anti-Ragging and Zero-Tolerance Policy',
        page: 4,
        content: `The college maintains an absolute ZERO-TOLERANCE policy towards ragging, harassment, cyberbullying, or discrimination of any form. Ragging is a cognizable criminal offense punishable under State and Federal law. Any student found engaging in, inciting, or tacitly observing acts of ragging will face immediate suspension, rustication from hostels, expulsion from the college, and automatic reporting to local law enforcement. The 24/7 Anti-Ragging Helpline is +1-800-CAMPUS-CARE (ext. 911), and anonymous complaints can be lodged via the Student Welfare portal.`
      },
      {
        sectionId: 'sec-2.1',
        heading: 'Campus ID Card and Access Security',
        page: 8,
        content: `All registered students must wear their official RFID Campus Smart ID card visibly while inside campus buildings, laboratories, dining halls, and academic blocks. Loss of the ID card must be reported immediately to the Security Office (Gate 1). A replacement ID card is issued by the IT Helpdesk upon payment of a $15 administrative replacement fee and submission of Dean approval. Lending or borrowing ID cards is a serious honor-code violation leading to a 2-week library suspension.`
      },
      {
        sectionId: 'sec-3.4',
        heading: 'Central Library Regulations and Loan Limits',
        page: 16,
        content: `The Central Library is open on weekdays from 8:00 AM to 11:00 PM, and on weekends/holidays from 9:00 AM to 8:00 PM. During examination weeks, reading halls remain open 24 hours. Undergraduate students may borrow up to 4 books simultaneously for a duration of 14 calendar days. Postgraduate and research scholars may borrow up to 8 books for 28 days. Overdue fines are accrued at $0.50 per day per book. Reference textbooks, journal print archives, and rare manuscripts cannot be taken out of library premises.`
      },
      {
        sectionId: 'sec-5.1',
        heading: 'Student Grievance Redressal Mechanism',
        page: 29,
        content: `Students with academic, infrastructural, or administrative grievances should first submit a ticket through the Campus Portal. If unresolved within 5 working days, the case escalates to the Departmental Grievance Committee headed by the HOD. Final appeals are heard by the Institutional Ombudsman, which convenes on the second and fourth Friday of every month. Whistleblower protection and confidential counseling are guaranteed for all complainants.`
      }
    ]
  },
  {
    id: 'doc-syllabus-cs-2025',
    title: 'B.Tech Computer Science & Engineering Curriculum & Syllabus',
    category: 'syllabus',
    version: 'Rev-2025',
    effectiveDate: 'June 2025',
    department: 'Department of Computer Science & Engineering',
    author: 'Curriculum & Board of Studies (BOS)',
    pages: 64,
    description: 'Detailed syllabus, course codes, prerequisite graphs, weekly modules, recommended textbooks, and laboratory practical frameworks for CS majors.',
    sections: [
      {
        sectionId: 'cs-201',
        heading: 'CS201: Data Structures and Algorithms (4 Credits)',
        page: 12,
        content: `Course Code: CS201 | L-T-P: 3-0-2 | Credits: 4 | Prerequisites: CS101 Introduction to Computing.
Module 1: Analysis of Algorithms, Asymptotic Notations (Big-O, Omega, Theta), Recurrence relations.
Module 2: Linear Data Structures: Arrays, Doubly Linked Lists, Circular Queues, Stacks, Applications (Expression Evaluation, Tower of Hanoi).
Module 3: Non-Linear Structures: Binary Trees, AVL Trees, Red-Black Trees, B-Trees, Binary Heaps and Priority Queues.
Module 4: Graphs: BFS, DFS, Dijkstra Shortest Path, Bellman-Ford, Kruskal and Prim Minimum Spanning Trees.
Module 5: Dynamic Programming & Greedy: Knapsack, LCS, Matrix Chain Multiplication.
Textbooks: 'Introduction to Algorithms' by Cormen, Leiserson, Rivest, Stein (CLRS); 'Data Structures and Algorithms in C++' by Goodrich.
Laboratory: 14 weekly programming sessions in C++/Python implementing custom data structures and competitive benchmarking.`
      },
      {
        sectionId: 'cs-301',
        heading: 'CS301: Operating Systems & Systems Programming (4 Credits)',
        page: 26,
        content: `Course Code: CS301 | L-T-P: 3-0-2 | Credits: 4 | Prerequisites: CS201 & CS204 Computer Architecture.
Module 1: OS Architecture, System Calls, Dual-mode execution, Process Management and PCB.
Module 2: CPU Scheduling Algorithms (FCFS, SJF, Round Robin, Multilevel Feedback Queues), Inter-Process Communication (Pipes, Shared Memory).
Module 3: Concurrency & Synchronization: Critical Section Problem, Peterson Solution, Semaphores, Mutex Locks, Deadlock Detection and Banker's Algorithm.
Module 4: Memory Management: Paging, Segmentation, TLB, Virtual Memory, Demand Paging, Page Replacement Algorithms (FIFO, LRU, Optimal).
Module 5: Storage and File Systems: Inode structures, Disk scheduling (SSTF, SCAN, C-SCAN), Distributed file systems (NFS).
Laboratory: Unix kernel programming, POSIX threads, xv6 system call additions, memory allocator design.`
      },
      {
        sectionId: 'cs-415',
        heading: 'CS415: Applied Machine Learning & Neural Networks (3 Credits)',
        page: 44,
        content: `Course Code: CS415 | L-T-P: 3-0-0 | Credits: 3 | Elective Track: Artificial Intelligence.
Topics: Supervised Learning (Linear/Logistic Regression, Support Vector Machines, Decision Trees, Random Forests, XGBoost).
Unsupervised Learning: K-Means clustering, PCA dimensionality reduction, Gaussian Mixture Models.
Deep Learning: Multi-Layer Perceptrons, Backpropagation calculus, Convolutional Neural Networks (CNNs) for vision, Transformers and Attention mechanisms for NLP.
Project Component: Capstone machine learning project with real-world dataset submission, ablation study, and peer review presentation.`
      }
    ]
  },
  {
    id: 'doc-hostel-2025',
    title: 'Hostel Regulations & Residential Community Guidelines 2025',
    category: 'hostel',
    version: 'v3.1',
    effectiveDate: 'August 2025',
    department: 'Campus Housing & Residential Life',
    author: 'Chief Warden',
    pages: 20,
    description: 'Residential policies, hostel curfew timings, night-out leave procedures, mess meal timings, prohibited appliances, and visitor rules.',
    sections: [
      {
        sectionId: 'hostel-3.1',
        heading: 'Hostel Entry Curfew Timings & Biometric Attendance',
        page: 5,
        content: `All student residents must return to their designated hostel premises by 9:30 PM on Sunday through Thursday, and by 10:30 PM on Fridays and Saturdays. Biometric fingerprint/facial recognition turnstiles mark mandatory evening attendance between 9:30 PM and 10:15 PM daily. Late entry past curfew requires a written late slip signed by the Resident Tutor. Accruing 3 unexcused late entries in a semester triggers a mandatory meeting with the Chief Warden and notification to parents/guardians.`
      },
      {
        sectionId: 'hostel-3.2',
        heading: 'Night-Out and Weekend Leave Application Process',
        page: 8,
        content: `Residents desiring to stay outside campus overnight or travel home during weekends must apply via the 'Campus Housing Portal' at least 24 hours prior to departure. Approval requires electronic two-factor confirmation from the registered parent or local guardian mobile number. Students must check out at the hostel security gate with their digital leave pass QR code and check back in immediately upon return.`
      },
      {
        sectionId: 'hostel-4.1',
        heading: 'Mess Timings, Dietary Plans & Rebate Policy',
        page: 12,
        content: `Dining hall meal timings are:
Breakfast: 7:15 AM - 9:00 AM (9:30 AM on Sundays)
Lunch: 12:00 PM - 2:00 PM
Evening Tea & Snacks: 4:30 PM - 5:45 PM
Dinner: 7:30 PM - 9:30 PM
Mess Rebate: Students away from campus for 5 or more continuous calendar days with an approved academic or medical leave pass are eligible for a mess rebate of $4.50 per day, credited against the subsequent month's mess ledger.`
      },
      {
        sectionId: 'hostel-5.2',
        heading: 'Prohibited Items and Safety Protocols',
        page: 15,
        content: `The following items are strictly prohibited inside hostel rooms: electric heaters, hot plates, induction stoves, immersion rods, air conditioners, pets, fireworks, alcohol, tobacco, and illegal substances. Electrical inspections are conducted monthly. Possession of prohibited electrical heating elements incurs an immediate confiscation and a $50 safety penalty.`
      }
    ]
  },
  {
    id: 'doc-fees-2025',
    title: 'Tuition Fee Structure, Payment Schedule & Scholarships 2025-2026',
    category: 'fees',
    version: 'Circular-2025/08',
    effectiveDate: 'June 1, 2025',
    department: 'Finance and Accounts Department',
    author: 'Chief Financial Officer',
    pages: 18,
    description: 'Semester tuition fees, installment plans, late fee schedule, refund policy on withdrawal, Dean Merit Scholarships, and need-based tuition waivers.',
    sections: [
      {
        sectionId: 'fees-1.1',
        heading: 'Semester Tuition and Campus Facilities Fee Schedule',
        page: 3,
        content: `Undergraduate Tuition Fee (per semester): $3,800 for domestic students, $6,500 for international students.
Mandatory Semester Amenities & Lab Fee: $450.
Campus Health Insurance & Wellness Fee: $120.
Hostel Accommodation (Double Occupancy): $1,100 per semester.
Mess Advance: $950 per semester.
Tuition fee payment for the Fall semester must be completed on or before August 10. Tuition fee payment for the Spring semester must be completed on or before January 10.`
      },
      {
        sectionId: 'fees-2.1',
        heading: 'Late Fine Schedule and Installment Options',
        page: 6,
        content: `A late payment fine of $25 is levied for payments made within 7 days past the deadline. Payments delayed by 8 to 21 days incur a late fine of $60. If dues remain unpaid 21 days past the due date, the student's portal access is temporarily suspended, preventing course registration and exam hall ticket generation. Students facing genuine financial hardship may apply for a 2-part installment plan via the Accounts Office prior to the original due date.`
      },
      {
        sectionId: 'fees-3.3',
        heading: 'Dean Merit Scholarships and Financial Assistance',
        page: 10,
        content: `Dean's Academic Excellence Scholarship: Awarded to top 5% students in each branch who secure a CGPA >= 9.20 with no backlogs, granting a 50% tuition fee waiver for the subsequent academic year.
Need-Based Financial Aid: Open to students whose annual family income is below $30,000, offering 25% to 75% tuition assistance upon committee verification of tax filings.
Sports and Cultural Excellence Concession: Up to 40% waiver for state/national medalists.`
      },
      {
        sectionId: 'fees-4.2',
        heading: 'Institutional Fee Refund Policy on Program Withdrawal',
        page: 14,
        content: `Students requesting formal program cancellation/withdrawal receive refunds according to the following schedule:
Withdrawal notice received 15 or more days before formal class commencement: 100% refund of tuition and hostel fees minus a $100 processing charge.
Notice within 15 days after class commencement: 80% tuition fee refund.
Notice between 16 and 30 days after class commencement: 50% tuition fee refund.
Notice after 30 days: No tuition refund is granted. Caution deposits and mess balances are refunded in full across all timeframes upon clearance of dues.`
      }
    ]
  },
  {
    id: 'doc-notices-2026',
    title: 'Official Academic Circulars & Campus Notices Bulletin 2026',
    category: 'notices',
    version: 'Spring-2026',
    effectiveDate: 'February 2026',
    department: 'Controller of Examinations & Registrar',
    author: 'Controller of Examinations',
    pages: 12,
    description: 'Current urgent notices, mid-semester exam timetable release, career placement drive registrations, scholarship deadlines, and campus maintenance schedules.',
    sections: [
      {
        sectionId: 'notice-2026-01',
        heading: 'Urgent Notice: Mid-Semester Examination Timetable & Hall Ticket Release',
        page: 2,
        content: `Notice Ref: COE/CIR/2026/044 | Date: Feb 18, 2026
All undergraduate and postgraduate students are hereby notified that the Spring 2026 Mid-Semester Examinations commence on Monday, March 16, 2026, and conclude on Wednesday, March 25, 2026.
Digital Hall Tickets will be accessible for download via the Student ERP Portal starting March 5, 2026, at 10:00 AM.
Pre-conditions for Hall Ticket generation:
1. Minimum 75% recorded attendance up to February 28.
2. Complete clearance of all semester tuition and lab fee arrears.
No student will be permitted into the exam center without a printed Hall Ticket and physical Smart ID card.`
      },
      {
        sectionId: 'notice-2026-02',
        heading: 'Placement & Internship Drive 2026: Mandatory Resume Verification',
        page: 5,
        content: `Notice Ref: TPO/2026/112 | Date: Feb 12, 2026
The Training and Placement Cell announces that 60+ tier-1 technology and engineering firms will begin on-campus summer internship interviews on April 2, 2026.
Eligible Batches: 3rd Year B.Tech and 1st Year M.Tech students with CGPA >= 7.0 and max 1 active backlog.
All candidates must complete online resume verification and upload their verified project portfolios on the TPO Portal before March 10, 2026, 5:00 PM. Late submissions will result in de-registration from the current campus placement season.`
      },
      {
        sectionId: 'notice-2026-03',
        heading: 'Annual TechFest Nexus-2026 and Hackathon Schedule',
        page: 7,
        content: `Notice Ref: SAC/FEST/2026/09 | Date: Feb 8, 2026
The flagship Annual Inter-Collegiate Technology Festival 'NEXUS-2026' and the 36-hour National Hackathon will take place from March 27 to March 29, 2026.
Classes on March 27 will be suspended after 12:00 PM to facilitate festival inauguration. Student participants from university clubs are granted official Duty Leave (OD) upon endorsement by their respective faculty mentors.`
      },
      {
        sectionId: 'notice-2026-04',
        heading: 'Campus Health Clinic: Free Health Checkup and Mental Health Counseling',
        page: 9,
        content: `Notice Ref: MED/2026/02 | Date: Jan 28, 2026
The Student Wellness Center offers 24/7 outpatient clinical care at Block D (near Gate 2). Certified resident medical doctors and psychological counselors are available daily from 9:00 AM to 7:00 PM for confidential one-on-one stress and academic wellness consultations.
Emergency Ambulance Helpline: Ext. 5555 / Cell: +1-800-CAMPUS-MED.`
      }
    ]
  }
];

export interface ProcessedChunk {
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
}

export function chunkCollegeDocument(
  doc: CollegeDocument,
  chunkSize: number = 450,
  overlap: number = 60
): ProcessedChunk[] {
  const chunks: ProcessedChunk[] = [];
  let globalChunkIndex = 0;

  for (const section of doc.sections) {
    const text = section.content.trim();
    if (text.length <= chunkSize) {
      chunks.push({
        chunkId: `${doc.id}-${section.sectionId}-${globalChunkIndex++}`,
        docId: doc.id,
        docTitle: doc.title,
        category: doc.category,
        sectionId: section.sectionId,
        heading: section.heading,
        page: section.page,
        chunkIndex: globalChunkIndex,
        text: `[Document: ${doc.title} | Section: ${section.heading} | Page: ${section.page}]\n${text}`,
        charCount: text.length,
        wordCount: text.split(/\s+/).length,
      });
    } else {
      // Sliding window chunking with word boundary respect
      const words = text.split(/\s+/);
      const wordsPerChunk = Math.floor(chunkSize / 6);
      const overlapWords = Math.floor(overlap / 6);
      let i = 0;

      while (i < words.length) {
        const slice = words.slice(i, i + wordsPerChunk).join(' ');
        if (slice.trim().length > 30) {
          chunks.push({
            chunkId: `${doc.id}-${section.sectionId}-${globalChunkIndex++}`,
            docId: doc.id,
            docTitle: doc.title,
            category: doc.category,
            sectionId: section.sectionId,
            heading: section.heading,
            page: section.page,
            chunkIndex: globalChunkIndex,
            text: `[Document: ${doc.title} | Section: ${section.heading} | Page: ${section.page}]\n${slice}`,
            charCount: slice.length,
            wordCount: slice.split(/\s+/).length,
          });
        }
        i += Math.max(1, wordsPerChunk - overlapWords);
      }
    }
  }

  return chunks;
}
