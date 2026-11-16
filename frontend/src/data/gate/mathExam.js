/**
 * Official GATE CS/IT Question Bank: Engineering & Discrete Mathematics
 */

export const mathExam = {
  "id": "exam_gate_math",
  "subjectId": "math",
  "subject": "Engineering & Discrete Mathematics",
  "quizTitle": "GATE CS: Discrete Mathematics & Linear Algebra",
  "difficulty": "Hard",
  "totalQuestions": 10,
  "timeLimitMinutes": 30,
  "description": "Graph handshaking theorem, propositional logic, eigenvalues & eigenvectors, Bayes conditional probability, and equivalence relations.",
  "topics": [
    "Graph Theory",
    "Propositional Logic",
    "Linear Algebra",
    "Probability & Bayes",
    "Equivalence Relations"
  ],
  "questions": [
    {
      "id": 1,
      "question": "A simple planar connected graph G has 20 vertices and each vertex has degree 3. How many faces (regions) does G divide the plane into?",
      "options": {
        "A": "12 faces",
        "B": "10 faces",
        "C": "14 faces",
        "D": "8 faces"
      },
      "correctAnswer": "A",
      "explanation": "Handshaking theorem: sum of degrees = 2|E| => 20 * 3 = 2|E| => |E| = 30 edges. Euler's formula for connected planar graphs: V - E + F = 2. Here: 20 - 30 + F = 2 => -10 + F = 2 => F = 12 faces."
    },
    {
      "id": 2,
      "question": "What is the contrapositive of the proposition: \"If it rains, then the match is cancelled\" (P -> Q)?",
      "options": {
        "A": "If the match is not cancelled, then it does not rain (~Q -> ~P)",
        "B": "If it does not rain, then the match is not cancelled",
        "C": "If the match is cancelled, then it rains",
        "D": "It rains and the match is not cancelled"
      },
      "correctAnswer": "A",
      "explanation": "The contrapositive of conditional statement P -> Q is logically equivalent to ~Q -> ~P: \"If the match is not cancelled, then it does not rain.\""
    },
    {
      "id": 3,
      "question": "If A is a 3 x 3 matrix with eigenvalues 1, -2, and 4, what is the determinant of (A^2 + 2I)?",
      "options": {
        "A": "3 * 6 * 18 = 324",
        "B": "18",
        "C": "-8",
        "D": "128"
      },
      "correctAnswer": "A",
      "explanation": "If λ is an eigenvalue of A, the eigenvalues of (A^2 + 2I) are (λ^2 + 2). For λ1 = 1: 1^2 + 2 = 3. For λ2 = -2: (-2)^2 + 2 = 6. For λ3 = 4: 4^2 + 2 = 18. The determinant is the product of eigenvalues: 3 * 6 * 18 = 324."
    },
    {
      "id": 4,
      "question": "Box 1 contains 2 gold and 3 silver coins. Box 2 contains 3 gold and 1 silver coins. A box is chosen at random and a coin drawn is found to be gold. What is the probability it came from Box 1?",
      "options": {
        "A": "8 / 23",
        "B": "15 / 23",
        "C": "2 / 5",
        "D": "1 / 2"
      },
      "correctAnswer": "A",
      "explanation": "By Bayes Theorem: P(B1) = P(B2) = 1/2. P(G|B1) = 2/5, P(G|B2) = 3/4. P(G) = (1/2)*(2/5) + (1/2)*(3/4) = 1/5 + 3/8 = 23/40. P(B1|G) = [P(B1)*P(G|B1)] / P(G) = (1/5) / (23/40) = 8/23."
    },
    {
      "id": 5,
      "question": "Let R be a relation on the set of integers Z defined by (a, b) ∈ R if and only if (a - b) is divisible by 5. What type of relation is R?",
      "options": {
        "A": "Equivalence Relation (Reflexive, Symmetric, and Transitive)",
        "B": "Partial Order Relation",
        "C": "Strict Order Relation",
        "D": "Symmetric only"
      },
      "correctAnswer": "A",
      "explanation": "Congruence modulo 5: 1) Reflexive: a - a = 0 is divisible by 5; 2) Symmetric: if a - b is div by 5, b - a = -(a - b) is div by 5; 3) Transitive: (a - b) + (b - c) = a - c is div by 5. Hence, R is an Equivalence Relation."
    },
    {
      "id": 6,
      "question": "What is the value of the limit: lim_(x -> 0) (sin x - x) / x^3?",
      "options": {
        "A": "-1/6",
        "B": "1/6",
        "C": "0",
        "D": "Does not exist"
      },
      "correctAnswer": "A",
      "explanation": "Using Taylor expansion: sin x = x - x^3 / 6 + x^5 / 120 - ... Subtracting x gives -x^3 / 6 + O(x^5). Dividing by x^3 and taking limit as x -> 0 gives -1/6."
    },
    {
      "id": 7,
      "question": "In a group of 367 people, what is the minimum number of people who must share the same birthday?",
      "options": {
        "A": "2",
        "B": "1",
        "C": "3",
        "D": "366"
      },
      "correctAnswer": "A",
      "explanation": "By the Generalized Pigeonhole Principle: there are at most 366 possible calendar birthdays (including leap year). Ceiling(367 / 366) = 2. Hence, at least 2 people must share the exact same birthday."
    },
    {
      "id": 8,
      "question": "What is the rank of the 4 x 4 identity matrix I_4?",
      "options": {
        "A": "4",
        "B": "1",
        "C": "0",
        "D": "16"
      },
      "correctAnswer": "A",
      "explanation": "The rank of an n x n identity matrix is n, as all rows and columns are linearly independent."
    },
    {
      "id": 9,
      "question": "Which of the following propositions is a TAUTOLOGY?",
      "options": {
        "A": "(P ∧ (P → Q)) → Q (Modus Ponens)",
        "B": "P ∧ ¬P",
        "C": "P → (P ∧ Q)",
        "D": "(P ∨ Q) → P"
      },
      "correctAnswer": "A",
      "explanation": "Modus Ponens: If P is true and P implies Q, then Q must be true. Truth table verifies [P ∧ (¬P ∨ Q)] → Q evaluates to TRUE under all truth assignments, making it a valid Tautology."
    },
    {
      "id": 10,
      "question": "If a graph G has 10 vertices and is 4-regular (every vertex has degree 4), how many edges does G have?",
      "options": {
        "A": "20 edges",
        "B": "40 edges",
        "C": "10 edges",
        "D": "14 edges"
      },
      "correctAnswer": "A",
      "explanation": "Handshaking lemma: sum of degrees = 2 * |E|. For a 4-regular graph with 10 vertices: 10 * 4 = 40 = 2 * |E| => |E| = 20 edges."
    }
  ]
};
