import { useEffect, useState } from 'react';
import { examErrors, type QuizExam } from './quizImport';

async function openLibrary(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('nihongoai-quiz-exams', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('exams', { keyPath: 'id' });
    request.onsuccess = () => { request.result.onversionchange = () => request.result.close(); resolve(request.result); };
    request.onerror = () => reject(new Error('Không mở được bộ nhớ bộ đề. Kiểm tra quyền lưu trữ của trình duyệt.'));
    request.onblocked = () => reject(new Error('Đóng các tab cũ rồi thử lại.'));
  });
}
async function readExams(): Promise<QuizExam[]> {
  const db = await openLibrary();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('exams', 'readonly'); const request = tx.objectStore('exams').getAll();
      tx.oncomplete = () => resolve(request.result as QuizExam[]);
      tx.onabort = () => reject(new Error('Không đọc được thư viện bộ đề.'));
    });
  } finally { db.close(); }
}
async function persistExam(exam: QuizExam) {
  if (!exam.name.trim() || exam.name.length > 200 || !exam.questions.length || exam.questions.length > 500 || examErrors(exam.questions).some(errors => errors.length))
    throw new Error('Bộ đề còn lỗi, vui lòng kiểm tra trước khi lưu.');
  const db = await openLibrary();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('exams', 'readwrite'); tx.objectStore('exams').put(exam);
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(new Error('Không lưu được bộ đề. Dữ liệu xem trước vẫn được giữ; hãy thử lưu lại.'));
    });
  } finally { db.close(); }
}
export function useExamLibrary() {
  const [exams, setExams] = useState<QuizExam[]>([]);
  const [loaded, setLoaded] = useState(false); const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let disposed = false; setError('');
    void readExams().then(items => { if (!disposed) { setExams(items); setLoaded(true); } })
      .catch(e => { if (!disposed) setError(e instanceof Error ? e.message : 'Không tải được bộ đề.'); });
    return () => { disposed = true; };
  }, [revision]);
  async function save(exam: QuizExam) {
    await persistExam(exam);
    setExams(previous => [...previous.filter(item => item.id !== exam.id), exam]);
    setLoaded(true); return exam;
  }
  return { exams, loaded, error, save, retry: () => setRevision(n => n + 1) };
}
