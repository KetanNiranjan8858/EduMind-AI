import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Save, Loader2, BookOpen } from 'lucide-react';
import { GATE_SUBJECTS } from '../../data/curatedExams';

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
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialQuestion) {
      setExamId(initialQuestion.examId || 'gate_cs');
      setSubjectId(initialQuestion.subjectId || 'math');
      setTopic(initialQuestion.topic || '');
      setDifficulty(initialQuestion.difficulty || 'Hard');
      setQuestionText(initialQuestion.question || initialQuestion.question_text || '');
      setOptionA(initialQuestion.options?.A || initialQuestion.option_a || '');
      setOptionB(initialQuestion.options?.B || initialQuestion.option_b || '');
      setOptionC(initialQuestion.options?.C || initialQuestion.option_c || '');
      setOptionD(initialQuestion.options?.D || initialQuestion.option_d || '');
      setCorrectAnswer(initialQuestion.correctAnswer || initialQuestion.correct_answer || 'A');
      setExplanation(initialQuestion.explanation || '');
      setErrorMsg('');
    } else {
      setExamId('gate_cs');
      setSubjectId('math');
      setTopic('');
      setDifficulty('Hard');
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectAnswer('A');
      setExplanation('');
      setErrorMsg('');
    }
  }, [initialQuestion, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!questionText.trim()) {
      setErrorMsg('Question text is required.');
      return;
    }
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setErrorMsg('All 4 multiple-choice options (A, B, C, D) are required.');
      return;
    }
    if (!explanation.trim()) {
      setErrorMsg('Detailed solution and derivation explanation is required.');
      return;
    }

    setSaving(true);
    try {
      const selectedSubjectObj = subjectsList.find((s) => s.id === subjectId);
      const payload = {
        examId,
        subjectId,
        subjectName: selectedSubjectObj?.name || subjectId,
        topic: topic.trim() || selectedSubjectObj?.name || 'General',
        difficulty,
        questionText: questionText.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer: correctAnswer.toUpperCase(),
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

          {/* Multiple Choice Options A, B, C, D */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1917]">
                Multiple Choice Options (Select correct option)
              </label>
              <span className="text-[11px] text-[#78716C]">
                Click an option card to mark it as the correct answer
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'A', value: optionA, setter: setOptionA },
                { key: 'B', value: optionB, setter: setOptionB },
                { key: 'C', value: optionC, setter: setOptionC },
                { key: 'D', value: optionD, setter: setOptionD }
              ].map(({ key, value, setter }) => {
                const isCorrect = correctAnswer === key;
                return (
                  <div
                    key={key}
                    onClick={() => setCorrectAnswer(key)}
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
                      required
                    />
                    {isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-[#173F3D] shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation & Solution */}
          <div>
            <label className="text-xs font-bold text-[#1C1917] mb-1.5 block">
              Detailed Solution & Derivation Explanation
            </label>
            <textarea
              rows={3}
              placeholder="Explain how to solve this step-by-step, formulas used, and why the selected option is correct..."
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
