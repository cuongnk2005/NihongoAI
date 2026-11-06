import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { DeckNode } from './pages/DecksPage';

// IndexedDB supports larger CSV imports than localStorage. No data is sent to a server.
const DATABASE = 'nihongoai-learning';
const STORE = 'decks';
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Đóng các tab cũ rồi thử lại.'));
  });
}

export function useSavedDecks(initial: DeckNode[]) {
  const [decks, updateDecks] = useState(initial);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const connection = useRef<IDBDatabase | null>(null);
  const latest = useRef(initial);
  const revision = useRef(0);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let disposed = false;
    let db: IDBDatabase | null = null;
    setError('');
    void openDatabase().then(database => {
      db = database;
      if (disposed) { database.close(); return; }
      connection.current = database;
      database.onversionchange = () => database.close();
      const transaction = database.transaction(STORE, 'readonly');
      const read = transaction.objectStore(STORE).get('library');
      transaction.oncomplete = () => {
        if (disposed) return;
        const value: unknown = read.result;
        if (value !== undefined && (!Array.isArray(value) || !value.every(isDeck))) {
          setError('Dữ liệu bộ thẻ đã lưu không hợp lệ. Chưa ghi đè dữ liệu cũ.'); return;
        }
        latest.current = value === undefined ? initial : value as DeckNode[];
        updateDecks(latest.current); setLoaded(true);
      };
      transaction.onabort = () => { if (!disposed) setError('Không đọc được bộ thẻ đã lưu. Vui lòng thử lại.'); };
    }).catch(() => { if (!disposed) setError('Không mở được bộ nhớ trình duyệt. Kiểm tra quyền lưu dữ liệu rồi thử lại.'); });
    return () => { disposed = true; connection.current = null; db?.close(); };
    // Initial decks are a module-level constant; retry only restarts a failed load.
  }, [retry]); // eslint-disable-line react-hooks/exhaustive-deps

  function persist(value: DeckNode[]) {
    const db = connection.current;
    if (!db) return;
    const version = ++revision.current;
    pending.current = true; setSaving(true); setError('');
    try {
      const transaction = db.transaction(STORE, 'readwrite');
      transaction.objectStore(STORE).put(value, 'library');
      transaction.oncomplete = () => {
        if (revision.current === version) { pending.current = false; setSaving(false); }
      };
      transaction.onabort = () => {
        if (revision.current === version) { setSaving(false); setError('Không lưu được bộ thẻ. Đừng tải lại trang; hãy tải bản sao lưu hoặc thử lưu lại.'); }
      };
    } catch {
      setSaving(false); setError('Không lưu được bộ thẻ. Đừng tải lại trang; hãy tải bản sao lưu hoặc thử lưu lại.');
    }
  }
  const setDecks: Dispatch<SetStateAction<DeckNode[]>> = value => {
    if (!loaded) return;
    const next = typeof value === 'function' ? value(latest.current) : value;
    latest.current = next; updateDecks(next); persist(next);
  };
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (pending.current) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);
  function backup() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, decks: latest.current }, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'nihongoai-decks-backup.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return { decks, setDecks, loaded, saving, error, backup,
    retry: () => loaded ? persist(latest.current) : setRetry(n => n + 1) };
}

function isDeck(value: unknown): value is DeckNode {
  if (!value || typeof value !== 'object') return false;
  const node = value as Record<string, unknown>;
  return typeof node.id === 'string' && typeof node.name === 'string' && typeof node.level === 'number'
    && (node.cards === undefined || Array.isArray(node.cards))
    && (node.children === undefined || Array.isArray(node.children) && node.children.every(isDeck));
}
