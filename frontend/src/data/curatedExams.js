/**
 * EduMind AI — Curated CBT Exam Question Banks
 * Dedicated GATE Computer Science & Information Technology (CS/IT) Papers
 */

export const AVAILABLE_EXAMS = [
  {
    id: 'gate_cs',
    title: 'GATE Computer Science & Information Technology (CS/IT)',
    shortCode: 'GATE CS/IT',
    stream: 'Engineering & Technology',
    description: 'National level graduate engineering aptitude benchmark covering Systems, Algorithms, Networks, and Databases.'
  }
];

export const GATE_EXAMS = [
  {
    id: 'exam_gate_os_01',
    track: 'gate_cs',
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
  {
    id: 'exam_gate_algo_02',
    track: 'gate_cs',
    subject: 'Data Structures & Algorithms',
    quizTitle: 'GATE CS: Data Structures & Algorithms',
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
    id: 'exam_gate_cn_03',
    track: 'gate_cs',
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
  {
    id: 'exam_gate_dbms_04',
    track: 'gate_cs',
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
        explanation: 'Computing attribute closures: A+ = {A, B, C, D, E} (Key). B+ = {B, D}; with C, BC+ = {B, C, D, E, A} (Key). Since A -> BC, B+ with C gives all. B -> D, so B is not alone a key without C. Wait: B alone cannot determine C. Let us check B: B+ = {B, D}. But E+ = {E, A, B, C, D} -> E is a key. CD+ = {C, D, E, A, B} -> CD is a key. Also B+: B -> D, but B does not give C. Thus candidate keys are A, E, CD, and BC.'
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
        explanation: 'WAL states that: 1) Any update\'s UNDO log record must be flushed to stable storage before the dirty data page replaces the disk copy (enabling rollback), and 2) All REDO log records must be flushed before the commit record is acknowledged, ensuring Durability (ACID).'
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
  }
];
