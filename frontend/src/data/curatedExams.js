/**
 * EduMind AI — Curated CBT Exam Question Banks
 * Ready-to-attempt benchmark examinations across GATE CS/IT, TCS NQT, AI/ML, and Full-Stack Engineering.
 */

export const CURATED_EXAMS = [
  {
    id: 'exam_gate_os_01',
    track: 'gate',
    trackLabel: 'GATE Computer Science & IT',
    quizTitle: 'GATE CS: Operating Systems & Virtual Memory Mastery',
    category: 'Systems & Architecture',
    difficulty: 'Hard',
    totalQuestions: 10,
    timeLimitMinutes: 30,
    description: 'High-rigor assessment covering two-level paging, effective memory access time (EMAT), counting semaphores, Banker\'s algorithm, and disk scheduling.',
    topics: ['Paging & TLB', 'Semaphores & Concurrency', 'Deadlock & Banker\'s Algorithm', 'Disk Scheduling', 'Process Scheduling'],
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
          A: 'Deadlock can never occur because total resources (13) > 4 * (4 - 1)',
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
  {
    id: 'exam_gate_algo_02',
    track: 'gate',
    trackLabel: 'GATE Computer Science & IT',
    quizTitle: 'GATE CS: Data Structures & Algorithms Rigor',
    category: 'Algorithms & Discrete Math',
    difficulty: 'Hard',
    totalQuestions: 10,
    timeLimitMinutes: 30,
    description: 'Master theorem recurrences, AVL tree balancing, min-heap properties, Dijkstra vs Bellman-Ford, and 0/1 knapsack dynamic programming.',
    topics: ['Asymptotic Analysis', 'AVL & BST', 'Graph Algorithms', 'Dynamic Programming', 'Greedy Invariants'],
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
        explanation: 'In a min-heap, every parent is smaller than or equal to its children. Therefore, the maximum element cannot be an internal node (since it would have children larger than itself); it must reside in one of the leaf nodes, which span indices floor(n/2) + 1 through n.'
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
  {
    id: 'exam_tcs_nqt_03',
    track: 'tcs',
    trackLabel: 'TCS NQT & Tech Placement Qualifiers',
    quizTitle: 'TCS NQT: Advanced Coding Logic, Pointers & Pseudocode',
    category: 'Placement & Industry Coding',
    difficulty: 'Medium',
    totalQuestions: 10,
    timeLimitMinutes: 25,
    description: 'Comprehensive test on C pointers, recursion call stacks, string manipulation, bitwise logic, and algorithmic complexity questions commonly asked in TCS NQT & campus drives.',
    topics: ['C Pointers & Memory', 'Recursion Stacks', 'Bitwise Operators', 'String Algorithms', 'Pseudocode Invariants'],
    questions: [
      {
        id: 1,
        question: 'What is the output of the following C code snippet?\n\nint arr[] = {10, 20, 30, 40, 50};\nint *ptr = arr;\nprintf("%d", *(ptr + 2) + 5);',
        options: {
          A: '25',
          B: '35',
          C: '45',
          D: '55'
        },
        correctAnswer: 'B',
        explanation: 'arr decays to a pointer to its first element (10). ptr + 2 points to arr[2] which is 30. *(ptr + 2) dereferences it to 30. Then 30 + 5 evaluates to 35.'
      },
      {
        id: 2,
        question: 'Consider the recursive function:\n\nint func(int n) {\n  if (n <= 1) return 1;\n  return n * func(n - 2);\n}\n\nWhat is the return value of func(7)?',
        options: {
          A: '105',
          B: '48',
          C: '5040',
          D: '120'
        },
        correctAnswer: 'A',
        explanation: 'func(7) = 7 * func(5) = 7 * (5 * func(3)) = 7 * 5 * (3 * func(1)) = 7 * 5 * 3 * 1 = 105.'
      },
      {
        id: 3,
        question: 'What does the expression (x & (x - 1)) == 0 evaluate to in C for any positive integer x?',
        options: {
          A: 'Checks if x is an odd number',
          B: 'Checks if x is a power of 2',
          C: 'Checks if x is a prime number',
          D: 'Checks if x is divisible by 4'
        },
        correctAnswer: 'B',
        explanation: 'A power of two in binary has exactly one set bit (e.g. 8 is 1000). Subtracting 1 flips all bits up to that bit (8 - 1 = 7, which is 0111). Their bitwise AND (1000 & 0111) is 0000. Hence, (x & (x - 1)) == 0 tests if x is a power of 2.'
      },
      {
        id: 4,
        question: 'What is the time complexity of the following loop?\n\nfor (int i = 1; i <= n; i *= 2) {\n  for (int j = 1; j <= n; j++) {\n    // O(1) operations\n  }\n}',
        options: {
          A: 'O(n^2)',
          B: 'O(n log n)',
          C: 'O(n)',
          D: 'O((log n)^2)'
        },
        correctAnswer: 'B',
        explanation: 'The outer loop variable i doubles in each step (1, 2, 4, 8, ...), executing floor(log2 n) + 1 times. The inner loop executes n times for each outer iteration. Total operations = n * log2(n), giving O(n log n).'
      },
      {
        id: 5,
        question: 'What is the difference between malloc() and calloc() in standard C library?',
        options: {
          A: 'malloc() initializes allocated memory to zero, while calloc() leaves it uninitialized',
          B: 'calloc() allocates contiguous memory and zeroes out all allocated bytes, while malloc() leaves allocated memory with garbage values',
          C: 'malloc() can allocate more than 1 MB, calloc() cannot',
          D: 'calloc() allocates on the stack, while malloc() allocates on the heap'
        },
        correctAnswer: 'B',
        explanation: 'calloc(num_elements, element_size) allocates the required memory and initializes every byte to 0. malloc(size) allocates raw bytes from the heap without clearing them, containing garbage values.'
      },
      {
        id: 6,
        question: 'What will happen if you attempt to modify a string literal in C as follows?\n\nchar *str = "EduMind";\nstr[0] = \'e\';',
        options: {
          A: 'The string successfully becomes "eduMind"',
          B: 'Segmentation fault / Undefined behavior at runtime because string literals are stored in read-only memory',
          C: 'Compile-time error only',
          D: 'The character is ignored silently'
        },
        correctAnswer: 'B',
        explanation: 'In C, string literals like "EduMind" are stored in the read-only data segment (.rodata). Modifying read-only memory via a pointer causes a segmentation fault / access violation at runtime.'
      },
      {
        id: 7,
        question: 'What is the value of result after executing:\n\nint a = 5, b = 2;\nfloat result = (float)(a / b);',
        options: {
          A: '2.5',
          B: '2.0',
          C: '2.25',
          D: '0.0'
        },
        correctAnswer: 'B',
        explanation: 'In (a / b), both a and b are integers, so integer division occurs first: 5 / 2 = 2. Then the integer 2 is cast to float, resulting in 2.0. To obtain 2.5, at least one operand must be cast before division: ((float)a / b).'
      },
      {
        id: 8,
        question: 'What is the output of the following pseudocode?\n\nSet a = 12, b = 7\nSet a = a ^ b\nSet b = a ^ b\nSet a = a ^ b\nPrint a, b',
        options: {
          A: '12, 7',
          B: '7, 12',
          C: '0, 0',
          D: '19, 5'
        },
        correctAnswer: 'B',
        explanation: 'This is the classic three-step XOR swap algorithm. It swaps the values of variables a and b without requiring any third temporary variable: a becomes 7 and b becomes 12.'
      },
      {
        id: 9,
        question: 'In Object-Oriented Programming, what is Polymorphism achieved via function overriding called?',
        options: {
          A: 'Compile-time (Static) Polymorphism',
          B: 'Run-time (Dynamic) Polymorphism using virtual method tables (vtable)',
          C: 'Encapsulation',
          D: 'Cohesion'
        },
        correctAnswer: 'B',
        explanation: 'Function overriding allows a derived class to provide a specific implementation of a method declared in its base class. The method call is resolved dynamically at runtime using virtual tables (vtable), representing Run-time / Dynamic Polymorphism.'
      },
      {
        id: 10,
        question: 'What is the minimum number of queues required to implement a Last-In First-Out (LIFO) Stack data structure?',
        options: {
          A: '1',
          B: '2',
          C: '3',
          D: '4'
        },
        correctAnswer: 'B',
        explanation: 'A stack can be simulated using two queues by making either the push operation costly (O(n)) or the pop operation costly (O(n)), moving elements between the two queues to preserve LIFO order.'
      }
    ]
  },
  {
    id: 'exam_ai_ml_04',
    track: 'aiml',
    trackLabel: 'AI, Machine Learning & Data Science',
    quizTitle: 'AI & ML: Deep Learning, CNNs & Transformer Foundations',
    category: 'Artificial Intelligence',
    difficulty: 'Hard',
    totalQuestions: 10,
    timeLimitMinutes: 30,
    description: 'Rigorous assessment on Self-Attention mechanism, Backpropagation chain rules, CNN receptive fields, vanishing gradients, Adam optimizer, and evaluation metrics.',
    topics: ['Self-Attention & Transformers', 'CNN Architectures', 'Backpropagation', 'Loss Functions & Optimizers', 'Model Evaluation'],
    questions: [
      {
        id: 1,
        question: 'In the Scaled Dot-Product Attention formula: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V, why is the dot product scaled by 1/sqrt(d_k)?',
        options: {
          A: 'To reduce computational complexity of matrix multiplication',
          B: 'To prevent large magnitude dot products from pushing the softmax function into regions with extremely small gradients',
          C: 'To guarantee that the resulting attention matrix is symmetric',
          D: 'To normalize the vectors to unit length'
        },
        correctAnswer: 'B',
        explanation: 'For large values of dimension d_k, the dot products grow large in magnitude, pushing the softmax function into regions where the gradient is vanishingly small. Dividing by sqrt(d_k) stabilizes the variance of the logits to 1.'
      },
      {
        id: 2,
        question: 'Given an input feature map of size 32 x 32 x 3, if we apply a convolutional layer with 16 filters of size 5 x 5, stride 1, and padding 2, what is the output dimension?',
        options: {
          A: '32 x 32 x 16',
          B: '28 x 28 x 16',
          C: '30 x 30 x 16',
          D: '32 x 32 x 3'
        },
        correctAnswer: 'A',
        explanation: 'Output dimension formula: Out = floor((W - F + 2P)/S) + 1. Here W = 32, F = 5, P = 2, S = 1. Out = floor((32 - 5 + 4)/1) + 1 = 31 + 1 = 32. Since there are 16 filters, the output shape is 32 x 32 x 16.'
      },
      {
        id: 3,
        question: 'Which of the following activation functions mitigates the vanishing gradient problem in deep neural networks during backpropagation?',
        options: {
          A: 'Sigmoid',
          B: 'Tanh',
          C: 'ReLU (Rectified Linear Unit)',
          D: 'Softmax'
        },
        correctAnswer: 'C',
        explanation: 'The derivative of Sigmoid is at most 0.25 and Tanh is at most 1.0, both saturating at extreme inputs and causing vanishing gradients. ReLU has a constant derivative of 1 for all positive inputs (x > 0), allowing gradients to backpropagate without exponential decay.'
      },
      {
        id: 4,
        question: 'In a binary classification dataset where 98% of samples belong to the negative class and 2% belong to the positive class, which metric is the MOST deceptive if used alone?',
        options: {
          A: 'Accuracy',
          B: 'F1-Score',
          C: 'Precision',
          D: 'Area Under the ROC Curve (ROC-AUC)'
        },
        correctAnswer: 'A',
        explanation: 'In highly imbalanced data (98% negative), a naive model predicting negative for all samples achieves 98% accuracy despite failing to detect a single positive instance. Hence, accuracy is deceptive, whereas F1-Score and Precision-Recall curves capture true performance.'
      },
      {
        id: 5,
        question: 'What is the primary architectural difference between an LSTM and a standard vanilla Recurrent Neural Network (RNN)?',
        options: {
          A: 'LSTMs use attention layers instead of recurrence',
          B: 'LSTMs introduce a separate cell state and gating mechanisms (forget, input, and output gates) to regulate long-term gradient flow',
          C: 'LSTMs cannot process sequential text data',
          D: 'LSTMs have fewer parameters than vanilla RNNs'
        },
        correctAnswer: 'B',
        explanation: 'LSTMs combat the vanishing gradient problem of vanilla RNNs by maintaining an uninterrupted linear cell state conduit, regulated by three multiplicative sigmoid gates (forget gate, input gate, output gate) to preserve gradients across long sequence spans.'
      },
      {
        id: 6,
        question: 'What is the role of L2 Regularization (Weight Decay) in training machine learning models?',
        options: {
          A: 'It sets coefficients exactly to zero to perform automatic feature selection',
          B: 'It adds a penalty proportional to the sum of squared weights to the loss function, encouraging smaller weight magnitudes to prevent overfitting',
          C: 'It increases the learning rate dynamically',
          D: 'It replaces gradient descent with genetic algorithms'
        },
        correctAnswer: 'B',
        explanation: 'L2 regularization adds (lambda / 2) * sum(w_i^2) to the loss. This penalizes extreme weight values, smoothing the decision boundary and reducing model variance (overfitting). In contrast, L1 regularization (Lasso) promotes sparsity by driving weights to absolute zero.'
      },
      {
        id: 7,
        question: 'How does the Adam optimizer compute parameter updates?',
        options: {
          A: 'By combining exponentially decaying averages of past gradients (first moment / momentum) and past squared gradients (second moment / uncentered variance)',
          B: 'By inverting the Hessian matrix directly using Newton-Raphson',
          C: 'By randomly permuting weights in each iteration',
          D: 'By fixing the learning rate constant throughout all epochs'
        },
        correctAnswer: 'A',
        explanation: 'Adam (Adaptive Moment Estimation) maintains moving averages of both the gradients (m_t, 1st moment) and the uncentered variance of gradients (v_t, 2nd moment), along with bias-correction factors to compute individualized adaptive learning rates per parameter.'
      },
      {
        id: 8,
        question: 'In multi-class classification with K mutually exclusive classes, which loss function is standardly paired with the Softmax activation function in the output layer?',
        options: {
          A: 'Categorical Cross-Entropy Loss',
          B: 'Mean Squared Error (MSE)',
          C: 'Hinge Loss',
          D: 'Huber Loss'
        },
        correctAnswer: 'A',
        explanation: 'Categorical Cross-Entropy: L = -sum(y_k * log(p_k)) measures the divergence between the true one-hot distribution and the predicted softmax probabilities. Paired with softmax, its derivative simplifies cleanly to (p_k - y_k), providing stable gradient updates.'
      },
      {
        id: 9,
        question: 'Why do Transformer models require Positional Encodings added to input embeddings?',
        options: {
          A: 'Because attention mechanisms are permutation-equivariant and do not inherently encode token order',
          B: 'To convert text strings into floating point numbers',
          C: 'To prevent overfitting on training data',
          D: 'To calculate cross-entropy loss'
        },
        correctAnswer: 'A',
        explanation: 'Unlike RNNs which process words sequentially step-by-step, self-attention processes all tokens in parallel and is invariant to permutations. Positional encodings (sinusoidal or learned) are injected so the model can distinguish word sequence order.'
      },
      {
        id: 10,
        question: 'During neural network training, what indicates that a model is overfitting?',
        options: {
          A: 'Both training loss and validation loss decrease steadily together',
          B: 'Training loss continues to decrease while validation loss begins to diverge and increase',
          C: 'Training loss is higher than validation loss',
          D: 'Learning rate drops to zero'
        },
        correctAnswer: 'B',
        explanation: 'Overfitting occurs when the model memorizes idiosyncratic noise in the training set rather than learning generalizable patterns. This is diagnosed by a continually decreasing training loss coupled with a rising/diverging validation loss.'
      }
    ]
  },
  {
    id: 'exam_fullstack_05',
    track: 'fullstack',
    trackLabel: 'Full-Stack Software Engineering',
    quizTitle: 'Full-Stack: React Internals, Event Loop & System Architecture',
    category: 'Web & Systems Design',
    difficulty: 'Medium',
    totalQuestions: 10,
    timeLimitMinutes: 25,
    description: 'Industry-standard questions on React Fiber reconciliation, JavaScript microtask queues, HTTP/REST invariants, B+ Tree SQL indexing, and distributed caching strategies.',
    topics: ['React Reconciliation', 'JavaScript Event Loop', 'HTTP & REST APIs', 'Database Indexing', 'System Design Caching'],
    questions: [
      {
        id: 1,
        question: 'In React, why is using an array index as the "key" prop considered an anti-pattern when rendering dynamic lists?',
        options: {
          A: 'It causes React to throw a fatal syntax error',
          B: 'It can cause subtle bugs, incorrect component state retention, and degraded performance when items are reordered, inserted, or removed',
          C: 'React does not allow numbers as keys',
          D: 'Keys must always be UUID strings'
        },
        correctAnswer: 'B',
        explanation: 'React uses keys to identify which items have changed, been added, or been removed between renders. If indices are used as keys, reordering or prepending items shifts the index of every element, causing React to incorrectly associate internal component state with the wrong item and needlessly re-render entire subtrees.'
      },
      {
        id: 2,
        question: 'What is the exact console output order of the following JavaScript code?\n\nconsole.log(\'1\');\nsetTimeout(() => console.log(\'2\'), 0);\nPromise.resolve().then(() => console.log(\'3\'));\nconsole.log(\'4\');',
        options: {
          A: '1, 4, 3, 2',
          B: '1, 2, 3, 4',
          C: '1, 4, 2, 3',
          D: '1, 3, 4, 2'
        },
        correctAnswer: 'A',
        explanation: 'Synchronous code runs first: \'1\' then \'4\'. Microtasks (Promise.then callbacks) are drained next before the event loop processes macrotasks: \'3\'. Finally, macrotasks (setTimeout callbacks) are executed: \'2\'. Output: 1, 4, 3, 2.'
      },
      {
        id: 3,
        question: 'Which of the following HTTP methods is defined as IDEMPOTENT according to the HTTP/1.1 specification (RFC 7231)?',
        options: {
          A: 'POST',
          B: 'PUT, GET, and DELETE',
          C: 'PATCH',
          D: 'None of the above'
        },
        correctAnswer: 'B',
        explanation: 'An HTTP method is idempotent if the side-effect of making multiple identical requests is the same as making a single request. GET, PUT, and DELETE are idempotent (calling PUT with the same payload ten times leaves the resource in the exact same state). POST and PATCH are not idempotent.'
      },
      {
        id: 4,
        question: 'Why do relational databases (e.g. MySQL InnoDB, PostgreSQL) predominantly use B+ Trees rather than Binary Search Trees (BST) for table indexing?',
        options: {
          A: 'B+ Trees have a high branching factor (fan-out), keeping tree height low and minimizing costly disk I/O seek operations',
          B: 'BSTs cannot store string data',
          C: 'B+ Trees require zero memory',
          D: 'B+ Trees do not support range queries'
        },
        correctAnswer: 'A',
        explanation: 'Disk reads occur in blocks (e.g., 4KB-16KB). A B+ Tree node holds hundreds of keys per block, resulting in very shallow trees (height 3-4 for millions of records). Furthermore, all records reside in linked leaf nodes, enabling high-performance sequential range scans.'
      },
      {
        id: 5,
        question: 'In distributed system architecture, what is the "Cache-Aside" (Lazy Loading) caching pattern?',
        options: {
          A: 'The application first checks the cache; if a miss occurs, it queries the database and populates the cache for subsequent requests',
          B: 'The cache writes directly to the database before acknowledging the client',
          C: 'The database pushes all updates to the cache synchronously via webhooks',
          D: 'Data is stored only in cache and never in a database'
        },
        correctAnswer: 'A',
        explanation: 'In Cache-Aside, the application controls cache logic: read from cache -> if found return -> if miss, fetch from database, write result to cache with a TTL, and return to caller.'
      },
      {
        id: 6,
        question: 'In a React functional component, what happens if an effect references a state variable but omits it from the dependency array?',
        options: {
          A: 'The component crashes immediately with a compile error',
          B: 'The effect closure retains the stale value of the state variable from the render in which it was created',
          C: 'React automatically adds the variable to the dependencies at runtime',
          D: 'The state variable is reset to null'
        },
        correctAnswer: 'B',
        explanation: 'Due to JavaScript lexical scoping and closures, an effect created during a render captures the variable values from that render. If dependencies are omitted, the effect does not re-run on subsequent state updates and reads stale closure values.'
      },
      {
        id: 7,
        question: 'Which of the following describes the anatomy of a JSON Web Token (JWT)?',
        options: {
          A: 'Three Base64URL-encoded strings separated by dots: Header, Payload, and Cryptographic Signature',
          B: 'An encrypted XML document with a private key',
          C: 'A single SHA-256 hash string',
          D: 'A session ID stored in Redis'
        },
        correctAnswer: 'A',
        explanation: 'A JWT comprises three dot-separated parts: 1) Header (specifying algorithm like HS256), 2) Payload (claims such as user ID, role, expiry), and 3) Signature (HMAC or RSA signature ensuring payload integrity).'
      },
      {
        id: 8,
        question: 'What is the purpose of an HTTP CORS (Cross-Origin Resource Sharing) "preflight" request?',
        options: {
          A: 'To verify whether the client browser is human or automated',
          B: 'An OPTIONS request sent by the browser to determine if the server permits the actual cross-origin request before transmitting it',
          C: 'To compress large payloads using Gzip',
          D: 'To exchange TLS certificates'
        },
        correctAnswer: 'B',
        explanation: 'For non-simple HTTP requests (e.g. methods like PUT/DELETE or custom headers like Authorization), modern browsers automatically dispatch an HTTP OPTIONS request to the server to check Access-Control-Allow-Origin, Access-Control-Allow-Methods, and Access-Control-Allow-Headers.'
      },
      {
        id: 9,
        question: 'According to the CAP Theorem in distributed data systems, what are the three properties, and how many can a distributed system guarantee simultaneously in the presence of network partitions?',
        options: {
          A: 'Consistency, Availability, Partition Tolerance; at most 2 can be guaranteed simultaneously',
          B: 'Concurrency, Atomicity, Performance; all 3 can be guaranteed simultaneously',
          C: 'Capacity, Accuracy, Persistence; only 1 can be guaranteed',
          D: 'Caching, Authorization, Privacy; at most 2 can be guaranteed'
        },
        correctAnswer: 'A',
        explanation: 'The CAP Theorem asserts that in a distributed computer system, you can choose at most two out of: Consistency (all nodes see same data simultaneously), Availability (every request receives a response), and Partition Tolerance (system continues functioning despite arbitrary network message loss). In real networks, partition tolerance is non-negotiable, forcing a trade-off between Consistency (CP) and Availability (AP).'
      },
      {
        id: 10,
        question: 'In SQL database transaction isolation levels, what is a "Dirty Read"?',
        options: {
          A: 'A transaction reads uncommitted data modified by another concurrent transaction that might later be rolled back',
          B: 'A transaction executes a query twice and sees different rows added by another committed transaction',
          C: 'Reading data that has not been indexed',
          D: 'A query reading deleted records from the trash bin'
        },
        correctAnswer: 'A',
        explanation: 'A dirty read occurs at the Read Uncommitted isolation level when Transaction A reads rows updated by Transaction B before Transaction B commits. If Transaction B rolls back, Transaction A operated on phantom invalid data.'
      }
    ]
  }
];

export const PREP_TRACK_FILTERS = [
  { id: 'all', label: 'All Exams', icon: 'layers' },
  { id: 'gate', label: 'GATE CS / IT', icon: 'book' },
  { id: 'tcs', label: 'TCS NQT', icon: 'briefcase' },
  { id: 'aiml', label: 'AI & Machine Learning', icon: 'brain' },
  { id: 'fullstack', label: 'Full-Stack Engineering', icon: 'code' }
];
