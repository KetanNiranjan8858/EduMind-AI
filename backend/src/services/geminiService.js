import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

let aiClient = null;

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

/**
 * Determine MIME type based on extension
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.md': 'text/plain',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.mp3': 'audio/mp3',
    '.wav': 'audio/wav'
  };
  return map[ext] || 'application/octet-stream';
}

/**
 * Upload a local file to Gemini Files API
 */
async function uploadToGeminiFilesAPI(ai, filePath, mimeType) {
  try {
    console.log(`[Gemini File API] Uploading ${filePath} (${mimeType})...`);
    // The @google/genai Files API upload method
    const uploadResult = await ai.files.upload({
      file: filePath,
      mimeType: mimeType
    });
    console.log(`[Gemini File API] Upload successful: ${uploadResult.name || uploadResult.uri}`);
    return uploadResult;
  } catch (err) {
    console.warn(`[Gemini File API] Upload via files API failed (${err.message}). Trying inline data fallback.`);
    return null;
  }
}

/**
 * Helper to generate mock questions if API key is not configured
 */
function generateMockQuiz(sources, difficulty, questionCount) {
  const sourceNames = sources.map(s => s.original_name).join(', ');
  const titles = [
    `Concept Analysis & Theoretical Principles (${difficulty})`,
    `Applied Problem Solving & Edge Cases`,
    `Algorithmic Performance & Complexity`,
    `System Architecture & Design Constraints`,
    `Failure Modes & Fault Tolerance Protocol`,
    `Critical State Transitions & Invariants`,
    `Optimization Thresholds & Performance Bounds`,
    `Comparative Trade-off Analysis`,
    `Data Integrity & Verification Techniques`,
    `Mathematical Derivation & Proof Invariants`
  ];

  const questions = [];
  for (let i = 0; i < questionCount; i++) {
    const qIndex = i + 1;
    const title = titles[i % titles.length];
    questions.push({
      id: qIndex,
      question: `Regarding ${title}, which statement is strictly supported by the core concepts?`,
      options: [
        `A. The primary invariant maintains consistency under concurrent state updates without degraded latency.`,
        `B. The throughput exhibits quadratic degradation if buffer boundaries exceed memory thresholds.`,
        `C. Direct indexing guarantees logarithmic execution time across distributed partitions.`,
        `D. Auxiliary validation steps are bypassed only during cold-start initialization phases.`
      ],
      correctAnswer: ['A', 'B', 'C', 'D'][i % 4],
      explanation: `This is the verified correct conclusion aligned with ${difficulty} requirements.`
    });
  }

  return {
    quizTitle: `${difficulty} Assessment: ${sources[0]?.original_name || 'Study Notes'}`,
    difficulty,
    totalQuestions: questionCount,
    sourceFiles: sources.map(s => s.original_name),
    generatedAt: new Date().toISOString(),
    isMock: true,
    note: "Generated in Demo/Offline mode because GEMINI_API_KEY is not configured in server/.env",
    questions
  };
}

/**
 * Generate MCQs from selected sources using Gemini 2.5 Flash
 */
