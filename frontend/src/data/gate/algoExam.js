/**
 * Official GATE CS/IT Question Bank: Algorithms
 */

export const algoExam = {
  "id": "exam_gate_algo",
  "subjectId": "algo",
  "subject": "Algorithms",
  "quizTitle": "GATE CS: Algorithms & Complexity",
  "difficulty": "Hard",
  "totalQuestions": 10,
  "timeLimitMinutes": 30,
  "description": "Master theorem recurrence relations, AVL tree rotations, min-heap properties, Dijkstra negative edge behavior, and 0/1 knapsack dynamic programming.",
  "topics": [
    "Recurrences",
    "AVL & BST",
    "Heap Invariants",
    "Graph Theory",
    "Dynamic Programming"
  ],
  "questions": [
    {
      "id": 1,
      "question": "What is the asymptotic time complexity of the recurrence relation T(n) = 3T(n/2) + O(n)?",
      "options": {
        "A": "O(n log n)",
        "B": "O(n^log2(3)) ≈ O(n^1.585)",
        "C": "O(n^2)",
        "D": "O(n)"
      },
      "correctAnswer": "B",
      "explanation": "Using the Master Theorem: a = 3, b = 2, f(n) = O(n). We compare f(n) with n^(log_b a) = n^(log2 3) ≈ n^1.585. Since f(n) = O(n^(1.585 - epsilon)) where epsilon ≈ 0.585 > 0, Case 1 of Master Theorem applies: T(n) = Theta(n^(log_b a)) = Theta(n^log2(3))."
    },
    {
      "id": 2,
      "question": "What is the worst-case number of rotations required to restore the balance factor of an AVL tree after an insertion and after a deletion respectively?",
      "options": {
        "A": "O(1) after insertion, O(log n) after deletion",
        "B": "O(log n) after insertion, O(1) after deletion",
        "C": "O(1) after insertion, O(1) after deletion",
        "D": "O(log n) after insertion, O(log n) after deletion"
      },
      "correctAnswer": "A",
      "explanation": "In an AVL tree, an insertion can be rebalanced with at most 1 single or double rotation (O(1)). However, a deletion may cause a height reduction that propagates up the tree to the root, requiring up to O(log n) rotations."
    },
    {
      "id": 3,
      "question": "In a binary min-heap with n elements stored in an array starting at index 1, where does the maximum element reside?",
      "options": {
        "A": "Always at index n",
        "B": "In one of the leaf nodes, which are located from index floor(n/2) + 1 to n",
        "C": "At index 1",
        "D": "At index floor(n/2)"
      },
      "correctAnswer": "B",
      "explanation": "In a min-heap, every parent is smaller than or equal to its children. Therefore, the maximum element cannot be an internal node; it must reside in one of the leaf nodes, which span indices floor(n/2) + 1 through n."
    },
    {
      "id": 4,
      "question": "Why does Dijkstra's shortest path algorithm fail on graphs with negative edge weights?",
      "options": {
        "A": "It assumes that once a vertex is extracted from the priority queue and marked finalized, its shortest distance cannot be improved",
        "B": "It causes an infinite loop even in graphs without cycles",
        "C": "It uses adjacency matrices instead of adjacency lists",
        "D": "It cannot compute distances greater than zero"
      },
      "correctAnswer": "A",
      "explanation": "Dijkstra's algorithm is a greedy algorithm based on the non-negative edge weight invariant: adding an edge to a path can never decrease path weight. When negative edges exist, a longer path with a negative edge could yield a lower total distance after a vertex is already marked finalized, violating the greedy assumption."
    },
    {
      "id": 5,
      "question": "What is the time complexity to solve the 0/1 Knapsack problem with n items and capacity W using Dynamic Programming?",
      "options": {
        "A": "O(n log n)",
        "B": "O(n * W) (pseudo-polynomial time)",
        "C": "O(2^n)",
        "D": "O(W^2)"
      },
      "correctAnswer": "B",
      "explanation": "The standard DP table for 0/1 Knapsack has dimensions (n + 1) * (W + 1). Each entry requires O(1) time to compute: dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]]). Thus the time complexity is O(n * W). Since W is numeric and exponential in its bit length, it is pseudo-polynomial."
    },
    {
      "id": 6,
      "question": "Which graph traversal is used to find a topological ordering of vertices in a Directed Acyclic Graph (DAG)?",
      "options": {
        "A": "Depth First Search (DFS) recording reverse post-order finish times",
        "B": "Breadth First Search (BFS) starting from vertex with highest degree",
        "C": "Prim's Algorithm",
        "D": "Kruskal's Algorithm"
      },
      "correctAnswer": "A",
      "explanation": "Topological sort can be computed by performing a Depth First Search (DFS) on the DAG and inserting vertices into a list in reverse order of their finishing times (or via Kahn's in-degree zero BFS algorithm)."
    },
    {
      "id": 7,
      "question": "What is the height of a Red-Black tree with n internal nodes?",
      "options": {
        "A": "At most 2 * log2(n + 1)",
        "B": "Exactly log2(n)",
        "C": "Theta(n)",
        "D": "At most log3(n)"
      },
      "correctAnswer": "A",
      "explanation": "A fundamental theorem of Red-Black trees states that a Red-Black tree with n internal nodes has height h <= 2 * log2(n + 1), ensuring guaranteed O(log n) time complexity for search, insert, and delete."
    },
    {
      "id": 8,
      "question": "Suppose we have an array of n integers where every element appears twice except for one unique element. What is the optimal time and auxiliary space to identify the unique element?",
      "options": {
        "A": "O(n) time and O(1) space using the XOR bitwise operator",
        "B": "O(n log n) time and O(1) space using Sorting",
        "C": "O(n) time and O(n) space using a Hash Set",
        "D": "O(n^2) time and O(1) space using Brute Force"
      },
      "correctAnswer": "A",
      "explanation": "XOR has two key properties: a ^ a = 0 and a ^ 0 = a, and it is commutative and associative. XORing all elements together cancels out every duplicate pair, leaving the single unique number in O(n) time and O(1) extra space."
    },
    {
      "id": 9,
      "question": "Given two strings of length m and n, what is the length of the Longest Common Subsequence of \"AGGTAB\" and \"GXTXAYB\"?",
      "options": {
        "A": "3 (\"GTB\")",
        "B": "4 (\"GTAB\")",
        "C": "5 (\"AGTAB\")",
        "D": "2 (\"AB\")"
      },
      "correctAnswer": "B",
      "explanation": "The common subsequence \"G-T-A-B\" appears in both \"A[G]G[T][A][B]\" and \"[G]X[T]X[A]Y[B]\". Its length is 4."
    },
    {
      "id": 10,
      "question": "What is the primary difference between Kruskal's and Prim's algorithms for finding a Minimum Spanning Tree (MST)?",
      "options": {
        "A": "Kruskal's grows a single tree from an arbitrary start vertex, while Prim's adds individual edges globally",
        "B": "Kruskal's operates on edge-sorted collections and forms forests using Disjoint Set Union (DSU), whereas Prim's grows a connected tree vertex by vertex",
        "C": "Prim's algorithm does not work on connected graphs",
        "D": "Kruskal's only works on directed acyclic graphs"
      },
      "correctAnswer": "B",
      "explanation": "Kruskal's is edge-based: it sorts all edges and uses Union-Find (DSU) to avoid cycles, creating a growing forest. Prim's is vertex-based: it starts at a single vertex and greedily extends a single connected cut component using a priority queue."
    }
  ]
};
