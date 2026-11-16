/**
 * Official GATE CS/IT Question Bank: Compiler Design
 */

export const cdExam = {
  "id": "exam_gate_cd",
  "subjectId": "cd",
  "subject": "Compiler Design",
  "quizTitle": "GATE CS: Compiler Design & Parsing",
  "difficulty": "Hard",
  "totalQuestions": 10,
  "timeLimitMinutes": 30,
  "description": "LL(1) parsing tables, FIRST/FOLLOW calculation, LR parser hierarchy (LR(0), SLR(1), LALR(1), CLR(1)), SDT, and basic block optimization.",
  "topics": [
    "FIRST & FOLLOW",
    "LL(1) & LR Parsing",
    "Syntax Directed Translation",
    "Code Optimization",
    "Activation Records"
  ],
  "questions": [
    {
      "id": 1,
      "question": "Given the grammar: S -> Aa | bAc | dc, A -> d. What is the FOLLOW(A)?",
      "options": {
        "A": "{ a, c }",
        "B": "{ a }",
        "C": "{ c }",
        "D": "{ $, a }"
      },
      "correctAnswer": "A",
      "explanation": "In S -> Aa, 'a' follows A, so a ∈ FOLLOW(A). In S -> bAc, 'c' follows A, so c ∈ FOLLOW(A). Thus FOLLOW(A) = { a, c }."
    },
    {
      "id": 2,
      "question": "Which of the following describes the correct ascending hierarchy of bottom-up parsing power?",
      "options": {
        "A": "LR(0) < SLR(1) < LALR(1) < CLR(1)",
        "B": "SLR(1) < LR(0) < LALR(1) < CLR(1)",
        "C": "LALR(1) < SLR(1) < LR(0) < CLR(1)",
        "D": "LR(0) < LALR(1) < SLR(1) < CLR(1)"
      },
      "correctAnswer": "A",
      "explanation": "LR(0) is the weakest. SLR(1) improves LR(0) by using FOLLOW sets for reduce actions. LALR(1) merges states with identical core items. CLR(1) uses full lookaheads and has maximum parsing power."
    },
    {
      "id": 3,
      "question": "What kind of conflicts can occur when merging states with identical cores to create an LALR(1) parsing table from a CLR(1) table?",
      "options": {
        "A": "Reduce-Reduce (R-R) conflicts may be introduced, but never Shift-Reduce (S-R) conflicts",
        "B": "Both S-R and R-R conflicts can be introduced",
        "C": "Only Shift-Reduce conflicts can be introduced",
        "D": "No conflicts can ever be introduced"
      },
      "correctAnswer": "A",
      "explanation": "Merging states with the same core items cannot create new Shift-Reduce conflicts because shift actions depend only on core items. However, merging can combine different lookaheads on reduce items, potentially creating Reduce-Reduce conflicts."
    },
    {
      "id": 4,
      "question": "In Syntax-Directed Translation, what is an S-attributed definition?",
      "options": {
        "A": "A grammar where every attribute is synthesized (computed solely from children nodes in the parse tree)",
        "B": "A grammar with only inherited attributes",
        "C": "A grammar evaluated top-down",
        "D": "A grammar without semantic actions"
      },
      "correctAnswer": "A",
      "explanation": "An S-attributed SDD contains exclusively synthesized attributes, which can be evaluated naturally during bottom-up parsing (e.g., LR parsing) using an evaluation stack."
    },
    {
      "id": 5,
      "question": "How are leaders identified when partitioning intermediate code into Basic Blocks?",
      "options": {
        "A": "1) The first three-address instruction is a leader; 2) Any instruction that is the target of a conditional or unconditional jump is a leader; 3) Any instruction that immediately follows a jump is a leader",
        "B": "Only branch instructions are leaders",
        "C": "Every assignment instruction is a leader",
        "D": "Leaders are selected randomly"
      },
      "correctAnswer": "A",
      "explanation": "Standard Dragon Book basic block algorithm: Leader rules are: 1) First instruction; 2) Target of any jump; 3) Instruction immediately following any jump."
    },
    {
      "id": 6,
      "question": "Which compiler optimization replaces expressions computed inside a loop whose values do not change across iterations?",
      "options": {
        "A": "Loop Invariant Code Motion (Loop Hoisting)",
        "B": "Loop Unrolling",
        "C": "Dead Code Elimination",
        "D": "Strength Reduction"
      },
      "correctAnswer": "A",
      "explanation": "Loop Invariant Code Motion detects computations whose operand values remain invariant throughout loop executions and hoists them out to the loop pre-header."
    },
    {
      "id": 7,
      "question": "What is \"Strength Reduction\" in compiler optimization?",
      "options": {
        "A": "Replacing an expensive operation (such as multiplication) with a cheaper operation (such as addition or left shift)",
        "B": "Deleting unreachable functions",
        "C": "Merging basic blocks",
        "D": "Compressing AST nodes"
      },
      "correctAnswer": "A",
      "explanation": "Strength reduction replaces high-cost machine instructions with equivalent lower-cost operations, such as replacing `i * 4` inside an array index loop with an addition accumulator `+ 4`."
    },
    {
      "id": 8,
      "question": "Can an ambiguous grammar ever be parsed by an LL(1) or LR(1) parser?",
      "options": {
        "A": "No, an ambiguous grammar can never be LL(k) or LR(k) for any k",
        "B": "Yes, if lookahead k >= 2",
        "C": "Yes, all ambiguous grammars are LR(1)",
        "D": "Only if it has no epsilon productions"
      },
      "correctAnswer": "A",
      "explanation": "Ambiguity means there exists a string with two distinct leftmost or rightmost derivations (two different parse trees). LL and LR parsers require unique, deterministic parsing decisions, so an ambiguous grammar is never LL(k) or LR(k)."
    },
    {
      "id": 9,
      "question": "In register allocation, what graph problem is used to determine whether k physical registers are sufficient?",
      "options": {
        "A": "Graph Coloring Problem (k-colorability of interference graph)",
        "B": "Travelling Salesman Problem",
        "C": "Max-Flow Min-Cut",
        "D": "Topological Sort"
      },
      "correctAnswer": "A",
      "explanation": "Chaitin's formulation models register allocation as graph coloring: variables with overlapping live ranges are connected by edges in a register interference graph. Finding a valid assignment with k registers is equivalent to k-coloring the interference graph."
    },
    {
      "id": 10,
      "question": "What is stored in an Activation Record (Stack Frame) on the call stack?",
      "options": {
        "A": "Local variables, actual parameters, return address, and saved machine status",
        "B": "Global variables only",
        "C": "Heap memory pointers only",
        "D": "Operating system page tables"
      },
      "correctAnswer": "A",
      "explanation": "An activation record manages a function invocation, containing: parameters, return address, dynamic link (old frame pointer), saved registers, and local variables."
    }
  ]
};
