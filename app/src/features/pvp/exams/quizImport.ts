import { parseAnkiCsv } from '../../../utils/csvParser';

export interface ExamQuestion {
  number: number;
  section: string;
  question: string;
  options: string[];
  correct: number;
}
export interface QuizExam { id: string; name: string; questions: ExamQuestion[]; createdAt: string }
export const EXAM_COLUMNS = ['number', 'section', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'];

export function questionErrors(question: ExamQuestion): string[] {
  const errors: string[] = [];
  if (!Number.isInteger(question.number) || question.number < 1) errors.push('Số câu phải là số nguyên dương');
  if (!question.question.trim() || question.question.length > 4000) errors.push('Nội dung câu hỏi cần có 1–4.000 ký tự');
  if (question.section.length > 200) errors.push('Tên nhóm quá dài');
  if (question.options.length !== 4 || question.options.some(o => !o.trim() || o.length > 2000)) errors.push('Cần đủ 4 lựa chọn, mỗi lựa chọn tối đa 2.000 ký tự');
  const groups = new Map<string, string[]>();
  question.options.forEach((option, index) => {
    const text = option.trim().normalize('NFC');
    if (text) groups.set(text, [...(groups.get(text) || []), 'ABCD'[index]]);
  });
  groups.forEach((labels, text) => {
    if (labels.length > 1) errors.push(`Các lựa chọn không được trùng nhau: ${labels.join(' và ')} đang cùng là “${text}”`);
  });
  if (!Number.isInteger(question.correct) || question.correct < 0 || question.correct > 3) errors.push('Đáp án đúng phải là A, B, C hoặc D');
  return errors;
}
export function examErrors(questions: ExamQuestion[]): string[][] {
  const numbers = new Map<number, number>();
  questions.forEach(q => numbers.set(q.number, (numbers.get(q.number) || 0) + 1));
  return questions.map(q => [...questionErrors(q), ...((numbers.get(q.number) || 0) > 1 ? ['Số câu bị trùng'] : [])]);
}

export function parseQuizCsv(text: string): ExamQuestion[] {
  if (text.includes('\uFFFD')) throw new Error('File bị lỗi mã hóa. Hãy lưu lại dưới dạng CSV UTF-8.');
  // Reject an unfinished quoted cell instead of silently consuming the rest of the exam.
  let quoted = false;
  for (let i = 0; i < text.length; i++) if (text[i] === '"') {
    if (quoted && text[i + 1] === '"') i++;
    else quoted = !quoted;
  }
  if (quoted) throw new Error('File có dấu ngoặc kép chưa đóng. Kiểm tra lại CSV.');
  const { rows } = parseAnkiCsv(text);
  if (rows.length < 2) throw new Error('File cần một dòng tiêu đề và ít nhất một câu hỏi.');
  const header = rows[0].map(column => column.trim().toLowerCase());
  if (new Set(header).size !== header.length) throw new Error('File có tên cột bị trùng.');
  const missing = EXAM_COLUMNS.filter(column => !header.includes(column));
  if (missing.length) throw new Error(`Thiếu cột: ${missing.join(', ')}`);
  if (rows.length > 501) throw new Error('Mỗi bộ đề được nhập tối đa 500 câu.');
  return rows.slice(1).map((row, index) => {
    if (row.length !== header.length) throw new Error(`Dòng dữ liệu ${index + 1} có số cột không khớp. Nội dung chứa dấu phẩy cần đặt trong dấu ngoặc kép.`);
    const get = (column: string) => row[header.indexOf(column)]?.trim() || '';
    return { number: Number(get('number')), section: get('section'), question: get('question'),
      options: ['option_a', 'option_b', 'option_c', 'option_d'].map(get), correct: ['A', 'B', 'C', 'D'].indexOf(get('correct_answer').toUpperCase()) };
  });
}

export function exportExamCsv(exam: QuizExam): string {
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  return '\uFEFF' + [EXAM_COLUMNS, ...exam.questions.map(q => [q.number, q.section, q.question, ...q.options, 'ABCD'[q.correct]])]
    .map(row => row.map(escape).join(',')).join('\r\n');
}
