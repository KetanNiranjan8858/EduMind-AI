/**
 * Official GATE CS/IT Question Bank: Operating Systems
 */

export const osExam = {
  "id": "exam_gate_os",
  "subjectId": "os",
  "subject": "Operating Systems",
  "quizTitle": "GATE CS: Operating Systems & Virtual Memory",
  "difficulty": "Hard",
  "totalQuestions": 10,
  "timeLimitMinutes": 30,
  "description": "Multi-level paging, effective memory access time (EMAT), counting semaphores, Banker's deadlock algorithm, and disk arm movement scheduling.",
  "topics": [
    "Paging & TLB",
    "Semaphores & Concurrency",
    "Banker's Algorithm",
    "Disk Scheduling",
    "Process Scheduling"
  ],
  "questions": [
    {
      "id": 1,
      "question": "A system uses a 32-bit virtual address and a page size of 4 KB. If each page table entry occupies 4 bytes in a two-level paging scheme where the outer page table fits exactly into one page, how many bits are used for the outer page table, inner page table, and offset respectively?",
      "options": {
        "A": "10 bits, 10 bits, 12 bits",
        "B": "12 bits, 8 bits, 12 bits",
        "C": "10 bits, 12 bits, 10 bits",
        "D": "11 bits, 9 bits, 12 bits"
      },
      "correctAnswer": "A",
      "explanation": "Page size = 4 KB = 2^12 bytes, so offset = 12 bits. Remaining for page indexing = 32 - 12 = 20 bits. Since one page is 4 KB and each PTE is 4 bytes, one page holds (4096 / 4) = 1024 entries = 2^10 entries. The outer table fits into one page, so it uses 10 bits. The inner page table uses the remaining 20 - 10 = 10 bits. Hence, the split is 10, 10, 12."
    },
    {
      "id": 2,
      "question": "In a demand paging system, the TLB hit ratio is 80%. TLB search takes 20 ns, and main memory access time is 100 ns. What is the Effective Memory Access Time (EMAT) assuming a single-level page table without page faults?",
      "options": {
        "A": "120 ns",
        "B": "140 ns",
        "C": "160 ns",
        "D": "180 ns"
      },
      "correctAnswer": "B",
      "explanation": "On TLB hit (probability 0.8), time = TLB search + memory access = 20 + 100 = 120 ns. On TLB miss (probability 0.2), time = TLB search + page table memory access + target memory access = 20 + 100 + 100 = 220 ns. EMAT = 0.8 * 120 + 0.2 * 220 = 96 + 44 = 140 ns."
    },
    {
      "id": 3,
      "question": "A counting semaphore S is initialized to 12. If 15 wait (P) operations and 7 signal (V) operations were executed on S in an arbitrary sequence, what is the final value of S?",
      "options": {
        "A": "4",
        "B": "2",
        "C": "0",
        "D": "-4"
      },
      "correctAnswer": "A",
      "explanation": "The value of a counting semaphore changes as: Final Value = Initial Value - (Number of Wait operations) + (Number of Signal operations). Here: 12 - 15 + 7 = 4."
    },
    {
      "id": 4,
      "question": "Consider 4 processes sharing 13 units of a single resource type. The peak demand for each process is 4 units. What is the maximum number of units that can be allocated to prevent a deadlock?",
      "options": {
        "A": "Deadlock can never occur because total resources (13) >= 4 * (4 - 1) + 1",
        "B": "Deadlock will occur if each process holds 3 units",
        "C": "At least 16 units are required for deadlock freedom",
        "D": "Deadlock occurs when 10 units are allocated"
      },
      "correctAnswer": "A",
      "explanation": "For n processes with maximum demand m, deadlock-free condition is: Total Resources >= n * (m - 1) + 1. Here n = 4, m = 4. Hence: 4 * (4 - 1) + 1 = 4 * 3 + 1 = 13 resources. Since exactly 13 units are available, at least one process is guaranteed to get its maximum demand, terminate, and release all resources. Thus deadlock is impossible."
    },
    {
      "id": 5,
      "question": "Which of the following page replacement algorithms CANNOT suffer from Belady's Anomaly (where increasing the number of page frames leads to an increased number of page faults)?",
      "options": {
        "A": "FIFO (First-In, First-Out)",
        "B": "LRU (Least Recently Used)",
        "C": "Second-Chance (Clock)",
        "D": "Random Replacement"
      },
      "correctAnswer": "B",
      "explanation": "LRU is a stack algorithm (satisfies inclusion property: the set of pages in memory for n frames is always a subset of pages in memory for n+1 frames). Stack algorithms are mathematically proven to never suffer from Belady's Anomaly."
    },
    {
      "id": 6,
      "question": "In a Shortest Remaining Time First (SRTF) CPU scheduling policy, process P1 arrives at time 0 with burst time 7, and P2 arrives at time 2 with burst time 4. What is the turnaround time of P1?",
      "options": {
        "A": "7 ms",
        "B": "9 ms",
        "C": "11 ms",
        "D": "13 ms"
      },
      "correctAnswer": "C",
      "explanation": "At t = 0, P1 starts. At t = 2, P1 has remaining time 7 - 2 = 5. P2 arrives with burst 4. Since 4 < 5, P2 preempts P1. P2 runs from t = 2 to t = 6 and finishes. At t = 6, P1 resumes and runs for its remaining 5 units until t = 11. Turnaround Time for P1 = Completion Time - Arrival Time = 11 - 0 = 11 ms."
    },
    {
      "id": 7,
      "question": "Disk requests arrive in order: 98, 183, 37, 122, 14, 124, 65, 67. The head is currently at cylinder 53. Using the Shortest Seek Time First (SSTF) scheduling algorithm, what is the total head movement in cylinders?",
      "options": {
        "A": "236 cylinders",
        "B": "208 cylinders",
        "C": "640 cylinders",
        "D": "174 cylinders"
      },
      "correctAnswer": "A",
      "explanation": "Order visited from 53: 65 (diff 12), 67 (diff 2), 37 (diff 30), 14 (diff 23), 98 (diff 84), 122 (diff 24), 124 (diff 2), 183 (diff 59). Total head movement = 12 + 2 + 30 + 23 + 84 + 24 + 2 + 59 = 236 cylinders."
    },
    {
      "id": 8,
      "question": "How many child processes are created by the execution of the following C code segment?\n\nfor (int i = 0; i < 3; i++) {\n  fork();\n}",
      "options": {
        "A": "3",
        "B": "7",
        "C": "8",
        "D": "6"
      },
      "correctAnswer": "B",
      "explanation": "After n iterations of fork(), the total number of processes created is 2^n. For n = 3, total processes = 2^3 = 8. Since one is the original parent process, the number of child processes created = 2^n - 1 = 8 - 1 = 7."
    },
    {
      "id": 9,
      "question": "In a Unix-style inode with 10 direct block pointers, 1 single indirect pointer, 1 double indirect pointer, and block size 1 KB, where each pointer is 4 bytes, what is the maximum file size addressable using only the direct and single indirect pointers?",
      "options": {
        "A": "10 KB + 256 KB = 266 KB",
        "B": "10 KB + 1024 KB = 1034 KB",
        "C": "256 KB",
        "D": "64 KB"
      },
      "correctAnswer": "A",
      "explanation": "10 direct pointers point to 10 * 1 KB = 10 KB. A 1 KB indirect block holds (1024 / 4) = 256 block pointers. 256 pointers * 1 KB = 256 KB. Total addressable = 10 KB + 256 KB = 266 KB."
    },
    {
      "id": 10,
      "question": "What is the primary cause of thrashing in an operating system?",
      "options": {
        "A": "Too few processes in the ready queue",
        "B": "The sum of the working-set sizes of active processes exceeds the total physical memory available",
        "C": "Deadlock among thread pools",
        "D": "Frequent context switches during I/O interrupts"
      },
      "correctAnswer": "B",
      "explanation": "Thrashing occurs when the system spends more time paging than executing instructions. According to Peter Denning's Working Set Model, thrashing begins when total demand D = sum(WSSi) > total physical memory frames available, forcing continuous page faults."
    }
  ]
};
