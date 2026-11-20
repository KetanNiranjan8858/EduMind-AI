import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Save, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-dark-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-dark-850/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-rose-600 via-purple-600 to-brand-600 rounded-xl text-white shadow-md shadow-rose-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {isEditing ? 'Edit Exam Prep Question' : 'Upload New Exam Prep Question'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Parameters will be saved exclusively into the Exam Prep Question Bank
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Exam & Subject Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                Target Exam Track
              </label>
              <select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="gate_cs">GATE Computer Science & IT (CS/IT)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
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
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                Specific Topic
              </label>
              <input
                type="text"
                placeholder="e.g. Multi-level Paging, Graph Theory, B-Trees"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">
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
                        ? diff === 'Hard'
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                          : diff === 'Medium'
                          ? 'bg-blue-500/20 border-blue-500/60 text-blue-300 shadow-sm'
                          : 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                        : 'bg-dark-950 border-slate-800 text-slate-400 hover:text-white'
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
            <label className="text-xs font-bold text-slate-300 mb-1.5 block">
              Question Statement
            </label>
            <textarea
              rows={4}
              placeholder="Enter complete technical question, numerical problem, or conceptual query..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full bg-dark-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
              required
            />
          </div>

          {/* Multiple Choice Options A, B, C, D */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                Options & Correct Answer
              </label>
              <span className="text-[11px] text-slate-400">
                Select the radio button beside the correct option
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
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm'
                        : 'bg-dark-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-400'
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
                      className="flex-1 bg-transparent border-0 text-xs text-slate-200 focus:outline-none"
                      required
                    />
                    {isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation & Solution */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-1.5 block">
              Detailed GATE Solution & Mathematical Derivation
            </label>
            <textarea
              rows={3}
              placeholder="Explain how to solve this step-by-step, formulas used, and why the selected option is correct..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full bg-dark-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
              required
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-dark-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/20 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
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
