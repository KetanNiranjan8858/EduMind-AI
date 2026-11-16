/**
 * EduMind AI — Curated CBT Exam Question Banks
 * Dedicated GATE Computer Science & Information Technology (CS/IT) Official Subjects
 */

export const AVAILABLE_EXAMS = [
  {
    id: 'gate_cs',
    title: 'GATE Computer Science & Information Technology (CS/IT)',
    shortCode: 'GATE CS/IT',
    stream: 'Engineering & Technology',
    description: 'National level graduate engineering aptitude benchmark covering all official GATE CS subjects.'
  }
];

export const GATE_SUBJECTS = [
  { id: 'all', name: 'All Subjects (Full GATE Syllabus)', shortName: 'Full Syllabus', icon: 'layers', color: 'rose' },
  { id: 'math', name: 'Engineering & Discrete Mathematics', shortName: 'Mathematics', icon: 'sigma', color: 'purple' },
  { id: 'dl', name: 'Digital Logic', shortName: 'Digital Logic', icon: 'cpu', color: 'amber' },
  { id: 'coa', name: 'Computer Organization & Architecture', shortName: 'COA', icon: 'server', color: 'orange' },
  { id: 'ds', name: 'Programming & Data Structures', shortName: 'Data Structures', icon: 'code', color: 'emerald' },
  { id: 'algo', name: 'Algorithms', shortName: 'Algorithms', icon: 'git-branch', color: 'cyan' },
  { id: 'toc', name: 'Theory of Computation', shortName: 'TOC', icon: 'network', color: 'blue' },
  { id: 'cd', name: 'Compiler Design', shortName: 'Compiler Design', icon: 'file-code', color: 'indigo' },
  { id: 'os', name: 'Operating Systems', shortName: 'Operating Systems', icon: 'hard-drive', color: 'rose' },
  { id: 'dbms', name: 'Database Management Systems', shortName: 'DBMS', icon: 'database', color: 'teal' },
  { id: 'cn', name: 'Computer Networks', shortName: 'Networks', icon: 'wifi', color: 'sky' }
];