export async function generateQuiz({ sources, difficulty = 'Medium', questionCount = 5, customTopic = '' }) {
  const ai = getAIClient();

  if (!ai) {
    console.warn('[EduMind AI] GEMINI_API_KEY is missing or invalid. Returning realistic mock assessment.');
    return generateMockQuiz(sources, difficulty, questionCount);
  }

  try {
    const contents = [];
    let textContext = '';

    for (const source of sources) {
      const fullPath = path.resolve(source.file_path);

      if (source.is_note && source.note_content) {
        textContext += `\n--- SOURCE NOTE: ${source.original_name} ---\n${source.note_content}\n`;
        continue;
      }

      if (!fs.existsSync(fullPath)) {
        console.warn(`[EduMind AI] File not found on disk: ${fullPath}`);
        continue;
      }

      const mimeType = source.mime_type || getMimeType(fullPath);

      // If text/markdown, read directly as text
      if (mimeType.startsWith('text/') || fullPath.endsWith('.txt') || fullPath.endsWith('.md')) {
        const textData = fs.readFileSync(fullPath, 'utf8');
        textContext += `\n--- SOURCE DOCUMENT: ${source.original_name} ---\n${textData}\n`;
      } else {
        // Multi-modal (PDF, Image, Video): upload to Gemini File API
        const uploadedFile = await uploadToGeminiFilesAPI(ai, fullPath, mimeType);
        if (uploadedFile) {
          contents.push({
            fileData: {
              fileUri: uploadedFile.uri,
              mimeType: uploadedFile.mimeType
            }
          });
        } else {
          // If files API fails, send small files as base64 inlineData if feasible
          try {
            const buffer = fs.readFileSync(fullPath);
            if (buffer.length < 15 * 1024 * 1024) {
              contents.push({
                inlineData: {
                  data: buffer.toString('base64'),
                  mimeType: mimeType
                }
              });
            }
          } catch (e) {
            console.error(`Failed to inline file ${source.original_name}:`, e.message);
          }
        }
      }
    }

    if (textContext.trim().length > 0) {
      contents.push({ text: textContext });
    }

    const systemPrompt = `You are an elite academic question author and psychometric testing specialist.
You must create exactly ${questionCount} multiple-choice questions (MCQs) strictly and solely based on the provided documents and notes.

STRICT CONSTRAINTS:
1. Difficulty Level: "${difficulty}" (Easy, Medium, or Hard). Calibrate questions, complexity, and analytical depth strictly to this level.
2. NO HALLUCINATIONS: Every question, correct answer, and explanation must be 100% grounded in the provided sources. Do not inject outside facts.
3. Each question must have exactly 4 options labeled with "A.", "B.", "C.", and "D.".
4. You must specify the "correctAnswer" as the single letter corresponding to the correct option ("A", "B", "C", or "D").
5. Provide a detailed, step-by-step "explanation" citing the concepts from the source material.
6. STRICT BAN ON FILE NAMES: NEVER include file names, document titles, or phrases like "Based on [filename]", "According to [filename]", or "In the document" inside the question statement. State ONLY the direct, pure academic question itself.

You MUST return valid, pure JSON without markdown wrappers (or clean json) conforming exactly to this structure:
{
  "quizTitle": "Descriptive title for the assessment",
  "difficulty": "${difficulty}",
  "totalQuestions": ${questionCount},
  "questions": [
    {
      "id": 1,
      "question": "Full question statement here",
      "options": [
        "A. Option 1",
        "B. Option 2",
        "C. Option 3",
        "D. Option 4"
      ],
      "correctAnswer": "A",
      "explanation": "Detailed explanation..."
    }
  ]
}`;

    contents.push({ text: systemPrompt });

    console.log(`[EduMind AI] Requesting quiz from Gemini 2.5 Flash (${difficulty}, ${questionCount} questions)...`);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const responseText = response.text || '';
    let parsedQuiz;

    try {
      // Strip markdown code fences if present
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsedQuiz = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('[EduMind AI] JSON parse failed on raw output, attempting regex extraction:', parseErr.message);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedQuiz = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse structured JSON from Gemini response.');
      }
    }

    // Attach metadata
    parsedQuiz.sourceFiles = sources.map(s => s.original_name);
    parsedQuiz.generatedAt = new Date().toISOString();

    // Sanitize questions: strictly strip any file names or source prefixes
    if (parsedQuiz.questions && Array.isArray(parsedQuiz.questions)) {
      parsedQuiz.questions = parsedQuiz.questions.map((q) => {
        let text = (q.question || '').trim();
        text = text.replace(/^\[(Easy|Medium|Hard|Assessment)\]\s*/i, '');
        text = text.replace(/^Based on (the )?(source material|uploaded documents?|documents?|notes?|text)[^:?\n]*[:,-]\s*/i, '');
        text = text.replace(/^(According to|In the document|In the file|In)\s+["']?[^:?\n]+["']?[:,-]\s*/i, '');
        for (const s of sources) {
          if (s.original_name) {
            const escaped = s.original_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            text = text.replace(new RegExp(`^.*?${escaped}["']?\\s*[:,-]?\\s*`, 'i'), '');
          }
        }
        text = text.replace(/^Regarding\s+["']?[^:?\n]+["']?,\s*which\s+/i, 'Which ');
        if (text.length > 0) {
          text = text.charAt(0).toUpperCase() + text.slice(1);
        }
        return {
          ...q,
          question: text || q.question
        };
      });
    }

    return parsedQuiz;
  } catch (err) {
    console.error('[EduMind AI] Gemini generation error:', err);
    console.warn('[EduMind AI] Falling back to robust mock quiz generation due to error.');
    return generateMockQuiz(sources, difficulty, questionCount);
  }
}

/**
 * Chat with Gemini based on selected documents
 */
export async function chatWithDocuments({ sources = [], messages = [], userQuery = '' }) {
  const ai = getAIClient();

  if (!ai) {
    return {
      reply: `Gemini API key not configured. Please add GEMINI_API_KEY to backend/.env.`,
      isMock: true
    };
  }

  try {
    const contents = [];
    let textContext = '';

    for (const source of sources) {
      const fullPath = path.resolve(source.file_path);

      if (source.is_note && source.note_content) {
        textContext += `\n--- NOTE: ${source.original_name} ---\n${source.note_content}\n`;
        continue;
      }

      if (!fs.existsSync(fullPath)) continue;
      const mimeType = source.mime_type || getMimeType(fullPath);

      if (mimeType.startsWith('text/') || fullPath.endsWith('.txt') || fullPath.endsWith('.md')) {
        const textData = fs.readFileSync(fullPath, 'utf8');
        textContext += `\n--- DOCUMENT: ${source.original_name} ---\n${textData}\n`;
      } else {
        const uploadedFile = await uploadToGeminiFilesAPI(ai, fullPath, mimeType);
        if (uploadedFile) {
          contents.push({
            fileData: {
              fileUri: uploadedFile.uri,
              mimeType: uploadedFile.mimeType
            }
          });
        }
      }
    }

    const systemPrompt = `You are EduMind AI, a precision-focused academic assistant and GATE tutor.
CRITICAL MANDATORY INSTRUCTIONS:
1. Generate ONLY precise, exact answers and the actual words, formulas, definitions, code, or derivations requested by the user.
2. DO NOT generate extra conversational filler, greetings, pleasantries, apologies, or introductory remarks (e.g. NEVER say "Hello!", "Certainly!", "Sure! I would be glad to help", "Here is the explanation:", or similar).
3. DO NOT generate closing remarks, sign-offs, or follow-up prompts (e.g. NEVER say "Hope this helps!", "Let me know if you have questions!").
4. Get straight to the answer immediately. If the user asks for a formula, output ONLY the formula and exact definition. If the user asks for a step-by-step derivation or solution, output directly the steps and final result.
5. Use clear, compact Markdown formatting with formulas or bullet points without verbose padding.
6. For headings or section titles, NEVER wrap headings in asterisks (do NOT use **Heading** or ### **Heading**). Write pure plain text headings, e.g. "### Heading" or "Heading:". Never include double asterisks ** around headings or titles.`;

    contents.push({ text: `${systemPrompt}\n${textContext}` });

    // Append prior conversational turns if provided
    if (Array.isArray(messages)) {
      for (const m of messages.slice(-6)) {
        contents.push({
          text: `${m.sender === 'user' ? 'Student' : 'EduMind AI'}: ${m.text}`
        });
      }
    }

    contents.push({ text: `Student: ${userQuery}` });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        temperature: 0.4
      }
    });

    let reply = response.text || 'No response generated from Gemini.';
    reply = reply
      .replace(/^(#{1,6}\s*)\*\*(.+?)\*\*/gm, '$1$2')
      .replace(/^(\s*)\*\*(.+?)\*\*(\s*:?)\s*$/gm, '$1$2$3')
      .replace(/^(\s*[-*•]\s*)\*\*(.+?)\*\*(\s*:?)/gm, '$1$2$3')
      .replace(/^(\s*\d+[\.\)]\s*)\*\*(.+?)\*\*(\s*:?)/gm, '$1$2$3')
      .replace(/^(\s*)\*\*(.+?):?\*\*:\s*/gm, '$1$2: ')
      .replace(/^(\s*)\*\*(.+?):\*\*\s*/gm, '$1$2: ');

    return {
      reply
    };
  } catch (err) {
    console.error('[EduMind AI] Chat error:', err);
    return {
      reply: `Sorry, an error occurred while processing your request with Gemini: ${err.message}`,
      error: true
    };
  }
}
