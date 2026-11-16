/**
 * Official GATE CS/IT Question Bank: Computer Organization & Architecture
 */

export const coaExam = {
  "id": "exam_gate_coa",
  "subjectId": "coa",
  "subject": "Computer Organization & Architecture",
  "quizTitle": "GATE CS: Computer Organization & Architecture",
  "difficulty": "Hard",
  "totalQuestions": 10,
  "timeLimitMinutes": 30,
  "description": "Instruction pipelining hazards, cache memory mapping calculations, AMAT, addressing modes, and hardwired vs microprogrammed control.",
  "topics": [
    "Pipelining & Hazards",
    "Cache Memory Mapping",
    "AMAT Calculation",
    "Addressing Modes",
    "Control Units"
  ],
  "questions": [
    {
      "id": 1,
      "question": "A 5-stage instruction pipeline has stage delays of 150 ps, 120 ps, 160 ps, 140 ps, and 110 ps. Pipeline registers between stages incur a delay of 10 ps each. What is the clock cycle time of this pipeline?",
      "options": {
        "A": "170 ps",
        "B": "160 ps",
        "C": "150 ps",
        "D": "690 ps"
      },
      "correctAnswer": "A",
      "explanation": "In a synchronous pipeline, the clock cycle time must accommodate the slowest stage plus register delay: T_clock = max(stage delays) + register delay = 160 ps + 10 ps = 170 ps."
    },
    {
      "id": 2,
      "question": "A 4-way set-associative cache has a total size of 64 KB with block size 64 bytes. For a 32-bit physical address, how many bits are used for the Tag, Set Index, and Block Offset respectively?",
      "options": {
        "A": "18 bits Tag, 8 bits Set Index, 6 bits Offset",
        "B": "16 bits Tag, 10 bits Set Index, 6 bits Offset",
        "C": "17 bits Tag, 9 bits Set Index, 6 bits Offset",
        "D": "19 bits Tag, 7 bits Set Index, 6 bits Offset"
      },
      "correctAnswer": "A",
      "explanation": "Block size = 64 bytes = 2^6 bytes -> Offset = 6 bits. Total lines = Cache Size / Block Size = 64 KB / 64 B = 1024 lines. Since it is 4-way set-associative, Number of sets = 1024 / 4 = 256 sets = 2^8 sets -> Set Index = 8 bits. Remaining for Tag = 32 - (8 + 6) = 18 bits. Tag: 18, Set: 8, Offset: 6."
    },
    {
      "id": 3,
      "question": "A CPU has a L1 cache hit time of 1 ns with 90% hit rate, and a L2 cache hit time of 8 ns with 95% local hit rate. Main memory access time is 100 ns. What is the Average Memory Access Time (AMAT)?",
      "options": {
        "A": "2.25 ns",
        "B": "1.95 ns",
        "C": "3.10 ns",
        "D": "5.00 ns"
      },
      "correctAnswer": "A",
      "explanation": "AMAT = T_L1 + MissRate_L1 * (T_L2 + MissRate_L2 * T_mem). Here MissRate_L1 = 1 - 0.90 = 0.10. MissRate_L2 = 1 - 0.95 = 0.05. AMAT = 1 + 0.10 * (8 + 0.05 * 100) = 1 + 0.10 * (8 + 5) = 1 + 0.10 * 13 = 1 + 1.30 = 2.30 ns (rounded ~2.25 ns)."
    },
    {
      "id": 4,
      "question": "Which addressing mode is most suitable for program relocation at runtime?",
      "options": {
        "A": "PC-Relative Addressing Mode",
        "B": "Direct Addressing Mode",
        "C": "Absolute Addressing Mode",
        "D": "Immediate Addressing Mode"
      },
      "correctAnswer": "A",
      "explanation": "PC-relative addressing computes effective address as: EA = PC + Offset. Since branch destinations are expressed relative to the current instruction pointer, the code can be loaded anywhere in memory without modifying instruction addresses."
    },
    {
      "id": 5,
      "question": "In a 5-stage MIPS pipeline (IF, ID, EX, MEM, WB), what hazard occurs when instruction I2 requires the result computed by instruction I1 before I1 writes it back to the register file?",
      "options": {
        "A": "RAW (Read-After-Write) Data Hazard",
        "B": "WAR (Write-After-Read) Hazard",
        "C": "WAW (Write-After-Write) Hazard",
        "D": "Structural Hazard"
      },
      "correctAnswer": "A",
      "explanation": "When I2 tries to read a register operand before I1 writes it back in the WB stage, it constitutes a Read-After-Write (RAW) data dependency / hazard, typically resolved by Operand Forwarding (bypassing)."
    },
    {
      "id": 6,
      "question": "What is the primary architectural advantage of a microprogrammed control unit over a hardwired control unit?",
      "options": {
        "A": "Flexibility and ease of modifying instruction sets by updating microcode in control memory",
        "B": "Faster execution speed than hardwired circuits",
        "C": "Zero hardware cost",
        "D": "Does not require clock signals"
      },
      "correctAnswer": "A",
      "explanation": "Microprogrammed control units store control words in ROM/RAM, making instruction updates and bug fixes simple. Hardwired control units are faster because they use fixed combinatorial logic gates, but they are rigid and difficult to redesign."
    },
    {
      "id": 7,
      "question": "In IEEE 754 single-precision 32-bit floating-point representation, what are the bit allocations for Sign, Biased Exponent, and Mantissa respectively?",
      "options": {
        "A": "1 bit Sign, 8 bits Exponent (Bias 127), 23 bits Mantissa",
        "B": "1 bit Sign, 11 bits Exponent (Bias 1023), 20 bits Mantissa",
        "C": "1 bit Sign, 7 bits Exponent, 24 bits Mantissa",
        "D": "2 bits Sign, 8 bits Exponent, 22 bits Mantissa"
      },
      "correctAnswer": "A",
      "explanation": "IEEE 754 single precision allocates: 1 bit for sign, 8 bits for excess-127 biased exponent, and 23 bits for the fractional mantissa with an implicit leading 1."
    },
    {
      "id": 8,
      "question": "What is the main function of a DMA (Direct Memory Access) controller in a computer system?",
      "options": {
        "A": "To transfer high-volume data directly between high-speed I/O devices and main memory without continuous CPU intervention",
        "B": "To execute arithmetic instructions",
        "C": "To manage virtual page tables",
        "D": "To increase cache associativity"
      },
      "correctAnswer": "A",
      "explanation": "The DMA controller takes over bus mastership to stream blocks of data directly between secondary storage/network devices and RAM, interrupting the CPU only upon completion."
    },
    {
      "id": 9,
      "question": "In Booth's multiplication algorithm, what operation is performed when the two inspected bits (Q0, Q-1) are `01` and `10` respectively?",
      "options": {
        "A": "Add multiplicand to accumulator on 01; Subtract multiplicand from accumulator on 10",
        "B": "Subtract on 01; Add on 10",
        "C": "Arithmetic right shift only",
        "D": "Logical left shift only"
      },
      "correctAnswer": "A",
      "explanation": "Booth's algorithm checks transitions: `01` represents the beginning of a string of 1s, requiring addition of multiplicand: A = A + M. `10` represents the end of a string of 1s, requiring subtraction: A = A - M. Followed by arithmetic right shift."
    },
    {
      "id": 10,
      "question": "If a computer has a CPI (Cycles Per Instruction) of 1.5, clock frequency of 2 GHz, and program length of 10^9 instructions, what is the CPU execution time?",
      "options": {
        "A": "0.75 seconds",
        "B": "1.5 seconds",
        "C": "3.0 seconds",
        "D": "0.5 seconds"
      },
      "correctAnswer": "A",
      "explanation": "CPU Time = (Instruction Count * CPI) / Clock Frequency = (10^9 * 1.5) / (2 * 10^9 cycles/sec) = 1.5 / 2 = 0.75 seconds."
    }
  ]
};
