import { AVAILABLE_EXAMS, GATE_SUBJECTS } from './gateSubjects.js';
import { osExam } from './osExam.js';
import { dsExam } from './dsExam.js';
import { algoExam } from './algoExam.js';
import { tocExam } from './tocExam.js';
import { coaExam } from './coaExam.js';
import { dlExam } from './dlExam.js';
import { cdExam } from './cdExam.js';
import { cnExam } from './cnExam.js';
import { dbmsExam } from './dbmsExam.js';
import { mathExam } from './mathExam.js';

export { AVAILABLE_EXAMS, GATE_SUBJECTS };

export const GATE_EXAMS = [
  osExam,
  dsExam,
  algoExam,
  tocExam,
  coaExam,
  dlExam,
  cdExam,
  cnExam,
  dbmsExam,
  mathExam
];
