/**
 * Official GATE CS/IT Question Bank: Programming & Data Structures
 */

export const dsExam = {
  "id": "exam_gate_ds",
  "subjectId": "ds",
  "subject": "Programming & Data Structures",
  "quizTitle": "GATE CS: Programming & Data Structures",
  "difficulty": "Hard",
  "totalQuestions": 10,
  "timeLimitMinutes": 30,
  "description": "Tree traversals, binary search trees, cycle detection in linked lists, stack evaluation, heap construction, and C memory models.",
  "topics": [
    "Binary Search Trees",
    "Traversals",
    "Linked Lists",
    "Stack & Queue",
    "C Pointers"
  ],
  "questions": [
    {
      "id": 1,
      "question": "Which tree traversals can uniquely reconstruct a binary tree with distinct elements?",
      "options": {
        "A": "Inorder and Preorder, or Inorder and Postorder",
        "B": "Preorder and Postorder",
        "C": "Inorder only",
        "D": "Level-order and Preorder"
      },
      "correctAnswer": "A",
      "explanation": "Inorder gives the relative positions of elements in the left and right subtrees. Combined with Preorder (which reveals the root first) or Postorder (which reveals the root last), a unique binary tree can always be reconstructed. Preorder + Postorder cannot differentiate between left and right single-child nodes."
    },
    {
      "id": 2,
      "question": "In a circular singly linked list with pointer `last` pointing to the last node, what is the time complexity to insert a new node at the front and at the rear respectively?",
      "options": {
        "A": "O(1) at front, O(1) at rear",
        "B": "O(1) at front, O(n) at rear",
        "C": "O(n) at front, O(1) at rear",
        "D": "O(n) at front, O(n) at rear"
      },
      "correctAnswer": "A",
      "explanation": "Because `last` points to the final node, `last->next` is the front node. A new node can be inserted as `newNode->next = last->next; last->next = newNode;` in O(1) time. For insertion at the rear, execute the same and update `last = newNode;` also in O(1) time."
    },
    {
      "id": 3,
      "question": "What is the time complexity to build a binary heap from an unsorted array of n elements using the bottom-up Heapify method?",
      "options": {
        "A": "O(n)",
        "B": "O(n log n)",
        "C": "O(n^2)",
        "D": "O(log n)"
      },
      "correctAnswer": "A",
      "explanation": "Bottom-up build-heap calls Heapify starting from index floor(n/2) down to 1. The summation sum_{h=0}^{log n} (n / 2^(h+1)) * O(h) converges to O(n), running in linear time."
    },
    {
      "id": 4,
      "question": "In a Binary Search Tree with n nodes, what is the worst-case time complexity to find the in-order successor of a given node?",
      "options": {
        "A": "O(h) where h is the height of the tree (O(n) for skewed BST)",
        "B": "Always O(1)",
        "C": "O(n log n)",
        "D": "O(h^2)"
      },
      "correctAnswer": "A",
      "explanation": "If the node has a right subtree, the successor is the minimum node in the right subtree (traversing down at most height h). If no right subtree exists, it traverses up parent pointers until an ancestor is a left child (also at most height h). For an unbalanced skewed tree, h = n, so worst case is O(n)."
    },
    {
      "id": 5,
      "question": "What is the output of the following C code?\n\nint a[5] = {1, 2, 3, 4, 5};\nint *p = (int*)(&a + 1);\nprintf(\"%d\", *(p - 1));",
      "options": {
        "A": "5",
        "B": "1",
        "C": "Garbage value",
        "D": "Segmentation fault"
      },
      "correctAnswer": "A",
      "explanation": "&a is a pointer to the entire array of 5 integers. Adding 1 advances the pointer by sizeof(a) = 5 * sizeof(int), pointing just past the end of the array. Casting to int* and subtracting 1 points back to the last element a[4], which is 5."
    },
    {
      "id": 6,
      "question": "How many distinct binary search trees can be constructed using n distinct keys?",
      "options": {
        "A": "Catalan Number C_n = (2n)! / ((n + 1)! * n!)",
        "B": "2^n",
        "C": "n!",
        "D": "n * (n - 1) / 2"
      },
      "correctAnswer": "A",
      "explanation": "The number of distinct BSTs that can be formed with n distinct keys is given by the nth Catalan number: C_n = (1 / (n + 1)) * (2n choose n) = (2n)! / ((n + 1)! * n!)."
    },
    {
      "id": 7,
      "question": "Which data structure is optimal for implementing an undo-redo buffer in a text editor?",
      "options": {
        "A": "Two Stacks",
        "B": "A single Queue",
        "C": "Binary Min-Heap",
        "D": "Adjacency Matrix"
      },
      "correctAnswer": "A",
      "explanation": "Undo-redo is standardly implemented using two LIFO stacks: an Undo stack and a Redo stack. An action is pushed onto Undo. When undo is triggered, it pops from Undo and pushes to Redo. When redo is triggered, it reverses the operation."
    },
    {
      "id": 8,
      "question": "Given an array `arr` of size n with a circular queue implementation, if `front` is the index of the first element and `rear` is the index of the last element, what is the formula for the number of elements in the queue?",
      "options": {
        "A": "(rear - front + n) % n",
        "B": "(rear - front) % n",
        "C": "(rear + front) % n",
        "D": "rear - front"
      },
      "correctAnswer": "A",
      "explanation": "In a circular queue with array length n, when rear wraps around to the beginning, (rear - front) can be negative. Adding n and taking modulo n: (rear - front + n) % n correctly handles wrapping."
    },
    {
      "id": 9,
      "question": "What is the space complexity of Floyd's Cycle Detection algorithm (Tortoise and Hare) in a linked list?",
      "options": {
        "A": "O(1) auxiliary space",
        "B": "O(n) auxiliary space",
        "C": "O(log n) space",
        "D": "O(n^2) space"
      },
      "correctAnswer": "A",
      "explanation": "Floyd's algorithm maintains only two pointer variables (slow and fast), requiring strictly O(1) auxiliary space, unlike hashing which consumes O(n) space."
    },
    {
      "id": 10,
      "question": "What is the prefix representation of the postfix expression: `A B + C D - *`?",
      "options": {
        "A": "* + A B - C D",
        "B": "+ * A B - C D",
        "C": "- * + A B C D",
        "D": "* A B + - C D"
      },
      "correctAnswer": "A",
      "explanation": "Evaluating: `A B +` becomes `(+ A B)`. `C D -` becomes `(- C D)`. Then multiplying gives `* (+ A B) (- C D)` = `* + A B - C D`."
    }
  ]
};