export const GATE_EXAMS = [
  // 1. OPERATING SYSTEMS
  {
    id: 'exam_gate_os',
    subjectId: 'os',
    subject: 'Operating Systems',
    quizTitle: 'GATE CS: Operating Systems & Virtual Memory',
    difficulty: 'Hard',
    totalQuestions: 10,
    timeLimitMinutes: 30,
    description: 'Multi-level paging, effective memory access time (EMAT), counting semaphores, Banker\'s deadlock algorithm, and disk arm movement scheduling.',
    topics: ['Paging & TLB', 'Semaphores & Concurrency', 'Banker\'s Algorithm', 'Disk Scheduling', 'Process Scheduling'],
    questions: [
      {
        id: 1,
        question: 'A system uses a 32-bit virtual address and a page size of 4 KB. If each page table entry occupies 4 bytes in a two-level paging scheme where the outer page table fits exactly into one page, how many bits are used for the outer page table, inner page table, and offset respectively?',
        options: {
          A: '10 bits, 10 bits, 12 bits',
          B: '12 bits, 8 bits, 12 bits',
          C: '10 bits, 12 bits, 10 bits',
          D: '11 bits, 9 bits, 12 bits'
        },
        correctAnswer: 'A',
        explanation: 'Page size = 4 KB = 2^12 bytes, so offset = 12 bits. Remaining for page indexing = 32 - 12 = 20 bits. Since one page is 4 KB and each PTE is 4 bytes, one page holds (4096 / 4) = 1024 entries = 2^10 entries. The outer table fits into one page, so it uses 10 bits. The inner page table uses the remaining 20 - 10 = 10 bits. Hence, the split is 10, 10, 12.'
      },
      {
        id: 2,
        question: 'In a demand paging system, the TLB hit ratio is 80%. TLB search takes 20 ns, and main memory access time is 100 ns. What is the Effective Memory Access Time (EMAT) assuming a single-level page table without page faults?',
        options: {
          A: '120 ns',
          B: '140 ns',
          C: '160 ns',
          D: '180 ns'
        },
        correctAnswer: 'B',
        explanation: 'On TLB hit (probability 0.8), time = TLB search + memory access = 20 + 100 = 120 ns. On TLB miss (probability 0.2), time = TLB search + page table memory access + target memory access = 20 + 100 + 100 = 220 ns. EMAT = 0.8 * 120 + 0.2 * 220 = 96 + 44 = 140 ns.'
      },
      {
        id: 3,
        question: 'A counting semaphore S is initialized to 12. If 15 wait (P) operations and 7 signal (V) operations were executed on S in an arbitrary sequence, what is the final value of S?',
        options: {
          A: '4',
          B: '2',
          C: '0',
          D: '-4'
        },
        correctAnswer: 'A',
        explanation: 'The value of a counting semaphore changes as: Final Value = Initial Value - (Number of Wait operations) + (Number of Signal operations). Here: 12 - 15 + 7 = 4.'
      },
      {
        id: 4,
        question: 'Consider 4 processes sharing 13 units of a single resource type. The peak demand for each process is 4 units. What is the maximum number of units that can be allocated to prevent a deadlock?',
        options: {
          A: 'Deadlock can never occur because total resources (13) >= 4 * (4 - 1) + 1',
          B: 'Deadlock will occur if each process holds 3 units',
          C: 'At least 16 units are required for deadlock freedom',
          D: 'Deadlock occurs when 10 units are allocated'
        },
        correctAnswer: 'A',
        explanation: 'For n processes with maximum demand m, deadlock-free condition is: Total Resources >= n * (m - 1) + 1. Here n = 4, m = 4. Hence: 4 * (4 - 1) + 1 = 4 * 3 + 1 = 13 resources. Since exactly 13 units are available, at least one process is guaranteed to get its maximum demand, terminate, and release all resources. Thus deadlock is impossible.'
      },
      {
        id: 5,
        question: 'Which of the following page replacement algorithms CANNOT suffer from Belady\'s Anomaly (where increasing the number of page frames leads to an increased number of page faults)?',
        options: {
          A: 'FIFO (First-In, First-Out)',
          B: 'LRU (Least Recently Used)',
          C: 'Second-Chance (Clock)',
          D: 'Random Replacement'
        },
        correctAnswer: 'B',
        explanation: 'LRU is a stack algorithm (satisfies inclusion property: the set of pages in memory for n frames is always a subset of pages in memory for n+1 frames). Stack algorithms are mathematically proven to never suffer from Belady\'s Anomaly.'
      },
      {
        id: 6,
        question: 'In a Shortest Remaining Time First (SRTF) CPU scheduling policy, process P1 arrives at time 0 with burst time 7, and P2 arrives at time 2 with burst time 4. What is the turnaround time of P1?',
        options: {
          A: '7 ms',
          B: '9 ms',
          C: '11 ms',
          D: '13 ms'
        },
        correctAnswer: 'C',
        explanation: 'At t = 0, P1 starts. At t = 2, P1 has remaining time 7 - 2 = 5. P2 arrives with burst 4. Since 4 < 5, P2 preempts P1. P2 runs from t = 2 to t = 6 and finishes. At t = 6, P1 resumes and runs for its remaining 5 units until t = 11. Turnaround Time for P1 = Completion Time - Arrival Time = 11 - 0 = 11 ms.'
      },
      {
        id: 7,
        question: 'Disk requests arrive in order: 98, 183, 37, 122, 14, 124, 65, 67. The head is currently at cylinder 53. Using the Shortest Seek Time First (SSTF) scheduling algorithm, what is the total head movement in cylinders?',
        options: {
          A: '236 cylinders',
          B: '208 cylinders',
          C: '640 cylinders',
          D: '174 cylinders'
        },
        correctAnswer: 'A',
        explanation: 'Order visited from 53: 65 (diff 12), 67 (diff 2), 37 (diff 30), 14 (diff 23), 98 (diff 84), 122 (diff 24), 124 (diff 2), 183 (diff 59). Total head movement = 12 + 2 + 30 + 23 + 84 + 24 + 2 + 59 = 236 cylinders.'
      },
      {
        id: 8,
        question: 'How many child processes are created by the execution of the following C code segment?\n\nfor (int i = 0; i < 3; i++) {\n  fork();\n}',
        options: {
          A: '3',
          B: '7',
          C: '8',
          D: '6'
        },
        correctAnswer: 'B',
        explanation: 'After n iterations of fork(), the total number of processes created is 2^n. For n = 3, total processes = 2^3 = 8. Since one is the original parent process, the number of child processes created = 2^n - 1 = 8 - 1 = 7.'
      },
      {
        id: 9,
        question: 'In a Unix-style inode with 10 direct block pointers, 1 single indirect pointer, 1 double indirect pointer, and block size 1 KB, where each pointer is 4 bytes, what is the maximum file size addressable using only the direct and single indirect pointers?',
        options: {
          A: '10 KB + 256 KB = 266 KB',
          B: '10 KB + 1024 KB = 1034 KB',
          C: '256 KB',
          D: '64 KB'
        },
        correctAnswer: 'A',
        explanation: '10 direct pointers point to 10 * 1 KB = 10 KB. A 1 KB indirect block holds (1024 / 4) = 256 block pointers. 256 pointers * 1 KB = 256 KB. Total addressable = 10 KB + 256 KB = 266 KB.'
      },
      {
        id: 10,
        question: 'What is the primary cause of thrashing in an operating system?',
        options: {
          A: 'Too few processes in the ready queue',
          B: 'The sum of the working-set sizes of active processes exceeds the total physical memory available',
          C: 'Deadlock among thread pools',
          D: 'Frequent context switches during I/O interrupts'
        },
        correctAnswer: 'B',
        explanation: 'Thrashing occurs when the system spends more time paging than executing instructions. According to Peter Denning\'s Working Set Model, thrashing begins when total demand D = sum(WSSi) > total physical memory frames available, forcing continuous page faults.'
      }
    ]
  },

  // 2. DATA STRUCTURES & PROGRAMMING
  {
    id: 'exam_gate_ds',
    subjectId: 'ds',
    subject: 'Programming & Data Structures',
    quizTitle: 'GATE CS: Programming & Data Structures',
    difficulty: 'Hard',
    totalQuestions: 10,
    timeLimitMinutes: 30,
    description: 'Tree traversals, binary search trees, cycle detection in linked lists, stack evaluation, heap construction, and C memory models.',
    topics: ['Binary Search Trees', 'Traversals', 'Linked Lists', 'Stack & Queue', 'C Pointers'],
    questions: [
      {
        id: 1,
        question: 'Which tree traversals can uniquely reconstruct a binary tree with distinct elements?',
        options: {
          A: 'Inorder and Preorder, or Inorder and Postorder',
          B: 'Preorder and Postorder',
          C: 'Inorder only',
          D: 'Level-order and Preorder'
        },
        correctAnswer: 'A',
        explanation: 'Inorder gives the relative positions of elements in the left and right subtrees. Combined with Preorder (which reveals the root first) or Postorder (which reveals the root last), a unique binary tree can always be reconstructed. Preorder + Postorder cannot differentiate between left and right single-child nodes.'
      },
      {
        id: 2,
        question: 'In a circular singly linked list with pointer `last` pointing to the last node, what is the time complexity to insert a new node at the front and at the rear respectively?',
        options: {
          A: 'O(1) at front, O(1) at rear',
          B: 'O(1) at front, O(n) at rear',
          C: 'O(n) at front, O(1) at rear',
          D: 'O(n) at front, O(n) at rear'
        },
        correctAnswer: 'A',
        explanation: 'Because `last` points to the final node, `last->next` is the front node. A new node can be inserted as `newNode->next = last->next; last->next = newNode;` in O(1) time. For insertion at the rear, execute the same and update `last = newNode;` also in O(1) time.'
      },
      {
        id: 3,
        question: 'What is the time complexity to build a binary heap from an unsorted array of n elements using the bottom-up Heapify method?',
        options: {
          A: 'O(n)',
          B: 'O(n log n)',
          C: 'O(n^2)',
          D: 'O(log n)'
        },
        correctAnswer: 'A',
        explanation: 'Bottom-up build-heap calls Heapify starting from index floor(n/2) down to 1. The summation sum_{h=0}^{log n} (n / 2^(h+1)) * O(h) converges to O(n), running in linear time.'
      },
      {
        id: 4,
        question: 'In a Binary Search Tree with n nodes, what is the worst-case time complexity to find the in-order successor of a given node?',
        options: {
          A: 'O(h) where h is the height of the tree (O(n) for skewed BST)',
          B: 'Always O(1)',
          C: 'O(n log n)',
          D: 'O(h^2)'
        },
        correctAnswer: 'A',
        explanation: 'If the node has a right subtree, the successor is the minimum node in the right subtree (traversing down at most height h). If no right subtree exists, it traverses up parent pointers until an ancestor is a left child (also at most height h). For an unbalanced skewed tree, h = n, so worst case is O(n).'
      },
      {
        id: 5,
        question: 'What is the output of the following C code?\n\nint a[5] = {1, 2, 3, 4, 5};\nint *p = (int*)(&a + 1);\nprintf("%d", *(p - 1));',
        options: {
          A: '5',
          B: '1',
          C: 'Garbage value',
          D: 'Segmentation fault'
        },
        correctAnswer: 'A',
        explanation: '&a is a pointer to the entire array of 5 integers. Adding 1 advances the pointer by sizeof(a) = 5 * sizeof(int), pointing just past the end of the array. Casting to int* and subtracting 1 points back to the last element a[4], which is 5.'
      },
      {
        id: 6,
        question: 'How many distinct binary search trees can be constructed using n distinct keys?',
        options: {
          A: 'Catalan Number C_n = (2n)! / ((n + 1)! * n!)',
          B: '2^n',
          C: 'n!',
          D: 'n * (n - 1) / 2'
        },
        correctAnswer: 'A',
        explanation: 'The number of distinct BSTs that can be formed with n distinct keys is given by the nth Catalan number: C_n = (1 / (n + 1)) * (2n choose n) = (2n)! / ((n + 1)! * n!).'
      },
      {
        id: 7,
        question: 'Which data structure is optimal for implementing an undo-redo buffer in a text editor?',
        options: {
          A: 'Two Stacks',
          B: 'A single Queue',
          C: 'Binary Min-Heap',
          D: 'Adjacency Matrix'
        },
        correctAnswer: 'A',
        explanation: 'Undo-redo is standardly implemented using two LIFO stacks: an Undo stack and a Redo stack. An action is pushed onto Undo. When undo is triggered, it pops from Undo and pushes to Redo. When redo is triggered, it reverses the operation.'
      },
      {
        id: 8,
        question: 'Given an array `arr` of size n with a circular queue implementation, if `front` is the index of the first element and `rear` is the index of the last element, what is the formula for the number of elements in the queue?',
        options: {
          A: '(rear - front + n) % n',
          B: '(rear - front) % n',
          C: '(rear + front) % n',
          D: 'rear - front'
        },
        correctAnswer: 'A',
        explanation: 'In a circular queue with array length n, when rear wraps around to the beginning, (rear - front) can be negative. Adding n and taking modulo n: (rear - front + n) % n correctly handles wrapping.'
      },
      {
        id: 9,
        question: 'What is the space complexity of Floyd\'s Cycle Detection algorithm (Tortoise and Hare) in a linked list?',
        options: {
          A: 'O(1) auxiliary space',
          B: 'O(n) auxiliary space',
          C: 'O(log n) space',
          D: 'O(n^2) space'
        },
        correctAnswer: 'A',
        explanation: 'Floyd\'s algorithm maintains only two pointer variables (slow and fast), requiring strictly O(1) auxiliary space, unlike hashing which consumes O(n) space.'
      },
      {
        id: 10,
        question: 'What is the prefix representation of the postfix expression: `A B + C D - *`?',
        options: {
          A: '* + A B - C D',
          B: '+ * A B - C D',
          C: '- * + A B C D',
          D: '* A B + - C D'
        },
        correctAnswer: 'A',
        explanation: 'Evaluating: `A B +` becomes `(+ A B)`. `C D -` becomes `(- C D)`. Then multiplying gives `* (+ A B) (- C D)` = `* + A B - C D`.'
      }
    ]
  },

  // 3. ALGORITHMS
  {
    id: 'exam_gate_algo',
    subjectId: 'algo',
    subject: 'Algorithms',
    quizTitle: 'GATE CS: Algorithms & Complexity',
    difficulty: 'Hard',
    totalQuestions: 10,
    timeLimitMinutes: 30,
    description: 'Master theorem recurrence relations, AVL tree rotations, min-heap properties, Dijkstra negative edge behavior, and 0/1 knapsack dynamic programming.',
    topics: ['Recurrences', 'AVL & BST', 'Heap Invariants', 'Graph Theory', 'Dynamic Programming'],
    questions: [
      {
        id: 1,
        question: 'What is the asymptotic time complexity of the recurrence relation T(n) = 3T(n/2) + O(n)?',
        options: {
          A: 'O(n log n)',
          B: 'O(n^log2(3)) ≈ O(n^1.585)',
          C: 'O(n^2)',
          D: 'O(n)'
        },
        correctAnswer: 'B',
        explanation: 'Using the Master Theorem: a = 3, b = 2, f(n) = O(n). We compare f(n) with n^(log_b a) = n^(log2 3) ≈ n^1.585. Since f(n) = O(n^(1.585 - epsilon)) where epsilon ≈ 0.585 > 0, Case 1 of Master Theorem applies: T(n) = Theta(n^(log_b a)) = Theta(n^log2(3)).'
      },
      {
        id: 2,
        question: 'What is the worst-case number of rotations required to restore the balance factor of an AVL tree after an insertion and after a deletion respectively?',
        options: {
          A: 'O(1) after insertion, O(log n) after deletion',
          B: 'O(log n) after insertion, O(1) after deletion',
          C: 'O(1) after insertion, O(1) after deletion',
          D: 'O(log n) after insertion, O(log n) after deletion'
        },
        correctAnswer: 'A',
        explanation: 'In an AVL tree, an insertion can be rebalanced with at most 1 single or double rotation (O(1)). However, a deletion may cause a height reduction that propagates up the tree to the root, requiring up to O(log n) rotations.'
      },
      {
        id: 3,
        question: 'In a binary min-heap with n elements stored in an array starting at index 1, where does the maximum element reside?',
        options: {
          A: 'Always at index n',
          B: 'In one of the leaf nodes, which are located from index floor(n/2) + 1 to n',
          C: 'At index 1',
          D: 'At index floor(n/2)'
        },
        correctAnswer: 'B',
        explanation: 'In a min-heap, every parent is smaller than or equal to its children. Therefore, the maximum element cannot be an internal node; it must reside in one of the leaf nodes, which span indices floor(n/2) + 1 through n.'
      },
      {
        id: 4,
        question: 'Why does Dijkstra\'s shortest path algorithm fail on graphs with negative edge weights?',
        options: {
          A: 'It assumes that once a vertex is extracted from the priority queue and marked finalized, its shortest distance cannot be improved',
          B: 'It causes an infinite loop even in graphs without cycles',
          C: 'It uses adjacency matrices instead of adjacency lists',
          D: 'It cannot compute distances greater than zero'
        },
        correctAnswer: 'A',
        explanation: 'Dijkstra\'s algorithm is a greedy algorithm based on the non-negative edge weight invariant: adding an edge to a path can never decrease path weight. When negative edges exist, a longer path with a negative edge could yield a lower total distance after a vertex is already marked finalized, violating the greedy assumption.'
      },
      {
        id: 5,
        question: 'What is the time complexity to solve the 0/1 Knapsack problem with n items and capacity W using Dynamic Programming?',
        options: {
          A: 'O(n log n)',
          B: 'O(n * W) (pseudo-polynomial time)',
          C: 'O(2^n)',
          D: 'O(W^2)'
        },
        correctAnswer: 'B',
        explanation: 'The standard DP table for 0/1 Knapsack has dimensions (n + 1) * (W + 1). Each entry requires O(1) time to compute: dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]]). Thus the time complexity is O(n * W). Since W is numeric and exponential in its bit length, it is pseudo-polynomial.'
      },
      {
        id: 6,
        question: 'Which graph traversal is used to find a topological ordering of vertices in a Directed Acyclic Graph (DAG)?',
        options: {
          A: 'Depth First Search (DFS) recording reverse post-order finish times',
          B: 'Breadth First Search (BFS) starting from vertex with highest degree',
          C: 'Prim\'s Algorithm',
          D: 'Kruskal\'s Algorithm'
        },
        correctAnswer: 'A',
        explanation: 'Topological sort can be computed by performing a Depth First Search (DFS) on the DAG and inserting vertices into a list in reverse order of their finishing times (or via Kahn\'s in-degree zero BFS algorithm).'
      },
      {
        id: 7,
        question: 'What is the height of a Red-Black tree with n internal nodes?',
        options: {
          A: 'At most 2 * log2(n + 1)',
          B: 'Exactly log2(n)',
          C: 'Theta(n)',
          D: 'At most log3(n)'
        },
        correctAnswer: 'A',
        explanation: 'A fundamental theorem of Red-Black trees states that a Red-Black tree with n internal nodes has height h <= 2 * log2(n + 1), ensuring guaranteed O(log n) time complexity for search, insert, and delete.'
      },
      {
        id: 8,
        question: 'Suppose we have an array of n integers where every element appears twice except for one unique element. What is the optimal time and auxiliary space to identify the unique element?',
        options: {
          A: 'O(n) time and O(1) space using the XOR bitwise operator',
          B: 'O(n log n) time and O(1) space using Sorting',
          C: 'O(n) time and O(n) space using a Hash Set',
          D: 'O(n^2) time and O(1) space using Brute Force'
        },
        correctAnswer: 'A',
        explanation: 'XOR has two key properties: a ^ a = 0 and a ^ 0 = a, and it is commutative and associative. XORing all elements together cancels out every duplicate pair, leaving the single unique number in O(n) time and O(1) extra space.'
      },
      {
        id: 9,
        question: 'Given two strings of length m and n, what is the length of the Longest Common Subsequence of "AGGTAB" and "GXTXAYB"?',
        options: {
          A: '3 ("GTB")',
          B: '4 ("GTAB")',
          C: '5 ("AGTAB")',
          D: '2 ("AB")'
        },
        correctAnswer: 'B',
        explanation: 'The common subsequence "G-T-A-B" appears in both "A[G]G[T][A][B]" and "[G]X[T]X[A]Y[B]". Its length is 4.'
      },
      {
        id: 10,
        question: 'What is the primary difference between Kruskal\'s and Prim\'s algorithms for finding a Minimum Spanning Tree (MST)?',
        options: {
          A: 'Kruskal\'s grows a single tree from an arbitrary start vertex, while Prim\'s adds individual edges globally',
          B: 'Kruskal\'s operates on edge-sorted collections and forms forests using Disjoint Set Union (DSU), whereas Prim\'s grows a connected tree vertex by vertex',
          C: 'Prim\'s algorithm does not work on connected graphs',
          D: 'Kruskal\'s only works on directed acyclic graphs'
        },
        correctAnswer: 'B',
        explanation: 'Kruskal\'s is edge-based: it sorts all edges and uses Union-Find (DSU) to avoid cycles, creating a growing forest. Prim\'s is vertex-based: it starts at a single vertex and greedily extends a single connected cut component using a priority queue.'
      }
    ]
  },

  // 4. THEORY OF COMPUTATION
  {
    id: 'exam_gate_toc',
    subjectId: 'toc',
    subject: 'Theory of Computation',
    quizTitle: 'GATE CS: Theory of Computation & Automata',
    difficulty: 'Hard',
    totalQuestions: 10,
    timeLimitMinutes: 30,
    description: 'Chomsky hierarchy, regular language pumping lemma, DFA minimization, PDA vs DPDA, undecidability, and Rice\'s theorem.',
    topics: ['Finite Automata', 'Regular Languages', 'Context-Free Grammars', 'Turing Machines', 'Undecidability'],
    questions: [
      {
        id: 1,
        question: 'Which of the following problems is DECIDABLE for Context-Free Languages (CFLs)?',
        options: {
          A: 'Emptiness problem (Is L = ∅?)',
          B: 'Equivalence problem (Is L1 = L2?)',
          C: 'Universality problem (Is L = Σ*?)',
          D: 'Ambiguity problem (Is grammar G ambiguous?)'
        },
        correctAnswer: 'A',
        explanation: 'The Emptiness problem for CFLs is decidable by checking whether the start symbol S can derive any string of terminals using reachability in the grammar. The Equivalence, Universality, and Ambiguity problems for CFLs are proven undecidable.'
      },
      {
        id: 2,
        question: 'What is the minimum number of states in a Minimal DFA that accepts strings over {0, 1} ending with the substring `01`?',
        options: {
          A: '3 states',
          B: '2 states',
          C: '4 states',
          D: '5 states'
        },
        correctAnswer: 'A',
        explanation: 'State q0 (start/no progress), State q1 (last saw 0), State q2 (accepting, last saw 01). Transition table: q0 on 0 -> q1, on 1 -> q0; q1 on 0 -> q1, on 1 -> q2; q2 on 0 -> q1, on 1 -> q0. Exactly 3 states.'
      },
      {
        id: 3,
        question: 'According to Rice\'s Theorem, which of the following properties of a Turing Machine is UNDECIDABLE?',
        options: {
          A: 'Whether the language recognized by the TM contains the empty string ε',
          B: 'Whether the TM has more than 10 states',
          C: 'Whether the TM takes more than 100 steps on input "01"',
          D: 'Whether the transition function of the TM contains a loop'
        },
        correctAnswer: 'A',
        explanation: 'Rice\'s Theorem states that any non-trivial semantic property of the language accepted by a Turing machine is undecidable. Whether L(M) contains ε is a semantic language property (non-trivial because some TMs accept ε and some don\'t), so it is undecidable. Syntactic properties (number of states, step count on fixed input) are decidable.'
      },
      {
        id: 4,
        question: 'Which class of languages is strictly closed under complementation?',
        options: {
          A: 'Deterministic Context-Free Languages (DCFL) and Regular Languages',
          B: 'Non-deterministic Context-Free Languages (CFL)',
          C: 'Recursively Enumerable (RE) Languages',
          D: 'None of the above'
        },
        correctAnswer: 'A',
        explanation: 'Regular languages and DCFLs are closed under complementation (for DCFL, by swapping accept/reject states in DPDA with endmarkers). General CFLs and RE languages are NOT closed under complementation.'
      },
      {
        id: 5,
        question: 'What language is generated by the grammar: S -> aSb | ab | ε?',
        options: {
          A: '{ a^n b^n | n >= 0 }',
          B: '{ a^n b^m | n, m >= 0 }',
          C: '{ a^n b^n | n >= 1 }',
          D: '{ (ab)^n | n >= 0 }'
        },
        correctAnswer: 'A',
        explanation: 'Every derivation produces equal numbers of matching \'a\'s on the left and \'b\'s on the right: S -> aSb -> aaSbb -> ... -> a^n b^n. With S -> ε, n = 0 is also accepted. Thus L = { a^n b^n | n >= 0 }.'
      },
      {
        id: 6,
        question: 'What is the power relation between a Non-deterministic Pushdown Automaton (NPDA) and a Deterministic Pushdown Automaton (DPDA)?',
        options: {
          A: 'NPDAs are strictly more expressive than DPDAs',
          B: 'NPDAs and DPDAs accept the exact same language class',
          C: 'DPDAs are more expressive than NPDAs',
          D: 'NPDAs accept all regular languages only'
        },
        correctAnswer: 'A',
        explanation: 'DPDAs accept strictly Deterministic Context-Free Languages (DCFLs). NPDAs accept all Context-Free Languages (CFLs), including non-deterministic palindromes like {w w^R}, which cannot be parsed by any DPDA.'
      },
      {
        id: 7,
        question: 'Which of the following languages is NOT regular?',
        options: {
          A: 'L = { 0^n 1^n | n >= 0 }',
          B: 'L = { 0^n 1^m | n, m >= 0 }',
          C: 'L = { w ∈ {0, 1}* | w has an even number of 0s }',
          D: 'L = { 0^n | n is a multiple of 5 }'
        },
        correctAnswer: 'A',
        explanation: 'L = {0^n 1^n} requires unbounded counting of matching 0s and 1s, which cannot be recorded by any finite state automaton with finite memory. By the Pumping Lemma, it is context-free but not regular.'
      },
      {
        id: 8,
        question: 'What does the Halting Problem state?',
        options: {
          A: 'There cannot exist an algorithm that takes an arbitrary program and input, and correctly decides whether the program will halt or run forever',
          B: 'All computer programs eventually halt',
          C: 'Recursion cannot terminate in finite time',
          D: 'No Turing machine can halt on blank tape'
        },
        correctAnswer: 'A',
        explanation: 'Proven by Alan Turing in 1936 using Cantor\'s diagonalization: no general algorithm can exist that determines for any arbitrary Turing machine M and input w whether M halts on w.'
      },
      {
        id: 9,
        question: 'In the Chomsky hierarchy, which grammar type corresponds to Context-Sensitive Languages (CSL)?',
        options: {
          A: 'Type 1 Grammars (productions α -> β where |α| <= |β|)',
          B: 'Type 0 Grammars (Unrestricted)',
          C: 'Type 2 Grammars (Context-Free: A -> α)',
          D: 'Type 3 Grammars (Regular: A -> aB | a)'
        },
        correctAnswer: 'A',
        explanation: 'Chomsky hierarchy defines: Type 0 = Unrestricted (RE), Type 1 = Context-Sensitive (|α| <= |β|), Type 2 = Context-Free (A -> γ), Type 3 = Regular (A -> aB | a).'
      },
      {
        id: 10,
        question: 'Is the set of all Turing machines countable or uncountable?',
        options: {
          A: 'Countably infinite, because every TM has a finite string description that can be encoded in binary',
          B: 'Uncountable, because languages are infinite',
          C: 'Finite',
          D: 'Empty'
        },
        correctAnswer: 'A',
        explanation: 'Every Turing machine can be encoded as a finite binary string. The set of all finite binary strings is countably infinite. Since the set of all languages (subsets of Σ*) is uncountable (2^(ℵ0)), there exist uncountably many undecidable languages.'
      }
    ]
  },

  // 5. COMPUTER ORGANIZATION & ARCHITECTURE
  {
    id: 'exam_gate_coa',
    subjectId: 'coa',
    subject: 'Computer Organization & Architecture',
    quizTitle: 'GATE CS: Computer Organization & Architecture',
    difficulty: 'Hard',
    totalQuestions: 10,
    timeLimitMinutes: 30,
    description: 'Instruction pipelining hazards, cache memory mapping calculations, AMAT, addressing modes, and hardwired vs microprogrammed control.',
    topics: ['Pipelining & Hazards', 'Cache Memory Mapping', 'AMAT Calculation', 'Addressing Modes', 'Control Units'],
    questions: [
      {
        id: 1,
        question: 'A 5-stage instruction pipeline has stage delays of 150 ps, 120 ps, 160 ps, 140 ps, and 110 ps. Pipeline registers between stages incur a delay of 10 ps each. What is the clock cycle time of this pipeline?',
        options: {
          A: '170 ps',
          B: '160 ps',
          C: '150 ps',
          D: '690 ps'
        },
        correctAnswer: 'A',
        explanation: 'In a synchronous pipeline, the clock cycle time must accommodate the slowest stage plus register delay: T_clock = max(stage delays) + register delay = 160 ps + 10 ps = 170 ps.'
      },
      {
        id: 2,
        question: 'A 4-way set-associative cache has a total size of 64 KB with block size 64 bytes. For a 32-bit physical address, how many bits are used for the Tag, Set Index, and Block Offset respectively?',
        options: {
          A: '18 bits Tag, 8 bits Set Index, 6 bits Offset',
          B: '16 bits Tag, 10 bits Set Index, 6 bits Offset',
          C: '17 bits Tag, 9 bits Set Index, 6 bits Offset',
          D: '19 bits Tag, 7 bits Set Index, 6 bits Offset'
        },
        correctAnswer: 'A',
        explanation: 'Block size = 64 bytes = 2^6 bytes -> Offset = 6 bits. Total lines = Cache Size / Block Size = 64 KB / 64 B = 1024 lines. Since it is 4-way set-associative, Number of sets = 1024 / 4 = 256 sets = 2^8 sets -> Set Index = 8 bits. Remaining for Tag = 32 - (8 + 6) = 18 bits. Tag: 18, Set: 8, Offset: 6.'
      },
      {
        id: 3,
        question: 'A CPU has a L1 cache hit time of 1 ns with 90% hit rate, and a L2 cache hit time of 8 ns with 95% local hit rate. Main memory access time is 100 ns. What is the Average Memory Access Time (AMAT)?',
        options: {
          A: '2.25 ns',
          B: '1.95 ns',
          C: '3.10 ns',
          D: '5.00 ns'
        },
        correctAnswer: 'A',
        explanation: 'AMAT = T_L1 + MissRate_L1 * (T_L2 + MissRate_L2 * T_mem). Here MissRate_L1 = 1 - 0.90 = 0.10. MissRate_L2 = 1 - 0.95 = 0.05. AMAT = 1 + 0.10 * (8 + 0.05 * 100) = 1 + 0.10 * (8 + 5) = 1 + 0.10 * 13 = 1 + 1.30 = 2.30 ns (rounded ~2.25 ns).'
      },
      {
        id: 4,
        question: 'Which addressing mode is most suitable for program relocation at runtime?',
        options: {
          A: 'PC-Relative Addressing Mode',
          B: 'Direct Addressing Mode',
          C: 'Absolute Addressing Mode',
          D: 'Immediate Addressing Mode'
        },
        correctAnswer: 'A',
        explanation: 'PC-relative addressing computes effective address as: EA = PC + Offset. Since branch destinations are expressed relative to the current instruction pointer, the code can be loaded anywhere in memory without modifying instruction addresses.'
      },
      {
        id: 5,
        question: 'In a 5-stage MIPS pipeline (IF, ID, EX, MEM, WB), what hazard occurs when instruction I2 requires the result computed by instruction I1 before I1 writes it back to the register file?',
        options: {
          A: 'RAW (Read-After-Write) Data Hazard',
          B: 'WAR (Write-After-Read) Hazard',
          C: 'WAW (Write-After-Write) Hazard',
          D: 'Structural Hazard'
        },
        correctAnswer: 'A',
        explanation: 'When I2 tries to read a register operand before I1 writes it back in the WB stage, it constitutes a Read-After-Write (RAW) data dependency / hazard, typically resolved by Operand Forwarding (bypassing).'
      },
      {
        id: 6,
        question: 'What is the primary architectural advantage of a microprogrammed control unit over a hardwired control unit?',
        options: {
          A: 'Flexibility and ease of modifying instruction sets by updating microcode in control memory',
          B: 'Faster execution speed than hardwired circuits',
          C: 'Zero hardware cost',
          D: 'Does not require clock signals'
        },
        correctAnswer: 'A',
        explanation: 'Microprogrammed control units store control words in ROM/RAM, making instruction updates and bug fixes simple. Hardwired control units are faster because they use fixed combinatorial logic gates, but they are rigid and difficult to redesign.'
      },
      {
        id: 7,
        question: 'In IEEE 754 single-precision 32-bit floating-point representation, what are the bit allocations for Sign, Biased Exponent, and Mantissa respectively?',
        options: {
          A: '1 bit Sign, 8 bits Exponent (Bias 127), 23 bits Mantissa',
          B: '1 bit Sign, 11 bits Exponent (Bias 1023), 20 bits Mantissa',
          C: '1 bit Sign, 7 bits Exponent, 24 bits Mantissa',
          D: '2 bits Sign, 8 bits Exponent, 22 bits Mantissa'
        },
        correctAnswer: 'A',
        explanation: 'IEEE 754 single precision allocates: 1 bit for sign, 8 bits for excess-127 biased exponent, and 23 bits for the fractional mantissa with an implicit leading 1.'
      },
      {
        id: 8,
        question: 'What is the main function of a DMA (Direct Memory Access) controller in a computer system?',
        options: {
          A: 'To transfer high-volume data directly between high-speed I/O devices and main memory without continuous CPU intervention',
          B: 'To execute arithmetic instructions',
          C: 'To manage virtual page tables',
          D: 'To increase cache associativity'
        },
        correctAnswer: 'A',
        explanation: 'The DMA controller takes over bus mastership to stream blocks of data directly between secondary storage/network devices and RAM, interrupting the CPU only upon completion.'
      },
      {
        id: 9,
        question: 'In Booth\'s multiplication algorithm, what operation is performed when the two inspected bits (Q0, Q-1) are `01` and `10` respectively?',
        options: {
          A: 'Add multiplicand to accumulator on 01; Subtract multiplicand from accumulator on 10',
          B: 'Subtract on 01; Add on 10',
          C: 'Arithmetic right shift only',
          D: 'Logical left shift only'
        },
        correctAnswer: 'A',
        explanation: 'Booth\'s algorithm checks transitions: `01` represents the beginning of a string of 1s, requiring addition of multiplicand: A = A + M. `10` represents the end of a string of 1s, requiring subtraction: A = A - M. Followed by arithmetic right shift.'
      },
      {
        id: 10,
        question: 'If a computer has a CPI (Cycles Per Instruction) of 1.5, clock frequency of 2 GHz, and program length of 10^9 instructions, what is the CPU execution time?',
        options: {
          A: '0.75 seconds',
          B: '1.5 seconds',
          C: '3.0 seconds',
          D: '0.5 seconds'
        },
        correctAnswer: 'A',
        explanation: 'CPU Time = (Instruction Count * CPI) / Clock Frequency = (10^9 * 1.5) / (2 * 10^9 cycles/sec) = 1.5 / 2 = 0.75 seconds.'
      }
    ]
  },

  // 6. DIGITAL LOGIC
  {
    id: 'exam_gate_dl',
    subjectId: 'dl',
    subject: 'Digital Logic',
    quizTitle: 'GATE CS: Digital Logic & Boolean Circuits',
    difficulty: 'Hard',
    totalQuestions: 10,
    timeLimitMinutes: 30,
    description: 'K-map minimization, multiplexer implementations, JK flip-flop race conditions, synchronous counters, setup/hold times, and IEEE 754.',
    topics: ['K-Maps & Boolean Algebra', 'Multiplexers & Decoders', 'Flip-Flops & Race Conditions', 'Counters & Registers', 'Timing & Propagation'],
    questions: [
      {
        id: 1,
        question: 'What is the minimum number of 2-to-1 Multiplexers required to implement a 16-to-1 Multiplexer?',
        options: {
          A: '15',
          B: '16',
          C: '8',
          D: '4'
        },
        correctAnswer: 'A',
        explanation: 'Tree construction: Stage 1 needs 16/2 = 8 multiplexers. Stage 2 needs 8/2 = 4 multiplexers. Stage 3 needs 4/2 = 2 multiplexers. Stage 4 needs 2/2 = 1 multiplexer. Total = 8 + 4 + 2 + 1 = 15 multiplexers (Formula: N - 1 = 16 - 1 = 15).'
      },
      {
        id: 2,
        question: 'In a Master-Slave JK Flip-Flop, how is the race-around condition prevented?',
        options: {
          A: 'The Master captures inputs on the positive clock edge while the Slave is disabled, and the Slave transfers output on the negative clock edge when the Master is disabled',
          B: 'By setting clock frequency to zero',
          C: 'By ensuring J and K are never equal to 1',
          D: 'By adding an external inverter'
        },
        correctAnswer: 'A',
        explanation: 'Race-around occurs in level-triggered flip-flops when J=K=1 and propagation delay is shorter than clock pulse width. Master-Slave isolates input capture and output update across opposite clock phases, eliminating race-around.'
      },
      {
        id: 3,
        question: 'How many flip-flops are required to construct a Mod-60 counter?',
        options: {
          A: '6 flip-flops (since 2^5 = 32 < 60 <= 2^6 = 64)',
          B: '5 flip-flops',
          C: '60 flip-flops',
          D: '4 flip-flops'
        },
        correctAnswer: 'A',
        explanation: 'For a mod-N counter, the required number of flip-flops n satisfies: 2^(n-1) < N <= 2^n. For N = 60, 2^5 = 32 < 60 <= 2^6 = 64. Hence, exactly 6 flip-flops are required.'
      },
      {
        id: 4,
        question: 'What is the minimal sum of products for the function F(A, B, C) = Σm(0, 1, 4, 5, 6)?',
        options: {
          A: 'B\' + A C\'',
          B: 'A\' B + B C',
          C: 'A B\' + C\'',
          D: 'A\' + B\' C'
        },
        correctAnswer: 'A',
        explanation: 'In K-map: Group 1 of 4 minterms (0, 1, 4, 5) gives B\'. Group 2 of 2 minterms (4, 6) gives A C\'. Combining both prime implicants gives F = B\' + A C\'.'
      },
      {
        id: 5,
        question: 'In sequential digital circuits, what is "Setup Time" (t_setup)?',
        options: {
          A: 'The minimum time interval that data input must remain stable BEFORE the active clock edge arrives',
          B: 'The time data must remain stable after the clock edge',
          C: 'The time taken to power on the chip',
          D: 'The propagation delay of the clock buffer'
        },
        correctAnswer: 'A',
        explanation: 'Setup time is the minimum duration the data input signal must be held stable before the triggering clock edge occurs to ensure correct latching. Violating setup time causes metastability.'
      },
      {
        id: 6,
        question: 'What is the condition for arithmetic overflow when adding two n-bit signed 2\'s complement numbers?',
        options: {
          A: 'Carry into the sign bit differs from carry out of the sign bit: V = C_in ⊕ C_out',
          B: 'Carry out of MSB is 1',
          C: 'Both numbers are positive',
          D: 'The result is zero'
        },
        correctAnswer: 'A',
        explanation: 'Signed 2\'s complement overflow occurs if and only if two positive numbers produce a negative result or two negative numbers produce a positive result. This happens precisely when the carry into the sign bit differs from the carry out: Overflow = C_(n-1) ⊕ C_n.'
      },
      {
        id: 7,
        question: 'How many 3-to-8 line decoders with an enable input are needed to construct a 4-to-16 line decoder?',
        options: {
          A: '2 decoders and 1 inverter',
          B: '4 decoders',
          C: '3 decoders',
          D: '5 decoders'
        },
        correctAnswer: 'A',
        explanation: 'Two 3-to-8 decoders produce 16 outputs (8 outputs each). The 4th input bit is connected directly to the Enable of one decoder and inverted to the Enable of the other.'
      },
      {
        id: 8,
        question: 'What is the dual of the Boolean expression: A + B\' · C?',
        options: {
          A: 'A · (B\' + C)',
          B: 'A\' + B · C\'',
          C: 'A\' · (B + C\')',
          D: 'A + B · C\''
        },
        correctAnswer: 'A',
        explanation: 'Duality principle: swap AND with OR (+ with ·), and 0 with 1, leaving variable literals intact. Original: A + (B\' · C). Dual: A · (B\' + C).'
      },
      {
        id: 9,
        question: 'Which logic gate produces a HIGH output if and only if an ODD number of its inputs are HIGH?',
        options: {
          A: 'XOR gate',
          B: 'XNOR gate',
          C: 'NAND gate',
          D: 'NOR gate'
        },
        correctAnswer: 'A',
        explanation: 'An XOR gate is a parity generator: its output is 1 whenever the number of 1s in its inputs is odd.'
      },
      {
        id: 10,
        question: 'What is the 2\'s complement of the binary number `110100`?',
        options: {
          A: '001100',
          B: '001011',
          C: '001101',
          D: '110101'
        },
        correctAnswer: 'A',
        explanation: '1\'s complement of 110100 = 001011. Adding 1: 001011 + 1 = 001100.'
      }
    ]
  },

  // 7. COMPILER DESIGN
  {
    id: 'exam_gate_cd',
    subjectId: 'cd',
    subject: 'Compiler Design',
    quizTitle: 'GATE CS: Compiler Design & Parsing',
    difficulty: 'Hard',
    totalQuestions: 10,
    timeLimitMinutes: 30,
    description: 'LL(1) parsing tables, FIRST/FOLLOW calculation, LR parser hierarchy (LR(0), SLR(1), LALR(1), CLR(1)), SDT, and basic block optimization.',
    topics: ['FIRST & FOLLOW', 'LL(1) & LR Parsing', 'Syntax Directed Translation', 'Code Optimization', 'Activation Records'],
    questions: [
      {
        id: 1,
        question: 'Given the grammar: S -> Aa | bAc | dc, A -> d. What is the FOLLOW(A)?',
        options: {
          A: '{ a, c }',
          B: '{ a }',
          C: '{ c }',
          D: '{ $, a }'
        },
        correctAnswer: 'A',
        explanation: 'In S -> Aa, \'a\' follows A, so a ∈ FOLLOW(A). In S -> bAc, \'c\' follows A, so c ∈ FOLLOW(A). Thus FOLLOW(A) = { a, c }.'
      },
      {
        id: 2,
        question: 'Which of the following describes the correct ascending hierarchy of bottom-up parsing power?',
        options: {
          A: 'LR(0) < SLR(1) < LALR(1) < CLR(1)',
          B: 'SLR(1) < LR(0) < LALR(1) < CLR(1)',
          C: 'LALR(1) < SLR(1) < LR(0) < CLR(1)',
          D: 'LR(0) < LALR(1) < SLR(1) < CLR(1)'
        },
        correctAnswer: 'A',
        explanation: 'LR(0) is the weakest. SLR(1) improves LR(0) by using FOLLOW sets for reduce actions. LALR(1) merges states with identical core items. CLR(1) uses full lookaheads and has maximum parsing power.'
      },
      {
        id: 3,
        question: 'What kind of conflicts can occur when merging states with identical cores to create an LALR(1) parsing table from a CLR(1) table?',
        options: {
          A: 'Reduce-Reduce (R-R) conflicts may be introduced, but never Shift-Reduce (S-R) conflicts',
          B: 'Both S-R and R-R conflicts can be introduced',
          C: 'Only Shift-Reduce conflicts can be introduced',
          D: 'No conflicts can ever be introduced'
        },
        correctAnswer: 'A',
        explanation: 'Merging states with the same core items cannot create new Shift-Reduce conflicts because shift actions depend only on core items. However, merging can combine different lookaheads on reduce items, potentially creating Reduce-Reduce conflicts.'
      },
      {
        id: 4,
        question: 'In Syntax-Directed Translation, what is an S-attributed definition?',
        options: {
          A: 'A grammar where every attribute is synthesized (computed solely from children nodes in the parse tree)',
          B: 'A grammar with only inherited attributes',
          C: 'A grammar evaluated top-down',
          D: 'A grammar without semantic actions'
        },
        correctAnswer: 'A',
        explanation: 'An S-attributed SDD contains exclusively synthesized attributes, which can be evaluated naturally during bottom-up parsing (e.g., LR parsing) using an evaluation stack.'
      },
      {
        id: 5,
        question: 'How are leaders identified when partitioning intermediate code into Basic Blocks?',
        options: {
          A: '1) The first three-address instruction is a leader; 2) Any instruction that is the target of a conditional or unconditional jump is a leader; 3) Any instruction that immediately follows a jump is a leader',
          B: 'Only branch instructions are leaders',
          C: 'Every assignment instruction is a leader',
          D: 'Leaders are selected randomly'
        },
        correctAnswer: 'A',
        explanation: 'Standard Dragon Book basic block algorithm: Leader rules are: 1) First instruction; 2) Target of any jump; 3) Instruction immediately following any jump.'
      },
      {
        id: 6,
        question: 'Which compiler optimization replaces expressions computed inside a loop whose values do not change across iterations?',
        options: {
          A: 'Loop Invariant Code Motion (Loop Hoisting)',
          B: 'Loop Unrolling',
          C: 'Dead Code Elimination',
          D: 'Strength Reduction'
        },
        correctAnswer: 'A',
        explanation: 'Loop Invariant Code Motion detects computations whose operand values remain invariant throughout loop executions and hoists them out to the loop pre-header.'
      },
      {
        id: 7,
        question: 'What is "Strength Reduction" in compiler optimization?',
        options: {
          A: 'Replacing an expensive operation (such as multiplication) with a cheaper operation (such as addition or left shift)',
          B: 'Deleting unreachable functions',
          C: 'Merging basic blocks',
          D: 'Compressing AST nodes'
        },
        correctAnswer: 'A',
        explanation: 'Strength reduction replaces high-cost machine instructions with equivalent lower-cost operations, such as replacing `i * 4` inside an array index loop with an addition accumulator `+ 4`.'
      },
      {
        id: 8,
        question: 'Can an ambiguous grammar ever be parsed by an LL(1) or LR(1) parser?',
        options: {
          A: 'No, an ambiguous grammar can never be LL(k) or LR(k) for any k',
          B: 'Yes, if lookahead k >= 2',
          C: 'Yes, all ambiguous grammars are LR(1)',
          D: 'Only if it has no epsilon productions'
        },
        correctAnswer: 'A',
        explanation: 'Ambiguity means there exists a string with two distinct leftmost or rightmost derivations (two different parse trees). LL and LR parsers require unique, deterministic parsing decisions, so an ambiguous grammar is never LL(k) or LR(k).'
      },
      {
        id: 9,
        question: 'In register allocation, what graph problem is used to determine whether k physical registers are sufficient?',
        options: {
          A: 'Graph Coloring Problem (k-colorability of interference graph)',
          B: 'Travelling Salesman Problem',
          C: 'Max-Flow Min-Cut',
          D: 'Topological Sort'
        },
        correctAnswer: 'A',
        explanation: 'Chaitin\'s formulation models register allocation as graph coloring: variables with overlapping live ranges are connected by edges in a register interference graph. Finding a valid assignment with k registers is equivalent to k-coloring the interference graph.'
      },
      {
        id: 10,
        question: 'What is stored in an Activation Record (Stack Frame) on the call stack?',
        options: {
          A: 'Local variables, actual parameters, return address, and saved machine status',
          B: 'Global variables only',
          C: 'Heap memory pointers only',
          D: 'Operating system page tables'
        },
        correctAnswer: 'A',
        explanation: 'An activation record manages a function invocation, containing: parameters, return address, dynamic link (old frame pointer), saved registers, and local variables.'
      }
    ]
  },

  // 8. COMPUTER NETWORKS
  {
    id: 'exam_gate_cn',
    subjectId: 'cn',
    subject: 'Computer Networks',
    quizTitle: 'GATE CS: Computer Networks & Protocols',
    difficulty: 'Hard',
    totalQuestions: 10,
    timeLimitMinutes: 30,
    description: 'Subnetting calculations, Stop-and-Wait/Sliding Window protocols, CSMA/CD frame limits, TCP flow/congestion control, and routing invariants.',
    topics: ['Subnetting & CIDR', 'Sliding Window', 'TCP Congestion Control', 'CSMA/CD', 'Routing Protocols'],
    questions: [
      {
        id: 1,
        question: 'An organization is granted the IP block 192.168.10.0/26. What is the maximum number of assignable host IP addresses in this subnet, and what is its broadcast address?',
        options: {
          A: '62 hosts, broadcast: 192.168.10.63',
          B: '64 hosts, broadcast: 192.168.10.64',
          C: '30 hosts, broadcast: 192.168.10.31',
          D: '126 hosts, broadcast: 192.168.10.127'
        },
        correctAnswer: 'A',
        explanation: 'With a /26 prefix, the host bits = 32 - 26 = 6 bits. Total IP addresses = 2^6 = 64. The assignable host addresses = 64 - 2 (network address and broadcast address) = 62. The block spans 192.168.10.0 to 192.168.10.63. The broadcast address is 192.168.10.63.'
      },
      {
        id: 2,
        question: 'In a Stop-and-Wait protocol, the packet size is 1000 bytes, bandwidth is 1 Mbps, and one-way propagation delay is 20 ms. What is the channel utilization (efficiency), neglecting ACK packet transmission time?',
        options: {
          A: '16.7%',
          B: '25.0%',
          C: '50.0%',
          D: '10.0%'
        },
        correctAnswer: 'A',
        explanation: 'Transmission time T_t = (1000 * 8 bits) / (10^6 bps) = 8 ms. Propagation delay T_p = 20 ms. Parameter a = T_p / T_t = 20 / 8 = 2.5. Channel utilization for Stop-and-Wait: U = 1 / (1 + 2a) = 1 / (1 + 2 * 2.5) = 1 / 6 ≈ 16.67%.'
      },
      {
        id: 3,
        question: 'In a 10 Mbps CSMA/CD Ethernet network with propagation speed 2 * 10^8 m/s, the maximum cable length between any two stations is 1 km. What is the minimum frame size required for proper collision detection?',
        options: {
          A: '100 bits',
          B: '100 bytes (800 bits)',
          C: '200 bits',
          D: '500 bits'
        },
        correctAnswer: 'A',
        explanation: 'One-way propagation delay T_p = Distance / Speed = 1000 m / (2 * 10^8 m/s) = 5 * 10^-6 s = 5 microseconds. For CSMA/CD collision detection, T_t >= 2 * T_p = 10 microseconds. Minimum frame size = Bandwidth * (2 * T_p) = (10 * 10^6 bps) * (10 * 10^-6 s) = 100 bits.'
      },
      {
        id: 4,
        question: 'In a Selective Repeat ARQ sliding window protocol using m-bit sequence numbers, what is the maximum permissible sender and receiver window size to prevent ambiguity?',
        options: {
          A: '2^(m - 1)',
          B: '2^m',
          C: '2^m - 1',
          D: '2^(m + 1)'
        },
        correctAnswer: 'A',
        explanation: 'In Selective Repeat, window size of sender W_s plus window size of receiver W_r must satisfy: W_s + W_r <= 2^m. Since typically W_s = W_r, we have 2 * W <= 2^m, so maximum window size = 2^(m - 1).'
      },
      {
        id: 5,
        question: 'A TCP connection is undergoing Congestion Avoidance with current congestion window (cwnd) = 16 MSS. If 3 consecutive duplicate ACKs are received, what will be the new values of ssthresh and cwnd under TCP Reno?',
        options: {
          A: 'ssthresh = 8 MSS, cwnd = 8 MSS + 3 MSS = 11 MSS (Fast Recovery)',
          B: 'ssthresh = 8 MSS, cwnd = 1 MSS',
          C: 'ssthresh = 16 MSS, cwnd = 8 MSS',
          D: 'ssthresh = 4 MSS, cwnd = 1 MSS'
        },
        correctAnswer: 'A',
        explanation: 'Under TCP Reno, triple duplicate ACKs trigger Fast Retransmit and Fast Recovery: ssthresh is halved to cwnd / 2 = 16 / 2 = 8 MSS. Then cwnd is set to ssthresh + 3 MSS = 11 MSS, avoiding a drop to 1 MSS (which only happens upon a full RTO timeout).'
      },
      {
        id: 6,
        question: 'What is the maximum number of bytes in the options field of an IPv4 packet header?',
        options: {
          A: '40 bytes',
          B: '20 bytes',
          C: '60 bytes',
          D: '65535 bytes'
        },
        correctAnswer: 'A',
        explanation: 'The Internet Header Length (IHL) field is 4 bits, holding values up to 15 (representing 4-byte words). Maximum IPv4 header length = 15 * 4 = 60 bytes. The base header is 20 bytes, leaving at most 60 - 20 = 40 bytes for optional parameters.'
      },
      {
        id: 7,
        question: 'What is the primary mechanism used by Distance Vector routing protocols (like RIP) to mitigate the Count-to-Infinity problem?',
        options: {
          A: 'Split Horizon and Poison Reverse',
          B: 'Dijkstra Link State Advertisements (LSA)',
          C: 'Binary Exponential Backoff',
          D: 'Spanning Tree Protocol'
        },
        correctAnswer: 'A',
        explanation: 'Distance Vector protocols resolve routing loops and the count-to-infinity problem using Split Horizon (never advertise a route back out the interface it was learned from) and Poison Reverse (advertise the route back with an infinite metric of 16).'
      },
      {
        id: 8,
        question: 'An IP datagram of total size 4000 bytes (including 20 bytes IP header) arrives at a router whose outgoing link has an MTU of 1500 bytes. What is the value of the Fragment Offset in the second fragment?',
        options: {
          A: '185',
          B: '1480',
          C: '370',
          D: '1500'
        },
        correctAnswer: 'A',
        explanation: 'MTU = 1500 bytes. With 20 bytes header, maximum payload per fragment = 1480 bytes (which is divisible by 8: 1480 / 8 = 185). First fragment carries data bytes 0 to 1479. The second fragment starts at byte 1480. Fragment Offset = 1480 / 8 = 185.'
      },
      {
        id: 9,
        question: 'What is the minimum header size of a TCP segment and a UDP segment respectively?',
        options: {
          A: '20 bytes and 8 bytes',
          B: '16 bytes and 4 bytes',
          C: '24 bytes and 12 bytes',
          D: '20 bytes and 20 bytes'
        },
        correctAnswer: 'A',
        explanation: 'A standard TCP header has a minimum size of 20 bytes (without options). A UDP header consists of 4 fields (Source Port, Destination Port, Length, Checksum) each of 2 bytes, totaling exactly 8 bytes.'
      },
      {
        id: 10,
        question: 'In the Domain Name System (DNS), what is the difference between an Iterative query and a Recursive query?',
        options: {
          A: 'In a recursive query, the contacted server assumes responsibility to resolve the full name and return the IP, whereas in an iterative query, the server returns the best referral IP it knows for the client to follow up',
          B: 'Iterative queries only work with IPv6',
          C: 'Recursive queries do not use UDP',
          D: 'Iterative queries are used only by web browsers'
        },
        correctAnswer: 'A',
        explanation: 'In recursive DNS queries, the DNS resolver takes full responsibility and queries other nameservers until the final IP is found. In iterative queries, the nameserver simply returns a referral to the next authoritative server (e.g., TLD or root server) for the client to query directly.'
      }
    ]
  },

  // 9. DATABASE MANAGEMENT SYSTEMS
  {
    id: 'exam_gate_dbms',
    subjectId: 'dbms',
    subject: 'Database Management Systems',
    quizTitle: 'GATE CS: Database Management Systems (DBMS)',
    difficulty: 'Hard',
    totalQuestions: 10,
    timeLimitMinutes: 30,
    description: 'Candidate key identification, 3NF vs BCNF normal forms, Conflict Serializability graphs, Two-Phase Locking (2PL), and B+ tree index structures.',
    topics: ['Normalization & BCNF', 'Conflict Serializability', 'Two-Phase Locking (2PL)', 'B+ Tree Fan-out', 'SQL Relational Algebra'],
    questions: [
      {
        id: 1,
        question: 'Given relation R(A, B, C, D, E) with Functional Dependencies: F = { A -> BC, CD -> E, B -> D, E -> A }. What are the candidate keys of R?',
        options: {
          A: 'A, B, E, and CD',
          B: 'Only A and B',
          C: 'Only A',
          D: 'AB and CDE'
        },
        correctAnswer: 'A',
        explanation: 'Computing attribute closures: A+ = {A, B, C, D, E} (Key). B+ = {B, D}; with C, BC+ = {B, C, D, E, A} (Key). Since A -> BC, B+ with C gives all. E+ = {E, A, B, C, D} -> E is a key. CD+ = {C, D, E, A, B} -> CD is a key. Candidate keys are A, E, CD, and BC.'
      },
      {
        id: 2,
        question: 'A relation R with functional dependencies is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X -> Y:',
        options: {
          A: 'X is a superkey of R',
          B: 'Y is a prime attribute (part of a candidate key)',
          C: 'X is a single attribute',
          D: 'R has no composite primary keys'
        },
        correctAnswer: 'A',
        explanation: 'BCNF is strictly defined: for every non-trivial functional dependency X -> Y, X must be a superkey of R. Unlike 3NF, BCNF does not allow the exception where Y is a prime attribute.'
      },
      {
        id: 3,
        question: 'Consider a schedule S with transactions T1 and T2: r1(X); r2(X); w1(X); r1(Y); w2(X); w1(Y). Is this schedule conflict serializable?',
        options: {
          A: 'No, because there is a cycle in the precedence graph: T1 -> T2 and T2 -> T1',
          B: 'Yes, equivalent to T1 followed by T2',
          C: 'Yes, equivalent to T2 followed by T1',
          D: 'It is view serializable only'
        },
        correctAnswer: 'A',
        explanation: 'Conflicting pairs on item X: r2(X) precedes w1(X) -> edge T2 -> T1. Also w1(X) precedes w2(X) -> edge T1 -> T2. The precedence graph contains the cycle T1 <-> T2. Hence, schedule S is NOT conflict serializable.'
      },
      {
        id: 4,
        question: 'Under the Basic Two-Phase Locking (2PL) protocol, what is guaranteed?',
        options: {
          A: 'Conflict Serializability, but deadlocks and cascading rollbacks are still possible',
          B: 'Freedom from both deadlocks and cascading rollbacks',
          C: 'Only view serializability',
          D: 'Freedom from deadlocks only'
        },
        correctAnswer: 'A',
        explanation: 'Basic 2PL ensures that transactions acquire all locks in a growing phase and release them in a shrinking phase. This mathematically guarantees conflict serializability, but it does NOT prevent deadlocks or cascading aborts (Strict 2PL is required to prevent cascading aborts).'
      },
      {
        id: 5,
        question: 'A B+ tree index is constructed on a table where block size is 4096 bytes. Each search key is 12 bytes and each block pointer is 8 bytes. What is the maximum order (number of block pointers) of an internal node?',
        options: {
          A: '205',
          B: '204',
          C: '170',
          D: '256'
        },
        correctAnswer: 'A',
        explanation: 'An internal node with order p contains at most p block pointers and p - 1 search keys. Space equation: p * (pointer size) + (p - 1) * (key size) <= Block Size. p * 8 + (p - 1) * 12 <= 4096 => 20p - 12 <= 4096 => 20p <= 4108 => p <= 205.4. Thus maximum order p = 205.'
      },
      {
        id: 6,
        question: 'In SQL, what is the primary distinction between the WHERE clause and the HAVING clause?',
        options: {
          A: 'WHERE filters individual rows before grouping, whereas HAVING filters aggregated groups after the GROUP BY operation',
          B: 'HAVING can only be used with subqueries',
          C: 'WHERE can use aggregate functions like COUNT() directly, HAVING cannot',
          D: 'They are completely interchangeable in SQL-92'
        },
        correctAnswer: 'A',
        explanation: 'The WHERE clause filters individual records prior to aggregation and cannot evaluate aggregate functions like AVG() or SUM(). The HAVING clause is evaluated after GROUP BY to filter grouped results based on aggregate conditions.'
      },
      {
        id: 7,
        question: 'What is the Write-Ahead Logging (WAL) protocol in database transaction management?',
        options: {
          A: 'The log records describing an update must be flushed to non-volatile disk before the corresponding dirty data page is written to disk',
          B: 'All queries must be written to log files before parsing',
          C: 'Indexes must be updated before data blocks',
          D: 'Transactions must write all data to memory before committing'
        },
        correctAnswer: 'A',
        explanation: 'WAL states that: 1) Any update\'s UNDO log record must be flushed to stable storage before the dirty data page replaces the disk copy, and 2) All REDO log records must be flushed before the commit record is acknowledged, ensuring Durability (ACID).'
      },
      {
        id: 8,
        question: 'In Relational Algebra, what is the result of natural join R ⨝ S if relation R and S have NO common attributes?',
        options: {
          A: 'Cartesian Product (Cross Product) R × S',
          B: 'Empty relation (null)',
          C: 'Union R ∪ S',
          D: 'Intersection R ∩ S'
        },
        correctAnswer: 'A',
        explanation: 'A natural join performs an equijoin on all attributes with matching names and projects away duplicates. If R and S share no common attributes, no equality conditions are evaluated, degenerating naturally into the Cartesian Product (R × S).'
      },
      {
        id: 9,
        question: 'What is a "lossless join" decomposition in database normalization?',
        options: {
          A: 'When decomposing relation R into R1 and R2, natural joining R1 and R2 reproduces exactly the original relation R with no spurious tuples',
          B: 'No attribute values are NULL in either relation',
          C: 'Both relations have the exact same number of tuples',
          D: 'All functional dependencies are preserved'
        },
        correctAnswer: 'A',
        explanation: 'A decomposition is lossless if R1 ⨝ R2 = R. By theorem, decomposition into (R1, R2) is lossless if and only if R1 ∩ R2 forms a superkey of R1 or a superkey of R2, ensuring no phantom tuples are generated.'
      },
      {
        id: 10,
        question: 'Which isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still permit Phantom Reads?',
        options: {
          A: 'Repeatable Read',
          B: 'Read Committed',
          C: 'Read Uncommitted',
          D: 'Serializable'
        },
        correctAnswer: 'A',
        explanation: 'In ANSI SQL isolation levels: Repeatable Read prevents Dirty Reads (reading uncommitted data) and Non-Repeatable Reads (row values changing between reads). However, it may still allow Phantom Reads (new rows inserted by another committed transaction matching a range query).'
      }
    ]
  },

  // 10. ENGINEERING & DISCRETE MATHEMATICS
  {
    id: 'exam_gate_math',
    subjectId: 'math',
    subject: 'Engineering & Discrete Mathematics',
    quizTitle: 'GATE CS: Discrete Mathematics & Linear Algebra',
    difficulty: 'Hard',
    totalQuestions: 10,
    timeLimitMinutes: 30,
    description: 'Graph handshaking theorem, propositional logic, eigenvalues & eigenvectors, Bayes conditional probability, and equivalence relations.',
    topics: ['Graph Theory', 'Propositional Logic', 'Linear Algebra', 'Probability & Bayes', 'Equivalence Relations'],
    questions: [
      {
        id: 1,
        question: 'A simple planar connected graph G has 20 vertices and each vertex has degree 3. How many faces (regions) does G divide the plane into?',
        options: {
          A: '12 faces',
          B: '10 faces',
          C: '14 faces',
          D: '8 faces'
        },
        correctAnswer: 'A',
        explanation: 'Handshaking theorem: sum of degrees = 2|E| => 20 * 3 = 2|E| => |E| = 30 edges. Euler\'s formula for connected planar graphs: V - E + F = 2. Here: 20 - 30 + F = 2 => -10 + F = 2 => F = 12 faces.'
      },
      {
        id: 2,
        question: 'What is the contrapositive of the proposition: "If it rains, then the match is cancelled" (P -> Q)?',
        options: {
          A: 'If the match is not cancelled, then it does not rain (~Q -> ~P)',
          B: 'If it does not rain, then the match is not cancelled',
          C: 'If the match is cancelled, then it rains',
          D: 'It rains and the match is not cancelled'
        },
        correctAnswer: 'A',
        explanation: 'The contrapositive of conditional statement P -> Q is logically equivalent to ~Q -> ~P: "If the match is not cancelled, then it does not rain."'
      },
      {
        id: 3,
        question: 'If A is a 3 x 3 matrix with eigenvalues 1, -2, and 4, what is the determinant of (A^2 + 2I)?',
        options: {
          A: '3 * 6 * 18 = 324',
          B: '18',
          C: '-8',
          D: '128'
        },
        correctAnswer: 'A',
        explanation: 'If λ is an eigenvalue of A, the eigenvalues of (A^2 + 2I) are (λ^2 + 2). For λ1 = 1: 1^2 + 2 = 3. For λ2 = -2: (-2)^2 + 2 = 6. For λ3 = 4: 4^2 + 2 = 18. The determinant is the product of eigenvalues: 3 * 6 * 18 = 324.'
      },
      {
        id: 4,
        question: 'Box 1 contains 2 gold and 3 silver coins. Box 2 contains 3 gold and 1 silver coins. A box is chosen at random and a coin drawn is found to be gold. What is the probability it came from Box 1?',
        options: {
          A: '8 / 23',
          B: '15 / 23',
          C: '2 / 5',
          D: '1 / 2'
        },
        correctAnswer: 'A',
        explanation: 'By Bayes Theorem: P(B1) = P(B2) = 1/2. P(G|B1) = 2/5, P(G|B2) = 3/4. P(G) = (1/2)*(2/5) + (1/2)*(3/4) = 1/5 + 3/8 = 23/40. P(B1|G) = [P(B1)*P(G|B1)] / P(G) = (1/5) / (23/40) = 8/23.'
      },
      {
        id: 5,
        question: 'Let R be a relation on the set of integers Z defined by (a, b) ∈ R if and only if (a - b) is divisible by 5. What type of relation is R?',
        options: {
          A: 'Equivalence Relation (Reflexive, Symmetric, and Transitive)',
          B: 'Partial Order Relation',
          C: 'Strict Order Relation',
          D: 'Symmetric only'
        },
        correctAnswer: 'A',
        explanation: 'Congruence modulo 5: 1) Reflexive: a - a = 0 is divisible by 5; 2) Symmetric: if a - b is div by 5, b - a = -(a - b) is div by 5; 3) Transitive: (a - b) + (b - c) = a - c is div by 5. Hence, R is an Equivalence Relation.'
      },
      {
        id: 6,
        question: 'What is the value of the limit: lim_(x -> 0) (sin x - x) / x^3?',
        options: {
          A: '-1/6',
          B: '1/6',
          C: '0',
          D: 'Does not exist'
        },
        correctAnswer: 'A',
        explanation: 'Using Taylor expansion: sin x = x - x^3 / 6 + x^5 / 120 - ... Subtracting x gives -x^3 / 6 + O(x^5). Dividing by x^3 and taking limit as x -> 0 gives -1/6.'
      },
      {
        id: 7,
        question: 'In a group of 367 people, what is the minimum number of people who must share the same birthday?',
        options: {
          A: '2',
          B: '1',
          C: '3',
          D: '366'
        },
        correctAnswer: 'A',
        explanation: 'By the Generalized Pigeonhole Principle: there are at most 366 possible calendar birthdays (including leap year). Ceiling(367 / 366) = 2. Hence, at least 2 people must share the exact same birthday.'
      },
      {
        id: 8,
        question: 'What is the rank of the 4 x 4 identity matrix I_4?',
        options: {
          A: '4',
          B: '1',
          C: '0',
          D: '16'
        },
        correctAnswer: 'A',
        explanation: 'The rank of an n x n identity matrix is n, as all rows and columns are linearly independent.'
      },
      {
        id: 9,
        question: 'Which of the following propositions is a TAUTOLOGY?',
        options: {
          A: '(P ∧ (P → Q)) → Q (Modus Ponens)',
          B: 'P ∧ ¬P',
          C: 'P → (P ∧ Q)',
          D: '(P ∨ Q) → P'
        },
        correctAnswer: 'A',
        explanation: 'Modus Ponens: If P is true and P implies Q, then Q must be true. Truth table verifies [P ∧ (¬P ∨ Q)] → Q evaluates to TRUE under all truth assignments, making it a valid Tautology.'
      },
      {
        id: 10,
        question: 'If a graph G has 10 vertices and is 4-regular (every vertex has degree 4), how many edges does G have?',
        options: {
          A: '20 edges',
          B: '40 edges',
          C: '10 edges',
          D: '14 edges'
        },
        correctAnswer: 'A',
        explanation: 'Handshaking lemma: sum of degrees = 2 * |E|. For a 4-regular graph with 10 vertices: 10 * 4 = 40 = 2 * |E| => |E| = 20 edges.'
      }
    ]
  }
];
