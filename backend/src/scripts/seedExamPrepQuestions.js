import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const examPrepDbFile = path.resolve(__dirname, '../../data/exam_prep_db.json');
const gateDir = path.resolve(__dirname, '../../../frontend/src/data/gate');

async function seed() {
  if (!fs.existsSync(examPrepDbFile)) {
    console.error('exam_prep_db.json does not exist!');
    return;
  }

  const raw = fs.readFileSync(examPrepDbFile, 'utf8');
  const dbData = JSON.parse(raw);

  if (dbData.exam_prep_questions && dbData.exam_prep_questions.length > 0) {
    console.log(`Database already has ${dbData.exam_prep_questions.length} questions. Skipping seed.`);
    return;
  }

  const files = [
    'osExam.js',
    'dsExam.js',
    'algoExam.js',
    'tocExam.js',
    'coaExam.js',
    'dlExam.js',
    'cdExam.js',
    'cnExam.js',
    'dbmsExam.js',
    'mathExam.js'
  ];

  const seeded = [];

  for (const f of files) {
    const fPath = path.join(gateDir, f);
    if (!fs.existsSync(fPath)) continue;

    const content = fs.readFileSync(fPath, 'utf8');
    // Extract JSON-like object after export const ... =
    const jsonMatch = content.match(/export const \w+\s*=\s*(\{[\s\S]*\});?\s*$/);
    if (!jsonMatch) {
      console.warn(`Could not parse ${f}`);
      continue;
    }

    try {
      // Evaluate or parse object
      const examObj = Function('"use strict";return (' + jsonMatch[1] + ')')();
      const subjectId = examObj.subjectId;
      const subjectName = examObj.subject;
      const difficulty = examObj.difficulty || 'Hard';
      const topics = examObj.topics || [];

      (examObj.questions || []).forEach((q, idx) => {
        const topic = topics[idx % topics.length] || subjectName;
        seeded.push({
          id: `gate_${subjectId}_${q.id}`,
          exam_id: 'gate_cs',
          subject_id: subjectId,
          subject_name: subjectName,
          topic: topic,
          difficulty: difficulty,
          question_text: q.question,
          option_a: q.options?.A || '',
          option_b: q.options?.B || '',
          option_c: q.options?.C || '',
          option_d: q.options?.D || '',
          correct_answer: q.correctAnswer,
          explanation: q.explanation || '',
          created_at: new Date().toISOString()
        });
      });
    } catch (e) {
      console.error(`Error processing ${f}:`, e.message);
    }
  }

  dbData.exam_prep_questions = seeded;
  fs.writeFileSync(examPrepDbFile, JSON.stringify(dbData, null, 2), 'utf8');
  console.log(`Successfully seeded ${seeded.length} questions into exam_prep_db.json!`);
}

seed();
