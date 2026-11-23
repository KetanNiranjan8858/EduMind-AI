import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Save, Loader2, BookOpen } from 'lucide-react';
import { GATE_SUBJECTS } from '../../data/curatedExams';
import { generateAdminExplanation } from '../../utils/api';

export default function QuestionModal({
  isOpen,
  onClose,
  initialQuestion = null,
  onSave
}) {
  const isEditing = Boolean(initialQuestion && initialQuestion.id);

  const subjectsList = GATE_SUBJECTS.filter((s) => s.id !== 'all');

  const [examId, setExamId] = useState('gate_cs');
  const [subjectId, setSubjectId] = useState('math');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Hard');
  const [questionType, setQuestionType] = useState('MCQ'); // 'MCQ', 'MSQ', 'NAT'
  const [marks, setMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0.33);
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [msqAnswers, setMsqAnswers] = useState(['A']);
  const [natAnswer, setNatAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialQuestion) {
      setExamId(initialQuestion.examId || 'gate_cs');
      setSubjectId(initialQuestion.subjectId || 'math');
      setTopic(initialQuestion.topic || '');
      setDifficulty(initialQuestion.difficulty || 'Hard');
      
      const rawType = (
        initialQuestion.questionType ||
        (initialQuestion.correctAnswer?.includes(',')
          ? 'MSQ'
          : (!initialQuestion.options?.A && !initialQuestion.options?.B ? 'NAT' : 'MCQ'))
      ).toUpperCase();
      setQuestionType(rawType);

      setMarks(initialQuestion.marks !== undefined ? initialQuestion.marks : 1);
      setNegativeMarks(
        initialQuestion.negativeMarks !== undefined
          ? initialQuestion.negativeMarks
          : initialQuestion.negative_marks !== undefined
          ? initialQuestion.negative_marks
          : (rawType === 'NAT' || rawType === 'MSQ' ? 0 : 0.33)
      );

      setQuestionText(initialQuestion.question || initialQuestion.question_text || '');
      setOptionA(initialQuestion.options?.A || initialQuestion.option_a || '');
      setOptionB(initialQuestion.options?.B || initialQuestion.option_b || '');
      setOptionC(initialQuestion.options?.C || initialQuestion.option_c || '');
      setOptionD(initialQuestion.options?.D || initialQuestion.option_d || '');

      const initialAns = (initialQuestion.correctAnswer || initialQuestion.correct_answer || 'A').toString().trim();
      if (rawType === 'NAT') {
        setNatAnswer(initialAns);
      } else if (rawType === 'MSQ') {
        const parts = initialAns.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
        setMsqAnswers(parts.length > 0 ? parts : ['A']);
      } else {
        setCorrectAnswer(initialAns.toUpperCase() || 'A');
      }

      setExplanation(initialQuestion.explanation || '');
      setErrorMsg('');
    } else {
      setExamId('gate_cs');
      setSubjectId('math');
      setTopic('');
      setDifficulty('Hard');
      setQuestionType('MCQ');
      setMarks(1);
      setNegativeMarks(0.33);
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectAnswer('A');
      setMsqAnswers(['A']);
      setNatAnswer('');
      setExplanation('');
      setErrorMsg('');
    }
  }, [initialQuestion, isOpen]);

  function handleTypeSwitch(newType) {
    setQuestionType(newType);
    if (newType === 'NAT' || newType === 'MSQ') {
      setNegativeMarks(0);
    } else {
      setNegativeMarks(Number(marks) === 2 ? 0.66 : 0.33);
    }
  }

  function toggleMsqOption(optKey) {
    setMsqAnswers((prev) => {
      if (prev.includes(optKey)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((k) => k !== optKey);
      } else {
        return [...prev, optKey].sort();
      }
    });
  }

  if (!isOpen) return null;

  async function handleAIGenerateExplanation() {
    if (!questionText.trim()) {
      setErrorMsg('Please enter the question statement first before generating an AI explanation.');
      return;
    }
    setIsGeneratingAI(true);
    setErrorMsg('');
    try {
      const selectedSubjectObj = subjectsList.find((s) => s.id === subjectId);
      const effectiveAnswer =
        questionType === 'NAT'
          ? natAnswer.trim()
          : questionType === 'MSQ'
          ? msqAnswers.join(',')
          : correctAnswer;

      const res = await generateAdminExplanation({
        questionText: questionText.trim(),
        options: questionType === 'NAT' ? {} : {
          A: optionA.trim(),
          B: optionB.trim(),
          C: optionC.trim(),
          D: optionD.trim()
        },
        correctAnswer: effectiveAnswer,
        subject: selectedSubjectObj?.name || subjectId,
        topic: topic.trim() || selectedSubjectObj?.name,
        questionType
      });
      if (res.explanation) {
        setExplanation(res.explanation);
      }
    } catch (err) {
      setErrorMsg('Failed to generate AI explanation: ' + err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!questionText.trim()) {
      setErrorMsg('Question text is required.');
      return;
    }

    if (questionType === 'NAT') {
      if (!natAnswer.trim()) {
        setErrorMsg('Numerical answer value is required for NAT questions.');
        return;
      }
    } else {
      if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
        setErrorMsg('All 4 multiple-choice options (A, B, C, D) are required.');
        return;
      }
      if (questionType === 'MSQ' && msqAnswers.length === 0) {
        setErrorMsg('At least one correct option must be selected for MSQ.');
        return;
      }
    }

    if (!explanation.trim()) {
      setErrorMsg('Detailed solution and derivation explanation is required.');
      return;
    }

    setSaving(true);
    try {
      const selectedSubjectObj = subjectsList.find((s) => s.id === subjectId);
      const finalAns =
        questionType === 'NAT'
          ? natAnswer.trim()
          : questionType === 'MSQ'
          ? msqAnswers.sort().join(',')
          : correctAnswer.toUpperCase();

      const payload = {
        examId,
        subjectId,
        subjectName: selectedSubjectObj?.name || subjectId,
        topic: topic.trim() || selectedSubjectObj?.name || 'General',
        difficulty,
        questionType,
        marks: Number(marks) || 1,
        negativeMarks: Number(negativeMarks) >= 0 ? Number(negativeMarks) : 0,
        questionText: questionText.trim(),
        optionA: questionType === 'NAT' ? '' : optionA.trim(),
        optionB: questionType === 'NAT' ? '' : optionB.trim(),
        optionC: questionType === 'NAT' ? '' : optionC.trim(),
        optionD: questionType === 'NAT' ? '' : optionD.trim(),
        correctAnswer: finalAns,
        explanation: explanation.trim()
      };

      await onSave(payload, initialQuestion?.id);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save question.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#E6DFD3] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E6DFD3] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#173F3D] text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5 text-[#FAF7F2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1917]">
                {isEditing ? 'Adjust Exam Prep Question' : 'Upload New Exam Prep Question'}
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                Parameters will be saved exclusively into the Exam Prep Question Bank
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#E6DFD3]/40 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Question Type: MCQ, MSQ, NAT */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1917]">
                Question Type & Exam Format
              </label>
              <span className="text-[10px] text-[#78716C]">
                {questionType === 'MCQ'
                  ? 'Single Choice • Standard Negative Marking'
                  : questionType === 'MSQ'
                  ? 'Multiple Select • 1 or More Correct • 0 Negative Marking'
                  : 'Numerical Answer • Keypad Input • 0 Negative Marking'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'MCQ', title: 'MCQ', desc: 'Single Choice' },
                { type: 'MSQ', title: 'MSQ', desc: 'Multiple Select' },
                { type: 'NAT', title: 'NAT', desc: 'Numerical Answer' }
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleTypeSwitch(item.type)}
                  className={`py-2 px-3 rounded-xl transition-all cursor-pointer border text-center flex flex-col items-center justify-center gap-0.5 ${
                    questionType === item.type
                      ? 'bg-[#173F3D] border-[#173F3D] text-white shadow-2xs'
                      : 'bg-white border-[#E6DFD3] text-[#78716C] hover:text-[#1C1917]'
                  }`}
                >
                  <span className="text-xs font-bold">{item.title}</span>
                  <span className={`text-[10px] ${questionType === item.type ? 'text-[#FAF7F2]/80' : 'text-[#78716C]'}`}>
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 1: Exam & Subject Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#1C1917] mb-1.5 block">
                Target Exam Track
              </label>
              <select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#173F3D]"
              >
                <option value="gate_cs">GATE Computer Science & IT (CS/IT)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1C1917] mb-1.5 block">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#173F3D]"
              >
                {subjectsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Topic & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#1C1917] mb-1.5 block">
                Specific Topic
              </label>
              <input
                type="text"
                placeholder="e.g. Multi-level Paging, Graph Theory, B-Trees"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#173F3D]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1C1917] mb-1.5 block">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      difficulty === diff
                        ? 'bg-[#173F3D] border-[#173F3D] text-white shadow-2xs'
                        : 'bg-[#FAF7F2] border-[#E6DFD3] text-[#78716C] hover:text-[#1C1917]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Question Marks & Negative Marking Scheme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3]">
            {/* Positive Marks */}
            <div>
              <label className="text-xs font-bold text-[#1C1917] mb-1.5 flex items-center justify-between">
                <span>Awarded Marks (+Score)</span>
                <span className="text-[10px] text-[#78716C]">Score for correct response</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMarks(m);
                      if (m === 1 && (Number(negativeMarks) === 0.66 || negativeMarks === '0.66')) {
                        setNegativeMarks(0.33);
                      } else if (m === 2 && (Number(negativeMarks) === 0.33 || negativeMarks === '0.33')) {
                        setNegativeMarks(0.66);
                      }
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                      Number(marks) === m
                        ? 'bg-[#173F3D] border-[#173F3D] text-white shadow-2xs'
                        : 'bg-white border-[#E6DFD3] text-[#78716C] hover:text-[#1C1917]'
                    }`}
                  >
                    <span>+{m} Mark{m > 1 ? 's' : ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Marking Deduction */}
            <div>
              <label className="text-xs font-bold text-[#1C1917] mb-1.5 flex items-center justify-between">
                <span>Negative Marking Penalty</span>
                <span className="text-[10px] text-rose-600 font-semibold">Deduction on wrong choice</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="grid grid-cols-3 gap-1.5 flex-1">
                  {[
                    { label: '-0.33 (1/3)', val: 0.33 },
                    { label: '-0.66 (2/3)', val: 0.66 },
                    { label: '0 (None)', val: 0 }
                  ].map(({ label, val }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNegativeMarks(val)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border text-center ${
                        Number(negativeMarks) === val
                          ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-2xs font-extrabold'
                          : 'bg-white border-[#E6DFD3] text-[#78716C] hover:text-[#1C1917]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="w-20 shrink-0">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="2"
                    placeholder="Penalty"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(e.target.value)}
                    className="w-full bg-white border border-[#E6DFD3] rounded-xl px-2.5 py-2 text-xs text-[#1C1917] font-mono font-bold text-center focus:outline-none focus:border-[#173F3D]"
                    title="Exact negative mark penalty (e.g. 0.33, 0.66, 0)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="text-xs font-bold text-[#1C1917] mb-1.5 block">
              Question Statement
            </label>
            <textarea
              rows={4}
              placeholder="Enter complete technical question, numerical problem, or conceptual query..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl p-3.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#173F3D] leading-relaxed font-sans"
              required
            />
          </div>

          {/* Options / Answer Input based on Question Type */}
          {questionType === 'NAT' ? (
            /* Numerical Answer Input for NAT */
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD3] space-y-2">
              <label className="text-xs font-bold text-[#1C1917] flex items-center justify-between">
                <span>Numerical Correct Answer Key (NAT)</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Candidates input via on-screen keypad</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 42 or 3.14 or -0.5"
                value={natAnswer}
                onChange={(e) => setNatAnswer(e.target.value)}
                className="w-full bg-white border border-[#E6DFD3] rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-[#173F3D] focus:outline-none focus:border-[#173F3D]"
                required
              />
              <p className="text-[11px] text-[#78716C] leading-relaxed">
                In GATE NAT questions, no multiple-choice options are displayed. Enter the exact numerical value or decimal answer.
              </p>
            </div>
          ) : (
            /* Multiple Choice Options A, B, C, D (MCQ single select or MSQ multi select) */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1C1917]">
                  {questionType === 'MSQ'
                    ? 'Multiple Select Options (Click all options that are correct)'
                    : 'Multiple Choice Options (Select 1 correct option)'}
                </label>
                <span className="text-[11px] text-[#78716C]">
                  {questionType === 'MSQ'
                    ? `${msqAnswers.length} option(s) marked correct (${msqAnswers.join(', ')})`
                    : `Option (${correctAnswer}) is marked correct`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'A', value: optionA, setter: setOptionA },
                  { key: 'B', value: optionB, setter: setOptionB },
                  { key: 'C', value: optionC, setter: setOptionC },
                  { key: 'D', value: optionD, setter: setOptionD }
                ].map(({ key, value, setter }) => {
                  const isCorrect = questionType === 'MSQ' ? msqAnswers.includes(key) : correctAnswer === key;
                  return (
                    <div
                      key={key}
                      onClick={() => {
                        if (questionType === 'MSQ') {
                          toggleMsqOption(key);
                        } else {
                          setCorrectAnswer(key);
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isCorrect
                          ? 'bg-[#E5ECEB] border-[#173F3D] text-[#173F3D] shadow-2xs'
                          : 'bg-[#FAF7F2] border-[#E6DFD3] hover:border-[#DCD2C0]'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                          isCorrect
                            ? 'bg-[#173F3D] text-white'
                            : 'bg-[#E6DFD3] text-[#78716C]'
                        }`}
                      >
                        {key}
                      </div>
                      <input
                        type="text"
                        placeholder={`Option ${key} text...`}
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-transparent border-0 text-xs text-[#1C1917] focus:outline-none font-medium"
                        required={questionType !== 'NAT'}
                      />
                      {isCorrect && (
                        <span className="text-[10px] font-bold text-[#173F3D] shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-[#173F3D]" />
                          <span>{questionType === 'MSQ' ? 'Correct (MSQ)' : 'Correct'}</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Explanation & Solution */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <label className="text-xs font-bold text-[#1C1917] block">
                Detailed Solution & Derivation Explanation
              </label>
              <button
                type="button"
                onClick={handleAIGenerateExplanation}
                disabled={isGeneratingAI || !questionText.trim()}
                className="px-2.5 py-1 bg-[#173F3D] hover:bg-[#102B2A] text-white disabled:opacity-40 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                title="Generate concise 5-10 line step-by-step solution using Gemini AI"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                    <span>AI Generating (5-10 lines)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>✨ AI Generate (5-10 lines max)</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Enter solution derivation (or click '✨ AI Generate (5-10 lines max)' for a concise 5 to 10 line explanation)..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl p-3.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#173F3D] leading-relaxed font-sans"
              required
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#E6DFD3] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#1C1917] border border-[#E6DFD3] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#173F3D] hover:bg-[#102B2A] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Exam Prep DB...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Update Question' : 'Save Question to Bank'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
