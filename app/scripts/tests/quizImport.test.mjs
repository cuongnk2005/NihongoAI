import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// Exercise the actual TypeScript parser with Node's built-in runner, without a browser/test dependency.
const root = fileURLToPath(new URL('../../', import.meta.url));
const modules = new Map();
function load(relative) {
  const filename = path.resolve(root, relative);
  if (modules.has(filename)) return modules.get(filename);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {}; modules.set(filename, exports);
  new Function('require', 'exports', output)(id => load(path.relative(root, path.resolve(path.dirname(filename), id + '.ts'))), exports);
  return exports;
}
const { parseQuizCsv, examErrors, exportExamCsv } = load('src/features/pvp/exams/quizImport.ts');
const header = 'number,section,question,option_a,option_b,option_c,option_d,correct_answer';
const row = '1,Reading,学校はどこですか。,ここ,そこ,あそこ,どこ,A';

test('reads UTF-8 BOM, Japanese, Vietnamese, quoted commas, escaped quotes and multiline questions', () => {
  const questions = parseQuizCsv('\uFEFF' + header + '\r\n1,Reading,"【学校】, ở đâu?\n""Chọn""",ここ,そこ,あそこ,どこ,b');
  assert.equal(questions[0].question, '【学校】, ở đâu?\n"Chọn"');
  assert.equal(questions[0].correct, 1); assert.deepEqual(examErrors(questions), [[]]);
});
test('rejects missing columns and unfinished quoted cells', () => {
  assert.throws(() => parseQuizCsv('number,question\n1,Hello'), /Thiếu cột/);
  assert.throws(() => parseQuizCsv(header + '\n1,Reading,"unfinished'), /chưa đóng/);
});
test('flags missing or unknown correct answers and missing options for review', () => {
  const questions = parseQuizCsv(header + '\n1,Reading,Question,,B,C,D,E');
  assert.equal(questions[0].correct, -1); assert.equal(examErrors(questions)[0].length, 2);
});
test('flags duplicate numbers and equivalent options', () => {
  const questions = parseQuizCsv(header + '\n' + row + '\n1,Reading,Another,A,A,C,D,A');
  assert.ok(examErrors(questions).every(errors => errors.includes('Số câu bị trùng')));
  assert.ok(examErrors(questions)[1].some(error => error.includes('trùng nhau')));
});
test('editing a duplicate option clears the blocker; editing the prompt or correct letter does not', () => {
  const questions = parseQuizCsv(header + '\n31,Writing,機械が【せいじょう】かどうか,盛情,威常,威常,正常,D');
  assert.ok(examErrors(questions)[0].some(error => error.includes('B và C')));
  const changedPrompt = [{ ...questions[0], question: 'Edited question', correct: 2 }];
  assert.equal(examErrors(changedPrompt)[0].length, 1);
  const corrected = [{ ...questions[0], options: ['盛情', '威常', '異常', '正常'] }];
  assert.deepEqual(examErrors(corrected), [[]]);
});
test('rejects inconsistent row width and more than 500 questions', () => {
  assert.throws(() => parseQuizCsv(header + '\n' + row + ',extra'), /số cột/);
  assert.throws(() => parseQuizCsv(header + '\n' + Array(501).fill(row).join('\n')), /500/);
});
test('supports reordered TSV headers and lossless CSV backup round trip', () => {
  const input = 'correct_answer\toption_d\toption_c\toption_b\toption_a\tquestion\tsection\tnumber\nD\t四\t三\t二\t一\t何ですか\tKanji\t7';
  const questions = parseQuizCsv(input); assert.equal(questions[0].correct, 3);
  assert.deepEqual(parseQuizCsv(exportExamCsv({ id: 'id', name: 'N3', questions, createdAt: '' })), questions);
});

test('reads all 60 sample questions and flags duplicated choices in question 31', { skip: !process.env.QUIZ_SAMPLE_FILE }, () => {
  const questions = parseQuizCsv(fs.readFileSync(process.env.QUIZ_SAMPLE_FILE, 'utf8'));
  assert.equal(questions.length, 60);
  const errors = examErrors(questions);
  assert.equal(errors.filter(items => items.length > 0).length, 1);
  assert.equal(questions[30].number, 31);
  assert.ok(errors[30].some(error => error.includes('trùng nhau')));
  assert.deepEqual(parseQuizCsv(exportExamCsv({ id: 'sample', name: 'Sample', questions, createdAt: '' })), questions);
  console.log(`Sample: ${questions.length} questions, 1 flagged (question 31: duplicate options); sections: ${[...new Set(questions.map(q => q.section))].join(', ')}`);
});
