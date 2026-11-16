/**
 * Official GATE CS/IT Question Bank: Database Management Systems
 */

export const dbmsExam = {
  "id": "exam_gate_dbms",
  "subjectId": "dbms",
  "subject": "Database Management Systems",
  "quizTitle": "GATE CS: Database Management Systems (DBMS)",
  "difficulty": "Hard",
  "totalQuestions": 10,
  "timeLimitMinutes": 30,
  "description": "Candidate key identification, 3NF vs BCNF normal forms, Conflict Serializability graphs, Two-Phase Locking (2PL), and B+ tree index structures.",
  "topics": [
    "Normalization & BCNF",
    "Conflict Serializability",
    "Two-Phase Locking (2PL)",
    "B+ Tree Fan-out",
    "SQL Relational Algebra"
  ],
  "questions": [
    {
      "id": 1,
      "question": "Given relation R(A, B, C, D, E) with Functional Dependencies: F = { A -> BC, CD -> E, B -> D, E -> A }. What are the candidate keys of R?",
      "options": {
        "A": "A, B, E, and CD",
        "B": "Only A and B",
        "C": "Only A",
        "D": "AB and CDE"
      },
      "correctAnswer": "A",
      "explanation": "Computing attribute closures: A+ = {A, B, C, D, E} (Key). B+ = {B, D}; with C, BC+ = {B, C, D, E, A} (Key). Since A -> BC, B+ with C gives all. E+ = {E, A, B, C, D} -> E is a key. CD+ = {C, D, E, A, B} -> CD is a key. Candidate keys are A, E, CD, and BC."
    },
    {
      "id": 2,
      "question": "A relation R with functional dependencies is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X -> Y:",
      "options": {
        "A": "X is a superkey of R",
        "B": "Y is a prime attribute (part of a candidate key)",
        "C": "X is a single attribute",
        "D": "R has no composite primary keys"
      },
      "correctAnswer": "A",
      "explanation": "BCNF is strictly defined: for every non-trivial functional dependency X -> Y, X must be a superkey of R. Unlike 3NF, BCNF does not allow the exception where Y is a prime attribute."
    },
    {
      "id": 3,
      "question": "Consider a schedule S with transactions T1 and T2: r1(X); r2(X); w1(X); r1(Y); w2(X); w1(Y). Is this schedule conflict serializable?",
      "options": {
        "A": "No, because there is a cycle in the precedence graph: T1 -> T2 and T2 -> T1",
        "B": "Yes, equivalent to T1 followed by T2",
        "C": "Yes, equivalent to T2 followed by T1",
        "D": "It is view serializable only"
      },
      "correctAnswer": "A",
      "explanation": "Conflicting pairs on item X: r2(X) precedes w1(X) -> edge T2 -> T1. Also w1(X) precedes w2(X) -> edge T1 -> T2. The precedence graph contains the cycle T1 <-> T2. Hence, schedule S is NOT conflict serializable."
    },
    {
      "id": 4,
      "question": "Under the Basic Two-Phase Locking (2PL) protocol, what is guaranteed?",
      "options": {
        "A": "Conflict Serializability, but deadlocks and cascading rollbacks are still possible",
        "B": "Freedom from both deadlocks and cascading rollbacks",
        "C": "Only view serializability",
        "D": "Freedom from deadlocks only"
      },
      "correctAnswer": "A",
      "explanation": "Basic 2PL ensures that transactions acquire all locks in a growing phase and release them in a shrinking phase. This mathematically guarantees conflict serializability, but it does NOT prevent deadlocks or cascading aborts (Strict 2PL is required to prevent cascading aborts)."
    },
    {
      "id": 5,
      "question": "A B+ tree index is constructed on a table where block size is 4096 bytes. Each search key is 12 bytes and each block pointer is 8 bytes. What is the maximum order (number of block pointers) of an internal node?",
      "options": {
        "A": "205",
        "B": "204",
        "C": "170",
        "D": "256"
      },
      "correctAnswer": "A",
      "explanation": "An internal node with order p contains at most p block pointers and p - 1 search keys. Space equation: p * (pointer size) + (p - 1) * (key size) <= Block Size. p * 8 + (p - 1) * 12 <= 4096 => 20p - 12 <= 4096 => 20p <= 4108 => p <= 205.4. Thus maximum order p = 205."
    },
    {
      "id": 6,
      "question": "In SQL, what is the primary distinction between the WHERE clause and the HAVING clause?",
      "options": {
        "A": "WHERE filters individual rows before grouping, whereas HAVING filters aggregated groups after the GROUP BY operation",
        "B": "HAVING can only be used with subqueries",
        "C": "WHERE can use aggregate functions like COUNT() directly, HAVING cannot",
        "D": "They are completely interchangeable in SQL-92"
      },
      "correctAnswer": "A",
      "explanation": "The WHERE clause filters individual records prior to aggregation and cannot evaluate aggregate functions like AVG() or SUM(). The HAVING clause is evaluated after GROUP BY to filter grouped results based on aggregate conditions."
    },
    {
      "id": 7,
      "question": "What is the Write-Ahead Logging (WAL) protocol in database transaction management?",
      "options": {
        "A": "The log records describing an update must be flushed to non-volatile disk before the corresponding dirty data page is written to disk",
        "B": "All queries must be written to log files before parsing",
        "C": "Indexes must be updated before data blocks",
        "D": "Transactions must write all data to memory before committing"
      },
      "correctAnswer": "A",
      "explanation": "WAL states that: 1) Any update's UNDO log record must be flushed to stable storage before the dirty data page replaces the disk copy, and 2) All REDO log records must be flushed before the commit record is acknowledged, ensuring Durability (ACID)."
    },
    {
      "id": 8,
      "question": "In Relational Algebra, what is the result of natural join R ⨝ S if relation R and S have NO common attributes?",
      "options": {
        "A": "Cartesian Product (Cross Product) R × S",
        "B": "Empty relation (null)",
        "C": "Union R ∪ S",
        "D": "Intersection R ∩ S"
      },
      "correctAnswer": "A",
      "explanation": "A natural join performs an equijoin on all attributes with matching names and projects away duplicates. If R and S share no common attributes, no equality conditions are evaluated, degenerating naturally into the Cartesian Product (R × S)."
    },
    {
      "id": 9,
      "question": "What is a \"lossless join\" decomposition in database normalization?",
      "options": {
        "A": "When decomposing relation R into R1 and R2, natural joining R1 and R2 reproduces exactly the original relation R with no spurious tuples",
        "B": "No attribute values are NULL in either relation",
        "C": "Both relations have the exact same number of tuples",
        "D": "All functional dependencies are preserved"
      },
      "correctAnswer": "A",
      "explanation": "A decomposition is lossless if R1 ⨝ R2 = R. By theorem, decomposition into (R1, R2) is lossless if and only if R1 ∩ R2 forms a superkey of R1 or a superkey of R2, ensuring no phantom tuples are generated."
    },
    {
      "id": 10,
      "question": "Which isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still permit Phantom Reads?",
      "options": {
        "A": "Repeatable Read",
        "B": "Read Committed",
        "C": "Read Uncommitted",
        "D": "Serializable"
      },
      "correctAnswer": "A",
      "explanation": "In ANSI SQL isolation levels: Repeatable Read prevents Dirty Reads (reading uncommitted data) and Non-Repeatable Reads (row values changing between reads). However, it may still allow Phantom Reads (new rows inserted by another committed transaction matching a range query)."
    }
  ]
};
