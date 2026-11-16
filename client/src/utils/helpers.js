/**
 * Crash Prevention (Fault Tolerance): Safely extract and normalize options
 * from varied LLM output shapes (Array of strings, Object map, Array of objects, or raw string)
 */
export function getSafeOptions(rawOptions) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  if (!rawOptions) {
    return letters.slice(0, 4).map(key => ({
      key,
      text: `Option ${key}`,
      fullText: `${key}. Option ${key}`
    }));
  }

  // Case 1: Already an array
  if (Array.isArray(rawOptions)) {
    return rawOptions.map((item, index) => {
      const defaultKey = letters[index] || String(index + 1);

      if (typeof item === 'string') {
        const trimmed = item.trim();
        // Check if string starts with "A.", "A)", "A -", etc.
        const match = trimmed.match(/^([A-D])[\.\)\:\-]\s*(.*)$/i);
        if (match) {
          const key = match[1].toUpperCase();
          const text = match[2].trim();
          return { key, text: text || trimmed, fullText: trimmed };
        }
        return {
          key: defaultKey,
          text: trimmed,
          fullText: `${defaultKey}. ${trimmed}`
        };
      }

      if (typeof item === 'object' && item !== null) {
        const text = item.text || item.option || item.value || JSON.stringify(item);
        const key = (item.key || item.label || defaultKey).toString().toUpperCase().replace(/[^A-D]/g, '') || defaultKey;
        return {
          key,
          text,
          fullText: `${key}. ${text}`
        };
      }

      return {
        key: defaultKey,
        text: String(item),
        fullText: `${defaultKey}. ${String(item)}`
      };
    });
  }

  // Case 2: Object key-value map like {"A": "First option", "B": "Second option"}
  if (typeof rawOptions === 'object' && rawOptions !== null) {
    const keys = Object.keys(rawOptions);
    return keys.map((k, index) => {
      const cleanKey = k.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || letters[index] || 'A';
      const text = String(rawOptions[k]);
      return {
        key: cleanKey,
        text,
        fullText: `${cleanKey}. ${text}`
      };
    });
  }

  // Case 3: Raw string with newlines
  if (typeof rawOptions === 'string') {
    const lines = rawOptions.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      return getSafeOptions(lines);
    }
  }

  // Fallback default
  return letters.slice(0, 4).map(key => ({
    key,
    text: `Option ${key}`,
    fullText: `${key}. Option ${key}`
  }));
}

/**
 * Strict Scoring Logic:
 * Accurately calculates score, accuracy (strictly attempted-only), and status breakdown.
 * Prevents impossible percentages like 175% or NaN on zero attempts.
 */
export function calculateScore(questions = [], userAnswers = {}, questionTimes = {}) {
  let attemptedCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let totalTimeSeconds = 0;

  const reviewBreakdown = questions.map((q, index) => {
    const qId = q.id !== undefined ? q.id : index + 1;
    const userAnswerKey = userAnswers[qId];
    const isAttempted = userAnswerKey !== undefined && userAnswerKey !== null && userAnswerKey !== '';
    const safeOpts = getSafeOptions(q.options);

    // Extract canonical correct letter (A, B, C, D)
    let rawCorrect = (q.correctAnswer || q.answer || 'A').toString().trim();
    let correctLetter = 'A';
    const letterMatch = rawCorrect.match(/^([A-D])/i);
    if (letterMatch) {
      correctLetter = letterMatch[1].toUpperCase();
    } else {
      // If correctAnswer is full text, try finding matching option
      const matchingOpt = safeOpts.find(o => o.text.toLowerCase() === rawCorrect.toLowerCase());
      if (matchingOpt) {
        correctLetter = matchingOpt.key;
      }
    }

    let isCorrect = false;
    if (isAttempted) {
      attemptedCount++;
      const userLetter = String(userAnswerKey).trim().toUpperCase();
      isCorrect = userLetter === correctLetter;
      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }

    const timeSpent = questionTimes[qId] || 0;
    totalTimeSeconds += timeSpent;

    return {
      questionId: qId,
      questionNumber: index + 1,
      questionText: q.question,
      options: safeOpts,
      userAnswer: userAnswerKey || null,
      correctAnswer: correctLetter,
      isAttempted,
      isCorrect,
      explanation: q.explanation || 'No detailed explanation provided.',
      timeSpent
    };
  });

  const totalQuestions = questions.length;
  const unattemptedCount = Math.max(0, totalQuestions - attemptedCount);

  // Strict accuracy: percentage of correct answers out of attempted questions ONLY
  // If attemptedCount is 0, accuracy is 0 (prevents division by zero or NaN)
  const accuracyPercentage = attemptedCount > 0
    ? Math.min(100, Math.max(0, Math.round((correctCount / attemptedCount) * 100)))
    : 0;

  const overallPercentage = totalQuestions > 0
    ? Math.min(100, Math.max(0, Math.round((correctCount / totalQuestions) * 100)))
    : 0;

  const averageTimePerQuestion = totalQuestions > 0
    ? Math.round(totalTimeSeconds / totalQuestions)
    : 0;

  return {
    totalQuestions,
    attemptedCount,
    unattemptedCount,
    correctCount,
    incorrectCount,
    accuracyPercentage,
    overallPercentage,
    totalTimeSeconds,
    averageTimePerQuestion,
    reviewBreakdown
  };
}

/**
 * Format seconds into mm:ss or hh:mm:ss
 */
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Human-friendly file size
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
