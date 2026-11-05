import { BASE_URL } from '../../services/apiConfig';

export { BASE_URL };
export interface Room {
  code: string; phase: 'WAITING' | 'PLAYING' | 'REVEAL' | 'FINISHED';
  round: number; total: number; serverTime: number; deadline: number; nextAt: number; you: number;
  players: { name: string; score: number; answered: boolean; choice: number | null; earned: number }[];
  question: { type: 'JAPANESE_TO_VIETNAMESE' | 'VIETNAMESE_TO_JAPANESE' | 'KANJI_TO_HIRAGANA'; word: string; options: string[]; correct: number | null } | null;
}
export interface Session { token: string; room: Room }
export async function request<T>(base: string, path: string, token?: string, body?: unknown): Promise<T> {
  const response = await fetch(`${base.replace(/\/$/, '')}/pvp/rooms${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'X-Player-Token': token } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || data.detail || 'Không thể thao tác với phòng. Kiểm tra mã phòng và kết nối.');
  }
  return response.json();
}
