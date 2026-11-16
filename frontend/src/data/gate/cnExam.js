/**
 * Official GATE CS/IT Question Bank: Computer Networks
 */

export const cnExam = {
  "id": "exam_gate_cn",
  "subjectId": "cn",
  "subject": "Computer Networks",
  "quizTitle": "GATE CS: Computer Networks & Protocols",
  "difficulty": "Hard",
  "totalQuestions": 10,
  "timeLimitMinutes": 30,
  "description": "Subnetting calculations, Stop-and-Wait/Sliding Window protocols, CSMA/CD frame limits, TCP flow/congestion control, and routing invariants.",
  "topics": [
    "Subnetting & CIDR",
    "Sliding Window",
    "TCP Congestion Control",
    "CSMA/CD",
    "Routing Protocols"
  ],
  "questions": [
    {
      "id": 1,
      "question": "An organization is granted the IP block 192.168.10.0/26. What is the maximum number of assignable host IP addresses in this subnet, and what is its broadcast address?",
      "options": {
        "A": "62 hosts, broadcast: 192.168.10.63",
        "B": "64 hosts, broadcast: 192.168.10.64",
        "C": "30 hosts, broadcast: 192.168.10.31",
        "D": "126 hosts, broadcast: 192.168.10.127"
      },
      "correctAnswer": "A",
      "explanation": "With a /26 prefix, the host bits = 32 - 26 = 6 bits. Total IP addresses = 2^6 = 64. The assignable host addresses = 64 - 2 (network address and broadcast address) = 62. The block spans 192.168.10.0 to 192.168.10.63. The broadcast address is 192.168.10.63."
    },
    {
      "id": 2,
      "question": "In a Stop-and-Wait protocol, the packet size is 1000 bytes, bandwidth is 1 Mbps, and one-way propagation delay is 20 ms. What is the channel utilization (efficiency), neglecting ACK packet transmission time?",
      "options": {
        "A": "16.7%",
        "B": "25.0%",
        "C": "50.0%",
        "D": "10.0%"
      },
      "correctAnswer": "A",
      "explanation": "Transmission time T_t = (1000 * 8 bits) / (10^6 bps) = 8 ms. Propagation delay T_p = 20 ms. Parameter a = T_p / T_t = 20 / 8 = 2.5. Channel utilization for Stop-and-Wait: U = 1 / (1 + 2a) = 1 / (1 + 2 * 2.5) = 1 / 6 ≈ 16.67%."
    },
    {
      "id": 3,
      "question": "In a 10 Mbps CSMA/CD Ethernet network with propagation speed 2 * 10^8 m/s, the maximum cable length between any two stations is 1 km. What is the minimum frame size required for proper collision detection?",
      "options": {
        "A": "100 bits",
        "B": "100 bytes (800 bits)",
        "C": "200 bits",
        "D": "500 bits"
      },
      "correctAnswer": "A",
      "explanation": "One-way propagation delay T_p = Distance / Speed = 1000 m / (2 * 10^8 m/s) = 5 * 10^-6 s = 5 microseconds. For CSMA/CD collision detection, T_t >= 2 * T_p = 10 microseconds. Minimum frame size = Bandwidth * (2 * T_p) = (10 * 10^6 bps) * (10 * 10^-6 s) = 100 bits."
    },
    {
      "id": 4,
      "question": "In a Selective Repeat ARQ sliding window protocol using m-bit sequence numbers, what is the maximum permissible sender and receiver window size to prevent ambiguity?",
      "options": {
        "A": "2^(m - 1)",
        "B": "2^m",
        "C": "2^m - 1",
        "D": "2^(m + 1)"
      },
      "correctAnswer": "A",
      "explanation": "In Selective Repeat, window size of sender W_s plus window size of receiver W_r must satisfy: W_s + W_r <= 2^m. Since typically W_s = W_r, we have 2 * W <= 2^m, so maximum window size = 2^(m - 1)."
    },
    {
      "id": 5,
      "question": "A TCP connection is undergoing Congestion Avoidance with current congestion window (cwnd) = 16 MSS. If 3 consecutive duplicate ACKs are received, what will be the new values of ssthresh and cwnd under TCP Reno?",
      "options": {
        "A": "ssthresh = 8 MSS, cwnd = 8 MSS + 3 MSS = 11 MSS (Fast Recovery)",
        "B": "ssthresh = 8 MSS, cwnd = 1 MSS",
        "C": "ssthresh = 16 MSS, cwnd = 8 MSS",
        "D": "ssthresh = 4 MSS, cwnd = 1 MSS"
      },
      "correctAnswer": "A",
      "explanation": "Under TCP Reno, triple duplicate ACKs trigger Fast Retransmit and Fast Recovery: ssthresh is halved to cwnd / 2 = 16 / 2 = 8 MSS. Then cwnd is set to ssthresh + 3 MSS = 11 MSS, avoiding a drop to 1 MSS (which only happens upon a full RTO timeout)."
    },
    {
      "id": 6,
      "question": "What is the maximum number of bytes in the options field of an IPv4 packet header?",
      "options": {
        "A": "40 bytes",
        "B": "20 bytes",
        "C": "60 bytes",
        "D": "65535 bytes"
      },
      "correctAnswer": "A",
      "explanation": "The Internet Header Length (IHL) field is 4 bits, holding values up to 15 (representing 4-byte words). Maximum IPv4 header length = 15 * 4 = 60 bytes. The base header is 20 bytes, leaving at most 60 - 20 = 40 bytes for optional parameters."
    },
    {
      "id": 7,
      "question": "What is the primary mechanism used by Distance Vector routing protocols (like RIP) to mitigate the Count-to-Infinity problem?",
      "options": {
        "A": "Split Horizon and Poison Reverse",
        "B": "Dijkstra Link State Advertisements (LSA)",
        "C": "Binary Exponential Backoff",
        "D": "Spanning Tree Protocol"
      },
      "correctAnswer": "A",
      "explanation": "Distance Vector protocols resolve routing loops and the count-to-infinity problem using Split Horizon (never advertise a route back out the interface it was learned from) and Poison Reverse (advertise the route back with an infinite metric of 16)."
    },
    {
      "id": 8,
      "question": "An IP datagram of total size 4000 bytes (including 20 bytes IP header) arrives at a router whose outgoing link has an MTU of 1500 bytes. What is the value of the Fragment Offset in the second fragment?",
      "options": {
        "A": "185",
        "B": "1480",
        "C": "370",
        "D": "1500"
      },
      "correctAnswer": "A",
      "explanation": "MTU = 1500 bytes. With 20 bytes header, maximum payload per fragment = 1480 bytes (which is divisible by 8: 1480 / 8 = 185). First fragment carries data bytes 0 to 1479. The second fragment starts at byte 1480. Fragment Offset = 1480 / 8 = 185."
    },
    {
      "id": 9,
      "question": "What is the minimum header size of a TCP segment and a UDP segment respectively?",
      "options": {
        "A": "20 bytes and 8 bytes",
        "B": "16 bytes and 4 bytes",
        "C": "24 bytes and 12 bytes",
        "D": "20 bytes and 20 bytes"
      },
      "correctAnswer": "A",
      "explanation": "A standard TCP header has a minimum size of 20 bytes (without options). A UDP header consists of 4 fields (Source Port, Destination Port, Length, Checksum) each of 2 bytes, totaling exactly 8 bytes."
    },
    {
      "id": 10,
      "question": "In the Domain Name System (DNS), what is the difference between an Iterative query and a Recursive query?",
      "options": {
        "A": "In a recursive query, the contacted server assumes responsibility to resolve the full name and return the IP, whereas in an iterative query, the server returns the best referral IP it knows for the client to follow up",
        "B": "Iterative queries only work with IPv6",
        "C": "Recursive queries do not use UDP",
        "D": "Iterative queries are used only by web browsers"
      },
      "correctAnswer": "A",
      "explanation": "In recursive DNS queries, the DNS resolver takes full responsibility and queries other nameservers until the final IP is found. In iterative queries, the nameserver simply returns a referral to the next authoritative server (e.g., TLD or root server) for the client to query directly."
    }
  ]
};
