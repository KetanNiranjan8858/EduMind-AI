/**
 * Official GATE CS/IT Question Bank: Digital Logic
 */

export const dlExam = {
  "id": "exam_gate_dl",
  "subjectId": "dl",
  "subject": "Digital Logic",
  "quizTitle": "GATE CS: Digital Logic & Boolean Circuits",
  "difficulty": "Hard",
  "totalQuestions": 10,
  "timeLimitMinutes": 30,
  "description": "K-map minimization, multiplexer implementations, JK flip-flop race conditions, synchronous counters, setup/hold times, and IEEE 754.",
  "topics": [
    "K-Maps & Boolean Algebra",
    "Multiplexers & Decoders",
    "Flip-Flops & Race Conditions",
    "Counters & Registers",
    "Timing & Propagation"
  ],
  "questions": [
    {
      "id": 1,
      "question": "What is the minimum number of 2-to-1 Multiplexers required to implement a 16-to-1 Multiplexer?",
      "options": {
        "A": "15",
        "B": "16",
        "C": "8",
        "D": "4"
      },
      "correctAnswer": "A",
      "explanation": "Tree construction: Stage 1 needs 16/2 = 8 multiplexers. Stage 2 needs 8/2 = 4 multiplexers. Stage 3 needs 4/2 = 2 multiplexers. Stage 4 needs 2/2 = 1 multiplexer. Total = 8 + 4 + 2 + 1 = 15 multiplexers (Formula: N - 1 = 16 - 1 = 15)."
    },
    {
      "id": 2,
      "question": "In a Master-Slave JK Flip-Flop, how is the race-around condition prevented?",
      "options": {
        "A": "The Master captures inputs on the positive clock edge while the Slave is disabled, and the Slave transfers output on the negative clock edge when the Master is disabled",
        "B": "By setting clock frequency to zero",
        "C": "By ensuring J and K are never equal to 1",
        "D": "By adding an external inverter"
      },
      "correctAnswer": "A",
      "explanation": "Race-around occurs in level-triggered flip-flops when J=K=1 and propagation delay is shorter than clock pulse width. Master-Slave isolates input capture and output update across opposite clock phases, eliminating race-around."
    },
    {
      "id": 3,
      "question": "How many flip-flops are required to construct a Mod-60 counter?",
      "options": {
        "A": "6 flip-flops (since 2^5 = 32 < 60 <= 2^6 = 64)",
        "B": "5 flip-flops",
        "C": "60 flip-flops",
        "D": "4 flip-flops"
      },
      "correctAnswer": "A",
      "explanation": "For a mod-N counter, the required number of flip-flops n satisfies: 2^(n-1) < N <= 2^n. For N = 60, 2^5 = 32 < 60 <= 2^6 = 64. Hence, exactly 6 flip-flops are required."
    },
    {
      "id": 4,
      "question": "What is the minimal sum of products for the function F(A, B, C) = Σm(0, 1, 4, 5, 6)?",
      "options": {
        "A": "B' + A C'",
        "B": "A' B + B C",
        "C": "A B' + C'",
        "D": "A' + B' C"
      },
      "correctAnswer": "A",
      "explanation": "In K-map: Group 1 of 4 minterms (0, 1, 4, 5) gives B'. Group 2 of 2 minterms (4, 6) gives A C'. Combining both prime implicants gives F = B' + A C'."
    },
    {
      "id": 5,
      "question": "In sequential digital circuits, what is \"Setup Time\" (t_setup)?",
      "options": {
        "A": "The minimum time interval that data input must remain stable BEFORE the active clock edge arrives",
        "B": "The time data must remain stable after the clock edge",
        "C": "The time taken to power on the chip",
        "D": "The propagation delay of the clock buffer"
      },
      "correctAnswer": "A",
      "explanation": "Setup time is the minimum duration the data input signal must be held stable before the triggering clock edge occurs to ensure correct latching. Violating setup time causes metastability."
    },
    {
      "id": 6,
      "question": "What is the condition for arithmetic overflow when adding two n-bit signed 2's complement numbers?",
      "options": {
        "A": "Carry into the sign bit differs from carry out of the sign bit: V = C_in ⊕ C_out",
        "B": "Carry out of MSB is 1",
        "C": "Both numbers are positive",
        "D": "The result is zero"
      },
      "correctAnswer": "A",
      "explanation": "Signed 2's complement overflow occurs if and only if two positive numbers produce a negative result or two negative numbers produce a positive result. This happens precisely when the carry into the sign bit differs from the carry out: Overflow = C_(n-1) ⊕ C_n."
    },
    {
      "id": 7,
      "question": "How many 3-to-8 line decoders with an enable input are needed to construct a 4-to-16 line decoder?",
      "options": {
        "A": "2 decoders and 1 inverter",
        "B": "4 decoders",
        "C": "3 decoders",
        "D": "5 decoders"
      },
      "correctAnswer": "A",
      "explanation": "Two 3-to-8 decoders produce 16 outputs (8 outputs each). The 4th input bit is connected directly to the Enable of one decoder and inverted to the Enable of the other."
    },
    {
      "id": 8,
      "question": "What is the dual of the Boolean expression: A + B' · C?",
      "options": {
        "A": "A · (B' + C)",
        "B": "A' + B · C'",
        "C": "A' · (B + C')",
        "D": "A + B · C'"
      },
      "correctAnswer": "A",
      "explanation": "Duality principle: swap AND with OR (+ with ·), and 0 with 1, leaving variable literals intact. Original: A + (B' · C). Dual: A · (B' + C)."
    },
    {
      "id": 9,
      "question": "Which logic gate produces a HIGH output if and only if an ODD number of its inputs are HIGH?",
      "options": {
        "A": "XOR gate",
        "B": "XNOR gate",
        "C": "NAND gate",
        "D": "NOR gate"
      },
      "correctAnswer": "A",
      "explanation": "An XOR gate is a parity generator: its output is 1 whenever the number of 1s in its inputs is odd."
    },
    {
      "id": 10,
      "question": "What is the 2's complement of the binary number `110100`?",
      "options": {
        "A": "001100",
        "B": "001011",
        "C": "001101",
        "D": "110101"
      },
      "correctAnswer": "A",
      "explanation": "1's complement of 110100 = 001011. Adding 1: 001011 + 1 = 001100."
    }
  ]
};
